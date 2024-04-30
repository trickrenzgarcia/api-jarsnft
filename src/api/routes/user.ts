import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { prisma } from "@/prisma";
import { randomUUID } from "crypto";
import { ethers } from "ethers";
import { Router, Request, Response } from "express";
import { z } from "zod";

export const userRouter = Router();

const addressSchema = z.string().refine((value) => ethers.utils.isAddress(value), {
  message: "Invalid address",
});

const createUserSchema = z.object({
  address: addressSchema,
});

const userParamsSchema = z.object({
  address: addressSchema,
});

const updateUserSchema = z.object({
  address: addressSchema,
  name: z.string().min(3, { message: "Name must be at least 3 character long" }),
  email: z.string().email(),
  is_listed: z.boolean(),
});

userRouter.get("/all", verifyEndPoint, async (req, res) => {
  const users = await prisma.users.findMany();

  if (!users) {
    return res.status(404).json({ message: "No users found" });
  }

  return res.status(200).json(users);
});

userRouter.get(
  "/:address",
  verifyEndPoint,
  async (req: Request<z.infer<typeof userParamsSchema>, any, any, any>, res: Response) => {
    const params = userParamsSchema.safeParse(req.params);
    if (!params.success) {
      const error = JSON.parse(params.error.message);
      return res.status(400).json(error);
    }

    const user = await prisma.users.findUnique({
      where: {
        address: req.params.address,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  }
);

userRouter.get("/profile/:address", verifyEndPoint, async (req, res) => {
  const userWithProfile = await prisma.users.findUnique({
    where: {
      address: req.params.address,
    },
    include: {
      profile: true,
    },
  });

  if (!userWithProfile) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(userWithProfile);
});

userRouter.post(
  "/create",
  verifyEndPoint,
  makeEndPoint(
    createUserSchema,
    async (req: Request<any, any, z.infer<typeof createUserSchema>, any>, res: Response) => {
      console.log("Hey");
      const createUser = await prisma.users.create({
        data: {
          uid: randomUUID(),
          address: req.body.address,
          is_listed: false,
        },
      });
      console.log(createUser);

      if (!createUser) {
        return res.status(500).json({ message: "Failed to create user" });
      }

      return res.status(201).json(createUser);
    }
  )
);

userRouter.put(
  "/update",
  verifyEndPoint,
  makeEndPoint(
    updateUserSchema,
    async (req: Request<any, any, z.infer<typeof updateUserSchema>, any>, res: Response) => {
      // Check if the address exists in the database
      const user = await prisma.users.findUnique({
        where: {
          address: req.body.address,
        },
        select: { address: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update the user if address exists in the database
      const updatedUser = await prisma.users.update({
        where: {
          address: req.body.address,
        },
        data: {
          name: req.body.name,
          email: req.body.email,
          is_listed: req.body.is_listed,
        },
      });

      res.status(200).json(updatedUser);
    }
  )
);
