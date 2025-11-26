import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { paginate } from "@/lib/paginate";

export const getDevelopers = async (req: Request, res: Response) => {
  try {
    const { all } = req.query;

    const developers = await prisma.developer.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!developers) {
      return res.status(404).json({ error: "Developer not found" });
    }

    const { page, limit, totalPages, totalItems, items } = paginate(
      developers,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    if (all) {
      return res.status(200).json({ data: developers });
    }

    return res.status(200).json({ page, limit, totalPages, totalItems, items });
  } catch (error) {
    logger.error("Error in getDevelopers controller:", error);
    res.status(500).json({ error: "Failed to get developers" });
  }
};
