import { assignAgent } from "@/controllers/selling/agent/assignAgent";
import { getSellingsByAgentId } from "@/controllers/selling/agent/getSellingsByAgentId";
import {
  addSelling,
  getSellings,
  getSelling,
  updateSelling,
  deleteSelling,
} from "@/controllers/selling/sellingController";
import { verifyToken } from "@/middlewares/token";
import { Router } from "express";

const router = Router();

router.get("/", verifyToken, getSellings);
router.get("/:id", verifyToken, getSelling);
router.post("/", addSelling);
router.patch("/:id", verifyToken, updateSelling);
router.delete("/:id", verifyToken, deleteSelling);

router.get("/agent/get", verifyToken, getSellingsByAgentId);
router.post("/agent", verifyToken, assignAgent);

export { router as sellingRouter };
