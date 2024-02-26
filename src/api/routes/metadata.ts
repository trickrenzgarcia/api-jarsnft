import { getAllMetadata, prisma } from "@/prisma";
import sdk from "@/thirdweb";
import { type RequestHandler, Router, Request, Response } from "express";

export const metadata = Router();

metadata.get("/all", async (req, res) => {
  const allMetadata = await getAllMetadata();

  res.status(200).json(allMetadata);
});

metadata.get("/:contract", async (req, res) => {
  const metadata = await prisma.collections.findFirst({
    where: {
      cid: req.params.contract,
    },
  });

  res.status(200).json(metadata);
});
