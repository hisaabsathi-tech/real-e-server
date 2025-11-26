import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { paginate } from "@/lib/paginate";

export const getCommunities = async (req: Request, res: Response) => {
  try {
    const { all } = req.query;

    const communities = await prisma.community.findMany({
      include: {
        area: true,
        developer: true,
        properties: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!communities) {
      return res.status(404).json({ error: "Communities not found" });
    }

    if (all) {
      return res.status(200).json({ data: communities });
    }

    const { page, limit, totalPages, totalItems, items } = paginate(
      communities,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    return res.status(200).json({ page, limit, totalPages, totalItems, items });
  } catch (error) {
    logger.error("Error in getCommunities controller:", error);
    res.status(500).json({ error: "Failed to get communities" });
  }
};
