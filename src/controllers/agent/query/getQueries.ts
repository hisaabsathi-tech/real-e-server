import { paginate } from "@/lib/paginate";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const getQueries = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    const queries = await prisma.agentQuery.findMany({
      orderBy: { createdAt: "desc" },
    });

    const paginatedData = paginate(
      queries,
      Number(page) || 1,
      Number(limit) || 10
    );

    res.status(200).json({ ...paginatedData });
  } catch (error) {
    logger.error("Error fetching queries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
