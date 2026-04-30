const express = require('express');
const router = express.Router();
const studentCtrl = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { registerStudent } = require('../controllers/courseController');

router.use(authenticateToken, requireRole('Student'));

router.get('/me', studentCtrl.getCurrentStudent);
router.get('/requirements', studentCtrl.getRequirements);
router.post('/generate-semester', studentCtrl.generateSemester);
router.get('/plans/:plan_id/conflicts', studentCtrl.checkConflicts);
router.get('/plans/:plan_id/feedback', studentCtrl.getPlanFeedback);
router.put('/plans/:plan_id/courses', studentCtrl.updatePlanCourses);
router.post('/plans/:plan_id/submit', studentCtrl.submitPlan);
router.post('/register', registerStudent);
router.delete('/plans/:plan_id', studentCtrl.deletePlan);
router.get('/availability', studentCtrl.getAvailability);
router.put('/availability', studentCtrl.saveAvailability);
router.post('/availability', studentCtrl.addAvailability);

module.exports = router;
