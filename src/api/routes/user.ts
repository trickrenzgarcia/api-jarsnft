import { verifyToken } from "@/middlewares/verifyToken";
import { prisma } from "@/prisma";
import { User as DBUser } from "@/types/ctx";
import { Router, Request, Response } from "express";

export const userRouter = Router();

userRouter.get("/greet", (req, res) => {
  res.send("Hello, user!");
});

userRouter.post("/create", verifyToken, async (req: Request<any, any, DBUser, any>, res: Response) => {
    // const createUser = await prisma.users.create({
    //     data: {
    //         uid: req.body.uid,
    //         address: req.body.address,
    //         is_listed: false
    //     }
    // })

    res.status(201).json("DECODED USER!!")
})