import { addCommunity } from "@/controllers/community/addCommunity";
import { deleteCommunity } from "@/controllers/community/deleteCommunity";
import { getCommunity } from "@/controllers/community/getCommunity";
import { getCommunities } from "@/controllers/community/getCommunities";
import { updateCommunity } from "@/controllers/community/updateCommunity";
import { Router } from "express";
import { verifyToken } from "@/middlewares/token";

const router = Router();

router.get("/", getCommunities);
router.get("/:id", getCommunity);
router.post("/", verifyToken, addCommunity);
router.patch("/:id", verifyToken, updateCommunity);
router.delete("/:id", verifyToken, deleteCommunity);

export { router as communityRouter };
