import { prisma } from "@/lib/prisma";
import { validator } from "@/lib/validator";
import logger from "@/logger/logger";
import { addPaymentPlanSchema, updatePaymentPlanSchema } from "@/schemas";
import { Request, Response } from "express";
import { paginate } from "@/lib/paginate";

export const addPaymentPlan = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const validatedData = validator({ schema: addPaymentPlanSchema, body });

    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { name, value } = validatedData;
    const paymentPlan = await prisma.paymentPlan.create({
      data: { name, value },
    });

    return res.status(201).json({
      message: "Payment plan added successfully",
      paymentPlan,
    });
  } catch (error) {
    logger.error("Error in addPaymentPlan controller:", error);
    res.status(500).json({ error: "Failed to add payment plan" });
  }
};

export const getPaymentPlans = async (req: Request, res: Response) => {
  try {
    const paymentPlans = await prisma.paymentPlan.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    if (req.query.all === "true") {
      return res.status(200).json({ data: paymentPlans });
    }

    const { page, limit, totalPages, totalItems, items } = paginate(
      paymentPlans,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    return res.status(200).json({ page, limit, totalPages, totalItems, items });
  } catch (error) {
    logger.error("Error in getPaymentPlans controller:", error);
    res.status(500).json({ error: "Failed to get payment plans" });
  }
};

export const getPaymentPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentPlan = await prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        properties: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!paymentPlan) {
      return res.status(404).json({ error: "Payment plan not found" });
    }

    return res.status(200).json({ paymentPlan });
  } catch (error) {
    logger.error("Error in getPaymentPlan controller:", error);
    res.status(500).json({ error: "Failed to get payment plan" });
  }
};

export const updatePaymentPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existingPaymentPlan = await prisma.paymentPlan.findUnique({
      where: { id },
    });
    if (!existingPaymentPlan) {
      return res.status(404).json({ error: "Payment plan not found" });
    }

    const validatedData = validator({ schema: updatePaymentPlanSchema, body });
    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const paymentPlan = await prisma.paymentPlan.update({
      where: { id },
      data: validatedData,
    });

    return res.status(200).json({
      message: "Payment plan updated successfully",
      paymentPlan,
    });
  } catch (error) {
    logger.error("Error in updatePaymentPlan controller:", error);
    res.status(500).json({ error: "Failed to update payment plan" });
  }
};

export const deletePaymentPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingPaymentPlan = await prisma.paymentPlan.findUnique({
      where: { id },
    });

    if (!existingPaymentPlan) {
      return res.status(404).json({ error: "Payment plan not found" });
    }

    await prisma.paymentPlan.delete({ where: { id } });

    return res.status(200).json({
      message: "Payment plan deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deletePaymentPlan controller:", error);
    res.status(500).json({ error: "Failed to delete payment plan" });
  }
};
