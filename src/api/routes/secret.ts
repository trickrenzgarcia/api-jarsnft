import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '@/prisma';
import { z } from 'zod';
import { makeEndPoint } from '@/middlewares/makeEndPoint';

export const secretRouter = Router();

const schema = z.object({
    address: z.string().min(0),
    name: z.string().min(0)
});

secretRouter.post('/create', makeEndPoint(schema, async (req, res) => {
    const randomBytes = crypto.randomBytes(16)
    const randomHex = randomBytes.toString('hex')
    
    const { address, name } = req.body

    const createSecret = await prisma.apiKeys.create({
        // expires a year from now
        data: {
            address: address,
            name: name,
            apiKey: randomHex,
            expired_at: new Date(Date.now() + 31556952000)
        }
    })

    res.status(201).json({ createSecret })
}))