const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken, requireRole('Admin'));

router.post('/programs', adminCtrl.createProgram);
router.post('/courses', adminCtrl.uploadCourse);
router.post('/program-courses', adminCtrl.addCourseToProgram);
router.post('/semester-offerings', adminCtrl.addSemesterOffering);
router.post('/prerequisites', adminCtrl.setPrerequisite);
router.get('/analytics/demand', adminCtrl.getAnalytics);
router.post('/create-user', adminCtrl.createUserProfile);

module.exports = router;