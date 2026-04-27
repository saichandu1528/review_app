"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRating = exports.getRatings = exports.deleteStore = exports.deleteUser = exports.getStores = exports.getUsers = exports.createStore = exports.createUser = exports.getDashboardStats = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../prisma"));
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await prisma_1.default.user.count();
        const totalStores = await prisma_1.default.store.count();
        const totalRatings = await prisma_1.default.rating.count();
        res.json({
            totalUsers,
            totalStores,
            totalRatings
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getDashboardStats = getDashboardStats;
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(20),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(4).max(16),
    address: zod_1.z.string().max(400),
    role: zod_1.z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER'])
});
const mail_service_1 = require("../utils/mail.service");
const createUser = async (req, res) => {
    try {
        const validatedData = createUserSchema.parse(req.body);
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: validatedData.email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const hashedPassword = await bcrypt_1.default.hash(validatedData.password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                address: validatedData.address,
                role: validatedData.role
            }
        });
        // Send welcome email asynchronously (don't block the response)
        (0, mail_service_1.sendWelcomeEmail)(user.email, user.name, validatedData.password, user.role)
            .catch(err => console.error('Failed to send welcome email:', err));
        res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email, role: user.role } });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createUser = createUser;
const createStoreSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    address: zod_1.z.string(),
    ownerId: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5).optional()
});
const createStore = async (req, res) => {
    try {
        const validatedData = createStoreSchema.parse(req.body);
        const owner = await prisma_1.default.user.findUnique({ where: { id: validatedData.ownerId } });
        if (!owner || owner.role !== 'STORE_OWNER') {
            return res.status(400).json({ error: 'Invalid ownerId or user is not a STORE_OWNER' });
        }
        const existingStore = await prisma_1.default.store.findUnique({
            where: { ownerId: validatedData.ownerId }
        });
        if (existingStore) {
            return res.status(400).json({ error: 'This owner already has a store' });
        }
        const store = await prisma_1.default.store.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                address: validatedData.address,
                ownerId: validatedData.ownerId
            }
        });
        // Create initial rating if provided
        if (validatedData.rating) {
            await prisma_1.default.rating.create({
                data: {
                    value: validatedData.rating,
                    storeId: store.id,
                    userId: req.user.id // The admin who created it or the owner? 
                    // Usually, a rating needs a user. Let's use the current user (the Admin).
                }
            });
        }
        res.status(201).json({ message: 'Store created successfully', store });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createStore = createStore;
const getUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                role: true,
                ownedStore: {
                    select: {
                        id: true,
                        ratings: {
                            select: { value: true }
                        }
                    }
                }
            }
        });
        // Calculate store ratings if STORE_OWNER
        const usersWithRatings = users.map(user => {
            let rating = null;
            if (user.role === 'STORE_OWNER' && user.ownedStore) {
                const ratings = user.ownedStore.ratings;
                if (ratings.length > 0) {
                    rating = ratings.reduce((acc, curr) => acc + curr.value, 0) / ratings.length;
                }
            }
            return {
                ...user,
                rating
            };
        });
        res.json(usersWithRatings);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getUsers = getUsers;
const getStores = async (req, res) => {
    try {
        const stores = await prisma_1.default.store.findMany({
            include: {
                ratings: true
            }
        });
        const storesWithRatings = stores.map(store => {
            let rating = null;
            if (store.ratings.length > 0) {
                rating = store.ratings.reduce((acc, curr) => acc + curr.value, 0) / store.ratings.length;
            }
            return {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                rating
            };
        });
        res.json(storesWithRatings);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getStores = getStores;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user exists
        const user = await prisma_1.default.user.findUnique({ where: { id: id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Delete user (associated store and ratings will be handled by cascade or manually if needed)
        // In our schema, we didn't specify onDelete: Cascade, so we might need to handle it.
        // Actually, let's just delete the user.
        await prisma_1.default.user.delete({ where: { id: id } });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteUser = deleteUser;
const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await prisma_1.default.store.findUnique({ where: { id: id } });
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        await prisma_1.default.store.delete({ where: { id: id } });
        res.json({ message: 'Store deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteStore = deleteStore;
const getRatings = async (req, res) => {
    try {
        const ratings = await prisma_1.default.rating.findMany({
            include: {
                user: { select: { name: true, email: true } },
                store: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ratings);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getRatings = getRatings;
const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const rating = await prisma_1.default.rating.findUnique({ where: { id: id } });
        if (!rating) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        await prisma_1.default.rating.delete({ where: { id: id } });
        res.json({ message: 'Rating deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteRating = deleteRating;
//# sourceMappingURL=admin.controller.js.map