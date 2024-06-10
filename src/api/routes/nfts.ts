import alchemy from "@/alchemy";
import { NFT_MARKETPLACE } from "@/lib/constant";
import { prisma } from "@/prisma";
import { getNFTByTokenId, getNFTsByWallet } from "@/simplehash";
import sdk from "@/thirdweb";
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
  tokenId: z.string().min(1),
});

nftsRouter.get("/:contractAddress/:tokenId", async (req, res) => {
  const nft = nftSchema.safeParse(req.params);

  if (!nft.success) {
    return res.status(400).json(JSON.parse(nft.error.message));
  }

  const data = await getNFTByTokenId(nft.data.contractAddress, nft.data.tokenId);

  res.status(200).json(data);
});

nftsRouter.get("/getNFTsByWallet", async (req, res) => {
  const wallet = walletSchema.safeParse(req.query);

  if (!wallet.success) {
    return res.status(400).json(JSON.parse(wallet.error.message));
  }

  const nfts = await getNFTsByWallet(wallet.data.walletAddress);

  return res.status(200).json(nfts.nfts);
});

nftsRouter.get("/views", async (req, res) => {
  const nft = nftSchema.safeParse(req.query);

  if (!nft.success) {
    return res.status(400).json(JSON.parse(nft.error.message));
  }

  try {
    const data = await prisma.nftViews.findFirst({
      where: {
        contract: nft.data.contractAddress,
        token_id: nft.data.tokenId,
      },
    });

    return res.status(200).json(data);
  } catch (error) {}
});

nftsRouter.post("/views", async (req, res) => {
  const nft = nftSchema.safeParse(req.body);

  if (!nft.success) {
    return res.status(400).json(JSON.parse(nft.error.message));
  }

  try {
    const data = await prisma.nftViews.findFirst({
      where: {
        contract: nft.data.contractAddress,
        token_id: nft.data.tokenId,
      },
    });

    if (!data) {
      const newView = await prisma.nftViews.create({
        data: {
          contract: nft.data.contractAddress,
          token_id: nft.data.tokenId,
          view_count: 1,
        },
      });
      return res.status(200).json(newView);
    }

    const updatedView = await prisma.nftViews.update({
      where: {
        id: data.id,
        contract: nft.data.contractAddress,
        token_id: nft.data.tokenId,
      },
      data: {
        view_count: data.view_count + 1,
      },
    });

    return res.status(200).json(updatedView);
  } catch (error) {
    // @ts-ignore
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

const transactionSchema = z.object({
  transactionHash: z.string().min(10),
  eventType: z
    .enum([
      "TokensMinted",
      "Transfer",
      "NewListing",
      "NewAuction",
      "NewBid",
      "NewSale",
      "CancelledListing",
      "CancelledAuction",
      "AuctionClosed",
    ])
    .optional(),
});

nftsRouter.post("/tx", async (req, res) => {
  const tx = transactionSchema.safeParse(req.body);

  if (!tx.success) {
    return res.status(400).json(JSON.parse(tx.error.message));
  }

  try {
    const txHash = tx.data.transactionHash;
    const eventType = tx.data.eventType;

    const data = await prisma.nftEvents.create({
      data: {
        transaction_hash: txHash,
        event_type: eventType ? eventType : "Unknown",
      },
    });

    return res.status(200).json(data);
  } catch (error) {
    // @ts-ignore
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

nftsRouter.get("/activities", async (req, res) => {
  const nft = nftSchema.safeParse(req.query);

  if (!nft.success) {
    return res.status(400).json(JSON.parse(nft.error.message));
  }

  try {
    const events = await prisma.nftEvents.findMany({
      where: {
        address: nft.data.contractAddress,
      },
    });

    return res.status(200).json(events);
  } catch (error) {
    // @ts-ignore
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }

  // const marketplace = await sdk.getContract(NFT_MARKETPLACE);
  // const contract = await sdk.getContract(nft.data.contractAddress);

  // const data = await marketplace.events.getEvents("NewListing");

  // return res.status(200).json(data);
});

nftsRouter.get("/getTransaction", async (req, res) => {
  const tx = transactionSchema.safeParse(req.query);

  if (!tx.success) {
    return res.status(400).json(JSON.parse(tx.error.message));
  }
  const CHAIN_ID = process.env.CHAIN_ID;
  const provider = new ethers.providers.InfuraProvider(CHAIN_ID, process.env.INFURA_API_PUBLIC_KEY);

  try {
    const txResult = await provider.getTransaction(tx.data.transactionHash);

    if (!txResult.blockNumber) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const block = await provider.getBlock(txResult.blockNumber);

    if (!block) {
      return res.status(404).json({ error: "Block not found" });
    }

    const timestamp = new Date(block.timestamp * 1000);

    return res.status(200).json({ tx, timestamp });
  } catch (e) {
    // @ts-ignore
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
});
