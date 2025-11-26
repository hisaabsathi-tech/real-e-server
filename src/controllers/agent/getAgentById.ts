import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const getAgentById = async (req: Request, res: Response) => {
  try {
    const { id: agentId } = req.params;

    const agent = await prisma.user.findUnique({
      where: {
        id: agentId,
        role: "AGENT",
      },
    });

    res.status(200).json({ data: agent });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
