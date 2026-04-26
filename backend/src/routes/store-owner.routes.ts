import { Router } from 'express';
import { getDashboardStats, updatePassword } from '../controllers/store-owner.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Store Owner routes require STORE_OWNER role
router.use(authenticateToken, authorizeRole(['STORE_OWNER']));

router.get('/dashboard', getDashboardStats);
router.put('/password', updatePassword);

export default router;
