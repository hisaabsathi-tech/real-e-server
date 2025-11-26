import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({
      message: "Query deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
