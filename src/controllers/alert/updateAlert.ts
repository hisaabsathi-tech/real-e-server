import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";

const updateAlertSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  name: z.string().optional(),
  areas: z.array(z.string()).optional(),
  communities: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),
  propertyStatus: z.array(z.string()).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minBeds: z.number().int().min(0).optional(),
  maxBeds: z.number().int().min(0).optional(),
  minBaths: z.number().int().min(0).optional(),
  maxBaths: z.number().int().min(0).optional(),
  minSqft: z.number().positive().optional(),
  maxSqft: z.number().positive().optional(),
  features: z.array(z.string()).optional(),
  developers: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const updateAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return ReturnResponse.error(res, {
        message: "Alert ID is required",
        statusCode: 400,
      });
    }

    const validatedData = updateAlertSchema.parse(req.body);

    // Find the alert first to check ownership
    const existingAlert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!existingAlert) {
      return ReturnResponse.error(res, {
        message: "Alert not found",
        statusCode: 404,
      });
    }

    // Check if user owns this alert or if it's associated with their email
    if (existingAlert.userId !== userId && existingAlert.email !== req.user?.email) {
      return ReturnResponse.error(res, {
        message: "Unauthorized to update this alert",
        statusCode: 403,
      });
    }

    // Validate ranges if they are being updated
    if (validatedData.minPrice && validatedData.maxPrice && validatedData.minPrice >= validatedData.maxPrice) {
      return ReturnResponse.error(res, {
        message: "Minimum price must be less than maximum price",
        statusCode: 400,
      });
    }

    if (validatedData.minBeds && validatedData.maxBeds && validatedData.minBeds >= validatedData.maxBeds) {
      return ReturnResponse.error(res, {
        message: "Minimum beds must be less than maximum beds",
        statusCode: 400,
      });
    }

    if (validatedData.minBaths && validatedData.maxBaths && validatedData.minBaths >= validatedData.maxBaths) {
      return ReturnResponse.error(res, {
        message: "Minimum baths must be less than maximum baths",
        statusCode: 400,
      });
    }

    if (validatedData.minSqft && validatedData.maxSqft && validatedData.minSqft >= validatedData.maxSqft) {
      return ReturnResponse.error(res, {
        message: "Minimum sqft must be less than maximum sqft",
        statusCode: 400,
      });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: validatedData,
    });

    return ReturnResponse.success(res, {
      message: "Alert updated successfully",
      data: updatedAlert,
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ReturnResponse.error(res, {
        message: "Validation failed",
        statusCode: 400,
        details: error.issues,
      });
    }

    console.error("Error updating alert:", error);
    return ReturnResponse.error(res, {
      message: "Internal server error",
      statusCode: 500,
    });
  }
};
