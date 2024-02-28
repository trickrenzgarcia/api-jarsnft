import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/prisma';
import { verifyEndPoint } from '@/middlewares/verifyEndPoint';
import { z } from 'zod';
import { makeEndPoint } from '@/middlewares/makeEndPoint';

const secretKey = process.env.JWT_SECRET_KEY as string;

export const secretRouter = Router();

const schema = z.object({
    address: z.string().min(0),
    name: z.string().min(0)
});

secretRouter.post('/create', verifyEndPoint, makeEndPoint(schema, async (req, res) => {
    const randomBytes = crypto.randomBytes(16)
    const randomHex = randomBytes.toString('hex')
    
    const { address, name } = req.body

    const createSecret = await prisma.api_keys.create({
        // expires a year from now
        data: {
            address: address,
            name: name,
            apiKey: randomHex,
            expired_at: new Date(Date.now() + 31556952000)
        }
    })

    res.status(201).json({
        success: true,
        message: 'API Key created successfully',
        data: createSecret
    })
}))