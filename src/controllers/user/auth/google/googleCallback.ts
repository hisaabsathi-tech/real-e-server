import { config } from "@/config/config";
import logger from "@/logger/logger";
import { generateGoogleToken } from "@/services/google";
import { Request, Response } from "express";

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const tokens = await generateGoogleToken(code as unknown as string);

    if (!req.session) {
      return res
        .status(500)
        .json({ error: "Session middleware is not initialized." });
    }

    req.session.tokens = tokens;

    const frontendurl = config.frontendurl;

    res.redirect(frontendurl + "/dashboard/request-tour");
  } catch (error) {
    console.log(error);
    logger.error("Google authentication failed", error);
    res.status(500).json({ error: "Google authentication failed" });
  }
};
