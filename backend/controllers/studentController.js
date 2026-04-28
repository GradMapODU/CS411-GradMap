const {
    Student, Program, Course, Plan, PlannedCourse,
    SemesterOffering, TimeSlot, PlanFeedback, Advisor
} = require('../models');

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
        const targetSemester = req.body.semester || 'Fall';

        const program = await Program.findOne({
            where: { name: student.major },
            include: [{ model: Course }]
        });

        const availableCourses = await SemesterOffering.findAll({
            where: { semester: targetSemester },
            include: [{ model: Course }]
        });

        const plan = await Plan.create({
            student_id: student.student_id,
            degree_program: student.major,
            status: 'Draft',
            creation_date: new Date()
        });

        let coursesAdded = 0;
        for (let offered of availableCourses) {
            if (coursesAdded >= 4) break;

            const isRequired = program.Courses.some(reqCourse => reqCourse.course_id === offered.course_id);
            if (isRequired) {
                await PlannedCourse.create({
                    plan_id: plan.plan_id,
                    course_id: offered.course_id,
                    semester: targetSemester,
                    year: new Date().getFullYear()
                });
                coursesAdded++;
            }
        }

        res.status(201).json({ message: 'Semester generated based on catalog offerings', plan_id: plan.plan_id });
    } catch (error) { res.status(500).json({ error: error.message }); }
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