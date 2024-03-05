import express, { type Express, type Response, type Request } from "express";
import cors from "cors";
import * as middleware from "@/middlewares";
import * as router from "@/api/routes";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.APP_PORT || 5000;

app.set("json spaces", 2);
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// API Endpoints
app.use("/user", router.userRouter)
app.use("/auth", router.login);
app.use("/collection", router.collection);
app.use("/collections", router.collections);
app.use("/address", router.address);
app.use("/test", router.test);
app.use("/nonce", router.nonce);
app.use("/metadata", router.metadata);
app.use("/secret", router.secretRouter)
app.use("/mint", router.mintRouter);

// Middlewares
//app.use(middleware.notFound);
// app.use(middleware.errorHandler);
app.use(middleware.zodMiddleware);

app.listen(port, () => {
  console.log(`[server]: The server is running at http://localhost:${port}`);
});
