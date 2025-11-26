import { Router } from "express";
import multer from "multer";
import { fileUpload } from "@/controllers/upload/fileUpload";
import { fileDelete } from "@/controllers/upload/fileDelete";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.array("files"), fileUpload);
router.post("/delete", fileDelete);

export { router as fileRouter };
