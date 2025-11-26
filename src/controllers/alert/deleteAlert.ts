import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return ReturnResponse.error(res, {
        message: "Alert ID is required",
        statusCode: 400,
      });
    }

    // Find the alert first to check ownership
    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      return ReturnResponse.error(res, {
        message: "Alert not found",
        statusCode: 404,
      });
    }

    // Check if user owns this alert or if it's associated with their email
    if (alert.userId !== userId && alert.email !== req.user?.email) {
      return ReturnResponse.error(res, {
        message: "Unauthorized to delete this alert",
        statusCode: 403,
      });
    }

    await prisma.alert.delete({
      where: { id },
    });

    return ReturnResponse.success(res, {
      message: "Alert deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return ReturnResponse.error(res, {
      message: "Internal server error",
      statusCode: 500,
    });
  }
};
