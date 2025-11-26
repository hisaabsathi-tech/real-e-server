import { addDeveloper } from "@/controllers/developer/addDeveloper";
import { deleteDeveloper } from "@/controllers/developer/deleteDeveloper";
import { getDeveloper } from "@/controllers/developer/getDeveloper";
import { getDevelopers } from "@/controllers/developer/getDevelopers";
import { updateDeveloper } from "@/controllers/developer/updateDeveloper";
import { Router } from "express";

const router = Router();

router.get("/", getDevelopers);
router.get("/:id", getDeveloper);
router.post("/", addDeveloper);
router.patch("/:id", updateDeveloper);
router.delete("/:id", deleteDeveloper);

export { router as developerRouter };
