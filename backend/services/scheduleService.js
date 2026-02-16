import PlannedCourse from '../models/PlannedCourse';
import Course from '../models/Course';
import { findAll } from '../models/Prerequisite';

/**
 * Generate a schedule for ONE semester.
 * @param {Array} selectedCourses - list of Course objects
 * @param {String} semester - e.g., 'Fall' or 'Spring'
 * @param {Number} year - e.g., 2026
 * @returns {Array} - array of objects with course_id, semester, year
 */
async function generateSchedule(selectedCourses, semester = 'Fall', year = new Date().getFullYear()) {
    // For demo purposes assign all courses to the same semester/year
    return selectedCourses.map(course => ({
        course_id: course.course_id,
        semester,
        year
    }));
}

/**
 * Check if all prerequisites are satisfied among the selected courses.
 * @param {Array} selectedCourses - list of Course objects
 * @returns {Array} - missing prerequisites, if any
 */
async function checkPrerequisites(selectedCourses) {
    const missingPrereqs = [];
    for (const course of selectedCourses) {
        const prereqs = await findAll({ where: { course_id: course.course_id } });
        for (const prereq of prereqs) {
            if (!selectedCourses.some(c => c.course_id === prereq.prerequisite_course_id)) {
                missingPrereqs.push({
                    course: course.course_code,
                    missing: prereq.prerequisite_course_id
                });
            }
        }
    }
    return missingPrereqs;
}

export default { generateSchedule, checkPrerequisites };