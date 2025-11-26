import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/logger/logger";
import { paginate } from "@/lib/paginate";
import { validator } from "@/lib/validator";
import { getPropertiesQuerySchema } from "@/schemas";

export const getProperties = async (req: Request, res: Response) => {
  try {
    const validatedQuery = validator({
      schema: getPropertiesQuerySchema,
      body: req.query,
    });

    if (!validatedQuery) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const {
      mode,
      sort,
      status,
      type,
      isFeatured,
      areas,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      // Filter fields
      beds,
      baths,
      sqft_min,
      sqft_max,
      lot_size_min,
      lot_size_max,
      year_built_min,
      year_built_max,
      garage_min,
      garage_max,
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
    } = validatedQuery;

    const where: any =
      req.user?.role !== "AGENT" ? {} : { userId: req.user.id };

    if (status) where.status = status;
    if (type) where.type = type;
    if (isFeatured !== undefined) where.isFeatured = isFeatured === "true";

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (minSize || maxSize) {
      where.size = {};
      if (minSize) where.size.gte = parseFloat(minSize as string);
      if (maxSize) where.size.lte = parseFloat(maxSize as string);
    }

    // Add property filters for direct field matching
    if (beds) where.beds = beds;
    if (baths) where.baths = baths;

    // Range filters
    if (sqft_min || sqft_max) {
      where.sqft = {};
      if (sqft_min) where.sqft.gte = sqft_min as string;
      if (sqft_max) where.sqft.lte = sqft_max as string;
    }

    if (lot_size_min || lot_size_max) {
      where.lot_size = {};
      if (lot_size_min) where.lot_size.gte = lot_size_min as string;
      if (lot_size_max) where.lot_size.lte = lot_size_max as string;
    }

    if (year_built_min || year_built_max) {
      where.year_built = {};
      if (year_built_min) where.year_built.gte = year_built_min as string;
      if (year_built_max) where.year_built.lte = year_built_max as string;
    }

    if (garage_min || garage_max) {
      where.garage = {};
      if (garage_min) where.garage.gte = garage_min as string;
      if (garage_max) where.garage.lte = garage_max as string;
    }

    const parseArrayParam = (param: any): string[] | null => {
      if (!param) return null;
      return typeof param === "string"
        ? param.split(",").map((item) => item.trim())
        : param;
    };

    if (property_type) {
      const parsedValue = parseArrayParam(property_type);
      if (parsedValue?.length) where.property_type = { hasSome: parsedValue };
    }
    if (property_status) {
      const parsedValue = parseArrayParam(property_status);
      if (parsedValue?.length) where.property_status = { hasSome: parsedValue };
    }
    if (popular_features) {
      const parsedValue = parseArrayParam(popular_features);
      if (parsedValue?.length)
        where.popular_features = { hasSome: parsedValue };
    }
    if (community_features) {
      const parsedValue = parseArrayParam(community_features);
      if (parsedValue?.length)
        where.community_features = { hasSome: parsedValue };
    }
    if (interior_features) {
      const parsedValue = parseArrayParam(interior_features);
      if (parsedValue?.length)
        where.interior_features = { hasSome: parsedValue };
    }
    if (parking_features) {
      const parsedValue = parseArrayParam(parking_features);
      if (parsedValue?.length)
        where.parking_features = { hasSome: parsedValue };
    }
    if (view) {
      const parsedValue = parseArrayParam(view);
      if (parsedValue?.length) where.view = { hasSome: parsedValue };
    }
    if (heating) {
      const parsedValue = parseArrayParam(heating);
      if (parsedValue?.length) where.heating = { hasSome: parsedValue };
    }
    if (financial_information) {
      const parsedValue = parseArrayParam(financial_information);
      if (parsedValue?.length)
        where.financial_information = { hasSome: parsedValue };
    }
    if (home_style) {
      const parsedValue = parseArrayParam(home_style);
      if (parsedValue?.length) where.home_style = { hasSome: parsedValue };
    }
    if (heating_features) {
      const parsedValue = parseArrayParam(heating_features);
      if (parsedValue?.length)
        where.heating_features = { hasSome: parsedValue };
    }
    if (property_subtypes) {
      const parsedValue = parseArrayParam(property_subtypes);
      if (parsedValue?.length)
        where.property_subtypes = { hasSome: parsedValue };
    }
    if (lot_features) {
      const parsedValue = parseArrayParam(lot_features);
      if (parsedValue?.length) where.lot_features = { hasSome: parsedValue };
    }
    if (pool_features) {
      const parsedValue = parseArrayParam(pool_features);
      if (parsedValue?.length) where.pool_features = { hasSome: parsedValue };
    }
    if (green_features) {
      const parsedValue = parseArrayParam(green_features);
      if (parsedValue?.length) where.green_features = { hasSome: parsedValue };
    }
    if (stories) {
      const parsedValue = parseArrayParam(stories);
      if (parsedValue?.length) where.stories = { hasSome: parsedValue };
    }
    if (exterior_features) {
      const parsedValue = parseArrayParam(exterior_features);
      if (parsedValue?.length)
        where.exterior_features = { hasSome: parsedValue };
    }
    if (property_features) {
      const parsedValue = parseArrayParam(property_features);
      if (parsedValue?.length)
        where.property_features = { hasSome: parsedValue };
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        developer: true,
        community: true,
        paymentPlan: true,
        area: true,
        propertyContacts: true,
        user: true,
      },
      orderBy: {
        createdAt:
          sort === "desc" || mode === "CURRENT" || mode === "NEW"
            ? "desc"
            : "asc",
      },
    });

    let data = properties;
    if (areas && typeof areas === "string") {
      const areaNames = areas
        .toLowerCase()
        .split(",")
        .map((area) => area.trim());
      data = properties.filter(
        (property) =>
          property.area && areaNames.includes(property.area.name.toLowerCase())
      );
    }

    const { page, limit, totalPages, totalItems, items } = paginate(
      data,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );

    return res.status(200).json({ page, limit, totalPages, totalItems, items });
  } catch (error) {
    logger.error("Error in getProperties controller:", error);
    res.status(500).json({ error: "Failed to get properties" });
  }
};

export const getProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: {
        id,
        ...(req.user?.role === "AGENT" && { userId: req.user.id }),
      },
      include: {
        developer: true,
        community: {
          include: {
            area: true,
          },
        },
        paymentPlan: true,
        area: true,
        propertyContacts: true,
        user: true,
      },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Format the response in the requested structure
    const formattedProperty = {
      houseDescription: property.overview,

      highlights: {
        listedBy: property.developer?.name || "N/A",
        propertyType: property.type,
        size: `${property.sqft || "N/A"} sq ft`,
        handover: property.handover
          ? new Date(property.handover).getFullYear()
          : "N/A",
        area: property.area?.name || "N/A",
        community: property.community?.name || "N/A",
        status: property.status,
        listingId: property.id,
        price: `$${property.price.toLocaleString()}`,
        paymentPlan: property.paymentPlan?.name || "N/A",
        accommodation: property.beds || "N/A",
        possession: "N/A", // This field can be added to schema later if needed
      },

      interiorFeatures: {
        bedroomsAndBathrooms: {
          bedrooms: property.beds || "N/A",
          bathrooms: property.baths || "N/A",
          fullBathrooms: property.baths || "N/A",
        },
        appliances: property.interior_features || [],
        floor: "N/A", // This field can be added to schema later if needed
        aboveGroundSqFt: property.sqft || "N/A",
        belowGroundSqFt: "N/A",
        other: property.property_features || [],
      },

      exteriorFeatures: {
        lot: property.lot_features || [],
        roof: "N/A", // This field can be added to schema later if needed
        others: property.exterior_features || [],
        parkingFeatures: property.parking_features || [],
      },

      propertyDetails: {
        propertyType: property.type,
        homeStyle: property.home_style || [],
        stories: property.stories || [],
        view: property.view || [],
        heating: property.heating || [],
        heatingFeatures: property.heating_features || [],
        propertySubtypes: property.property_subtypes || [],
        poolFeatures: property.pool_features || [],
        greenFeatures: property.green_features || [],
        communityFeatures: property.community_features || [],
        popularFeatures: property.popular_features || [],
        financialInformation: property.financial_information || [],
      },

      location: {
        latitude: property.lat,
        longitude: property.long,
        area: property.area?.name,
        community: property.community?.name,
      },

      contact:
        property.propertyContacts?.map((contact) => ({
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          message: contact.message,
        })) || [],

      images: property.images || [],
      brochures: {
        property: property.brochure,
        floorPlan: property.floorPlanBrochure,
        paymentPlan: property.paymentPlanBrochure,
      },

      // Include raw property data for backward compatibility
      rawProperty: property,

      agent: property.user,
    };

    return res.status(200).json({ property: formattedProperty });
  } catch (error) {
    logger.error("Error in getProperty controller:", error);
    res.status(500).json({ error: "Failed to get property" });
  }
};
