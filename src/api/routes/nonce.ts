import { nonceExists, saveNonce } from "@/prisma";
import { Router, Request, Response } from "express";

export const nonce = Router();

type ReqBody = {
  nonce: string;
};

nonce.post("/validate", async (req: Request<any, any, ReqBody, any>, res: Response) => {
  const nonce = await nonceExists(req.body.nonce);
  if (nonce) {
    res.status(409).json({ isExists: nonce });
  }

  res.status(200).json({ isExists: nonce });
});

nonce.post("/create", async (req: Request<any, any, ReqBody, any>, res: Response) => {
  const newNonce = await saveNonce(req.body.nonce);

  if (!newNonce) {
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }

  res.status(200).json({
    success: true,
    nonce: newNonce,
  });
});
