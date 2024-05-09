import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { getAllMetadata, prisma } from "@/prisma";
import { ethers } from "ethers";
import { Router } from "express";
import { z } from "zod";
import alchemy from "@/alchemy";

export const metadata = Router();

const schema = z.object({
  contractAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
  }),
});

metadata.get("/all", async (req, res) => {
  const allMetadata = await getAllMetadata();

  res.status(200).json(allMetadata);
});

metadata.get("/getContractMetadata", verifyEndPoint, async (req, res) => {
  const contractAddress = schema.safeParse(req.query);

  if (!contractAddress.success) {
    return res.status(400).json(JSON.parse(contractAddress.error.message));
  }

  try {
    const response = await fetch(
      `${process.env.SEPOLIA_ALCHEMY_BASE_URL}${process.env.SEPOLIA_ALCHEMY_API_KEY}/getContractMetadata?contractAddress=${contractAddress.data.contractAddress}`
    );
    const metadata = await response.json();

    return res.status(200).json(metadata);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Metadata" });
  }
});

metadata.get("/getFloorPrice", async (req, res) => {
  const contractAddress = schema.safeParse(req.query);

  if (!contractAddress.success) {
    return res.status(400).json(JSON.parse(contractAddress.error.message));
  }

  try {
    const floorPrice = alchemy.nft.getFloorPrice(contractAddress.data.contractAddress);
    res.status(200).json(floorPrice);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Floor Price" });
  }
});
