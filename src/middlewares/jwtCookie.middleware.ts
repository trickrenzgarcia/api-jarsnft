import { type RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const authorization: RequestHandler = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) res.sendStatus(403);
  try {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) return res.sendStatus(403);
    const user = jwt.verify(token, secret);
    req.body.user = user;
    if (!user) res.sendStatus(403);
    next();
  } catch (err) {
    console.log(err);
    res.clearCookie("token");
    return res.sendStatus(500);
  }
};
