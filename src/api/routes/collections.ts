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
  owner: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Owner Address Input is not a valid address or ENS name.",
  }),
});

collections.get("/getContractsForOwner", async (req, res) => {
  const ownerSchema = schema.safeParse(req.query);

  if (!ownerSchema.success) {
    return res.status(400).json(JSON.parse(ownerSchema.error.message));
  }

  try {
    const collections = await prisma.nftCollections.findMany({
      where: {
        owner: ownerSchema.data.owner,
      },
    });
    return res.status(200).json(collections);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Collections" });
  }
});

collections.get("/getTrendingCollections", async (req, res) => {
  // https://api.simplehash.com/api/v0/nfts/collections/trending?chains=ethereum&limit=100
});
