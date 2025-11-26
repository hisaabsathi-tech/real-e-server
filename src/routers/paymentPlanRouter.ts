import { 
  addPaymentPlan, 
  getPaymentPlans, 
  getPaymentPlan, 
  updatePaymentPlan, 
  deletePaymentPlan 
} from "@/controllers/paymentPlan/paymentPlanControllers";
import { Router } from "express";

const router = Router();

router.get("/", getPaymentPlans);
router.get("/:id", getPaymentPlan);
router.post("/", addPaymentPlan);
router.patch("/:id", updatePaymentPlan);
router.delete("/:id", deletePaymentPlan);

export { router as paymentPlanRouter };
