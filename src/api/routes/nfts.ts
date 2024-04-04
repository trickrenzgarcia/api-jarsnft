import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { Router, Response, Request } from "express";

export const nftsRouter = Router();

nftsRouter.get("/:address", verifyEndPoint, async (req, res) => {
  const address = req.params.address;
  try {
    const nfts = await fetch(
      `https://eth-sepolia.g.alchemy.com/nft/v3/8NdhArhTjfpQ6owO-4b3YLWjqw9oTI2Z/getNFTsForOwner?owner=${address}`
    );
    const data = await nfts.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching NFTs" });
  }
});
