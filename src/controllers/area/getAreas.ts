import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { paginate } from "@/lib/paginate";

export const getAreas = async (req: Request, res: Response) => {
  try {
    const { all } = req.query;

    const areas = await prisma.area.findMany({
      include: {
        communities: {
          orderBy: { createdAt: "desc" },
        },
        properties: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [
        { properties: { _count: "desc" } },
        { createdAt: "desc" }
      ],
    });

    if (!areas) {
      return res.status(404).json({ error: "Areas not found" });
    }

    const { page, limit, totalPages, totalItems, items } = paginate(
      areas,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    if (all) {
      return res.status(200).json({ data: areas });
    } else {
      return res
        .status(200)
        .json({ page, limit, totalPages, totalItems, items });
    }
  } catch (error) {
    console.log("Error in getAreas controller:", error);
    logger.error("Error in getAreas controller:", error);
    res.status(500).json({ error: "Failed to get areas" });
  }
};
