import { config } from "@/config/config";
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const isValidToken = (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, config.jwtsecret) as JwtPayload;

    const isValid = decoded && decoded.exp && decoded.exp * 1000 > Date.now();

    res.status(200).json({ data: isValid });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to validate token" });
  }
};
