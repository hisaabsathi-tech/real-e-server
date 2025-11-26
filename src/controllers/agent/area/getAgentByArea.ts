import { paginate } from "@/lib/paginate";
import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const getAgentByArea = async (req: Request, res: Response) => {
  try {
    const { area, page, limit, all } = req.query as unknown as {
      area: string;
      page: string;
      limit: string;
      all: string | null;
    };

    const data = await prisma.user.findMany({
      where: { role: "AGENT" },
      include: { area: true },
    });

    const agents = data.filter((agent) => agent.area.some((a) => a.name === area));

    if (all === "true") {
      return res.status(200).json({ data: agents });
    }
    
    const paginatedData = paginate(
      agents,
      Number(page) || 1,
      Number(limit) || 10
    );

    res.status(200).json({ ...paginatedData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
