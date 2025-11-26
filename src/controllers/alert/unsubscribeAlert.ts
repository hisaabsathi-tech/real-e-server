import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";

export const unsubscribeAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.query;

    if (!alertId || typeof alertId !== 'string') {
      return ReturnResponse.error(res, {
        message: "Alert ID is required",
        statusCode: 400,
      });
    }

    // Find the alert
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return ReturnResponse.error(res, {
        message: "Alert not found",
        statusCode: 404,
      });
    }

    // Deactivate the alert
    await prisma.alert.update({
      where: { id: alertId },
      data: { isActive: false },
    });

    return ReturnResponse.success(res, {
      message: "Successfully unsubscribed from property alerts",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error unsubscribing from alert:", error);
    return ReturnResponse.error(res, {
      message: "Internal server error",
      statusCode: 500,
    });
  }
};
