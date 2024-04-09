import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { prisma } from "@/prisma";
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
});

deploy.get("/nft-collection", verifyEndPoint, async (req, res) => {
  const allCollections = await prisma.nft_collections.findMany({ take: 10 });

  return res.status(200).json(allCollections);
});

deploy.post(
  "/nft-collection",
  verifyEndPoint,
  makeEndPoint(
    deployContractSchema,
    async (req: Request<any, any, z.infer<typeof deployContractSchema>, any>, res: Response) => {
      const contractSchema = deployContractSchema.safeParse(req.body);

      if (!contractSchema.success) {
        const error = JSON.parse(contractSchema.error.message);
        return res.status(400).json(error);
      }

      const contract = await sdk.getContract(contractSchema.data.contractAddress);
      const metadata = await contract.metadata.get();

      try {
        const collection = await prisma.nft_collections.create({
          data: {
            contract: contractSchema.data.contractAddress,
            name: metadata.name,
            symbol: metadata.symbol || "",
            app_uri: metadata.app_uri || "",
            description: metadata.description || "",
            image: metadata.image || "",
            external_link: metadata.external_link || "",
            fee_recipient: metadata.fee_recipient || "",
            seller_fee_basis_points: metadata.seller_fee_basis_points || 0,
            primary_sale_recipient: metadata.primary_sale_recipient || "",
            owner: contractSchema.data.owner,
            trusted_forwarders: metadata.trusted_forwarders || [],
          },
        });
        return res.status(200).json(collection);
      } catch (error) {
        return res.status(400).json({ message: "Error creating Collection" });
      }
    }
  )
);
