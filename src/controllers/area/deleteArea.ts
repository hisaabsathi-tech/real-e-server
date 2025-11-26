import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const deleteArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingArea = await prisma.area.findUnique({
      where: { id },
    });

    if (!existingArea) {
      return res.status(404).json({ error: "Area not found" });
    }

    await prisma.area.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Area deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteArea controller:", error);
    res.status(500).json({ error: "Failed to delete area" });
  }
};
