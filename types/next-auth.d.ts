import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    provider?: string;
    id?: string;
  }

  interface Session {
    provider?: string;
    accessToken?: string;
    error?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    accessToken?: string;
    id?: string;
    refreshToken?: string;
    accessTokenExpires?: number | null;
    error?: string;
  }
}