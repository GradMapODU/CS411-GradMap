const { DataTypes } = require('sequelize');
const { Course, Plan, PlannedCourse, sequelize } = require('../models');

exports.registerStudent = async (req, res) => {
    // Grab the IDs from the Postman body
    const { studentId, courseId } = req.body;
    
    // Start the transaction to protect our data
    const transaction = await sequelize.transaction();

    try {
        //Find the course and verify there is a seat open
        const course = await Course.findByPk(courseId, { transaction });
        
        if (!course) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Course not found.' });
        }
        
        if (course.seat_availability <= 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Class is full! No seats remaining.' });
        }

        let plan = await Plan.findOne({ 
            where: { student_id: studentId } 
        }, { transaction });

        if (!plan) {
            plan = await Plan.create({
                student_id: studentId,
                degree_program: 'Undeclared',
                creation_date: new Date(),
                status: 'Draft'
            }, { transaction });
        }

        //check if they are already registered for the class
        const alreadyRegistered = await PlannedCourse.findOne({
            where: { plan_id: plan.plan_id, course_id: courseId }
        }, { transaction });

        if (alreadyRegistered) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Student is already registered for this course.' });
        }

        //create the official registration
        await PlannedCourse.create({
            plan_id: plan.plan_id,
            course_id: courseId,
            semester: 'Fall', 
            year: new Date().getFullYear()
        }, { transaction });

        //decrement the availability
        course.seat_availability -= 1;
        await course.save({ transaction });

        //Save it to the database
        await transaction.commit();

        return res.status(200).json({
            message: 'Successfully registered!',
            course: course.course_name,
            seatsRemaining: course.seat_availability
        });

    } catch (error) {
        // If anything fails, undo all database changes
        await transaction.rollback();
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.getCourses = async (req, res) => {
  try {
    const { major, department, q } = req.query;
    const where = {};
    if (department) where.department = department;
    if (q) where.course_name = { [require('sequelize').Op.like]: `%${q}%` };
    const courses = await Course.findAll({ where });
    // Map DB fields to the shape the frontend expects
    const mapped = courses.map(c => ({
      code: c.course_code,
      title: c.course_name,
      credits: c.credits,
      department: c.department,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};