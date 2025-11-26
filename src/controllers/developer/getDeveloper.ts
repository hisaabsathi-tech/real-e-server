import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";

export const getDeveloper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const developer = await prisma.developer.findUnique({
      where: { id },
    });

    if (!developer) {
      return res.status(404).json({ error: "Developer not found" });
    }

    return res.status(200).json({ data: developer });
  } catch (error) {
    logger.error("Error in getDeveloper controller:", error);
    res.status(500).json({ error: "Failed to get developer" });
  }
};
