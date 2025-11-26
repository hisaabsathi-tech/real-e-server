import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { Request, Response } from "express";

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const agent = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { area: true },
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    let updateData: any = { ...req.body };

    if (req.body.area) {
      updateData.area = {
        disconnect: agent.area ? agent.area.map((a) => ({ id: a.id })) : [],
        connect: req.body.area
          ? req.body.area.map((a: string) => ({ id: a }))
          : [],
      };
    }

    const updatedAgent = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...req.body },
    });

    res.status(204).json({ data: updatedAgent });
  } catch (error) {
    logger.error("Error updating agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
