"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.getDashboardStats = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../prisma"));
const getDashboardStats = async (req, res) => {
    try {
        const ownerId = req.user?.id;
        if (!ownerId)
            return res.status(401).json({ error: 'Unauthorized' });
        const store = await prisma_1.default.store.findUnique({
            where: { ownerId },
            include: {
                ratings: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });
        if (!store) {
            return res.status(404).json({ error: 'Store not found for this owner' });
        }
        let averageRating = 0;
        if (store.ratings.length > 0) {
            averageRating = store.ratings.reduce((acc, curr) => acc + curr.value, 0) / store.ratings.length;
        }
        const usersWhoRated = store.ratings.map(rating => ({
            userId: rating.user.id,
            name: rating.user.name,
            email: rating.user.email,
            ratingValue: rating.value,
            createdAt: rating.createdAt
        }));
        res.json({
            storeName: store.name,
            storeAddress: store.address,
            averageRating,
            usersWhoRated
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getDashboardStats = getDashboardStats;
const updatePasswordSchema = zod_1.z.object({
    newPassword: zod_1.z.string()
        .min(8)
        .max(16)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});
const updatePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const validatedData = updatePasswordSchema.parse(req.body);
        const hashedPassword = await bcrypt_1.default.hash(validatedData.newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updatePassword = updatePassword;
//# sourceMappingURL=store-owner.controller.js.map