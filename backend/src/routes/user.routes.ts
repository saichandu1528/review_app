import { Router } from 'express';
import { getStores, submitRating, updatePassword } from '../controllers/user.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Normal user routes require NORMAL role
router.use(authenticateToken, authorizeRole(['NORMAL']));

router.get('/stores', getStores);
router.post('/ratings', submitRating);
router.put('/password', updatePassword);

export default router;
