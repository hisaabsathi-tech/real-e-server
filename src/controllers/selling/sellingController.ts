import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { Request, Response } from "express";
import { paginate } from "@/lib/paginate";
import { Selling } from "@/generated/prisma";

export const addSelling = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const selling = await prisma.selling.create({
      data: body,
    });

    return res.status(201).json({
      message: "Selling added successfully",
      selling,
    });
  } catch (error) {
    logger.error("Error in addSelling controller:", error);
    res.status(500).json({ error: "Failed to add selling" });
  }
};

export const getSellings = async (req: Request, res: Response) => {
  try {
    const sellings = await prisma.selling.findMany({
      orderBy: { createdAt: "desc" },
    });

    const { page, limit, totalPages, totalItems, items } = paginate(
      sellings,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    return res.status(200).json({ page, limit, totalPages, totalItems, items });
  } catch (error) {
    logger.error("Error in getSellings controller:", error);
    res.status(500).json({ error: "Failed to get sellings" });
  }
};

export const getSelling = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const selling = await prisma.selling.findUnique({ where: { id } });

    if (!selling) {
      return res.status(404).json({ error: "Selling not found" });
    }

    return res.status(200).json({ selling });
  } catch (error) {
    logger.error("Error in getSelling controller:", error);
    res.status(500).json({ error: "Failed to get selling" });
  }
};

export const updateSelling = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as Omit<
      Selling,
      "id" | "createdAt" | "updatedAt" | "area"
    >;

    const existingSelling = await prisma.selling.findUnique({ where: { id } });
    if (!existingSelling) {
      return res.status(404).json({ error: "Selling not found" });
    }

    const updateData: Record<string, unknown> = {};
    for (const key in body) {
      if (
        Object.prototype.hasOwnProperty.call(body, key) &&
        key in existingSelling
      ) {
        const typedKey = key as keyof typeof body;
        if (body[typedKey] !== existingSelling[typedKey]) {
          updateData[typedKey] = body[typedKey];
        }

        if (body.status === "PENDING") {
          updateData.agent = {
            disconnect: { id: existingSelling.agentId },
          };
        }
      }
    }

    const selling = await prisma.selling.update({
      where: { id },
      data: { ...updateData },
    });

    return res.status(200).json({
      message: "Selling updated successfully",
      selling,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error in updateSelling controller:", error);
    res.status(500).json({ error: "Failed to update selling" });
  }
};

export const deleteSelling = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingSelling = await prisma.selling.findUnique({ where: { id } });

    if (!existingSelling) {
      return res.status(404).json({ error: "Selling not found" });
    }

    await prisma.selling.delete({ where: { id } });

    return res.status(200).json({
      message: "Selling deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteSelling controller:", error);
    res.status(500).json({ error: "Failed to delete selling" });
  }
};
