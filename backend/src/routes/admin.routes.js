"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes here require ADMIN role
router.use(auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['ADMIN']));
router.get('/dashboard', admin_controller_1.getDashboardStats);
router.post('/users', admin_controller_1.createUser);
router.delete('/users/:id', admin_controller_1.deleteUser);
router.post('/stores', admin_controller_1.createStore);
router.delete('/stores/:id', admin_controller_1.deleteStore);
router.get('/users', admin_controller_1.getUsers);
router.get('/stores', admin_controller_1.getStores);
router.get('/ratings', admin_controller_1.getRatings);
router.delete('/ratings/:id', admin_controller_1.deleteRating);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map