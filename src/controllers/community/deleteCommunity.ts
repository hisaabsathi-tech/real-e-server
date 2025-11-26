import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingCommunity = await prisma.community.findUnique({
      where: { id },
    });

    if (!existingCommunity) {
      return res.status(404).json({ error: "Community not found" });
    }

    await prisma.community.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Community deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteCommunity controller:", error);
    res.status(500).json({ error: "Failed to delete community" });
  }
};
