import session from "express-session";
import { Request, Response, NextFunction } from "express";
import { Credentials } from "google-auth-library";

interface SessionRequest extends Request {
  session: session.Session & {
    tokens?: Credentials;
  };
}

export const sessionMiddleware = (
  req: SessionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.session);

    if (!req.session.tokens) {
      console.log("No session tokens found");
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  } catch (error) {
    console.log("Session middleware error:", error);
    res.status(500).json({ error: "Session middleware error" });
  }
};
