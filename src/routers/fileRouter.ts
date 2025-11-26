import { Router } from "express";
import multer from "multer";
import { fileUpload } from "@/controllers/upload/fileUpload";
import { fileDownload } from "@/controllers/upload/fileDownload";
import { fileDelete } from "@/controllers/upload/fileDelete";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.array("files"), fileUpload);
router.post("/delete", fileDelete);
router.post("/download", fileDownload);

export { router as fileRouter };
