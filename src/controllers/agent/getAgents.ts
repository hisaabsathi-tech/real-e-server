import { paginate } from "@/lib/paginate";
import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const getAgents = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const agents = await prisma.user.findMany({
      where: {
        role: "AGENT",
      },
      include: {
        area: true,
      },
    });

    const paginatedAgents = paginate(
      agents,
      Number(page) || 1,
      Number(limit) || 10
    );

    res.status(200).json({ ...paginatedAgents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
