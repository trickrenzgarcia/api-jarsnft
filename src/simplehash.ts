import { SimpleHashCollection } from "./types/simple-hash/collection";

const baseURL = "https://api.simplehash.com/api/v0/nfts";
const apiKey = process.env.SIMPLEHASH_API_KEY as string;

type CollectionEndpoints = "collections";

type Chain =
  | "ethereum"
  | "ethereum-sepolia"
  | "polygon"
  | "solana"
  | "polygon-zkevm"
  | "polygon-mumbai"
  | "polygon-zkevm-testnet"
  | "polygon-amoy";

const chain: Chain = process.env.CHAIN as Chain;

const get = async (endpoint: string) =>
  fetch(endpoint, {
    headers: {
      "X-API-KEY": apiKey,
    },
  });

export const getCollection = async (contractAddress: string) => {
  const response = await get(
    `${baseURL}/collections/${chain}/${contractAddress}?include_top_contract_details=1&limit=50`
  );
  const data = await response.json();
  return data as SimpleHashCollection;
};
