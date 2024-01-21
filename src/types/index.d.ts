import { CustomContractOutput } from "@thirdweb-dev/sdk";
import { CommonNFTOutput } from "@thirdweb-dev/sdk/dist/declarations/src/core/schema/nft";
import { z } from "zod";

/**
 * @public
 */
export type ContractMetadata = z.output<typeof CustomContractOutput>;
/**
 * @public
 */
export type NFTMetadata = z.output<typeof CommonNFTOutput>;
/**
 * @public
 */
export type NFT = {
  metadata: NFTMetadata;
  owner: string;
  type: "ERC1155" | "ERC721" | "metaplex";
  supply: string;
  quantityOwned?: string;
};
//# sourceMappingURL=index.d.ts.map
