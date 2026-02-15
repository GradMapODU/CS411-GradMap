const Plan = require('../models/Plan');
const PlannedCourse = require('../models/PlannedCourse');
const Course = require('../models/Course');
const { generateSchedule, checkPrerequisites } = require('./scheduleService');

/**
 * Create a new plan for a student
 * @param {Number} student_id
 * @param {String} degree_program
 * @param {Array} selected_course_ids
 * @param {String} semester - e.g., 'Fall'
 * @param {Number} year - e.g., 2026
 */
async function createPlan(student_id, degree_program, selected_course_ids, semester, year) {
    // Fetch selected courses
    const courses = await Course.findAll({ where: { course_id: selected_course_ids } });

    // Check pre-requisites
    const missingPrereqs = await checkPrerequisites(courses);
    if (missingPrereqs.length > 0) {
        throw new Error(`Missing prerequisites: ${JSON.stringify(missingPrereqs)}`);
    }

    // Create plan
    const plan = await Plan.create({
        student_id,
        degree_program,
        creation_date: new Date(),
        status: 'Draft'
    });

    // Generate schedule for ONE semester
    const scheduledCourses = await generateSchedule(courses, semester, year);

    for (const sc of scheduledCourses) {
        await PlannedCourse.create({
            plan_id: plan.plan_id,
            course_id: sc.course_id,
            semester: sc.semester,
            year: sc.year
        });
    }

    return plan;
}

/**
 * Review a plan by an advisor
 * @param {Number} plan_id
 * @param {String} action - 'Approved' or 'Archived'
 */
async function reviewPlan(plan_id, action) {
    const plan = await Plan.findByPk(plan_id);
    if (!plan) throw new Error('Plan not found');
    plan.status = action;
    await plan.save();
    return plan;
}

/**
 * Get all plans for a given student
 * @param {Number} student_id
 */
async function getStudentPlans(student_id) {
    return await Plan.findAll({ where: { student_id }, include: PlannedCourse });
}

/**
 * Get all plans assigned to a specific advisor
 * @param {Number} advisor_id
 */
async function getAdvisorPlans(advisor_id) {
    const Student = require('../models/Student');
    const students = await Student.findAll({ where: { advisor_id } });
    const studentIds = students.map(s => s.student_id);
    return await Plan.findAll({ where: { student_id: studentIds }, include: PlannedCourse });
}

module.exports = { createPlan, reviewPlan, getStudentPlans, getAdvisorPlans };