import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getStores = async (req: Request, res: Response): Promise<any> => {
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

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        ratings: true
      }
    });

    // We also need to send the user's submitted rating if they are logged in
    // Since this is an authenticated route, req.user.id is available
    const userId = (req as AuthRequest).user?.id;

    const storesWithRatings = stores.map(store => {
      let overallRating = null;
      let userRating = null;

      if (store.ratings.length > 0) {
        overallRating = store.ratings.reduce((acc, curr) => acc + curr.value, 0) / store.ratings.length;
        
        if (userId) {
          const uRating = store.ratings.find(r => r.userId === userId);
          if (uRating) userRating = uRating.value;
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
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const submitRatingSchema = z.object({
  storeId: z.string(),
  value: z.number().min(1).max(5)
});

export const submitRating = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const validatedData = submitRatingSchema.parse(req.body);

    // Check if rating already exists
    const existingRating = await prisma.rating.findUnique({
      where: {
        storeId_userId: {
          storeId: validatedData.storeId,
          userId: userId
        }
      }
    });

    if (existingRating) {
      // Modify rating
      const updatedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { value: validatedData.value }
      });
      return res.json({ message: 'Rating updated successfully', rating: updatedRating });
    }

    // Submit new rating
    const rating = await prisma.rating.create({
      data: {
        value: validatedData.value,
        storeId: validatedData.storeId,
        userId: userId
      }
    });

    res.status(201).json({ message: 'Rating submitted successfully', rating });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
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
