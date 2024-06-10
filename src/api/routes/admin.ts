import { NFT_MARKETPLACE } from "@/lib/constant";
import { weiToEth } from "@/lib/utils";
import sdk from "@/thirdweb";
import { Router } from "express";
import { z } from "zod";

export const admin = Router();


admin.get("/getTransactions", async (req, res) => {
  const marketPlace = await sdk.getContract(NFT_MARKETPLACE, "marketplace-v3");

  const transactions = await marketPlace.events.getAllEvents({
    order: "desc",
  });

  const totalTransactionsCount = transactions.length;

  return res.status(200).json({ totalTransactionsCount, transactions });
});

admin.get("/getSales", async (req, res) => {
  const marketPlace = await sdk.getContract(NFT_MARKETPLACE, "marketplace-v3");

  const sales = await marketPlace.events.getEvents("NewSale", {
    order: "desc",
  });
  
  const totalSalesPrice = sales.reduce((acc, sale) => {
    const totalPricePaid = parseFloat(weiToEth(sale.data.totalPricePaid));
    return acc + totalPricePaid;
  }, 0);

  const totalSalesCount = sales.length;

  const totalMarketplaceFee = totalSalesCount * 0.02;

  return res.status(200).json({ 
    totalSalesPrice,
    totalSalesCount,
    totalMarketplaceFee,
    sales 
  });
  try {

  } catch(error) {

  }
});