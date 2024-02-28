import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { prisma } from "@/prisma";
import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import { z } from "zod";

export const userRouter = Router();


const walletAddressSchema = z.string().refine(value => /^0x[a-fA-F0-9]{40}$/.test(value), {
  message: 'Wallet address must be starts with "0x" prefix and 40 characters long.'
});
const createUserSchema = z.object({
  address: walletAddressSchema,
})

userRouter.post("/create", verifyEndPoint, makeEndPoint(createUserSchema, 
  async (req: Request<any, any, z.infer<typeof createUserSchema>, any>, res: Response) => {
    const createUser = await prisma.users.create({
        data: {
            uid: randomUUID(),
            address: req.body.address,
            is_listed: false
        }
    })

    const minifiedAddress = (address: string) => address.slice(0, 6) + '...' + address.slice(-5);
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: createUser,
      minifiedAddress: minifiedAddress(req.body.address)
    })
  }
))

const updateUserSchema = z.object({
  address: walletAddressSchema,
  name: z.string(),
  email: z.string().email(),
}) 

userRouter.put("/update", verifyEndPoint, makeEndPoint(updateUserSchema, async (req, res) => {
  const updatedUser = await prisma.users.update({
    where: {
      address: req.body.address
    },
    data: {
      name: req.body.name,
      email: req.body.email,
      is_listed: true
    }
  })

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser
  })
}))