import { makeEndPoint } from "@/middlewares/makeEndPoint";
import { prisma } from "@/prisma";
import { randomUUID } from "crypto";
import { ethers } from "ethers";
import { Router, Request, Response } from "express";
import { z } from "zod";

export const userRouter = Router();

const schema = z.object({
  address: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid address",
  }),
});

const nonceSchema = z.object({
  nonce: z.string().optional(),
});

const favoriteScheme = z.object({
  uid: z.string().uuid(),
  contract: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid Contract Address",
  }),
  token_id: z.string(),
})

userRouter.get("/getUsers", async (req, res) => {
  const users = await prisma.users.findMany();

  return res.status(200).json(users);
});

userRouter.get("/getUser", async (req, res) => {
  const userSchema = schema.safeParse(req.query);

  if (!userSchema.success) {
    return res.status(400).json(userSchema.error.errors);
  }

  const user = await prisma.users.findUnique({
    where: {
      address: userSchema.data.address,
    },
  });

  return res.status(200).json(user);
});

userRouter.get("/isEmailExists", async (req, res) => {
  const emailSchema = z.object({
    email: z.string().email(),
  }).safeParse(req.query);

  if (!emailSchema.success) {
    return res.status(400).json(emailSchema.error.errors);
  }

  const email = await prisma.users.findFirst({
    where: {
      email: emailSchema.data.email,
    },
  });

  return res.status(200).json(email ? true : false);
});

const userProfileSchema = z.object({
  address: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid address",
  }),
});

userRouter.get("/getUserProfile", async (req, res) => {
  const user = userProfileSchema.safeParse(req.query);

  if(!user.success) {
    return res.status(400).json(user.error.errors);
  }

  const userProfile = await prisma.users.findUnique({
    where: {
      address: user.data.address,
    },
    include: {
      profile: true
    }
  });

  if(!userProfile) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(userProfile);
})

const createUserSchema = z.object({
  address: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid address",
  }),
});

userRouter.post("/createUser", async (req, res) => {
  const userSchema = createUserSchema.safeParse(req.body);

  if (!userSchema.success) {
    return res.status(400).json(JSON.parse(userSchema.error.message));
  }

  const user = await prisma.users.create({
    data: {
      uid: randomUUID(),
      address: userSchema.data.address,
    },
  });

  return res.status(200).json(user);
});

const updateUserSchema = z.object({
  address: z.string().refine((value) => ethers.utils.isAddress(value), {
    message: "Invalid address",
  }),
  name: z.string().optional(),
  email: z.string().optional(),
});

userRouter.post("/updateUser", makeEndPoint(updateUserSchema, async (req: Request<any, any, z.infer<typeof updateUserSchema>, any>, res) => {
  const userSchema = updateUserSchema.safeParse(req.body);
  
  if (!userSchema.success) {
    return res.status(400).json(JSON.parse(userSchema.error.message));
  }

  const { address, email, name } = userSchema.data;

  try {
    const user = await prisma.users.update({
      where: { address: address },
      data: { email: email, name: name, is_listed: true },
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
}));

userRouter.post("/nonceExists", async (req, res) => {
  const nonce = nonceSchema.safeParse(req.body);
  
  if(!nonce.success) {
    return res.status(400).json(nonce.error.errors);
  }

  try {
    const nonceExists = await prisma.nonce.findUnique({
      where: {
        nonce: nonce.data.nonce,
      }
    });
    if(!nonceExists) {
      return res.status(409).json(false);
    }

    return res.status(200).json(true);
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
});

userRouter.post("/createNonce", async (req, res) => {
  const nonce = nonceSchema.safeParse(req.body);

  if(!nonce.success) {
    return res.status(400).json(nonce.error.errors);
  }

  if(!nonce.data.nonce) {
    return res.status(400).json("Nonce is required");
  }

  try {
    const createNonce = await prisma.nonce.create({
      data: {
        nonce: nonce.data.nonce,
      }
    });

    if(!createNonce) {
      return res.status(500).json("Internal Server Error");
    }

    return res.status(201).json(createNonce);
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
});

userRouter.post("/addToFavorite", async (req, res) => {
  const favorite = favoriteScheme.safeParse(req.body);

  if(!favorite.success) {
    return res.status(400).json(favorite.error.errors);
  }

  try {
    const favoriteExists = await prisma.userFavorites.findFirst({
      where: {
        uid: favorite.data.uid,
        contract: favorite.data.contract,
        token_id: favorite.data.token_id,
      }
    });

    if(!favoriteExists) {
      const createFavorite = await prisma.userFavorites.create({
        data: {
          uid: favorite.data.uid,
          contract: favorite.data.contract,
          token_id: favorite.data.token_id,
        }
      });

      if(!createFavorite) {
        return res.status(500).json("Internal Server Error");
      }

      return res.status(201).json(createFavorite);
    } else {
      const deleteFavorite = await prisma.userFavorites.delete({
        where: {
          id: favoriteExists.id,
          uid: favorite.data.uid,
          contract: favorite.data.contract,
          token_id: favorite.data.token_id,
        }
      });
      return res.status(200).json(deleteFavorite);
    }
  } catch (error) {
    // @ts-ignore
    return res.status(500).json("Internal Server Error", error.message);
  }
});

userRouter.get("/isUserLiked", async (req, res) => {
  const favorite = favoriteScheme.safeParse(req.query);

  if(!favorite.success) {
    return res.status(400).json(favorite.error.errors);
  }

  try {
    const favoriteExists = await prisma.userFavorites.findFirst({
      where: {
        uid: favorite.data.uid,
        contract: favorite.data.contract,
        token_id: favorite.data.token_id,
      }
    });

    if(!favoriteExists) {
      return res.status(200).json(false);
    }

    return res.status(200).json(true);
  } catch (error) {
    // @ts-ignore
    return res.status(500).json("Internal Server Error: ", error.message);
  }
})

userRouter.get("/getFavoriteCount", async (req, res) => {
  const favCountSchema = favoriteScheme.omit({ uid: true }).safeParse(req.query);

  if(!favCountSchema.success) {
    return res.status(400).json("Bad request");
  }

  try {
    const count = await prisma.userFavorites.count({
      where: {
        contract: favCountSchema.data.contract,
        token_id: favCountSchema.data.token_id,
      }
    })

    return res.status(200).json({ count });
  } catch (e) {
    // @ts-ignore
    return res.status(500).json("Internal Server Error: ", e.message);
  }
});
