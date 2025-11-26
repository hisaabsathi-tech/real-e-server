import { Storage } from "@google-cloud/storage";

export const deleteFile = async (fileUrl: string) => {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
    const keyFilePath = process.env.GOOGLE_CLOUD_KEYFILE_PATH!;
    
    const storage = new Storage({
      projectId: projectId,
      keyFilename: keyFilePath,
    });

    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!);

    const url = new URL(fileUrl);
    const gcsKey = url.pathname.split("/").pop()?.includes("/")
      ? url.pathname.substring(url.pathname.indexOf("/", 1) + 1) // Remove bucket name from path
      : url.pathname.substring(1); // Simple path extraction

    await storage
      .bucket(bucket.name)
      .file(gcsKey.substring(gcsKey.indexOf("/") + 1))
      .delete();

    return {
      success: true,
      message: `File ${gcsKey} deleted successfully`,
    };
  } catch (error) {
    throw error;
  }
};
