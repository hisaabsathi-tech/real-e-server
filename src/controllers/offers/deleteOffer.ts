import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";
import { Request, Response } from "express";
import logger from "@/logger/logger";

export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return ReturnResponse.error(res, {
        message: "Offer ID is required",
        statusCode: 400,
      });
    }

    const offer = await prisma.makeOffer.delete({
      where: { id },
    });
    
    if (!offer) {
      return ReturnResponse.error(res, {
        message: "Cannot delete offer",
        statusCode: 400,
      });
    }

    ReturnResponse.success(res, {
      message: "Offer deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error deleting offers", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
