import { prisma } from "@/prisma";
import { Router } from "express";
import { z } from "zod";

export const search = Router();

const searchSchema = z.object({
  q: z.string().min(3),
});

search.get("/", async (req, res) => {
  const search = searchSchema.safeParse(req.query);

  if (!search.success) {
    return res.status(200).json(null);
  }

  try {
    const result = await prisma.nftCollections.findMany({
      where: {
        OR: [
          {
            contract: {
              contains: search.data.q,
            }
          },
          {
            name: {
              contains: search.data.q,
            },
          },
        ]
      }
    });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(200).json(null);
  }
});