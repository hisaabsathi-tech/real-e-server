import { NextFunction, Request, Response } from "express";
import { config } from "../config/config";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        role: string;
        otp?: string;
        permittedToAddProperty?: boolean;
        agentId?: string;
        isDraft?: boolean;
        iat: number;
        exp: number;
      };
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, config.jwtsecret) as {
      id: string;
      email: string;
      role: string;
      otp?: string;
      permittedToAddProperty?: boolean;
      agentId?: string;
      isDraft?: boolean;
      iat: number;
      exp: number;
    };

    if (!decoded) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (decoded.role === "UNVERIFIED") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    
    if (
      decoded.role === "USER" &&
      !decoded.permittedToAddProperty &&
      req.originalUrl === "/property"
    ) {
      return res.status(403).json({ error: "Forbidden route" });
    }

    req.user = decoded;

    if (config.nodeenv === "dev")
      console.log("User decoded from token:", decoded);

    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
};
