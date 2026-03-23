const { Student, Program, Course, Plan, PlannedCourse, SemesterOffering, TimeSlot } = require('../models');

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

        const plan = await Plan.create({ student_id: student.student_id, degree_program: student.major, status: 'Draft', creation_date: new Date() });
        
        let coursesAdded = 0;
        for (let offered of availableCourses) {
            if (coursesAdded >= 4) break;
            
            const isRequired = program.Courses.some(reqCourse => reqCourse.course_id === offered.course_id);
            if (isRequired) {
                await PlannedCourse.create({ plan_id: plan.plan_id, course_id: offered.course_id, semester: targetSemester, year: new Date().getFullYear() });
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