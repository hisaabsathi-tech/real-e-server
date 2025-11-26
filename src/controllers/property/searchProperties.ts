import { Request, Response } from "express";
import {
  searchProperties,
  autocompleteProperties,
  getSearchStats,
} from "@/lib/redis";
import {
  syncAllPropertiesToRedis,
  syncPropertyToRedis,
} from "@/lib/propertySearchSync";
import logger from "@/logger/logger";
import { validator } from "@/lib/validator";
import { getPropertiesQuerySchema } from "@/schemas";
import { paginate } from "@/lib/paginate";

export const searchPropertiesRedis = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const validatedQuery = validator({
      schema: getPropertiesQuerySchema,
      body: req.query,
    });

    if (!validatedQuery) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const {
      sort,
      status,
      type,
      isFeatured,
      developerId,
      communityId,
      areaId,
      minPrice,
      maxPrice,
      beds,
      baths,
      property_type,
      property_status,
      popular_features,
      community_features,
      interior_features,
      parking_features,
      view,
      heating,
      financial_information,
      home_style,
      heating_features,
      property_subtypes,
      lot_features,
      pool_features,
      green_features,
      stories,
      exterior_features,
      property_features,
      query,
      lat,
      long,
      radius,
    } = validatedQuery;

    const searchOptions: any = {
      query: query as string,
      filters: {},
      sort: {
        by: sort === "price" ? "price" : sort === "name" ? "name" : "createdAt",
        order: req.query.order === "asc" ? "ASC" : "DESC",
      },
      offset:
        ((Number(req.query.page) || 1) - 1) * (Number(req.query.limit) || 20),
      limit: Number(req.query.limit) || 20,
    };

    if (status)
      searchOptions.filters.status = Array.isArray(status) ? status : [status];
    if (type) searchOptions.filters.type = Array.isArray(type) ? type : [type];
    if (isFeatured !== undefined)
      searchOptions.filters.isFeatured = isFeatured === "true";
    if (developerId)
      searchOptions.filters.developerId = Array.isArray(developerId)
        ? developerId
        : [developerId];
    if (communityId)
      searchOptions.filters.communityId = Array.isArray(communityId)
        ? communityId
        : [communityId];
    if (areaId)
      searchOptions.filters.areaId = Array.isArray(areaId) ? areaId : [areaId];
    if (beds) searchOptions.filters.beds = Array.isArray(beds) ? beds : [beds];
    if (baths)
      searchOptions.filters.baths = Array.isArray(baths) ? baths : [baths];

    if (minPrice)
      searchOptions.filters.priceMin = parseFloat(minPrice as string);
    if (maxPrice)
      searchOptions.filters.priceMax = parseFloat(maxPrice as string);

    const arrayFilters = {
      property_type,
      property_status,
      popular_features,
      community_features,
      interior_features,
      parking_features,
      view,
      heating,
      financial_information,
      home_style,
      heating_features,
      property_subtypes,
      lot_features,
      pool_features,
      green_features,
      stories,
      exterior_features,
      property_features,
    };

    Object.entries(arrayFilters).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0) {
        searchOptions.filters[key] = value;
      }
    });

    if (lat && long && radius) {
      searchOptions.filters.lat = parseFloat(lat as string);
      searchOptions.filters.long = parseFloat(long as string);
      searchOptions.filters.radius = parseFloat(radius as string);
    }

    const results = await searchProperties(searchOptions);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    return res
      .status(200)
      .json({
        items: results.properties,
        page,
        limit,
        totalPages: Math.ceil(results.total / limit),
        totalItems: results.total,
      });
  } catch (error) {
    logger.error("Error in Redis property search:", error);
    return res.status(500).json({ error: "Search operation failed" });
  }
};

export const autocompletePropertiesEndpoint = async (
  req: Request,
  res: Response
) => {
  try {
    const { q, limit } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const suggestions = await autocompleteProperties(
      q as string,
      Math.min(Number(limit) || 10, 50)
    );

    return res.status(200).json({ suggestions });
  } catch (error) {
    logger.error("Error in property autocomplete:", error);
    return res.status(500).json({ error: "Autocomplete operation failed" });
  }
};

export const getPropertySearchStats = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const stats = await getSearchStats();
    return res.status(200).json({ stats });
  } catch (error) {
    logger.error("Error getting search stats:", error);
    return res.status(500).json({ error: "Failed to get search statistics" });
  }
};

export const syncPropertyEndpoint = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required" });
    }

    await syncPropertyToRedis(propertyId);
    return res.status(200).json({ message: "Property synced successfully" });
  } catch (error) {
    logger.error("Error syncing property to Redis:", error);
    return res.status(500).json({ error: "Failed to sync property" });
  }
};

export const syncAllProperty = async (req: Request, res: Response) => {
  try {
    await syncAllPropertiesToRedis();
    return res
      .status(200)
      .json({ message: "All properties synced successfully" });
  } catch (error) {
    logger.error("Error syncing all properties to Redis:", error);
    return res.status(500).json({ error: "Failed to sync all properties" });
  }
};
