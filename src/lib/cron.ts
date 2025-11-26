import { schedule } from "node-cron";
import { config } from "@/config/config";
import { syncAllPropertiesToRedis } from "@/lib/propertySearchSync";
import { clearSearchCache } from "@/lib/redis";
import { AlertService } from "@/services/alertService";
import logger from "@/logger/logger";

const ping = async () => {
  try {
    const response = await fetch(`${config.url}/api/ping`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Ping failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Ping response data:", (data as any).message);
  } catch (error) {
    logger.error("Cron job failed", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
};

const syncPropertiesToRedis = async () => {
  try {
    logger.info("Starting scheduled Redis property sync...");
    await syncAllPropertiesToRedis();
    logger.info("Scheduled Redis property sync completed successfully");
  } catch (error) {
    logger.error("Scheduled Redis property sync failed:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
};

const clearRedisCache = async () => {
  try {
    logger.info("Starting scheduled Redis cache clear...");
    await clearSearchCache();
    logger.info("Scheduled Redis cache clear completed successfully");
  } catch (error) {
    logger.error("Scheduled Redis cache clear failed:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
};

const processPropertyAlerts = async () => {
  try {
    logger.info("Starting scheduled property alerts processing...");
    await AlertService.processAllAlerts();
    logger.info("Scheduled property alerts processing completed successfully");
  } catch (error) {
    logger.error("Scheduled property alerts processing failed:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
};

const jobs = [
  {
    name: "Daily Maintenance",
    schedule: config.cronjob,
    task: async () => ping(),
  },
  {
    name: "Redis Property Sync",
    schedule: "0 */6 * * *", // Every 6 hours
    task: syncPropertiesToRedis,
  },
  {
    name: "Redis Cache Clear",
    schedule: "0 2 * * *", // Daily at 2 AM
    task: clearRedisCache,
    },
    {
    name: "Property Alerts",
    schedule: config.nodeenv === "dev" ? "*/30 * * * * *" : "0 8 * * *", // Every 30 seconds in dev, 8 AM daily in production
    task: processPropertyAlerts,
  },
];

export const initializeCronJobs = () => {
  logger.info(
    `Server ping cron job scheduled to run every ${
      config.nodeenv === "dev" ? "1 minute" : "5 minutes"
    }`
  );

  jobs.forEach((job) => {
    logger.info(
      `Setting up cron job: ${job.name} with schedule: ${job.schedule}`
    );
    if (job.name === "Weekly Job Search Reminders") {
      logger.info(`Weekly reminder scheduler will run on Sundays at 9:00 AM`);
      logger.info(
        `Each trigger will create a dynamic job that executes on a random day of the week between 6:00 AM - 9:00 PM`
      );
    }

    schedule(job.schedule, job.task, {
      timezone: "UTC",
    });
  });

  logger.info(`${jobs.length} cron jobs initialized successfully`);
};
