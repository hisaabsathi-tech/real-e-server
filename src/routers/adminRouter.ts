import { profile } from "@/controllers/admin/profile/profile";
import { updateProfile } from "@/controllers/admin/profile/updateProfile";
import {
  getProperties,
  getProperty,
} from "@/controllers/property/getProperties";
import { Router } from "express";

const router = Router();

router.get("/profile/:adminId", profile);
router.patch("/profile/:adminId", updateProfile);

router.get("/properties", getProperties);
router.get("/properties/:id", getProperty);

export { router as adminRouter };
