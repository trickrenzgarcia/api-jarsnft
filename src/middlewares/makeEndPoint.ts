import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const makeEndPoint =
  <TBody>(
    schema: z.Schema<TBody>,
    callback: (req: Request<any, any, TBody, any>, res: Response, next: NextFunction) => void
  ) =>
  (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    const body = schema.safeParse(req.body);

    if (!body.success) {
      return res.status(400).send(body.error.message);
    }

    return callback(req, res, next)
  };