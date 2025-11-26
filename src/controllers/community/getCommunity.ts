import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";

export const getCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        area: true,
        developer: true,
        properties: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    return res.status(200).json({ community });
  } catch (error) {
    logger.error("Error in getCommunity controller:", error);
    res.status(500).json({ error: "Failed to get community" });
  }
};
