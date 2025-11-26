import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";

export const getArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const area = await prisma.area.findUnique({
      where: { id },
      include: {
        communities: {
          orderBy: { createdAt: "desc" },
        },
        properties: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!area) {
      return res.status(404).json({ error: "Area not found" });
    }

    return res.status(200).json({ data: area });
  } catch (error) {
    logger.error("Error in getArea controller:", error);
    res.status(500).json({ error: "Failed to get area" });
  }
};
