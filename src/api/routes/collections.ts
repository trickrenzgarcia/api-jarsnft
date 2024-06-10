import { Router, Request } from "express";
import { type RequestHandler } from "express";
import { type ContractMetadata } from "@/types";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/prisma";
import { z } from "zod";
import { ethers } from "ethers";
import sdk from "@/thirdweb";
import { NFT_MARKETPLACE } from "@/lib/constant";
import { weiToEth } from "@/lib/utils";

export const collections = Router();

collections.get("/popular", async (req, res) => {
  try {
    const marketPlace = await sdk.getContract(NFT_MARKETPLACE, "marketplace-v3");
    const res1 = marketPlace.events.getEvents("NewSale");
    
    // Fetch collections with their view counts
    const res2 = prisma.nftCollections.findMany({
      take: 100,
    });

    const [sales, collections] = await Promise.all([res1, res2]);

    // Fetch view counts from nftViews
    const views = await prisma.nftViews.groupBy({
      by: ['contract'],
      _sum: {
        view_count: true
      },
      where: {
        contract: {
          in: collections.map((collection) => collection.contract)
        }
      }
    });

    // Create a map for quick lookup of nftViews view counts
    const viewsMap = new Map();
    views.forEach(view => {
      viewsMap.set(view.contract, view._sum.view_count || 0);
    });

    // Create a map for cumulative totalPricePaid
    const salesMap = new Map();
    sales.forEach(sale => {
      const contract = sale.data.assetContract;
      const totalPricePaid = parseFloat(weiToEth(sale.data.totalPricePaid));
      if (!salesMap.has(contract)) {
        salesMap.set(contract, 0);
      }
      salesMap.set(contract, salesMap.get(contract) + totalPricePaid);
    });

    // Combine the view counts, sales, and sort by combined popularity metric
    const combinedCollections = collections.map(collection => {
      const nftViewsCount = viewsMap.get(collection.contract) || 0;
      const totalSales = salesMap.get(collection.contract) || 0;
      const combinedPopularityMetric = collection.view_count + nftViewsCount + totalSales;
      return { ...collection, combinedPopularityMetric };
    }).sort((a, b) => b.combinedPopularityMetric - a.combinedPopularityMetric);

    return res.status(200).json(combinedCollections.slice(0, 100));
  } catch (error) {
    return res.status(400).json({ message: "Error fetching Collections" });
  }
});

const schema = z.object({
  category: z.enum(["art", "photography", "pfp", "gaming"], {
    required_error: "Category is required",
  }),
  page: z
    .number()
    .int()
    .positive()
    .default(1),
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),
});

type TrendingParams = {
  category: "art" | "photography" | "pfp" | "gaming",
  page: string,
  limit: string,
};

collections.get("/trending", async (req: Request<any, any, any, TrendingParams>, res) => {
  const trending = schema.safeParse({
    category: req.query.category,
    page: parseInt(req.query.page, 10),
    limit: parseInt(req.query.limit, 10),
  });

  if(!trending.success) {
    return res.status(400).json({ message: trending.error.errors[0].message });
  }

  const { category, page, limit } = trending.data;
  const skip = (page - 1) * limit;

  try {
    const collections = await prisma.nftCollections.findMany({
      where: {
        category,
      },
      skip,
      take: limit,
    });

    const total = await prisma.nftCollections.count({
      where: {
        category,
      },
    });

    return res.status(200).json({
      collections,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(400).json({ message: "Error fetching trending collections" });
  }
});


