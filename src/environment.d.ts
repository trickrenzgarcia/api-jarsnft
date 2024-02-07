import { type Secret } from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      THIRDWEB_CLIENT_ID: string;
      THIRDWEB_API_KEY: string;
      PORT: number;
      JWT_SECRET_KEY: Secret;
      LOCAL_DATABASE_URL: string;
      DATABASE_URL: string;
    }
  }
}

export {};
