import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";
import logger from "@/logger/logger";

const createAlertSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().optional(),
  areas: z.array(z.string()).optional().default([]),
  communities: z.array(z.string()).optional().default([]),
  propertyTypes: z.array(z.string()).optional().default([]),
  propertyStatus: z.array(z.string()).optional().default([]),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minBeds: z.number().int().min(0).optional(),
  maxBeds: z.number().int().min(0).optional(),
  minBaths: z.number().int().min(0).optional(),
  maxBaths: z.number().int().min(0).optional(),
  minSqft: z.number().positive().optional(),
  maxSqft: z.number().positive().optional(),
  features: z.array(z.string()).optional().default([]),
  developers: z.array(z.string()).optional().default([]),
});

export const createAlert = async (req: Request, res: Response) => {
  if (!req.user) {
    return ReturnResponse.error(res, {
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  try {
    const validatedData = createAlertSchema.parse(req.body);

    // Validate price range
    if (
      validatedData.minPrice &&
      validatedData.maxPrice &&
      validatedData.minPrice >= validatedData.maxPrice
    ) {
      return ReturnResponse.error(res, {
        message: "Minimum price must be less than maximum price",
        statusCode: 400,
      });
    }

    // Validate beds range
    if (
      validatedData.minBeds &&
      validatedData.maxBeds &&
      validatedData.minBeds >= validatedData.maxBeds
    ) {
      return ReturnResponse.error(res, {
        message: "Minimum beds must be less than maximum beds",
        statusCode: 400,
      });
    }

    // Validate baths range
    if (
      validatedData.minBaths &&
      validatedData.maxBaths &&
      validatedData.minBaths >= validatedData.maxBaths
    ) {
      return ReturnResponse.error(res, {
        message: "Minimum baths must be less than maximum baths",
        statusCode: 400,
      });
    }

    // Validate sqft range
    if (
      validatedData.minSqft &&
      validatedData.maxSqft &&
      validatedData.minSqft >= validatedData.maxSqft
    ) {
      return ReturnResponse.error(res, {
        message: "Minimum sqft must be less than maximum sqft",
        statusCode: 400,
      });
    }
    
    const userId = req.user.id;

    const alert = await prisma.alert.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    return ReturnResponse.success(res, {
      message: "Alert created successfully",
      data: alert,
      statusCode: 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ReturnResponse.error(res, {
        message: "Validation failed",
        statusCode: 400,
        details: error.issues,
      });
    }

    logger.error("Error creating alert:", error);
    return ReturnResponse.error(res, {
      message: "Internal server error",
      statusCode: 500,
    });
  }
};
