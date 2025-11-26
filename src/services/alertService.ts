import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendEmail";
import { generatePropertyAlertEmail } from "@/templates/propertyAlert";
import logger from "@/logger/logger";

interface AlertCriteria {
  id: string;
  email: string;
  name?: string | null;
  areas: string[];
  communities: string[];
  propertyTypes: string[];
  propertyStatus: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  minBeds?: number | null;
  maxBeds?: number | null;
  minBaths?: number | null;
  maxBaths?: number | null;
  minSqft?: number | null;
  maxSqft?: number | null;
  features: string[];
  developers: string[];
  lastSent?: Date | null;
}

export class AlertService {
  /**
   * Find properties that match the alert criteria
   */
  static async findMatchingProperties(alert: AlertCriteria) {
    try {
      const whereClause: any = {
        isDraft: false,
      };

      if (alert.areas.length > 0) {
        whereClause.area = {
          name: {
            in: alert.areas,
          },
        };
      }

      if (alert.communities.length > 0) {
        whereClause.community = {
          name: {
            in: alert.communities,
          },
        };
      }

      if (alert.developers.length > 0) {
        whereClause.developer = {
          name: {
            in: alert.developers,
          },
        };
      }

      if (alert.propertyTypes.length > 0) {
        whereClause.property_type = {
          hasSome: alert.propertyTypes,
        };
      }

      if (alert.propertyStatus.length > 0) {
        whereClause.property_status = {
          hasSome: alert.propertyStatus,
        };
      }

      if (alert.minPrice !== null || alert.maxPrice !== null) {
        whereClause.price = {};
        if (alert.minPrice !== null) {
          whereClause.price.gte = alert.minPrice;
        }
        if (alert.maxPrice !== null) {
          whereClause.price.lte = alert.maxPrice;
        }
      }

      if (alert.minBeds !== null || alert.maxBeds !== null) {
        whereClause.beds = {
          not: null,
        };
      }

      if (alert.minBaths !== null || alert.maxBaths !== null) {
        whereClause.baths = {
          not: null,
        };
      }

      if (alert.minSqft !== null || alert.maxSqft !== null) {
        whereClause.sqft = {};
        if (alert.minSqft !== null) {
          whereClause.sqft.gte = alert.minSqft;
        }
        if (alert.maxSqft !== null) {
          whereClause.sqft.lte = alert.maxSqft;
        }
      }

      if (alert.features.length > 0) {
        whereClause.OR = [
          { popular_features: { hasSome: alert.features } },
          { interior_features: { hasSome: alert.features } },
          { community_features: { hasSome: alert.features } },
          { exterior_features: { hasSome: alert.features } },
          { property_features: { hasSome: alert.features } },
        ];
      }

      const lastSentDate =
        alert.lastSent || new Date(Date.now() - 24 * 60 * 60 * 1000);
      whereClause.createdAt = {
        gte: lastSentDate,
      };
      
      console.log(alert);
      console.log(whereClause);

      const properties = await prisma.property.findMany({
        where: whereClause,
        include: {
          area: {
            select: {
              name: true,
            },
          },
          community: {
            select: {
              name: true,
            },
          },
          developer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });
      logger.info(
        `Found ${properties.length} matching properties for alert ${alert.id}`
      );

      return properties;
    } catch (error) {
      console.error("Error finding matching properties:", error);
      throw error;
    }
  }

  /**
   * Send alert email to user
   */
  static async sendAlertEmail(alert: AlertCriteria, properties: any[]) {
    try {
      if (properties.length === 0) {
        logger.info(`No new properties found for alert ${alert.id}`);
        return;
      }

      const unsubscribeUrl = `${
        process.env.CLIENT_URL || "https://your-website.com"
      }/unsubscribe?alertId=${alert.id}`;

      const emailHtml = generatePropertyAlertEmail({
        userName: alert.name || "Property Seeker",
        properties: properties,
        alertCriteria: {
          areas: alert.areas,
          communities: alert.communities,
          propertyTypes: alert.propertyTypes,
          propertyStatus: alert.propertyStatus,
          minPrice: alert.minPrice || undefined,
          maxPrice: alert.maxPrice || undefined,
          minBeds: alert.minBeds || undefined,
          maxBeds: alert.maxBeds || undefined,
          minBaths: alert.minBaths || undefined,
          maxBaths: alert.maxBaths || undefined,
          minSqft: alert.minSqft || undefined,
          maxSqft: alert.maxSqft || undefined,
          features: alert.features,
          developers: alert.developers,
        },
        unsubscribeUrl,
      });

      const subject = `🏠 ${properties.length} New ${
        properties.length === 1 ? "Property" : "Properties"
      } Matching Your Alert`;

      await sendEmail(alert.email, subject, emailHtml);

      // Update lastSent timestamp
      await prisma.alert.update({
        where: { id: alert.id },
        data: { lastSent: new Date() },
      });

      logger.info(
        `Alert email sent successfully to ${alert.email} with ${properties.length} properties`
      );
    } catch (error) {
      logger.error(`Error sending alert email to ${alert.email}:`, error);
      throw error;
    }
  }

  /**
   * Process all active alerts
   */
  static async processAllAlerts() {
    try {
      logger.info("Starting alert processing job...");

      const activeAlerts = await prisma.alert.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (activeAlerts.length === 0) {
        logger.info("No active alerts found");
        return;
      }

      logger.info(`Found ${activeAlerts.length} active alerts to process`);

      let successCount = 0;
      let errorCount = 0;

      for (const alert of activeAlerts) {
        try {
          const matchingProperties = await this.findMatchingProperties(alert);

          if (matchingProperties.length > 0) {
            await this.sendAlertEmail(alert, matchingProperties);
            successCount++;
          } else {
            logger.info(
              `No new properties found for alert ${alert.id} (${alert.email})`
            );
          }
        } catch (error) {
          logger.error(`Error processing alert ${alert.id}:`, error);
          errorCount++;
        }

        // Add a small delay between processing alerts to avoid overwhelming the email service
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      logger.info(
        `Alert processing completed. Success: ${successCount}, Errors: ${errorCount}`
      );
    } catch (error) {
      logger.error("Error in processAllAlerts:", error);
      throw error;
    }
  }
}
