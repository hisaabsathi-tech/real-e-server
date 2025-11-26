import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { addCollectionSchema } from "@/schemas";
import { Request, Response } from "express";

export const addCollection = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const validatedData = validator({ schema: addCollectionSchema, body });

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

    // Check if collection already exists for this user and property
    const existingCollection = await prisma.collection.findFirst({
      where: {
        userId,
        propertyId: validatedData.propertyId
      }
    });

    if (existingCollection) {
      return res.status(409).json({ error: "Property already in collection" });
    }

    const collection = await prisma.collection.create({
      data: {
        userId,
        propertyId: validatedData.propertyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        properties: {
          include: {
            developer: true,
            community: true,
            area: true,
          }
        }
      },
    });

    logger.info(`Collection added successfully for user ${userId}`);
    res.status(201).json({
      message: "Collection added successfully",
      data: collection,
    });
  } catch (error) {
    logger.error(`Error adding collection: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
