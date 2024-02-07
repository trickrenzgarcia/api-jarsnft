import { getUserAddress } from "@/prisma";
import { Router, Request, Response } from "express";
import { z } from "zod";

export const address = Router();

const getHandler =
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
  address: z.string().min(1),
});

address.get(
  "/:address",
  getHandler(schema, async (req, res) => {
    const user = await getUserAddress(req.params.address);
    if (!user)
      return res.status(404).json({
        success: false,
        error: { message: "user not found", code: res.statusCode },
      });

    return res.status(200).json({ success: true, user });
  })
);
