import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { addRequestTourSchema } from "@/schemas";
import { Request, Response } from "express";

export const addRequestTour = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const validatedData = validator({ schema: addRequestTourSchema, body });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId }
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const requestTour = await prisma.requestTour.create({
      data: {
        userId,
        propertyId: validatedData.propertyId,
        date: validatedData.date,
        mode: validatedData.mode,
        timeframe: validatedData.timeframe,
        name: validatedData.name,
        email: validatedData.email,
        message: validatedData.message,
      },
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

    logger.info(`Tour request added successfully for user ${userId}`);
    res.status(201).json({
      message: "Tour request added successfully",
      data: requestTour,
    });
  } catch (error) {
    logger.error(`Error adding tour request: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
