import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ error: "Collection ID is required" });
    }

    // Check if collection exists and belongs to the user
    const existingCollection = await prisma.collection.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!existingCollection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    await prisma.collection.delete({
      where: { id }
    });

    logger.info(`Collection ${id} deleted for user ${userId}`);
    res.status(200).json({
      message: "Collection deleted successfully"
    });
  } catch (error) {
    logger.error(`Error deleting collection: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
