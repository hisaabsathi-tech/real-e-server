import logger from "@/logger/logger";
import { generateGoogleRedirectUrl } from "@/services/google";
import { Request, Response } from "express";

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const url = await generateGoogleRedirectUrl();

    res.status(200).json({ url });
  } catch (error) {
    console.log(error);
    logger.error("Google authentication failed", error);
    res.status(500).json({ error: "Google authentication failed" });
  }
};
