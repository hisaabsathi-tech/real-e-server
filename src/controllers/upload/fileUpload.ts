import { Request, Response } from "express";
import { uploadFile } from "@/lib/uploadFile";
import logger from "@/logger/logger";
import fs from "fs/promises";

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
    return res.status(500).json({ message: "File missing" });
  }

  for (const file of req.files) {
    if (!acceptedFileTypes.includes(file.mimetype)) {
      return res.status(500).json({ message: "Invalid file" });
    }
  }

  try {
    const { email } = req.user;

    const uploadPromises = req.files.map((file) => uploadFile(file, email));
    const uploadResults = await Promise.all(uploadPromises);

    const s3FileUrls = uploadResults.map((result) => result.s3FileUrl);

    await Promise.all(req.files.map((file) => fs.unlink(file.path)));

    return res.status(200).json({
      message: "File uploaded",
      s3FileUrls: s3FileUrls,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("File upload error");
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
