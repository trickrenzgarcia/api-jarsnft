import { type Secret } from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      THIRDWEB_CLIENT_ID: string;
      THIRDWEB_API_KEY: string;
      PRIVATE_KEY: string;
      PORT: number;
      JWT_SECRET_KEY: Secret;
      JWT_TOKEN: string;
      LOCAL_DATABASE_URL: string;
      DATABASE_URL: string;
      INFURA_API_PUBLIC_KEY: string;
      INFURA_API_SECRET_KEY: string;
      INFURA_JSON_RPC_HTTPS: string;
    }
  }
}

export {};
