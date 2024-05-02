import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { getContractsByDeployer } from "@/simplehash";
import { ethers } from "ethers";
import { Router } from "express";
import { z } from "zod";

export const contracts = Router();

const schema = z.object({
  walletAddress: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Owner Address Input is not a valid address or ENS name.",
  }),
});

contracts.get("/getContractsForOwner", verifyEndPoint, async (req, res) => {
  const walletAddress = schema.safeParse(req.query);

  if (!walletAddress.success) {
    return res.status(400).json(JSON.parse(walletAddress.error.message));
  }

  try {
    const contracts = await getContractsByDeployer(walletAddress.data.walletAddress);
    return res.status(200).json(contracts);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Collections" });
  }
});
