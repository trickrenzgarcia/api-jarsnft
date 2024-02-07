import { type LoginOutput, type LoginInput, CustomLoginInput } from "@/types";
import { Router, type RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const login = Router();

export const postLogin: RequestHandler<unknown, LoginOutput, LoginInput> = (req, res, next) => {
  const { address, email, password } = CustomLoginInput.parse(req.body);
  const secret = process.env.JWT_SECRET_KEY || null;
  if (secret === null) return res.sendStatus(403);

  // Important part
  const token = jwt.sign({ address: address, email: email }, secret, { expiresIn: "1h" });

  res
    .cookie("token", token, {
      httpOnly: true,
      //secure: true,
      //maxAge: 1000000,
      // signed: true
    })
    .status(200)
    .json({ token });
};

login.post("/login", postLogin);
