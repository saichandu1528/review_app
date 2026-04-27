import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../prisma';

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createUserSchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(4).max(16),
  address: z.string().max(400),
  role: z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER'])
});

import { sendWelcomeEmail } from '../utils/mail.service';

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        address: validatedData.address,
        role: validatedData.role
      }
    });

    // Send welcome email asynchronously (don't block the response)
    sendWelcomeEmail(user.email, user.name, validatedData.password, user.role)
      .catch(err => console.error('Failed to send welcome email:', err));

    res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createStoreSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: z.string(),
  ownerId: z.string(),
  rating: z.number().min(1).max(5).optional()
});

export const createStore = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = createStoreSchema.parse(req.body);

    const owner = await prisma.user.findUnique({ where: { id: validatedData.ownerId } });
    if (!owner || owner.role !== 'STORE_OWNER') {
      return res.status(400).json({ error: 'Invalid ownerId or user is not a STORE_OWNER' });
    }

    const existingStore = await prisma.store.findUnique({
      where: { ownerId: validatedData.ownerId }
    });

    if (existingStore) {
      return res.status(400).json({ error: 'This owner already has a store' });
    }

    const store = await prisma.store.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        address: validatedData.address,
        ownerId: validatedData.ownerId
      }
    });

    // Create initial rating if provided
    if (validatedData.rating) {
      await prisma.rating.create({
        data: {
          value: validatedData.rating,
          storeId: store.id,
          userId: (req as any).user.id // The admin who created it or the owner? 
          // Usually, a rating needs a user. Let's use the current user (the Admin).
        }
      });
    }

    res.status(201).json({ message: 'Store created successfully', store });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getStores = async (req: Request, res: Response): Promise<any> => {
  try {
    const stores = await prisma.store.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (t !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. Delete all ratings submitted by this user
    await prisma.rating.deleteMany({ where: { userId: id as string } });

    // 2. Check if this user owns a store (regardless of role string)
    const store = await prisma.store.findUnique({ where: { ownerId: id as string } });
    if (store) {
      // Delete all ratings for that store first
      await prisma.rating.deleteMany({ where: { storeId: store.id } });
      // Then delete the store
      await prisma.store.delete({ where: { id: store.id } });
    }

    // 3. Finally delete the user
    await prisma.user.delete({ where: { id: id as string } });

    res.json({ message: 'User and all related data deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ error: 'Failed to delete user. They may have related data that cannot be removed.' });
  }
};

export const deleteStore = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({ where: { id: id as string } });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // 1. Delete all ratings for this store first
    await prisma.rating.deleteMany({ where: { storeId: id as string } });

    // 2. Then delete the store
    await prisma.store.delete({ where: { id: id as string } });

    res.json({ message: 'Store and related ratings deleted successfully' });
  } catch (error) {
    console.error('Delete Store Error:', error);
    res.status(500).json({ error: 'Failed to delete store. It may have related data that cannot be removed.' });
  }
};

export const getRatings = async (req: Request, res: Response): Promise<any> => {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteRating = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const rating = await prisma.rating.findUnique({ where: { id: id as string } });
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    await prisma.rating.delete({ where: { id: id as string } });

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
