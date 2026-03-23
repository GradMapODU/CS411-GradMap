const express = require('express');
const router = express.Router();
const studentCtrl = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken, requireRole('Student'));

router.get('/requirements', studentCtrl.getRequirements);
router.post('/generate-semester', studentCtrl.generateSemester);
router.get('/plans/:plan_id/conflicts', studentCtrl.checkConflicts);

module.exports = router;