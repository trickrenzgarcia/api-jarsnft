import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY as string;

export const verifyEndPoint = (req: Request, res: Response, next: NextFunction) => {
  // Assuming token is passed in the X-API-KEY header
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  jwt.verify(apiKey, secretKey, (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // If the token is valid
    (req as any).user = decoded;
    next();
  });
};
