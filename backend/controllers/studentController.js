import { create, findAll } from '../models/Plan';
import PlannedCourse, { create as _create } from '../models/PlannedCourse';
import { generateSchedule, checkPrerequisites } from '../services/scheduleService';
import { findAll as _findAll } from '../models/Course';

export async function createPlan(req, res) {
    const { degree_program, selected_course_ids } = req.body;
    const student_id = req.user.user_id;

    try {
        const courses = await _findAll({ where: { course_id: selected_course_ids } });

        const missingPrereqs = await checkPrerequisites(courses);
        if (missingPrereqs.length > 0) {
            return res.status(400).json({ error: 'Missing prerequisites', details: missingPrereqs });
        }

        const plan = await create({ student_id, degree_program, creation_date: new Date(), status: 'Draft' });
        const scheduledCourses = await generateSchedule(courses);

        for (const sc of scheduledCourses) {
            await _create({
                plan_id: plan.plan_id,
                course_id: sc.course_id,
                semester: sc.semester,
                year: sc.year
            });
        }

        res.json({ message: 'Plan created successfully', plan_id: plan.plan_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

export async function getMyPlans(req, res) {
    const student_id = req.user.user_id;
    const plans = await findAll({ where: { student_id }, include: PlannedCourse });
    res.json(plans);
}