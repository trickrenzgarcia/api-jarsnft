import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { prisma } from "@/prisma";
import sdk from "@/thirdweb";
import { ethers } from "ethers";
import { Router, Request, Response } from "express";
import { z } from "zod";

export const deploy = Router();

const contractAddressSchema = z.object({
  contractAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Input is not a valid address or ENS name.",
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
    contractAddressSchema,
    async (req: Request<any, any, z.infer<typeof contractAddressSchema>, any>, res: Response) => {
      const contractAddress = contractAddressSchema.safeParse(req.body);

      if (!contractAddress.success) {
        const error = JSON.parse(contractAddress.error.message);
        return res.status(400).json(error);
      }

      const contract = await sdk.getContract(contractAddress.data.contractAddress);
      const metadata = await contract.metadata.get();

      const collection = await prisma.nft_collections.create({
        data: {
          contract: contractAddress.data.contractAddress,
          name: metadata.name,
          symbol: metadata.symbol || "",
          app_uri: metadata.app_uri || "",
          description: metadata.description || "",
          image: metadata.image || "",
          external_link: metadata.external_link || "",
          fee_recipient: metadata.fee_recipient || "",
          seller_fee_basis_points: metadata.seller_fee_basis_points || 0,
          primary_sale_recipient: metadata.primary_sale_recipient || "",
          trusted_forwarders: metadata.trusted_forwarders || [],
        },
      });
      return res.status(200).json(collection);
    }
  )
);
