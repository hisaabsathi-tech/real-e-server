import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import { syncPropertyToRedis } from "@/lib/propertySearchSync";
import logger from "@/logger/logger";
import { addPropertySchema } from "@/schemas";
import { Request, Response } from "express";
import { config } from "@/config/config";

export const addProperty = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = req.body;
    const validatedData = validator({ schema: addPropertySchema, body });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const [developer, community, paymentPlan, area] = await Promise.all([
      prisma.developer.findUnique({
        where: { id: validatedData.developerId },
      }),
      prisma.community.findUnique({
        where: { id: validatedData.communityId },
      }),
      validatedData.paymentPlanId &&
        prisma.paymentPlan.findUnique({
          where: { id: validatedData.paymentPlanId },
        }),
      prisma.area.findUnique({ where: { id: validatedData.areaId } }),
    ]);

    const userId =
      req.user.role === "AGENT" || req.user.role === "ADMIN"
        ? req.user.id
        : req.user.agentId;

    if (!developer)
      return res.status(404).json({ error: "Developer not found" });
    if (!community)
      return res.status(404).json({ error: "Community not found" });
    if (validatedData.paymentPlanId && !paymentPlan)
      return res.status(404).json({ error: "Payment plan not found" });
    if (!area) return res.status(404).json({ error: "Area not found" });

    const property = await prisma.property.create({
      data: {
        ...validatedData,
        userId: userId,
        isFeatured: req.user.isDraft ? false : true,
        isDraft: req.user.isDraft || false,
      },
      include: {
        developer: true,
        community: true,
        paymentPlan: true,
        area: true,
      },
    });

    config.nodeenv !== "dev" &&
      syncPropertyToRedis(property.id).catch((error) => {
        logger.error(
          `Failed to sync new property ${property.id} to Redis:`,
          error
        );
      });

    return res.status(201).json({
      message: "Property added successfully",
      property,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error in addProperty controller:", error);
    res.status(500).json({ error: "Failed to add property" });
  }
};
