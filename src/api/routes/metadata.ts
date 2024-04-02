import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { getAllMetadata, prisma } from "@/prisma";
import sdk from "@/thirdweb";
import { ethers } from "ethers";
import { Router } from "express";
import { z } from "zod";

export const metadata = Router();

const schema = z.object({
  contract: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
  }),
});

metadata.get("/all", async (req, res) => {
  const allMetadata = await getAllMetadata();

  res.status(200).json(allMetadata);
});

metadata.get("/:contract", verifyEndPoint, async (req, res) => {
  const contractAddress = schema.safeParse(req.params);

  if (!contractAddress.success) {
    return res.status(400).json(JSON.parse(contractAddress.error.message));
  }

  const contract = await sdk.getContract(contractAddress.data.contract);
  const metadata = await contract.metadata.get();

  return res.status(200).json(metadata);
});
