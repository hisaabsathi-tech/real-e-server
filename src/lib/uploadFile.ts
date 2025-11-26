import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import logger from "@/logger/logger";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function getObjectSignedUrl(key: any) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  };
  const command = new GetObjectCommand(params);
  const seconds = 60 * 60 * 24 * 7; // 7 days
  const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

  return url;
}

export function getPermanentUrl(key: string) {
  return `https://${process.env.AWS_BUCKET_NAME!}.s3.${process.env
    .AWS_REGION!}.amazonaws.com/${key}`;
}

export async function uploadFile({
  fileBuffer,
  fileName,
  mimetype,
  folderName,
  orgName,
}: {
  fileBuffer: Buffer;
  fileName: string;
  mimetype: string;
  folderName: string;
  orgName?: string;
}) {
  try {
    const fileKey = `${folderName}/${orgName ? orgName + "/" : ""}${fileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Body: fileBuffer,
      Key: fileKey,
      ContentType: mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const presignedUrl = await getObjectSignedUrl(fileKey);
    const permanentUrl = getPermanentUrl(fileKey);

    return {
      imageKey: fileKey,
      presignedUrl,
      permanentUrl,
    };
  } catch (error) {
    return { success: false, message: "File upload to S3 failed" };
  }
}

export async function deleteFile({ fileKey }: { fileKey: string }) {
  try {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    logger.error("Error deleting file from S3:", error);
    return { success: false, message: "Failed to delete file from S3" };
  }
}
