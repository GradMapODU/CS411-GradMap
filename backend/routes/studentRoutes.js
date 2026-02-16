import { Router } from 'express';
const router = Router();
import { createPlan, getMyPlans } from '../controllers/studentController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

router.use(authenticateToken);
router.use(authorizeRoles('Student'));

// Student APIs
router.post('/create-plan', createPlan);
router.get('/my-plans', getMyPlans);

export default router;