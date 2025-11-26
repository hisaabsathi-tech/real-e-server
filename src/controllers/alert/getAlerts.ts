import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { email } = req.query;

    let whereClause: any = {
      isActive: true,
    };

    // If user is logged in, show their alerts
    if (userId) {
      whereClause.userId = userId;
    }
    // If email is provided in query, show alerts for that email
    else if (email && typeof email === 'string') {
      whereClause.email = email;
    }
    // If no user session and no email, return empty array
    else {
      return ReturnResponse.success(res, {
        message: "Alerts retrieved successfully",
        data: [],
        statusCode: 200,
      });
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return ReturnResponse.success(res, {
      message: "Alerts retrieved successfully",
      data: alerts,
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return ReturnResponse.error(res, {
      message: "Internal server error",
      statusCode: 500,
    });
  }
};
