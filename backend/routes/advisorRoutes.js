import { Router } from 'express';
const router = Router();
import { getAssignedPlans, reviewPlan } from '../controllers/advisorController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

router.use(authenticateToken);
router.use(authorizeRoles('Advisor'));

// Advisor APIs
router.get('/assigned-plans', getAssignedPlans);
router.post('/review-plan', reviewPlan);

export default router;