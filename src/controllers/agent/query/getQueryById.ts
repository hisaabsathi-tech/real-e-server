import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const getQueryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = await prisma.agentQuery.findUnique({
      where: { id: id },
    });

    res.status(200).json({ data: query });
  } catch (error) {
    logger.error("Error fetching queries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
