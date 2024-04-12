import alchemy from "@/alchemy";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { ethers } from "ethers";
import { Router, Response, Request } from "express";
import { z } from "zod";

export const nftsRouter = Router();

const ownerSchema = z.object({
  owner: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
  }),
});

const contractSchema = z.object({
  contractAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
  }),
});

nftsRouter.get("/getNFTsForOwner", verifyEndPoint, async (req, res) => {
  const owner = ownerSchema.safeParse(req.query);

  if (!owner.success) {
    return res.status(400).json(JSON.parse(owner.error.message));
  }

  const nfts = await alchemy.nft.getNftsForOwner(owner.data.owner);
  res.status(200).json(nfts);
});
