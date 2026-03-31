const bcrypt = require('bcrypt');
const {User, Student, Advisor,  Course, PlannedCourse, Program, ProgramCourse, SemesterOffering, Prerequisite, sequelize } = require('../models');

exports.uploadCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createProgram = async (req, res) => {
    try {
        const program = await Program.create(req.body);
        res.status(201).json(program);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addCourseToProgram = async (req, res) => {
    try {
        const { program_id, course_id, requirement_type } = req.body;
        const mapping = await ProgramCourse.create({ program_id, course_id, requirement_type });
        res.status(201).json({ message: 'Course linked to program', mapping });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addSemesterOffering = async (req, res) => {
    try {
        const { course_id, semester } = req.body;
        const offering = await SemesterOffering.create({ course_id, semester });
        res.status(201).json({ message: 'Offering added', offering });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.setPrerequisite = async (req, res) => {
    try {
        const { course_id, prerequisite_course_id } = req.body;
        const prereq = await Prerequisite.create({ course_id, prerequisite_course_id });
        res.status(201).json({ message: 'Prerequisite established', prereq });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getAnalytics = async (req, res) => {
    try {
        const demand = await PlannedCourse.findAll({
            attributes: ['course_id', [sequelize.fn('COUNT', sequelize.col('course_id')), 'demand_count']],
            group: ['course_id'],
            order: [[sequelize.col('demand_count'), 'DESC']],
            include: [{ model: Course, attributes: ['course_name', 'course_code'] }]
        });
        res.json(demand);
    } catch (error) { res.status(500).json({ error: error.message }); }

    
};

exports.createUserProfile = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { 
            username, password, role, 
            first_name, last_name, 
            major,year, gpa,       
            department             
        } = req.body;

        //Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        //Create the base User account
        const newUser = await User.create({
            username,
            password_hash,
            role
        }, { transaction: t });

        //Check the role and create the matching profile!
        if (role === 'Student') {
            await Student.create({
                student_id: newUser.get('user_id') || newUser.id || newUser.user_id, // Sequelize quirk: sometimes it's .get('field') and sometimes .field
                first_name,
                last_name,
                major: major || 'Undeclared', 
                year: year || 1,
                gpa: gpa || 0.0 // Default to 0.0 if not provided
            }, { transaction: t });
            
        } else if (role === 'Advisor') {
            await Advisor.create({
                advisor_id: newUser.get('user_id') || newUser.id || newUser.user_id,
                first_name,
                last_name,
                department: department || 'General Advising'
            }, { transaction: t });
        }

        //save both to the database
        await t.commit();
        res.status(201).json({ 
            message: `Success! ${role} account and profile created for ${first_name} ${last_name}.`,
            user_id: newUser.user_id 
        });

    } catch (error) {
        //undo the whole thing if anything goes wrong
        await t.rollback();
        console.error("Creation Error:", error);
        res.status(500).json({ error: error.message });
    }
};