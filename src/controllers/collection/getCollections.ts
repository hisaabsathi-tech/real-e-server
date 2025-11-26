import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { getCollectionsSchema } from "@/schemas";
import { Request, Response } from "express";
import { paginate } from "@/lib/paginate";

export const getCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = req.query;
    const validatedQuery = validator({
      schema: getCollectionsSchema,
      body: query,
    });

    if (!validatedQuery) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const page = parseInt(validatedQuery.page || "1");
    const limit = parseInt(validatedQuery.limit || "10");

    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        properties: {
          include: {
            developer: true,
            community: true,
            area: true,
            paymentPlan: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const paginatedResult = paginate(collections, page, limit);

    logger.info(`Collections retrieved for user ${userId}`);
    res.status(200).json({
      message: "Collections retrieved successfully",
      ...paginatedResult,
    });
  } catch (error) {
    logger.error(`Error retrieving collections: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ error: "Collection ID is required" });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        properties: {
          include: {
            developer: true,
            community: true,
            area: true,
            paymentPlan: true,
          },
        },
      },
    });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    logger.info(`Collection ${id} retrieved for user ${userId}`);
    res.status(200).json({
      message: "Collection retrieved successfully",
      data: collection,
    });
  } catch (error) {
    logger.error(`Error retrieving collection: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
