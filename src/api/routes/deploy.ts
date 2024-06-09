import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { prisma } from "@/prisma";
import { getCollection } from "@/simplehash";
import sdk from "@/thirdweb";
import { ethers } from "ethers";
import { Router, Request, Response } from "express";
import { z } from "zod";

export const deploy = Router();

const deployContractSchema = z.object({
  contractAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Contract Address Input is not a valid address or ENS name.",
  }),
  owner: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Owner Address Input is not a valid address or ENS name.",
  }),
  category: z.enum(["art", "photography", "pfp", "gaming"])
});

const deployMintedSchema = z.object({
  contractAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Contract Address Input is not a valid address or ENS name.",
  }),
  tokenId: z.string().min(1)
});

deploy.get("/nft-collection", async (req, res) => {
  const allCollections = await prisma.nftCollections.findMany({ take: 10 });

  return res.status(200).json(allCollections);
});

deploy.post(
  "/nft-collection",
  async (req, res) => {
    const contractSchema = deployContractSchema.safeParse(req.body);

    if (!contractSchema.success) {
      const error = JSON.parse(contractSchema.error.message);
      return res.status(400).json(error);
    }

    const contract = await sdk.getContract(contractSchema.data.contractAddress);
    const metadata = await contract.metadata.get();
    

    if(!metadata) {
      return res.status(404).json({ error: "Contract does not have metadata." });
    }

    try {
      const collection = await prisma.nftCollections.create({
        data: {
          contract: contractSchema.data.contractAddress,
          owner: contractSchema.data.owner,
          name: metadata.name,
          symbol: metadata.symbol,
          description: metadata.description,
          primary_sale_recipient: metadata.fee_recipient,
          app_uri: metadata.app_uri,
          external_link: metadata.external_link,
          fee_recipient: contractSchema.data.owner,
          seller_fee_basis_points: metadata.seller_fee_basis_points,
          image: metadata.image,
          trusted_forwarders: JSON.stringify([]),
          category: contractSchema.data.category,       
        }
      });
  
      return res.status(200).json(collection);
    } catch (error)  {
      return res.status(500).json("Something went wrong. Please try again.");
    }
  }
);

deploy.get('/nft-minted', async (req, res) => {
  const mintedSchema = deployMintedSchema.safeParse(req.query);

  if(!mintedSchema.success) {
    const error = JSON.parse(mintedSchema.error.message);
    return res.status(400).json(error);
  }



  const contract = await sdk.getContract(mintedSchema.data.contractAddress);
  const nft = await contract.erc721.get(mintedSchema.data.tokenId);

  res.status(200).json(nft);
});

deploy.post('/nft-minted', async (req, res) => {
  const mintedSchema = deployMintedSchema.safeParse(req.body);

  if(!mintedSchema.success) {
    const error = JSON.parse(mintedSchema.error.message);
    return res.status(400).json(error);
  }
});