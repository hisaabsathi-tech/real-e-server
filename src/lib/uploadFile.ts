import path from "path";
import { hashFile } from "./hashFile";
import { Storage } from "@google-cloud/storage";

export const uploadFile = async (
  file: any,
  email: string
): Promise<{ s3FileUrl: string }> => {
  try {
    const key = await hashFile(file.path, "sha256");

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
    const keyFilePath = "/home/atmajo/Desktop/projects/times-real-estate/storied-glazing-473717-j6-758f24562994.json";
    
    const storage = new Storage({
      projectId: projectId,
      keyFilename: keyFilePath,
    });
    
    const bucket = process.env.GOOGLE_CLOUD_BUCKET_NAME!;

    const folderName = email.replace(/[^\w.-]/g, "_").toLowerCase();

    const fileName = `${Date.now()}-${path.basename(key)}`
      .trim()
      .replace(/\s+/g, "_");

    const fileKey = `${folderName}/${fileName}`;

    const options = {
      destination: fileKey,
    };

    await storage.bucket(bucket).upload(file.path, options);

    return {
      s3FileUrl: `https://storage.googleapis.com/${bucket}/${fileKey}`,
    };
  } catch (error) {
    throw error;
  }
};
