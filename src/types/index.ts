import { type CustomContractOutput } from "@thirdweb-dev/sdk";
import { type CommonNFTOutput } from "@thirdweb-dev/sdk/dist/declarations/src/core/schema/nft";
import { z } from "zod";

export const CustomLoginInput = z.object({
  address: z.string().trim().min(1),
  email: z.string().trim().email().min(1),
  password: z.string().trim().min(1),
});
export type LoginInput = z.input<typeof CustomLoginInput>;

export declare const CustomLoginOutput: z.ZodObject<{
  address: z.ZodOptional<z.ZodString>;
  email: z.ZodOptional<z.ZodString>;
  token: z.ZodString;
}>;
export type LoginOutput = z.output<typeof CustomLoginOutput>;

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
