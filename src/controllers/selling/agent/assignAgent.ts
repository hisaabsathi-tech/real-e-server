import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

export const assignAgent = async (req: Request, res: Response) => {
  try {
    const { agentId, sellingId } = req.body as {
      agentId: string;
      sellingId: string;
    };

    if (!agentId || !sellingId) {
      return res
        .status(400)
        .json({ message: "Agent ID and Selling ID are required" });
    }

    if (!(await prisma.selling.findUnique({ where: { id: sellingId } }))) {
      return res.status(404).json({ message: "Selling query not found" });
    }

    if (!(await prisma.user.findUnique({ where: { id: agentId } }))) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const selling = await prisma.selling.update({
      where: { id: sellingId },
      data: { agentId, status: "FORWARDED" },
      include: {
        agent: true,
      },
    });

    res.status(200).json({ message: "Agent assigned successfully", selling });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
