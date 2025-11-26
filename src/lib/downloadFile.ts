import { Storage } from "@google-cloud/storage";

export const downloadFile = async (fileUrl: string, expirationTime = 300) => {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
    const keyFilePath =
      "/home/atmajo/Desktop/projects/times-real-estate/storied-glazing-473717-j6-758f24562994.json";
    
    const storage = new Storage({
      projectId: projectId,
      keyFilename: keyFilePath,
    });

    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!);

    const url = new URL(fileUrl);
    const gcsKey = url.pathname.split("/").pop()?.includes("/")
      ? url.pathname.substring(url.pathname.indexOf("/", 1) + 1) // Remove bucket name from path
      : url.pathname.substring(1); // Simple path extraction

    const file = bucket.file(gcsKey.substring(gcsKey.indexOf("/") + 1));

    // Generate a signed URL (valid for specified expiration time in seconds)
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + expirationTime * 1000, // Convert seconds to milliseconds
    });

    return {
      success: true,
      downloadUrl: signedUrl,
      message: "File download link generated successfully",
    };
  } catch (error) {
    throw error;
  }
};
