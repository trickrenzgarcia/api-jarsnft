import { getUserAddress } from "@/prisma";
import { Router, Request, Response } from "express";
import { z } from "zod";

export const test = Router();

const makeGetEndpoint =
  <TQuery>(schema: z.Schema<TQuery>, callback: (req: Request, res: Response) => void) =>
  (req: Request<any, any, any, TQuery>, res: Response) => {
    const queryParamsResult = schema.safeParse(req.query);

    if (!queryParamsResult.success) {
      return res.status(400).send(queryParamsResult.error.message);
    }
    return callback(req as any, res);
  };

test.get(
  "/",
  makeGetEndpoint(z.object({ id: z.string() }), (req, res) => {
    const id = req.query.id;

    res.json(id);
  })
);

test.get("/:address", async (req, res) => {
  const user = await getUserAddress(req.params.address);
  if (!user)
    return res.status(404).json({
      success: false,
      error: { message: "user not found", code: res.statusCode },
    });

  return res.status(200).json({ success: true, user });
});

test.get("/", async (req, res) => {});
