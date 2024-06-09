import { Router, Request } from "express";
import { type RequestHandler } from "express";
import { type ContractMetadata } from "@/types";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/prisma";
import { z } from "zod";
import { ethers } from "ethers";

export const collections = Router();

collections.get("/", async (req, res) => {
  try {
    const collections = await prisma.nftCollections.findMany({ take: 10 });
    return res.status(200).json(collections);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Collections" });
  }
});

const schema = z.object({
  category: z.enum(["art", "photography", "pfp", "gaming"], {
    required_error: "Category is required",
  }),
  page: z
    .number()
    .int()
    .positive()
    .default(1),
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),
});

type TrendingParams = {
  category: "art" | "photography" | "pfp" | "gaming",
  page: string,
  limit: string,
};

collections.get("/trending", async (req: Request<any, any, any, TrendingParams>, res) => {
  const trending = schema.safeParse({
    category: req.query.category,
    page: parseInt(req.query.page, 10),
    limit: parseInt(req.query.limit, 10),
  });

  if(!trending.success) {
    return res.status(400).json({ message: trending.error.errors[0].message });
  }

  const { category, page, limit } = trending.data;
  const skip = (page - 1) * limit;

  try {
    const collections = await prisma.nftCollections.findMany({
      where: {
        category,
      },
      skip,
      take: limit,
    });

    const total = await prisma.nftCollections.count({
      where: {
        category,
      },
    });

    return res.status(200).json({
      collections,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(400).json({ message: "Error fetching trending collections" });
  }
});
