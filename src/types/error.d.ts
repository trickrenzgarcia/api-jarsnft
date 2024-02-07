import type { z } from "zod";

/**
 * @internal
 */
export declare const CustomErrorOutput: z.ZodObject<{
  message: z.ZodString;
  statusCode: z.ZodOptional<z.ZodNumber>;
  stack: z.ZodOptional<z.ZodString>;
}>;
export type ErrorResponse = z.output<typeof CustomErrorOutput>;
