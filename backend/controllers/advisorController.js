import { findAll, findByPk } from '../models/Plan';
import { findAll as _findAll } from '../models/Student';
import PlannedCourse from '../models/PlannedCourse';

export async function getAssignedPlans(req, res) {
    const advisor_id = req.user.user_id;
    const students = await _findAll({ where: { advisor_id } });
    const studentIds = students.map(s => s.student_id);
    const plans = await findAll({ where: { student_id: studentIds }, include: PlannedCourse });
    res.json(plans);
}

export async function reviewPlan(req, res) {
    const { plan_id, action } = req.body; // action = 'Approved' or 'Archived'
    try {
        const plan = await findByPk(plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        plan.status = action;
        await plan.save();
        res.json({ message: `Plan ${action.toLowerCase()} successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}