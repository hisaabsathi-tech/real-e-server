import { Router } from "express";
import { 
  getStats, 
  getPropertyPerformance, 
  getRecentActivities, 
  getAnalytics 
} from "@/controllers/dashboard/getStats";

const router = Router();

// Dashboard statistics endpoints
router.get("/stats", getStats);
router.get("/property-performance", getPropertyPerformance);
router.get("/recent-activities", getRecentActivities);
router.get("/analytics", getAnalytics);

export { router as dashboardRouter };
