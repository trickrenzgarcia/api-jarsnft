import { PrismaClient, collections } from "@prisma/client";
import { ZodError, z } from "zod";

export const prisma = new PrismaClient();

export const getUserAddress = async (address: string) => {
  const user = await prisma.users.findUnique({
    where: {
      address: address,
    },
  });

  return user;
};

export const saveNonce = async (nonce: string) => {
  const newNonce = await prisma.nonce.create({
    data: {
      nonce: nonce,
    },
  });
  return newNonce ? true : false;
};

export const nonceExists = async (nonce: string) => {
  const data = await prisma.nonce.findFirst({
    where: {
      nonce: nonce,
    },
  });

  return data ? true : false;
};

export const getCollectionMetadata = async (contract: string) => {
  const data = await prisma.collections.findFirst({
    where: {
      cid: contract,
    },
  });

  return data;
};

export const getAllMetadata = async () => {
  const data = await prisma.collections.findMany();

  return data;
};
