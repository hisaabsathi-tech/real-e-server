import { addRequestTour } from "@/controllers/requestTour/addRequestTour";
import { getRequestTours, getRequestTour, getRequestTourByUserId } from "@/controllers/requestTour/getRequestTours";
import { updateRequestTour, deleteRequestTour } from "@/controllers/requestTour/updateRequestTour";
import { Router } from "express";

const router = Router();

router.get("/", getRequestTours);
router.get("/:id", getRequestTour);
router.post("/", addRequestTour);
router.patch("/:id", updateRequestTour);
router.delete("/:id", deleteRequestTour);

export { router as requestTourRouter };
