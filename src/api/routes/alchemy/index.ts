import { Network, Alchemy, type AlchemySettings, AssetTransfersCategory, fromHex } from "alchemy-sdk";
import { Router } from "express";

const settings: AlchemySettings = {
    apiKey: process.env.SEPOLIA_ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
}

const alchemy = new Alchemy(settings);

export const alchemyRouter = Router();

alchemyRouter.get("/", async (req, res) => {
    const s = await alchemy.nft.getContractMetadata("0x317197Bcbf59603cd999fFC9e090279b35b60249")
    console.log(s)
    res.json({ s });
})

alchemyRouter.get("/newBlock", async (req, res) => {
    const latestBlock = await alchemy.core.getBlockNumber()
    res.json({ latestBlock });
});

alchemyRouter.get("/transferHistory", async (req, res) => {
    const response = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        contractAddresses: ["0x317197Bcbf59603cd999fFC9e090279b35b60249"],
        category: [AssetTransfersCategory.ERC721],
        excludeZeroValue: false,
    });

    const nftId = 0;

    let txns = response.transfers.filter((txn) => fromHex(txn.erc721TokenId) === nftId)
    console.log(txns)
    res.json({ txns });
})