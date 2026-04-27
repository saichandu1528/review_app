"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.submitRating = exports.getStores = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../prisma"));
const getStores = async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        if (search && typeof search === 'string') {
            whereClause = {
                OR: [
                    { name: { contains: search } },
                    { address: { contains: search } }
                ]
            };
        }
        const stores = await prisma_1.default.store.findMany({
            where: whereClause,
            include: {
                ratings: true
            }
        });
        // We also need to send the user's submitted rating if they are logged in
        // Since this is an authenticated route, req.user.id is available
        const userId = req.user?.id;
        const storesWithRatings = stores.map(store => {
            let overallRating = null;
            let userRating = null;
            if (store.ratings.length > 0) {
                overallRating = store.ratings.reduce((acc, curr) => acc + curr.value, 0) / store.ratings.length;
                if (userId) {
                    const uRating = store.ratings.find(r => r.userId === userId);
                    if (uRating)
                        userRating = uRating.value;
                }
            }
            return {
                id: store.id,
                name: store.name,
                address: store.address,
                overallRating,
                userRating
            };
        });
        res.json(storesWithRatings);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getStores = getStores;
const submitRatingSchema = zod_1.z.object({
    storeId: zod_1.z.string(),
    value: zod_1.z.number().min(1).max(5)
});
const submitRating = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const validatedData = submitRatingSchema.parse(req.body);
        // Check if rating already exists
        const existingRating = await prisma_1.default.rating.findUnique({
            where: {
                storeId_userId: {
                    storeId: validatedData.storeId,
                    userId: userId
                }
            }
        });
        if (existingRating) {
            // Modify rating
            const updatedRating = await prisma_1.default.rating.update({
                where: { id: existingRating.id },
                data: { value: validatedData.value }
            });
            return res.json({ message: 'Rating updated successfully', rating: updatedRating });
        }
        // Submit new rating
        const rating = await prisma_1.default.rating.create({
            data: {
                value: validatedData.value,
                storeId: validatedData.storeId,
                userId: userId
            }
        });
        res.status(201).json({ message: 'Rating submitted successfully', rating });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.submitRating = submitRating;
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
//# sourceMappingURL=user.controller.js.map