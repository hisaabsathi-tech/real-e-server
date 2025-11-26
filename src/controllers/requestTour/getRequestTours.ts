import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { getRequestToursSchema } from "@/schemas";
import { Request, Response } from "express";
import { paginate } from "@/lib/paginate";

export const getRequestTours = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const query = req.query;
    const validatedQuery = validator({
      schema: getRequestToursSchema,
      body: query,
    });

    if (!validatedQuery) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const page = parseInt(validatedQuery.page || "1");
    const limit = parseInt(validatedQuery.limit || "10");

    let where: any = {};
    if (req.user.role === "USER") {
      where.userId = req.user.id;
    }
    
    if (req.user.role === "AGENT") {
      where.property = {
        userId: req.user.id,
      };
    }

    const requestTours = await prisma.requestTour.findMany({
      where,
      include: {
        property: {
          include: {
            user: true,
            developer: true,
            community: true,
            paymentPlan: true,
            area: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const paginatedResult = paginate(requestTours, page, limit);

    res.status(200).json({
      ...paginatedResult,
    });
  } catch (error) {
    logger.error(`Error retrieving request tours: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRequestTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Request tour ID is required" });
    }

    const requestTour = await prisma.requestTour.findFirst({
      where: {
        id,
      },
      include: {
        user: true,
        property: {
          include: {
            developer: true,
            community: true,
            area: true,
            paymentPlan: true,
          },
        },
      },
    });

    if (!requestTour) {
      return res.status(404).json({ error: "Request tour not found" });
    }

    res.status(200).json({
      message: "Request tour retrieved successfully",
      data: requestTour,
    });
  } catch (error) {
    logger.error(`Error retrieving request tour: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRequestTourByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const requestTour = await prisma.requestTour.findMany({
      where: {
        property: {
          userId: userId,
        },
      },
      include: {
        user: true,
        property: {
          include: {
            user: true,
            developer: true,
            community: true,
            area: true,
            paymentPlan: true,
          },
        },
      },
    });

    if (!requestTour) {
      return res.status(404).json({ error: "Request tour not found" });
    }

    const paginatedData = paginate;

    res.status(200).json({
      message: "Request tour retrieved successfully",
      data: requestTour,
    });
  } catch (error) {
    logger.error(`Error retrieving request tour: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
