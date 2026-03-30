// const { Student, Plan } = require('../models');
const { Student, Plan, PlanFeedback } = require('../models');

exports.getMyStudents = async (req, res) => {
    try {
        const students = await Student.findAll({ 
            where: { advisor_id: req.user.user_id },
            include: [{ model: Plan }] 
        });
        res.json(students);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.reviewPlan = async (req, res) => {
    try {
        const { plan_id } = req.params;
        const { status, advisor_notes } = req.body; 

        const plan = await Plan.findByPk(plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        plan.status = status || plan.status;
        plan.advisor_notes = advisor_notes || plan.advisor_notes;
        await plan.save();

        res.json({ message: 'Plan updated', plan });
    } catch (error) { res.status(500).json({ error: error.message }); }
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