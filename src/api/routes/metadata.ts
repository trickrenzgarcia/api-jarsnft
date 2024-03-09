import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { verifyEndPoint } from "@/middlewares/verifyEndPoint";
import { getAllMetadata, prisma } from "@/prisma";
import sdk from "@/thirdweb";
import { type RequestHandler, Router, Request, Response } from "express";
import { z } from "zod";

export const metadata = Router();

metadata.get("/all", async (req, res) => {
  const allMetadata = await getAllMetadata();

  res.status(200).json(allMetadata);
});

metadata.get("/:contract", verifyEndPoint, async (req, res) => {
  const metadata = await prisma.collections.findFirst({
    where: {
      cid: req.params.contract,
    },
  });

  if(!metadata) {
    return res.status(404).json({ message: "Contract Metadata Not found" });
  }

  return res.status(200).json(metadata);
});

