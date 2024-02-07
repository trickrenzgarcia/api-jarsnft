import { PrismaClient, Users, collections } from "@prisma/client";
import { ZodError, z } from "zod";

const prisma = new PrismaClient();

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
