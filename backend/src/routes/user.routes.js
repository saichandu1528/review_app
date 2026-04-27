"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Normal user routes require NORMAL role
router.use(auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['NORMAL']));
router.get('/stores', user_controller_1.getStores);
router.post('/ratings', user_controller_1.submitRating);
router.put('/password', user_controller_1.updatePassword);
exports.default = router;
//# sourceMappingURL=user.routes.js.map