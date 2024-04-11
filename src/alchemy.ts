import { Alchemy, Network, NftFilters } from "alchemy-sdk";

const config = {
  apiKey: process.env.SEPOLIA_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

export default alchemy;
