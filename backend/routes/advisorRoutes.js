const express = require('express');
const router = express.Router();
const advisorCtrl = require('../controllers/advisorController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken, requireRole('Advisor'));

router.get('/students', advisorCtrl.getMyStudents);
router.put('/plans/:plan_id', advisorCtrl.reviewPlan);

module.exports = router;