import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { Router, Response, Request } from "express";

export const nftsRouter = Router();

nftsRouter.get("/:address", verifyEndPoint, async (req, res) => {
  const address = req.params.address;
  try {
    const nfts = await fetch(
      `${process.env.SEPOLIA_ALCHEMY_BASE_URL}${process.env.SEPOLIA_ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}`
    );
    const data = await nfts.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching NFTs" });
  }
});
