import { createOffer } from "@/controllers/offers/createOffer";
import { deleteOffer } from "@/controllers/offers/deleteOffer";
import { getOffer } from "@/controllers/offers/getOffer";
import { getOffers } from "@/controllers/offers/getOffers";
import { Router } from "express";

const router = Router();

router.get("/:id", getOffer);
router.get("/", getOffers);
router.post("/", createOffer);
router.delete("/:id", deleteOffer);

export { router as offerRouter };
