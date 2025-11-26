import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const profile = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;

    const profile = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        area: true,
        Selling: true,
        property: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.status(200).json({ data: profile });
  } catch (error) {
    logger.error("Error in profile controller:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};
