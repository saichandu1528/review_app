import { Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const store = await prisma.store.findUnique({
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
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updatePasswordSchema = z.object({
  newPassword: z.string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const updatePassword = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const validatedData = updatePasswordSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
