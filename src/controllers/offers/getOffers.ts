import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";
import { Request, Response } from "express";
import logger from "@/logger/logger";
import { paginate } from "@/lib/paginate";

export const getOffers = async (req: Request, res: Response) => {
  try {
    const offers = await prisma.makeOffer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!offers) {
      return ReturnResponse.success(res, {
        message: "No offers found",
        data: [],
        statusCode: 200,
      });
    }

    const paginatedData = paginate(
      offers,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    ReturnResponse.paginated(res, {
      ...paginatedData,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error fetching offers", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
