import { Request, Response } from "express";
import { Usertype } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(500).json({ message: "User not found" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: role as Usertype },
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Verification error:", error.message);
      return res.status(500).json({
        message: "Internal server error",
        details: error.message,
      });
    }
    return res.status(500).json({
      message: "An unexpected error occurred",
    });
  }
};
