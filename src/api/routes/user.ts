import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { prisma } from "@/prisma";
import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import { z } from "zod";

export const userRouter = Router();

userRouter.get("/", verifyEndPoint, async (req, res) => {
  res.status(200).json({ message: "User route" });
})

const walletAddressSchema = z.string().refine(value => /^0x[a-fA-F0-9]/.test(value), {
  message: 'Wallet address must be starts with "0x" prefix and 45 characters long.'
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
  // Check if the address exists in the database
  const user = await prisma.users.findUnique({
    where: {
      address: req.body.address
    }
  })

  if(!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    })
  }
  

  // Update the user if address exists in the database
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

const userParamsSchema = z.object({
  address: walletAddressSchema
})

userRouter.get("/:address", verifyEndPoint, async (req: Request<z.infer<typeof userParamsSchema>, any, any, any>, res: Response) => {
  const params = userParamsSchema.safeParse(req.params);
  if(!params.success) {
    const error = JSON.parse(params.error.message);
    return res.status(400).json(error);
  }
  
  const user = await prisma.users.findUnique({
    where: {
      address: req.params.address
    }
  })

  if(!user) {
    return res.status(404).json({
      success: true,
      message: "User not found",
      data: user
    })
  }

  return res.status(200).json({
    success: true,
    message: "User found",
    data: user
  })

})

userRouter.post("/:address", verifyEndPoint, async (req: Request<z.infer<typeof userParamsSchema>, any, any, any>, res: Response) => {
  const params = userParamsSchema.safeParse(req.params);
  if(!params.success) {
    const error = JSON.parse(params.error.message);
    return res.status(400).json(error);
  }
  
  const user = await prisma.users.findUnique({
    where: {
      address: req.params.address
    }
  })

  if(!user) {
    return res.status(404).json({
      success: true,
      message: "User not found",
      data: user
    })
  }

  return res.status(200).json({
    success: true,
    message: "User found",
    data: user
  })
})