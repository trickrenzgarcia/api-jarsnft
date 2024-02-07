import { type ErrorResponse } from "@/types/error";
import { type NextFunction, type Request, type Response } from "express";

export { zodMiddleware } from "./zod.middleware";
export { authorization } from "./jwtCookie.middleware";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    statusCode: statusCode,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}
