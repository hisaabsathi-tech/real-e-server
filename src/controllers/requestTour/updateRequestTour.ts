import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { updateRequestTourSchema } from "@/schemas";
import { Request, Response } from "express";

export const updateRequestTour = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const body = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ error: "Request tour ID is required" });
    }

    const validatedData = validator({ schema: updateRequestTourSchema, body });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Check if request tour exists and belongs to the user
    const existingRequestTour = await prisma.requestTour.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!existingRequestTour) {
      return res.status(404).json({ error: "Request tour not found" });
    }

    const requestTour = await prisma.requestTour.update({
      where: { id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        property: {
          include: {
            developer: true,
            community: true,
            area: true,
          }
        }
      },
    });

    logger.info(`Request tour ${id} updated for user ${userId}`);
    res.status(200).json({
      message: "Request tour updated successfully",
      data: requestTour,
    });
  } catch (error) {
    logger.error(`Error updating request tour: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteRequestTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Request tour ID is required" });
    }

    // Check if request tour exists and belongs to the user
    const existingRequestTour = await prisma.requestTour.findFirst({
      where: { 
        id,
      }
    });

    if (!existingRequestTour) {
      return res.status(404).json({ error: "Request tour not found" });
    }

    await prisma.requestTour.delete({
      where: { id }
    });

    res.status(200).json({
      message: "Request tour deleted successfully"
    });
  } catch (error) {
    logger.error(`Error deleting request tour: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
