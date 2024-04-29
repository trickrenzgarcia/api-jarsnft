import { ethers } from "ethers";

export const weiToEth = (wei: number | ethers.BigNumberish) => ethers.utils.formatEther(wei);

export const weiToGwei = (wei: number | ethers.BigNumberish) =>
  ethers.utils.formatUnits(wei, "gwei");

export const usdCentsToUSD = (usdCents: number) => usdCents / 100;
