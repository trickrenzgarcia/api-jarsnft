import express, { type Express, type Response, type Request } from "express";
import cors from "cors";
import { address, collection, collections, login, nonce, test } from "@/api/routes";
import * as middleware from "@/middlewares";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.APP_PORT || 5000;

app.set("json spaces", 2);
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// API Endpoints
app.use("/auth", login);
app.use("/collection", collection);
app.use("/collections", collections);
app.use("/address", address);
app.use("/test", test);
app.use("/nonce", nonce);

app.get("/", middleware.authorization, (req: Request, res: Response) => {
  res.json(process.env.THIRDWEB_CLIENT_ID);
});

// Middlewares
//app.use(middleware.notFound);
// app.use(middleware.errorHandler);
app.use(middleware.zodMiddleware);

app.listen(port, () => {
  console.log(`[server]: The server is running at http://localhost:${port}`);
});
