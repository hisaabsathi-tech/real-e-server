import { addArea } from "@/controllers/area/addArea";
import { deleteArea } from "@/controllers/area/deleteArea";
import { getArea } from "@/controllers/area/getArea";
import { getAreas } from "@/controllers/area/getAreas";
import { updateArea } from "@/controllers/area/updateArea";
import { verifyToken } from "@/middlewares/token";
import { Router } from "express";

const router = Router();

router.get("/", getAreas);
router.get("/:id", getArea);
router.post("/", verifyToken, addArea);
router.patch("/:id", verifyToken, updateArea);
router.delete("/:id", verifyToken, deleteArea);

export { router as areaRouter };
