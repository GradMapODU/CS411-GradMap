const { Student, Program, Course, Plan, PlannedCourse, SemesterOffering, TimeSlot, PlanFeedback, StudentAvailability } = require('../models');

const isWithinAvailability = (courseSlot, studentAvailabilities) => {
    if (!studentAvailabilities || studentAvailabilities.length === 0) return true; // No availability means no restrictions

    const courseDays = courseSlot.days.split(''); // "MWF" -> ['M', 'W', 'F']
    const [cStart, cEnd] = courseSlot.time_range.split('-').map(t => t.trim()); // "10:00-11:15" -> ["10:00", "11:15"]

    return courseDays.every(day => {
        return studentAvailabilities.some(avail => {
            return avail.day === day && 
            avail.start_time <= cStart &&
            avail.end_time >= cEnd;
     });
});
};

const hasTimeConflict = (slot1, slot2) => {
    const days1 = slot1.days.split('');
    const days2 = slot2.days.split('');
    const sharedDays = days1.filter(day => days2.includes(day));

    if (sharedDays.length === 0) return false; // No shared days means no conflict

    const [start1, end1] = slot1.time_range.split('-').map(t => t.trim());
    const [start2, end2] = slot2.time_range.split('-').map(t => t.trim());

    return (start1 < end2 && end1 > start2); // Overlap condition
};

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
        
        //Get the student's program requirements
        const program = await Program.findOne({
            where: { name: student.major },
            include: [{ model: Course }]
        });

        //Fetch the student's real-world availability
        const studentAvailabilities = await StudentAvailability.findAll({
            where: { student_id: student.student_id }
        });

        //Fetch available courses, but make sure to include their TimeSlots
        const availableCourses = await SemesterOffering.findAll({
            where: { semester: targetSemester },
            include: [{ 
                model: Course,
                include: [{ model: TimeSlot }]
            }]
        });

        const plan = await Plan.create({ 
            student_id: student.student_id, 
            degree_program: student.major, 
            status: 'Draft', 
            creation_date: new Date() 
        });
        
        let coursesAdded = 0;
        let selectedCourses = []; 

        for (let offered of availableCourses) {
            if (coursesAdded >= 4) break;
            
            const course = offered.Course;
            const isRequired = program.Courses.some(reqCourse => reqCourse.course_id === course.course_id);
            
            if (isRequired) {
                const courseSlots = course.Time_Slots || course.TimeSlots || []; 

              
                const fitsSchedule = courseSlots.every(slot => isWithinAvailability(slot, studentAvailabilities));
                if (!fitsSchedule) continue; // Skip to the next class if they are busy

                let conflict = false;
                for (const selected of selectedCourses) {
                    const selectedSlots = selected.Course.Time_Slots || selected.Course.TimeSlots || [];
                    for (const slot1 of courseSlots) {
                        for (const slot2 of selectedSlots) {
                            if (hasTimeConflict(slot1, slot2)) {
                                conflict = true;
                                break;
                            }
                        }
                        if (conflict) break;
                    }
                    if (conflict) break;
                }

                if (conflict) continue; // Skip to the next class if it overlaps

                //add to the plan
                await PlannedCourse.create({ 
                    plan_id: plan.plan_id, 
                    course_id: course.course_id, 
                    semester: targetSemester, 
                    year: new Date().getFullYear() 
                });
                
                selectedCourses.push(offered);
                coursesAdded++;
            }
        }

        res.status(201).json({ 
            message: `Semester generated! Successfully found ${coursesAdded} courses that fit the student's schedule.`, 
            plan_id: plan.plan_id,
            coursesAdded 
        });
    } catch (error) { 
        console.error("Generator Error:", error);
        res.status(500).json({ error: error.message }); 
    }
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

exports.getPlanFeedback = async (req, res) => {
    try {
        const { plan_id } = req.params;

        const feedback = await PlanFeedback.findAll({
            where: { plan_id },
            order: [['createdAt', 'DESC']]
        });

        res.json(feedback);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addAvailability = async (req, res) => {
    try {
        // Example: { studentId: 2, availabilities: [{ day: 'M', start_time: '08:00', end_time: '12:00' }, ...] }
        const { studentId, availabilities } = req.body;

        //Clear out their old availability before saving the new ones
        await StudentAvailability.destroy({ where: { student_id: studentId } });

        // Map over the input to attach the student ID to each record
        const availabilityRecords = availabilities.map(avail => ({
            student_id: studentId,
            day: avail.day,
            start_time: avail.start_time,
            end_time: avail.end_time
        }));

        // Save them all to the database
        await StudentAvailability.bulkCreate(availabilityRecords);

        res.status(201).json({ message: 'Availability successfully updated!' });

    } catch (error) {
        console.error('Availability Error:', error);
        res.status(500).json({ error: error.message });
    }
};
