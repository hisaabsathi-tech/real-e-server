import { Credentials } from "google-auth-library";

declare namespace Express {
  interface CookieOptions {
    partitioned?: boolean;
  }
}

declare module "express-session" {
  interface SessionData {
    tokens?: Credentials;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    session: import("express-session").Session &
      Partial<import("express-session").SessionData>;
  }
}
