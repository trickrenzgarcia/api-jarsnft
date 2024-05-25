import alchemy from "@/alchemy";
import { getNFTByTokenId, getNFTsByWallet } from "@/simplehash";
import { ethers } from "ethers";
import { Router, Response, Request } from "express";
import { z } from "zod";

export const nftsRouter = Router();

const ownerSchema = z.object({
  owner: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
  }),
});

const walletSchema = z.object({
  walletAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
  }),
});

const contractSchema = z.object({
  contractAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
  }),
});

nftsRouter.get("/getNFTsForOwner", async (req, res) => {
  const owner = ownerSchema.safeParse(req.query);

  if (!owner.success) {
    return res.status(400).json(JSON.parse(owner.error.message));
  }

  const nfts = await alchemy.nft.getNftsForOwner(owner.data.owner);
  res.status(200).json(nfts);
});

const nftSchema = z.object({
  contractAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
  }),
  tokenId: z.string(),
});

nftsRouter.get("/:contractAddress/:tokenId", async(req, res) => {
  const nft = nftSchema.safeParse(req.params);

  if (!nft.success) {
    return res.status(400).json(JSON.parse(nft.error.message));
  }

  const data = await getNFTByTokenId(nft.data.contractAddress, nft.data.tokenId);

  res.status(200).json(data)
})

nftsRouter.get("/getNFTsByWallet", async (req, res) => {
  const wallet = walletSchema.safeParse(req.query);

  if (!wallet.success) {
    return res.status(400).json(JSON.parse(wallet.error.message));
  }

  const nfts = await getNFTsByWallet(wallet.data.walletAddress);

  return res.status(200).json(nfts.nfts);
})