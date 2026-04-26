import { Router } from 'express';
import { getDashboardStats, createUser, createStore, getUsers, getStores, deleteUser, deleteStore, getRatings, deleteRating } from '../controllers/admin.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// All routes here require ADMIN role
router.use(authenticateToken, authorizeRole(['ADMIN']));

router.get('/dashboard', getDashboardStats);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.post('/stores', createStore);
router.delete('/stores/:id', deleteStore);
router.get('/users', getUsers);
router.get('/stores', getStores);
router.get('/ratings', getRatings);
router.delete('/ratings/:id', deleteRating);

export default router;
