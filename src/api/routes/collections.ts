import { Router } from "express";
import { RequestHandler } from "express-serve-static-core";
import { ContractMetadata } from "@/types";
import { PrismaClient } from "@prisma/client";

export const collections = Router();
const prisma = new PrismaClient();

const getAllCollection: RequestHandler<ContractMetadata, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.query;
    const data = await prisma.collections.findMany({ take: 10 });
    console.log(id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

collections.get("/", getAllCollection);
