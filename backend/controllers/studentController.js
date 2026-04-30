const {
    Student, Program, Course, Plan, PlannedCourse,
    SemesterOffering, TimeSlot, PlanFeedback, Advisor, StudentAvailability,
    Prerequisite
} = require('../models');

const hasTimeConflict = (slot1, slot2) => {
    const days1 = slot1.days.split('');
    const days2 = slot2.days.split('');
    const sharedDays = days1.filter(day => days2.includes(day));

    if (sharedDays.length === 0) return false;

    const [start1, end1] = slot1.time_range.split('-').map(t => t.trim());
    const [start2, end2] = slot2.time_range.split('-').map(t => t.trim());

    return (start1 < end2 && end1 > start2);
};

function buildTermLabel(plannedCourses) {
    if (!Array.isArray(plannedCourses) || plannedCourses.length === 0) return "";

    const semesterOrder = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };

    const valid = plannedCourses
        .filter(pc => pc && pc.semester && pc.year)
        .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return (semesterOrder[a.semester] ?? 99) - (semesterOrder[b.semester] ?? 99);
        });

    if (valid.length === 0) return "";
    return `${valid[0].semester} ${valid[0].year}`;
}

function mapPlanStatus(status) {
    return status || "Draft";
}

function computePlanAlerts(plan) {
    const alerts = { informative: [], warnings: [], urgent: [] };
    const courses = plan.courses || [];
    const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);

    if (totalCredits >= 18) {
        alerts.urgent.push(`Very heavy load: ${totalCredits} credits this semester.`);
    } else if (totalCredits >= 16) {
        alerts.warnings.push(`Heavy academic load projected: ${totalCredits} credits.`);
    } else if (totalCredits > 0 && totalCredits < 12) {
        alerts.informative.push(`Light load: ${totalCredits} credits — verify full-time status if needed.`);
    }

    if (courses.length === 0 && plan.status !== "Historical") {
        alerts.warnings.push("This plan has no courses yet.");
    }

    const hasPlanned   = courses.some(c => c.status === "Planned");
    const hasEnrolled  = courses.some(c => c.status === "Enrolled");
    const hasCompleted = courses.some(c => c.status === "Completed");

    if (hasEnrolled && hasPlanned) {
        alerts.informative.push("Plan contains both enrolled and still-planned courses.");
    }
    if (hasCompleted && (hasEnrolled || hasPlanned)) {
        alerts.informative.push("Plan mixes completed and upcoming courses.");
    }

    return alerts;
}


const DAY_CODE_TO_ID = { M: 'mon', T: 'tue', W: 'wed', R: 'thu', F: 'fri' };
const DAY_ID_TO_CODE = { mon: 'M', tue: 'T', wed: 'W', thu: 'R', fri: 'F' };

function to12Hour(time24) {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}:${mStr || '00'} ${suffix}`;
}

function to24Hour(time12) {
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return time12;
    let h = parseInt(match[1], 10);
    const m = match[2];
    const period = match[3].toUpperCase();
    if (period === 'AM' && h === 12) h = 0;
    else if (period === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${m}`;
}


function getCourseNumber(courseCode) {
    const match = String(courseCode || '').match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 9999;
}


exports.getRequirements = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.user_id);
        const program = await Program.findOne({
            where: { name: student.major },
            include: [{
                model: Course,
                through: { attributes: ['requirement_type'] },
                include: [{ model: Course, as: 'RequiredPrerequisites', attributes: ['course_code', 'course_name'] }]
            }]
        });

        if (!program) return res.status(404).json({ error: 'Degree program not found.' });
        res.json(program);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.generateSemester = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.user_id);
        const { semesters } = req.body;

        if (!Array.isArray(semesters) || semesters.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of semesters.' });
        }

        if (semesters.length > 4) {
            return res.status(400).json({ error: 'You can generate at most 4 semesters at a time.' });
        }

        const program = await Program.findOne({
            where: { name: student.major },
            include: [{ model: Course }]
        });

        if (!program) {
            return res.status(404).json({ error: 'Degree program not found for your major.' });
        }

        const existingPlans = await Plan.findAll({
            where: { student_id: student.student_id },
            include: [{ model: PlannedCourse }]
        });

        const alreadyPlannedCourseIds = new Set();
        for (const plan of existingPlans) {
            const pcs = Array.isArray(plan.Planned_Courses) ? plan.Planned_Courses : [];
            for (const pc of pcs) {
                alreadyPlannedCourseIds.add(pc.course_id);
            }
        }


        let programCourses = (program.Courses || [])
            .filter(c => !alreadyPlannedCourseIds.has(c.course_id))
            .sort((a, b) => getCourseNumber(a.course_code) - getCourseNumber(b.course_code));

        if (programCourses.length === 0) {
            const deptWhere = {};
            if (student.major) deptWhere.department = student.major;

            let fallbackCourses = await Course.findAll({ where: deptWhere });

            if (fallbackCourses.length === 0 && student.major) {
                fallbackCourses = await Course.findAll();
            }

            programCourses = fallbackCourses
                .filter(c => !alreadyPlannedCourseIds.has(c.course_id))
                .sort((a, b) => getCourseNumber(a.course_code) - getCourseNumber(b.course_code));
        }

        const usedCourseIds = new Set();

        const results = [];

        for (const semesterLabel of semesters) {

            const parts = semesterLabel.trim().split(/\s+/);
            const semesterName = parts[0] || 'Fall';
            const year = parseInt(parts[1], 10) || new Date().getFullYear();


            const selectedCourses = [];
            let totalCredits = 0;

            for (const course of programCourses) {
                if (usedCourseIds.has(course.course_id)) continue;
                const credits = course.credits || 3;


                if (totalCredits + credits > 15) continue;

                selectedCourses.push(course);
                totalCredits += credits;
                usedCourseIds.add(course.course_id);

                if (totalCredits >= 12) break;
            }


            const plan = await Plan.create({
                student_id: student.student_id,
                degree_program: student.major,
                status: 'Draft',
                creation_date: new Date()
            });

            for (const course of selectedCourses) {
                await PlannedCourse.create({
                    plan_id: plan.plan_id,
                    course_id: course.course_id,
                    semester: semesterName,
                    year: year,
                    status: 'Planned'
                });
            }

            const courses = selectedCourses.map(c => ({
                code: c.course_code,
                title: c.course_name,
                credits: c.credits,
                status: 'Planned'
            }));

            results.push({
                plan_id: plan.plan_id,
                term: `${semesterName} ${year}`,
                semester: semesterName,
                year,
                courses,
                credits: totalCredits,
                status: 'Draft'
            });
        }

        res.status(201).json({
            message: `Generated ${results.length} semester plan(s).`,
            plans: results
        });
    } catch (error) {
        console.error("Generator Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.checkConflicts = async (req, res) => {
    try {
        const { plan_id } = req.params;
        const courses = await PlannedCourse.findAll({
            where: { plan_id },
            include: [{ model: Course, include: [TimeSlot] }]
        });

        let conflicts = [];
        for (let i = 0; i < courses.length; i++) {
            for (let j = i + 1; j < courses.length; j++) {
                const slotsI = courses[i].Course.Time_Slots || [];
                const slotsJ = courses[j].Course.Time_Slots || [];

                for (const slot1 of slotsI) {
                    for (const slot2 of slotsJ) {
                        if (slot1.days === slot2.days && slot1.time_range === slot2.time_range) {
                            conflicts.push(`Conflict: ${courses[i].Course.course_name} and ${courses[j].Course.course_name} both meet at ${slot1.time_range} on ${slot1.days}.`);
                        }
                    }
                }
            }
        }

        res.json({ hasConflicts: conflicts.length > 0, conflicts });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getPlanFeedback = async (req, res) => {
    try {
        const { plan_id } = req.params;

        const feedback = await PlanFeedback.findAll({
            where: { plan_id },
            order: [['createdAt', 'DESC']]
        });

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCurrentStudent = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const student = await Student.findByPk(userId, {
            include: [
                {
                    model: Plan,
                    include: [
                        {
                            model: PlannedCourse,
                            include: [Course]
                        },
                        {
                            model: PlanFeedback,
                            include: [{
                                model: Advisor,
                                attributes: ['first_name', 'last_name']
                            }]
                        }
                    ]
                },
                {
                    model: Advisor,
                    attributes: ['first_name', 'last_name']
                }
            ]
        });

        if (!student) {
            return res.status(404).json(null);
        }

        const program = await Program.findOne({ where: { name: student.major } });
        const creditsRequired = program?.total_credits_required ?? null;

        const plans = Array.isArray(student.Plans) ? student.Plans : [];

        const planRows = plans.map(plan => {
            const plannedCourses = Array.isArray(plan.Planned_Courses) ? plan.Planned_Courses : [];

            const courses = plannedCourses.map(pc => ({
                code: pc.Course?.course_code || "",
                title: pc.Course?.course_name || "",
                credits: pc.Course?.credits || 0,
                semester: pc.semester || "",
                year: pc.year || "",
                status: pc.status || "Planned",
                grade: pc.grade || null,
            }));

            const credits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

            const feedbackList = Array.isArray(plan.PlanFeedbacks) ? plan.PlanFeedbacks : [];
            feedbackList.sort((a, b) => {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bTime - aTime;
            });
            const newest = feedbackList[0];

            const planRow = {
                id: plan.plan_id,
                term: buildTermLabel(plannedCourses),
                status: mapPlanStatus(plan.status),
                advisorStatus: mapPlanStatus(plan.status),
                courses,
                credits,
                submittedOn: plan.creation_date || null,
                reviewedOn: newest?.createdAt || null,
                reviewedBy: newest?.Advisor
                    ? `${newest.Advisor.first_name} ${newest.Advisor.last_name}`
                    : "",
                advisorFeedback: newest?.message || ""
            };
            planRow.alerts = computePlanAlerts(planRow);
            return planRow;
        });

        const creditsEarned = planRows.reduce((total, plan) => {
            const completedCredits = plan.courses
                .filter(c => c.status === "Completed")
                .reduce((sum, c) => sum + (c.credits || 0), 0);
            return total + completedCredits;
        }, 0);

        const progressPercent =
            creditsRequired && creditsRequired > 0
                ? Math.min(100, (creditsEarned / creditsRequired) * 100)
                : null;

        const gpaNum = student.GPA != null && student.GPA !== "" ? Number(student.GPA) : null;
        const gpa = Number.isFinite(gpaNum) ? gpaNum : (student.GPA || "");

        const studentAlerts = { informative: [], warnings: [], urgent: [] };
        for (const row of planRows) {
            if (row.status === "Historical") continue;
            studentAlerts.informative.push(...(row.alerts.informative || []));
            studentAlerts.warnings.push(...(row.alerts.warnings || []));
            studentAlerts.urgent.push(...(row.alerts.urgent || []));
        }
        studentAlerts.informative = [...new Set(studentAlerts.informative)];
        studentAlerts.warnings = [...new Set(studentAlerts.warnings)];
        studentAlerts.urgent = [...new Set(studentAlerts.urgent)];

        const response = {
            student_id: student.student_id,
            name: `${student.first_name || ""} ${student.last_name || ""}`.trim(),
            first_name: student.first_name || "",
            last_name: student.last_name || "",
            major: student.major || "",
            gpa,
            year: student.year || null,
            advisor: student.Advisor
                ? `${student.Advisor.first_name} ${student.Advisor.last_name}`
                : "",
            creditsEarned,
            creditsRequired,
            progressPercent,
            alerts: studentAlerts,
            plan: planRows
        };

        res.json(response);
    } catch (error) {
        console.error("getCurrentStudent error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { plan_id } = req.params;

        const plan = await Plan.findOne({
            where: { plan_id, student_id: req.user.user_id },
        });

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found.' });
        }

        if (plan.status === 'Approved' || plan.status === 'Historical') {
            return res.status(403).json({
                error: 'Cannot delete plans that are approved or historical.',
            });
        }

        await PlannedCourse.destroy({ where: { plan_id } });
        await PlanFeedback.destroy({ where: { plan_id } });
        await plan.destroy();

        res.json({ message: 'Plan deleted.', plan_id });
    } catch (error) {
        console.error('deletePlan error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.submitPlan = async (req, res) => {
    try {
        const { plan_id } = req.params;

        const plan = await Plan.findOne({
            where: { plan_id, student_id: req.user.user_id },
        });

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found.' });
        }

        const submittableStatuses = ['Draft', 'Needs Revision', 'Needs Changes'];
        if (!submittableStatuses.includes(plan.status)) {
            return res.status(400).json({
                error: `Only Draft or Needs Revision plans can be submitted. Current status: ${plan.status}`,
            });
        }

        plan.status = 'Pending';
        plan.submitted_on = new Date();
        await plan.save();

        res.json({
            message: 'Plan submitted for advisor review.',
            plan_id: plan.plan_id,
            status: plan.status,
            submitted_on: plan.submitted_on,
        });
    } catch (error) {
        console.error('submitPlan error:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.updatePlanCourses = async (req, res) => {
    try {
        const { plan_id } = req.params;
        const { courses } = req.body;

        const plan = await Plan.findOne({
            where: { plan_id, student_id: req.user.user_id },
        });

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found.' });
        }

        if (plan.status === 'Approved' || plan.status === 'Historical') {
            return res.status(403).json({
                error: 'Cannot edit plans that are approved or historical.',
            });
        }

        if (!Array.isArray(courses)) {
            return res.status(400).json({ error: 'courses must be an array.' });
        }


        await PlannedCourse.destroy({ where: { plan_id } });

        for (const c of courses) {
            const dbCourse = await Course.findOne({ where: { course_code: c.code } });
            if (!dbCourse) continue;

            await PlannedCourse.create({
                plan_id: plan.plan_id,
                course_id: dbCourse.course_id,
                semester: c.semester || plan.degree_program ? 'Fall' : 'Fall',
                year: c.year || new Date().getFullYear(),
                status: c.status || 'Planned'
            });
        }

        const updatedPlan = await Plan.findByPk(plan_id, {
            include: [{ model: PlannedCourse, include: [Course] }]
        });

        const plannedCourses = Array.isArray(updatedPlan.Planned_Courses) ? updatedPlan.Planned_Courses : [];
        const mappedCourses = plannedCourses.map(pc => ({
            code: pc.Course?.course_code || "",
            title: pc.Course?.course_name || "",
            credits: pc.Course?.credits || 0,
            status: pc.status || "Planned",
        }));

        const credits = mappedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);

        res.json({
            message: 'Plan updated.',
            plan_id: updatedPlan.plan_id,
            term: buildTermLabel(plannedCourses),
            status: updatedPlan.status,
            courses: mappedCourses,
            credits
        });
    } catch (error) {
        console.error('updatePlanCourses error:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.getAvailability = async (req, res) => {
    try {
        const studentId = req.user.user_id;

        const rows = await StudentAvailability.findAll({
            where: { student_id: studentId },
            order: [['day', 'ASC'], ['start_time', 'ASC']],
        });

        const weeklyHours = { mon: [], tue: [], wed: [], thu: [], fri: [] };

        const HOUR_SLOTS = [
            '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
            '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
            '18:00', '19:00', '20:00', '21:00',
        ];

        for (const row of rows) {
            const dayId = DAY_CODE_TO_ID[row.day];
            if (!dayId) continue;

            for (const slot of HOUR_SLOTS) {
                if (slot >= row.start_time && slot < row.end_time) {
                    const display = to12Hour(slot);
                    if (!weeklyHours[dayId].includes(display)) {
                        weeklyHours[dayId].push(display);
                    }
                }
            }
        }

        res.json({ weeklyHours });
    } catch (error) {
        console.error('getAvailability error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.saveAvailability = async (req, res) => {
    try {
        const studentId = req.user.user_id;
        const { weeklyHours } = req.body;

        if (!weeklyHours || typeof weeklyHours !== 'object') {
            return res.status(400).json({ error: 'weeklyHours is required.' });
        }

        await StudentAvailability.destroy({ where: { student_id: studentId } });

        const records = [];

        for (const [dayId, hours] of Object.entries(weeklyHours)) {
            const dayCode = DAY_ID_TO_CODE[dayId];
            if (!dayCode || !Array.isArray(hours) || hours.length === 0) continue;

            const sorted24 = hours
                .map(h => to24Hour(h))
                .sort();

            let blockStart = sorted24[0];
            let blockEnd = sorted24[0];

            for (let i = 1; i < sorted24.length; i++) {
                const prevHour = parseInt(blockEnd.split(':')[0], 10);
                const currHour = parseInt(sorted24[i].split(':')[0], 10);

                if (currHour === prevHour + 1) {
                    blockEnd = sorted24[i];
                } else {
                    const endHour = parseInt(blockEnd.split(':')[0], 10) + 1;
                    records.push({
                        student_id: studentId,
                        day: dayCode,
                        start_time: blockStart,
                        end_time: `${String(endHour).padStart(2, '0')}:00`,
                    });
                    blockStart = sorted24[i];
                    blockEnd = sorted24[i];
                }
            }

            const endHour = parseInt(blockEnd.split(':')[0], 10) + 1;
            records.push({
                student_id: studentId,
                day: dayCode,
                start_time: blockStart,
                end_time: `${String(endHour).padStart(2, '0')}:00`,
            });
        }

        if (records.length > 0) {
            await StudentAvailability.bulkCreate(records);
        }

        res.json({ message: 'Availability saved successfully.' });
    } catch (error) {
        console.error('saveAvailability error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.addAvailability = async (req, res) => {
    try {
        const { studentId, availabilities } = req.body;

        const sid = studentId || req.user.user_id;

        await StudentAvailability.destroy({ where: { student_id: sid } });

        const availabilityRecords = availabilities.map(avail => ({
            student_id: sid,
            day: avail.day,
            start_time: avail.start_time,
            end_time: avail.end_time
        }));

        await StudentAvailability.bulkCreate(availabilityRecords);

        res.status(201).json({ message: 'Availability successfully updated!' });
    } catch (error) {
        console.error('Availability Error:', error);
        res.status(500).json({ error: error.message });
    }
};
