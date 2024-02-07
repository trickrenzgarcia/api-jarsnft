import sdk from "@/thirdweb";
import { type RequestHandler, Router, Request, Response } from "express";
import { z } from "zod";

export const collection = Router();

const makeGetEndpoint =
  <TQuery>(
    schema: z.Schema<TQuery>,
    callback: (req: Request<TQuery, any, any, any>, res: Response) => void
  ) =>
  (req: Request<TQuery, any, any, any>, res: Response) => {
    const params = schema.safeParse(req.params);

    if (!params.success) {
      res.status(400).send(params.error.message);
    }

    return callback(req, res);
  };

const schema = z.object({
  contract: z.string().refine((value) => value.startsWith("0x")),
});

collection.get("/", (req: Request, res: Response) => {
  // http method not allowed 405
  res.status(405).json({
    statusCode: res.statusCode,
    success: true,
    message: `${req.method} is not allowed.`,
  });
});

collection.get(
  "/:contract",
  makeGetEndpoint(schema, async (req, res) => {
    const contract = await sdk.getContract(req.params.contract);
    const metadata = await contract.metadata.get();
    const nfts = await contract.erc721.getAll();

    res.status(200).json({ metadata, nfts });
  })
);
