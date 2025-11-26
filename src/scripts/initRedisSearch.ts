#!/usr/bin/env node

import { createPropertySearchIndex } from "@/lib/redis";
import { syncAllPropertiesToRedis } from "@/lib/propertySearchSync";
import logger from "@/logger/logger";

async function initializeRedisSearch() {
  try {
    logger.info("Initializing Redis Search for Real Estate Properties...");
    
    // Step 1: Create the search index
    logger.info("Creating Redis search index...");
    await createPropertySearchIndex();
    
    // Step 2: Sync all properties from database to Redis
    logger.info("Syncing properties to Redis...");
    await syncAllPropertiesToRedis();
    
    logger.info("Redis Search initialization completed successfully!");
    
  } catch (error) {
    logger.error("Failed to initialize Redis Search:", error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializeRedisSearch()
    .then(() => {
      logger.info("Initialization complete. You can now use the fast search endpoints!");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Initialization failed:", error);
      process.exit(1);
    });
}

export { initializeRedisSearch };
