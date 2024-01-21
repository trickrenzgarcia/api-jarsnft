import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Sepolia } from "@thirdweb-dev/chains";
import { z } from "zod";

declare const CommonOptionOutput: z.ZodObject<{
  clientId: z.ZodOptional<z.ZodString>;
  secretKey: z.ZodOptional<z.ZodString>;
}>;

type Option = z.output<typeof CommonOptionOutput>;

const option: Option = {
  clientId: z.string().min(1).optional().parse(process.env.THIRDWEB_CLIENT_ID),
  secretKey: z.string().min(1).optional().parse(process.env.THIRDWEB_API_KEY),
};

const sdk = new ThirdwebSDK("sepolia", option);
export default sdk;
