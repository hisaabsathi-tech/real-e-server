import { Request, Response } from "express";
import logger from "@/logger/logger";
import { downloadFile } from "@/lib/downloadFile";

export const fileDownload = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { fileUrl } = req.body;
    const { success, message, downloadUrl } = await downloadFile(
      fileUrl as string
    );

    if (!success) {
      return res.status(500).json({ message: "File download failed" });
    }

    return res.status(200).json({
      message,
      downloadUrl,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("File download error");
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
