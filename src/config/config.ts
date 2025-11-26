import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const config = {
  nodeenv: process.env.NODE_ENV,
  port: process.env.PORT ? process.env.PORT : 3000,
  jwtsecret: process.env.JWT_SECRET!,
  url: process.env.URL ? process.env.URL : "http://localhost:3000",
  cronjob: process.env.NODE_ENV === "dev" ? "* * * * *" : "*/5 * * * *",
  email: process.env.EMAIL!,
  password: process.env.PASSWORD!,
  origin: process.env.ORIGIN ? process.env.ORIGIN : "*",
  session_secret: process.env.SESSION_SECRET || "your_session_secret",
  frontendurl: process.env.FRONTEND_URL!,
  clienturl: process.env.CLIENT_URL!,
};
