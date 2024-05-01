import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { prisma } from "@/prisma";
import { randomUUID } from "crypto";
import { ethers } from "ethers";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { address } from "./address";

export const userRouter = Router();

const schema = z.object({
  address: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid address",
  }),
});

userRouter.get("/getUsers", async (req, res) => {
  const users = await prisma.users.findMany();

  return res.status(200).json(users);
});

userRouter.get("/getUser", async (req, res) => {
  const userSchema = schema.safeParse(req.query);

  if (!userSchema.success) {
    return res.status(400).json(JSON.parse(userSchema.error.message));
  }

  const user = await prisma.users.findUnique({
    where: {
      address: userSchema.data.address,
    },
  });

  return res.status(200).json(user);
});

const createUserSchema = z.object({
  address: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid address",
  }),
});

userRouter.post("/createUser", async (req, res) => {
  const userSchema = createUserSchema.safeParse(req.body);

  if (!userSchema.success) {
    return res.status(400).json(JSON.parse(userSchema.error.message));
  }

  const user = await prisma.users.create({
    data: {
      uid: randomUUID(),
      address: userSchema.data.address,
    },
  });

  return res.status(200).json(user);
});

const updateUserSchema = z.object({
  address: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid address",
  }),
  name: z.string().optional(),
  email: z.string().optional(),
});

userRouter.post("/updateUser", async (req, res) => {
  const userSchema = updateUserSchema.safeParse(req.body);

  if (!userSchema.success) {
    return res.status(400).json(JSON.parse(userSchema.error.message));
  }

  const { address, email, name } = userSchema.data;

  try {
    const user = await prisma.users.update({
      where: { address: address },
      data: { email: email, name: name, is_listed: true },
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
});
