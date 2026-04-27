import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getStores: (req: Request, res: Response) => Promise<any>;
export declare const submitRating: (req: AuthRequest, res: Response) => Promise<any>;
export declare const updatePassword: (req: AuthRequest, res: Response) => Promise<any>;
//# sourceMappingURL=user.controller.d.ts.map