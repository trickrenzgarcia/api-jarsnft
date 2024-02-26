import { Router } from "express";
import { type RequestHandler } from "express";
import { type ContractMetadata } from "@/types";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/prisma";

export const collections = Router();

collections.get("/", async (req, res) => {
  const allCollections = await prisma.collections.findMany({ take: 10 });

  return res.status(200).json(allCollections);
});
