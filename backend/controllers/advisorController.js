const {
    Student, Advisor, Plan, PlannedCourse, Course, Program, PlanFeedback
} = require('../models');


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

function shapePlanRow(plan) {
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

    const allFeedback = Array.isArray(plan.PlanFeedbacks) ? [...plan.PlanFeedbacks] : [];
    const humanFeedback = allFeedback.filter(f => f.advisor_id != null);
    const systemFeedback = allFeedback.filter(f => f.advisor_id == null);


    humanFeedback.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : (a.id || 0);
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : (b.id || 0);
        return bTime - aTime;
    });
    const newestHuman = humanFeedback[0];

    const planRow = {
        id: plan.plan_id,
        term: buildTermLabel(plannedCourses),
        status: mapPlanStatus(plan.status),
        advisorStatus: mapPlanStatus(plan.status),
        courses,
        credits,
        submittedOn: plan.creation_date || null,
        reviewedOn: newestHuman?.createdAt || null,
        reviewedBy: newestHuman?.Advisor
            ? `${newestHuman.Advisor.first_name} ${newestHuman.Advisor.last_name}`
            : "",
        advisorFeedback: newestHuman?.message || ""
    };
    planRow.alerts = computePlanAlerts(planRow);

    for (const sf of systemFeedback) {
        const msg = String(sf.message || "").replace(/^\[SYSTEM\]\s*/, "");
        if (msg) planRow.alerts.warnings.push(msg);
    }

    return planRow;
}

function aggregateStudentAlerts(planRows) {
    const studentAlerts = { informative: [], warnings: [], urgent: [] };
    for (const row of planRows) {
        if (row.status === "Historical") continue;
        studentAlerts.informative.push(...(row.alerts?.informative || []));
        studentAlerts.warnings.push(...(row.alerts?.warnings || []));
        studentAlerts.urgent.push(...(row.alerts?.urgent || []));
    }
    studentAlerts.informative = [...new Set(studentAlerts.informative)];
    studentAlerts.warnings = [...new Set(studentAlerts.warnings)];
    studentAlerts.urgent = [...new Set(studentAlerts.urgent)];
    return studentAlerts;
}


exports.getCurrentAdvisor = async (req, res) => {
    try {
        const advisor = await Advisor.findByPk(req.user.user_id);
        if (!advisor) return res.status(404).json(null);

        res.json({
            advisor_id: advisor.advisor_id,
            first_name: advisor.first_name || "",
            last_name: advisor.last_name || "",
            name: `${advisor.first_name || ""} ${advisor.last_name || ""}`.trim(),
            department: advisor.department || ""
        });
    } catch (error) {
        console.error("getCurrentAdvisor error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getMyStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            where: { advisor_id: req.user.user_id },
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
                }
            ]
        });

        const majorSet = new Set(students.map(s => s.major).filter(Boolean));
        const programByMajor = {};
        for (const major of majorSet) {
            const program = await Program.findOne({ where: { name: major } });
            programByMajor[major] = program?.total_credits_required ?? null;
        }

        const shapedStudents = students.map(student => {
            const plans = Array.isArray(student.Plans) ? student.Plans : [];
            const planRows = plans.map(shapePlanRow);

            const creditsRequired = programByMajor[student.major] ?? null;
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

            return {
                id: student.student_id,
                student_id: student.student_id,
                name: `${student.first_name || ""} ${student.last_name || ""}`.trim(),
                first_name: student.first_name || "",
                last_name: student.last_name || "",
                major: student.major || "",
                year: student.year || null,
                gpa,
                creditsEarned,
                creditsRequired,
                progressPercent,
                alerts: aggregateStudentAlerts(planRows),
                plan: planRows
            };
        });

        const REVIEWABLE = new Set(["Pending", "Needs Revision"]);
        const submissions = [];
        for (const s of shapedStudents) {
            for (const p of s.plan) {
                if (REVIEWABLE.has(p.status)) {
                    submissions.push({
                        id: `sub-${s.student_id}-${p.id}`,
                        studentId: s.student_id,
                        studentName: s.name,
                        planId: p.id,
                        term: p.term,
                        status: p.status,
                        submittedOn: p.submittedOn,
                        credits: p.credits
                    });
                }
            }
        }

        res.json({ students: shapedStudents, submissions });
    } catch (error) {
        console.error("getMyStudents error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.reviewPlan = async (req, res) => {
    try {
        const { plan_id } = req.params;
        const { status, message } = req.body;

        const ALLOWED = new Set(['Draft', 'Pending', 'Approved', 'Needs Revision', 'Historical']);
        if (status && !ALLOWED.has(status)) {
            return res.status(400).json({ error: `Invalid status: ${status}` });
        }

        const plan = await Plan.findByPk(plan_id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found.' });
        }

        if (status) plan.status = status;
        await plan.save();

        let feedbackRow = null;
        const trimmed = (message || "").trim();
        if (trimmed) {
            feedbackRow = await PlanFeedback.create({
                plan_id: plan.plan_id,
                advisor_id: req.user.user_id,
                message: trimmed
            });
        }

        res.json({
            message: 'Plan updated',
            plan,
            feedback: feedbackRow
        });
    } catch (error) {
        console.error("reviewPlan error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.addFeedback = async (req, res) => {
    try {
        const { plan_id } = req.params;
        const { message } = req.body;

        const plan = await Plan.findByPk(plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const feedback = await PlanFeedback.create({
            plan_id,
            advisor_id: req.user.user_id,
            message
        });

        res.status(201).json({
            message: 'Feedback submitted',
            feedback
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};