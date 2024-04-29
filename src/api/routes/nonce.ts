import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { prisma } from "@/prisma";
import { Router } from "express";
import { z } from "zod";

export const nonce = Router();

const nonceSchema = z.object({
  nonce: z.string().min(1),
});

nonce.post(
  "/validate",
  verifyEndPoint,
  makeEndPoint(nonceSchema, async (req, res) => {
    const nonce = await prisma.nonce.findFirst({
      where: {
        nonce: req.body.nonce,
      },
    });

    if (nonce) {
      return res.status(409).json(true);
    }

    return res.status(200).json(false);
  })
);

nonce.post("/create", verifyEndPoint, async (req, res) => {
  try {
    const createNonce = await prisma.nonce.create({
      data: {
        nonce: req.body.nonce,
      },
    });

    if (!createNonce) {
      return res.status(500).json({ message: "Failed to create nonce" });
    }

    return res.status(201).json(createNonce);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create nonce", error: error });
  }
});
