"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_owner_controller_1 = require("../controllers/store-owner.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Store Owner routes require STORE_OWNER role
router.use(auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['STORE_OWNER']));
router.get('/dashboard', store_owner_controller_1.getDashboardStats);
router.put('/password', store_owner_controller_1.updatePassword);
exports.default = router;
//# sourceMappingURL=store-owner.routes.js.map