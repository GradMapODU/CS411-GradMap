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
        const { status } = req.body; 

        //Ensure the advisor is only sending a valid status
        if (!['Approved', 'Needs Revision'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be Approved or Needs Revision.' });
        }

        //Find the plan
        const plan = await Plan.findByPk(plan_id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found.' });
        }

        //Update and save
        plan.status = status;
        await plan.save();

        res.status(200).json({ 
            message: `Success! Plan #${plan_id} has been marked as ${status}.`, 
            plan 
        });

    } catch (error) {
        console.error('Review Error:', error);
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