import { paginate } from "@/lib/paginate";
import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const getSellingsByAgentId = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { id: agentId } = req.user;
    const { page, limit, all } = req.query as unknown as {
      page: number | null;
      limit: number | null;
      all: string | null;
    };

    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    const sellings = await prisma.selling.findMany({
      where: { agentId },
    });
    
    if (all === "true") {
      return res.status(200).json({ data: sellings });
    }

    const paginatedData = paginate(
      sellings,
      Number(page) || 1,
      Number(limit) || 10
    );

    res.status(200).json({ ...paginatedData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
