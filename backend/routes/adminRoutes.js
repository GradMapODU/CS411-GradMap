import { Router } from 'express';
const router = Router();
import { createUser, deleteUser } from '../controllers/adminController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

router.use(authenticateToken);
router.use(authorizeRoles('Administrator'));

// Admin APIs
router.post('/create-user', createUser);
router.delete('/delete-user/:id', deleteUser);

export default router;