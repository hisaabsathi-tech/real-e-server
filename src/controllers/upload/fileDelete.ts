import { Request, Response } from "express";
import { uploadFile } from "@/lib/uploadFile";
import logger from "@/logger/logger";
import fs from "fs/promises";
import { deleteFile } from "@/lib/uploadFile";

export const fileDelete = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { fileUrl } = req.body;
    const { success, message } = await deleteFile({
      fileKey: fileUrl as string,
    });

    if (!success) {
      return res.status(500).json({ message: "File delete failed" });
    }

    return res.status(200).json({
      message,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("File delete error");
      return res.status(500).json({
        message: "Internal server error",
        details: error.message,
      });
    }
    return res.status(500).json({
      message: "An unexpected error occurred",
    });
  }
};
