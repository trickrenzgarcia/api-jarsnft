import { getCollectionMetadata, prisma } from "@/prisma";
import { getCollection } from "@/simplehash";
import sdk from "@/thirdweb";
import { ethers } from "ethers";
import { type RequestHandler, Router, Request, Response } from "express";
import { z } from "zod";

export const collection = Router();

const schema = z.object({
  contractAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid Address Input is not a valid address or ENS name.",
  }),
});

const owner = z.object({
  owner: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid Address Input is not a valid address or ENS name.",
  }),
});

collection.get("/getCollection", async (req, res) => {
  const contractAddress = schema.safeParse(req.query);
  if (!contractAddress.success) {
    return res.status(400).json(JSON.parse(contractAddress.error.message));
  }

  try {
    const collection = prisma.nftCollections.findUnique({
      where: {
        contract: contractAddress.data.contractAddress,
      },
    });
    const simpleHash = getCollection(contractAddress.data.contractAddress);
    const [collectionData, simpleHashData] = await Promise.all([collection, simpleHash]);
    const data = { ...collectionData, simpleHashData: simpleHashData };
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Collection" });
  }
});

collection.put("/updateViewCount", async (req, res) => {
  const contractAddress = schema.safeParse(req.query);
  if (!contractAddress.success) {
    return res.status(400).json(JSON.parse(contractAddress.error.message));
  }

  try {
    const collection = prisma.nftCollections.update({
      where: {
        contract: contractAddress.data.contractAddress,
      },
      data: {
        view_count: { increment: 1 },
      },
      select: { view_count: true },
    });

    return res.status(200).json(collection);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Collection" });
  }
});

collection.get("/getCollectionsByOwner", async (req, res) => {
  const ownerAddress = owner.safeParse(req.query);
  if (!ownerAddress.success) {
    return res.status(400).json(JSON.parse(ownerAddress.error.message));
  }

  try {
    const collection = await prisma.nftCollections.findMany({
      where: {
        owner: ownerAddress.data.owner,
      },
    });

    return res.status(200).json(collection);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Collection" });
  }
});

collection.get("/thirdweb", async (req, res) => {
  const contractAddress = schema.safeParse(req.query);
  if (!contractAddress.success) {
    return res.status(400).json(JSON.parse(contractAddress.error.message));
  }
  const contract = await sdk.getContract(contractAddress.data.contractAddress);
  const metadata = await contract.metadata.get();
  
  res.status(200).json(metadata);
})