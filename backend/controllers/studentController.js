const {
    Student, Program, Course, Plan, PlannedCourse,
    SemesterOffering, TimeSlot, PlanFeedback, Advisor,
    StudentAvailability, Prerequisite
} = require('../models');


const DAY_LETTERS = ['M', 'T', 'W', 'R', 'F'];
const SEMESTER_ORDER = { Spring: 0, Summer: 1, Fall: 2, Winter: 3 };

const COURSE_GROUPS = [
    ['CS 150', 'CS 151', 'CS 153'],
    ['CS 120G', 'CS 121G', 'CS 126G', 'CS 202G'],
];


const AVAILABILITY_EMPTY_SENTINEL = Object.freeze({
    day: 'X',
    start_time: '00:00',
    end_time: '00:00',
});

function isSentinelRow(row) {
    return row && row.day === AVAILABILITY_EMPTY_SENTINEL.day;
}

function toMinutes(hhmm) {
    if (!hhmm || typeof hhmm !== 'string') return NaN;
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
    return h * 60 + m;
}

function parseTimeRange(range) {
    if (!range || typeof range !== 'string') return null;
    const [start, end] = range.split('-').map(s => s.trim());
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    if (Number.isNaN(startMin) || Number.isNaN(endMin)) return null;
    return { start: startMin, end: endMin };
}

function expandDays(days) {
    if (!days) return [];
    return String(days).split('').filter(d => DAY_LETTERS.includes(d));
}

function meetingsConflict(a, b) {
    const aRange = parseTimeRange(a.time_range);
    const bRange = parseTimeRange(b.time_range);
    if (!aRange || !bRange) return false;

    const aDays = new Set(expandDays(a.days));
    const sharedDay = expandDays(b.days).some(d => aDays.has(d));
    if (!sharedDay) return false;

    return aRange.start < bRange.end && bRange.start < aRange.end;
}

function groupSlotsIntoSections(slots) {
    const map = new Map();
    for (const s of slots) {
        const key = `${s.course_id}|${s.section_number}|${s.semester}|${s.year}`;
        if (!map.has(key)) {
            map.set(key, {
                course_id: s.course_id,
                section_number: s.section_number,
                semester: s.semester,
                year: s.year,
                meetings: [],
            });
        }
        map.get(key).meetings.push({ days: s.days, time_range: s.time_range });
    }
    return Array.from(map.values());
}

function buildAvailabilityIndex(availabilityRows) {
    const idx = { M: [], T: [], W: [], R: [], F: [] };

    const realRows = (availabilityRows || []).filter(r => !isSentinelRow(r));
    const sawSentinel = (availabilityRows || []).some(isSentinelRow);


    if (realRows.length === 0 && !sawSentinel) {
        for (const d of DAY_LETTERS) {
            idx[d].push({ start: 6 * 60, end: 22 * 60 });
        }
        return { index: idx, hasData: false };
    }

    for (const row of realRows) {
        if (!idx[row.day]) continue;
        const start = toMinutes(row.start_time);
        const end = toMinutes(row.end_time);
        if (Number.isNaN(start) || Number.isNaN(end) || end <= start) continue;
        idx[row.day].push({ start, end });
    }
    return { index: idx, hasData: true };
}

function meetingFitsAvailability(meeting, availabilityIndex) {
    const range = parseTimeRange(meeting.time_range);
    if (!range) return false;

    for (const day of expandDays(meeting.days)) {
        const dayBlocks = availabilityIndex[day] || [];
        const fits = dayBlocks.some(
            block => block.start <= range.start && block.end >= range.end
        );
        if (!fits) return false;
    }
    return true;
}

function sectionFitsAvailability(section, availabilityIndex) {
    return section.meetings.every(m => meetingFitsAvailability(m, availabilityIndex));
}

function sectionsConflict(secA, secB) {
    for (const ma of secA.meetings) {
        for (const mb of secB.meetings) {
            if (meetingsConflict(ma, mb)) return true;
        }
    }
    return false;
}

function termIsBefore(yearA, semA, yearB, semB) {
    if (yearA !== yearB) return yearA < yearB;
    return (SEMESTER_ORDER[semA] ?? 99) < (SEMESTER_ORDER[semB] ?? 99);
}

function buildGroupKeyByCode() {
    const map = new Map();
    COURSE_GROUPS.forEach((group, idx) => {
        const key = `__group_${idx}`;
        for (const code of group) map.set(code, key);
    });
    return map;
}

function parseCourseNumber(code) {
    if (!code) return Infinity;
    const m = String(code).match(/(\d+)/);
    return m ? Number(m[1]) : Infinity;
}

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


exports.getRequirements = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.user_id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        const program = await Program.findOne({
            where: { name: student.major },
            include: [{
                model: Course,
                through: { attributes: ['requirement_type'] },
                include: [{
                    model: Course,
                    as: 'RequiredPrerequisites',
                    attributes: ['course_code', 'course_name'],
                }],
            }],
        });

        if (!program) {
            return res.status(404).json({ error: 'Degree program not found.' });
        }
        res.json(program);
    } catch (error) {
        console.error('getRequirements error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.generateSemester = async (req, res) => {
    console.log("generateSemester body:", req.body, "user:", req.user?.user_id);
    try {
        const student = await Student.findByPk(req.user.user_id);
        if (!student) return res.status(404).json({ error: 'Student not found.' });

        const targetSemester = req.body.semester || 'Fall';
        const targetYear = Number(req.body.year) || new Date().getFullYear();
        const maxCredits = Number(req.body.maxCredits) || 15;

        const program = await Program.findOne({
            where: { name: student.major },
            include: [{ model: Course }],
        });

        if (!program) {
            return res.status(404).json({ error: 'Degree program not found for student.' });
        }

        const requiredCourseIds = new Set(
            (program.Courses || []).map(c => c.course_id)
        );

        const allPlannedRows = await PlannedCourse.findAll({
            include: [{
                model: Plan,
                where: { student_id: student.student_id },
                attributes: [],
            }],
            attributes: ['course_id', 'semester', 'year', 'status'],
        });

        const allCoursesForCodes = await Course.findAll({
            attributes: ['course_id', 'course_code'],
        });
        const codeByCourseId = new Map(
            allCoursesForCodes.map(c => [c.course_id, c.course_code])
        );
        const idByCourseCode = new Map(
            allCoursesForCodes.map(c => [c.course_code, c.course_id])
        );
        const groupKeyByCode = buildGroupKeyByCode();


        const excludedCourseIds = new Set();
        const excludedGroupKeys = new Set();
        for (const row of allPlannedRows) {
            excludedCourseIds.add(row.course_id);
            const code = codeByCourseId.get(row.course_id);
            if (code && groupKeyByCode.has(code)) {
                excludedGroupKeys.add(groupKeyByCode.get(code));
            }
        }
        for (const [code, key] of groupKeyByCode.entries()) {
            if (excludedGroupKeys.has(key)) {
                const id = idByCourseCode.get(code);
                if (id) excludedCourseIds.add(id);
            }
        }

        const offerings = await SemesterOffering.findAll({
            where: { semester: targetSemester },
            include: [{ model: Course }],
        });

        const candidateCourses = offerings
            .filter(o =>
                o.Course
                && requiredCourseIds.has(o.course_id)
                && !excludedCourseIds.has(o.course_id)
            )
            .map(o => o.Course);

        if (candidateCourses.length === 0) {
            return res.status(200).json({
                message: 'No new required courses available this semester (all are already taken or planned).',
                plan_id: null,
                scheduled: [],
                warnings: [],
                skipped: [],
            });
        }

        const candidateIds = candidateCourses.map(c => c.course_id);
        const slots = await TimeSlot.findAll({
            where: {
                course_id: candidateIds,
                semester: targetSemester,
            },
        });

        const sectionsByCourse = new Map();
        for (const section of groupSlotsIntoSections(slots)) {
            if (!sectionsByCourse.has(section.course_id)) {
                sectionsByCourse.set(section.course_id, []);
            }
            sectionsByCourse.get(section.course_id).push(section);
        }

        let availabilityRows = [];
        if (StudentAvailability) {
            availabilityRows = await StudentAvailability.findAll({
                where: { student_id: student.student_id },
            });
        }
        const { index: availabilityIndex, hasData: hasAvailability } =
            buildAvailabilityIndex(availabilityRows);

        const willBeDoneCourseIds = new Set();
        for (const row of allPlannedRows) {
            const isEarlierTerm = termIsBefore(
                row.year, row.semester, targetYear, targetSemester
            );
            const isCurrentlyInProgress =
                (row.status === 'Completed' || row.status === 'Enrolled') &&
                !termIsBefore(targetYear, targetSemester, row.year, row.semester);
            if (isEarlierTerm || isCurrentlyInProgress) {
                willBeDoneCourseIds.add(row.course_id);
            }
        }

        {
            const willBeDoneGroupKeys = new Set();
            for (const id of willBeDoneCourseIds) {
                const code = codeByCourseId.get(id);
                if (code && groupKeyByCode.has(code)) {
                    willBeDoneGroupKeys.add(groupKeyByCode.get(code));
                }
            }
            for (const [code, key] of groupKeyByCode.entries()) {
                if (willBeDoneGroupKeys.has(key)) {
                    const id = idByCourseCode.get(code);
                    if (id) willBeDoneCourseIds.add(id);
                }
            }
        }

        const prereqRows = await Prerequisite.findAll({
            where: { course_id: candidateIds },
        });

        const prereqsByCourse = new Map();
        for (const row of prereqRows) {
            if (!prereqsByCourse.has(row.course_id)) {
                prereqsByCourse.set(row.course_id, []);
            }
            prereqsByCourse.get(row.course_id).push(row.prerequisite_course_id);
        }

        const allPrereqIds = new Set();
        for (const ids of prereqsByCourse.values()) {
            for (const id of ids) allPrereqIds.add(id);
        }
        const prereqCourseRows = allPrereqIds.size > 0
            ? await Course.findAll({
                where: { course_id: Array.from(allPrereqIds) },
                attributes: ['course_id', 'course_code'],
            })
            : [];
        const codeById = new Map(prereqCourseRows.map(c => [c.course_id, c.course_code]));

        const chosenSections = [];
        const skipped = [];
        let creditsSoFar = 0;

        const sortedCandidates = [...candidateCourses].sort((a, b) => {
            const an = parseCourseNumber(a.course_code);
            const bn = parseCourseNumber(b.course_code);
            if (an !== bn) return an - bn;
            return String(a.course_code || '').localeCompare(String(b.course_code || ''));
        });

        for (const course of sortedCandidates) {
            if (creditsSoFar + (course.credits || 0) > maxCredits) {
                skipped.push({
                    courseCode: course.course_code,
                    reason: `Would exceed ${maxCredits}-credit cap`,
                    severity: 'blocker',
                });
                continue;
            }

            const required = prereqsByCourse.get(course.course_id) || [];
            const missing = required.filter(id => !willBeDoneCourseIds.has(id));
            const courseWarnings = [];
            if (missing.length > 0) {
                const missingCodes = missing.map(id => codeById.get(id) || `#${id}`);
                courseWarnings.push(
                    `Prerequisite${missing.length > 1 ? 's' : ''} not yet scheduled: ${missingCodes.join(', ')}`
                );
            }

            const sections = sectionsByCourse.get(course.course_id) || [];
            if (sections.length === 0) {
                skipped.push({
                    courseCode: course.course_code,
                    reason: 'No sections offered this term',
                    severity: 'blocker',
                });
                continue;
            }

            const fitting = sections.filter(
                sec => sectionFitsAvailability(sec, availabilityIndex)
            );
            if (fitting.length === 0) {
                skipped.push({
                    courseCode: course.course_code,
                    reason: 'No section fits student availability',
                    severity: 'blocker',
                });
                continue;
            }

            const nonConflicting = fitting.find(
                sec => !chosenSections.some(c => sectionsConflict(c.section, sec))
            );
            if (!nonConflicting) {
                skipped.push({
                    courseCode: course.course_code,
                    reason: 'All available sections conflict with already-scheduled courses',
                    severity: 'blocker',
                });
                continue;
            }

            chosenSections.push({ course, section: nonConflicting, warnings: courseWarnings });
            creditsSoFar += (course.credits || 0);

            for (const w of courseWarnings) {
                skipped.push({
                    courseCode: course.course_code,
                    reason: w,
                    severity: 'warning',
                });
            }
        }

        if (chosenSections.length === 0) {
            return res.status(200).json({
                message: 'Could not schedule any courses with current availability.',
                plan_id: null,
                scheduled: [],
                warnings: [],
                skipped,
                hasAvailabilityData: hasAvailability,
            });
        }

        const plan = await Plan.create({
            student_id: student.student_id,
            degree_program: student.major,
            status: 'Draft',
            creation_date: new Date(),
        });

        for (const { course } of chosenSections) {
            await PlannedCourse.create({
                plan_id: plan.plan_id,
                course_id: course.course_id,
                semester: targetSemester,
                year: targetYear,
            });
        }

        const warningRows = [];
        for (const { course, warnings } of chosenSections) {
            for (const w of warnings) {
                warningRows.push({
                    plan_id: plan.plan_id,
                    advisor_id: null,
                    message: `[SYSTEM] ${course.course_code}: ${w}`,
                });
            }
        }
        if (warningRows.length) {
            await PlanFeedback.bulkCreate(warningRows);
        }

        const scheduledOut = chosenSections.map(({ course, section, warnings }) => ({
            courseCode: course.course_code,
            courseName: course.course_name,
            credits: course.credits,
            section: section.section_number,
            meetings: section.meetings,
            warnings,
        }));

        return res.status(201).json({
            message: 'Semester scheduled successfully.',
            plan_id: plan.plan_id,
            totalCredits: creditsSoFar,
            scheduled: scheduledOut,
            warnings: scheduledOut
                .filter(s => s.warnings && s.warnings.length)
                .flatMap(s => s.warnings.map(w => ({ courseCode: s.courseCode, reason: w }))),
            skipped,
            hasAvailabilityData: hasAvailability,
        });
    } catch (error) {
        console.error('generateSemester error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.checkConflicts = async (req, res) => {
    try {
        const { plan_id } = req.params;
        const courses = await PlannedCourse.findAll({
            where: { plan_id },
            include: [{ model: Course, include: [TimeSlot] }],
        });

        const conflicts = [];
        for (let i = 0; i < courses.length; i++) {
            for (let j = i + 1; j < courses.length; j++) {
                const slotsI = courses[i].Course.Time_Slots || [];
                const slotsJ = courses[j].Course.Time_Slots || [];

                for (const slot1 of slotsI) {
                    for (const slot2 of slotsJ) {
                        if (meetingsConflict(slot1, slot2)) {
                            conflicts.push(
                                `Conflict: ${courses[i].Course.course_name} (${slot1.days} ${slot1.time_range}) ` +
                                `overlaps with ${courses[j].Course.course_name} (${slot2.days} ${slot2.time_range}).`
                            );
                        }
                    }
                }
            }
        }

        res.json({ hasConflicts: conflicts.length > 0, conflicts });
    } catch (error) {
        console.error('checkConflicts error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPlanFeedback = async (req, res) => {
    try {
        const { plan_id } = req.params;

        const feedback = await PlanFeedback.findAll({
            where: { plan_id },
            order: [['createdAt', 'DESC']],
        });

        res.json(feedback);
    } catch (error) {
        console.error('getPlanFeedback error:', error);
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
                            include: [Course],
                        },
                        {
                            model: PlanFeedback,
                            include: [{
                                model: Advisor,
                                attributes: ['first_name', 'last_name'],
                            }],
                        },
                    ],
                },
                {
                    model: Advisor,
                    attributes: ['first_name', 'last_name'],
                },
            ],
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
                advisorFeedback: newest?.message || "",
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

        res.json({
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
            plan: planRows,
        });
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

exports.updatePlanCourses = async (req, res) => {
    try {
        const { plan_id } = req.params;
        const courses = req.body.courses;

        if (!Array.isArray(courses)) {
            return res.status(400).json({ error: 'courses must be an array.' });
        }

        const plan = await Plan.findOne({
            where: { plan_id, student_id: req.user.user_id },
        });

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found.' });
        }

        if (!['Draft', 'Needs Revision'].includes(plan.status)) {
            return res.status(403).json({
                error: `Cannot edit a plan with status "${plan.status}".`,
            });
        }

        const codes = courses.map(c => c.code).filter(Boolean);
        const courseRows = codes.length
            ? await Course.findAll({ where: { course_code: codes } })
            : [];
        const idByCode = new Map(courseRows.map(c => [c.course_code, c.course_id]));

        await PlannedCourse.destroy({ where: { plan_id } });

        const rows = courses
            .map(c => ({
                plan_id: Number(plan_id),
                course_id: idByCode.get(c.code),
                semester: c.semester || 'Fall',
                year: c.year || new Date().getFullYear(),
                status: c.status || 'Planned',
            }))
            .filter(r => r.course_id); 

        if (rows.length) {
            await PlannedCourse.bulkCreate(rows);
        }

        res.json({ message: 'Plan updated.', plan_id, courseCount: rows.length });
    } catch (error) {
        console.error('updatePlanCourses error:', error);
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

        if (!['Draft', 'Needs Revision'].includes(plan.status)) {
            return res.status(400).json({
                error: `Plan is already "${plan.status}" and cannot be re-submitted.`,
            });
        }

        plan.status = 'Pending';
        await plan.save();

        res.json({
            message: 'Plan submitted for advisor review.',
            plan_id,
            status: plan.status,
        });
    } catch (error) {
        console.error('submitPlan error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAvailability = async (req, res) => {
    try {
        if (!StudentAvailability) {
            return res.status(503).json({ error: 'Availability feature not available.' });
        }
        const rows = await StudentAvailability.findAll({
            where: { student_id: req.user.user_id },
        });

        res.json(rows.filter(r => !isSentinelRow(r)));
    } catch (error) {
        console.error('getAvailability error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.saveAvailability = async (req, res) => {
    try {
        if (!StudentAvailability) {
            return res.status(503).json({ error: 'Availability feature not available.' });
        }

        const slots = req.body; 
        if (!Array.isArray(slots)) {
            return res.status(400).json({ error: 'Body must be an array of availability slots.' });
        }

        await StudentAvailability.destroy({ where: { student_id: req.user.user_id } });

        const rows = slots
            .filter(s => s.day && s.start_time && s.end_time)
            .map(s => ({
                student_id: req.user.user_id,
                day: s.day,
                start_time: s.start_time,
                end_time: s.end_time,
            }));

        if (rows.length) {
            await StudentAvailability.bulkCreate(rows);
        } else {

            await StudentAvailability.create({
                student_id: req.user.user_id,
                ...AVAILABILITY_EMPTY_SENTINEL,
            });
        }

        res.json({ message: 'Availability saved.', count: rows.length });
    } catch (error) {
        console.error('saveAvailability error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.addAvailability = async (req, res) => {
    try {
        if (!StudentAvailability) {
            return res.status(503).json({ error: 'Availability feature not available.' });
        }

        const { day, start_time, end_time } = req.body;
        if (!day || !start_time || !end_time) {
            return res.status(400).json({ error: 'day, start_time, and end_time are required.' });
        }

        const slot = await StudentAvailability.create({
            student_id: req.user.user_id,
            day,
            start_time,
            end_time,
        });

        res.status(201).json(slot);
    } catch (error) {
        console.error('addAvailability error:', error);
        res.status(500).json({ error: error.message });
    }
};