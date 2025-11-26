import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";

export const profile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
    });

    res.status(200).json({ data: userProfile });
  } catch (error) {
    logger.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
