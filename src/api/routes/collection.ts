import sdk from "../../thirdweb";
import { RequestHandler, Router } from "express";

interface Contract {
  contract: string;
}

const collection = Router();

const getCollection: RequestHandler<Contract, unknown> = async (
  req,
  res,
  next
) => {
  const { contract } = req.params;
  const sdkContract = await sdk.getContract(contract);
  const nfts = await sdkContract.erc721.getAll();
  console.log(nfts);
  res.json(nfts);
};

collection.get("/:contract", getCollection);

export { collection };
