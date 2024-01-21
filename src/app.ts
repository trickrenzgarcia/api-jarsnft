import express, { Express, Response, Request } from "express";
import cors from "cors";
import sdk from "./thirdweb";
import { collection, collections } from "./api/routes";
import * as middleware from "@/middlewares";
import { z } from "zod";

require("dotenv").config();

const app: Express = express();
const port = process.env.APP_PORT || 5000;

app.set("json spaces", 2);
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// API Endpoints
app.use("/collection", collection);
app.use("/collections", collections);

app.get("/", (req: Request, res: Response) => {
  const bodySchema = z.object({
    name: z.string().trim().min(1),
  });

  const result = bodySchema.parse(req.body);
  res.status(200).json(result);
});

// Middlewares
//app.use(middleware.notFound);
//app.use(middleware.errorHandler);
app.use(middleware.zodMiddleware);

app.listen(port, () => {
  console.log(`[server]: The server is running at http://localhost:${port}`);
});
