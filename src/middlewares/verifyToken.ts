import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY as string;

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // Assuming token is passed in the Authorization header
    const token = req.headers['authorization']?.split(' ')[1];
    console.log(token)
    console.log(secretKey)
    if(!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        console.log(decoded?.toString())
        if(err) {
            return res.status(400).json({ message: "Invalid token" });
        }

        // If the token is valid
        (req as any).user = decoded;
        next();
    })
}