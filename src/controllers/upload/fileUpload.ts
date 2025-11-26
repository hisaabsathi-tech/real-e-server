import { Request, Response } from "express";
import { uploadFile } from "@/lib/uploadFile";
import logger from "@/logger/logger";
import fs from "fs/promises";
import path from "path";

const acceptedFileTypes = [
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/png",
  "application/pdf",
];

export const fileUpload = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ message: "File missing" });
  }

  for (const file of req.files) {
    if (!acceptedFileTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type" });
    }
  }

  try {
    const { email } = req.user;

    // Prepare upload promises with proper parameters
    const uploadPromises = req.files.map(async (file) => {
      // Read file buffer from disk (assumes file.path exists)
      const fileBuffer = await fs.readFile(file.path);

      // Use email as folderName; original file name from file.originalname
      return uploadFile({
        fileBuffer,
        fileName: file.originalname || path.basename(file.path),
        mimetype: file.mimetype,
        folderName: email,
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Remove temp files from disk regardless of upload success or failure
    await Promise.all(req.files.map((file) => fs.unlink(file.path)));

    // Collect permanent URLs for response
    const s3FileUrls = uploadResults.map((result) => result.permanentUrl);

    return res.status(200).json({
      message: "File(s) uploaded",
      s3FileUrls,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("File upload error", { error });
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
