import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const deleteDeveloper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingDeveloper = await prisma.developer.findUnique({
      where: { id },
    });

    if (!existingDeveloper) {
      return res.status(404).json({ error: "Developer not found" });
    }

    await prisma.developer.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Developer deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteDeveloper controller:", error);
    res.status(500).json({ error: "Failed to delete developer" });
  }
};
