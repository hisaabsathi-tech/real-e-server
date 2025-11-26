import Redis from "ioredis";
import logger from "@/logger/logger";

const MAX_SEARCH_RESULTS = 1000;
const CACHE_TTL = 3600;
const PROPERTY_INDEX = "properties_idx";
const SEARCH_CACHE_PREFIX = "search_cache:";

export const redis = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

interface PropertySearchOptions {
  query?: string;
  filters?: {
    status?: string[];
    type?: string[];
    priceMin?: number;
    priceMax?: number;
    beds?: string[];
    baths?: string[];
    areaId?: string[];
    developerId?: string[];
    communityId?: string[];
    isFeatured?: boolean;
    property_type?: string[];
    property_status?: string[];
    popular_features?: string[];
    community_features?: string[];
    interior_features?: string[];
    parking_features?: string[];
    view?: string[];
    heating?: string[];
    financial_information?: string[];
    home_style?: string[];
    heating_features?: string[];
    property_subtypes?: string[];
    lot_features?: string[];
    pool_features?: string[];
    green_features?: string[];
    stories?: string[];
    exterior_features?: string[];
    property_features?: string[];
    lat?: number;
    long?: number;
    radius?: number;
  };
  sort?: {
    by?: 'price' | 'createdAt' | 'name' | '_score';
    order?: 'ASC' | 'DESC';
  };
  offset?: number;
  limit?: number;
}

export const createPropertySearchIndex = async (): Promise<void> => {
  try {
    try {
      await redis.call("FT.INFO", PROPERTY_INDEX);
      logger.info("Property search index already exists");
      return;
    } catch (error) {
      logger.error("Failed to check property search index:", error);
    }

    await redis.call(
      "FT.CREATE",
      PROPERTY_INDEX,
      "ON", "HASH",
      "PREFIX", "1", "property:",
      "SCHEMA",
      "name", "TEXT", "WEIGHT", "2.0", "SORTABLE",
      "overview", "TEXT", "WEIGHT", "1.5",
      "area_name", "TEXT", "WEIGHT", "1.0",
      "developer_name", "TEXT", "WEIGHT", "1.0",
      "community_name", "TEXT", "WEIGHT", "1.0",
      
      "status", "TAG", "SORTABLE",
      "type", "TAG", "SORTABLE",
      "beds", "TAG",
      "baths", "TAG",
      "areaId", "TAG",
      "developerId", "TAG",
      "communityId", "TAG",
      "userId", "TAG",
      
      "price", "NUMERIC", "SORTABLE",
      "lat", "NUMERIC",
      "long", "NUMERIC",
      "createdAt", "NUMERIC", "SORTABLE",
      
      "isFeatured", "TAG",
      
      "property_type", "TAG",
      "property_status", "TAG",
      "popular_features", "TAG",
      "community_features", "TAG",
      "interior_features", "TAG",
      "parking_features", "TAG",
      "view", "TAG",
      "heating", "TAG",
      "financial_information", "TAG",
      "home_style", "TAG",
      "heating_features", "TAG",
      "property_subtypes", "TAG",
      "lot_features", "TAG",
      "pool_features", "TAG",
      "green_features", "TAG",
      "stories", "TAG",
      "exterior_features", "TAG",
      "property_features", "TAG"
    );

    logger.info("Property search index created successfully");
  } catch (error) {
    logger.error("Failed to create property search index:", error);
    throw error;
  }
};

export const indexProperty = async (property: any): Promise<void> => {
  try {
    const propertyKey = `property:${property.id}`;
    
    const indexData: Record<string, any> = {
      name: property.name || "",
      overview: property.overview || "",
      area_name: property.area?.name || "",
      developer_name: property.developer?.name || "",
      community_name: property.community?.name || "",
      status: property.status || "",
      type: property.type || "",
      beds: property.beds || "",
      baths: property.baths || "",
      areaId: property.areaId || "",
      developerId: property.developerId || "",
      communityId: property.communityId || "",
      userId: property.userId || "",
      price: property.price || 0,
      lat: property.lat || 0,
      long: property.long || 0,
      createdAt: new Date(property.createdAt).getTime(),
      isFeatured: property.isFeatured ? "true" : "false",
    };

    const arrayFields = [
      'property_type', 'property_status', 'popular_features', 'community_features',
      'interior_features', 'parking_features', 'view', 'heating',
      'financial_information', 'home_style', 'heating_features', 'property_subtypes',
      'lot_features', 'pool_features', 'green_features', 'stories',
      'exterior_features', 'property_features'
    ];

    arrayFields.forEach(field => {
      if (property[field] && Array.isArray(property[field])) {
        indexData[field] = property[field].join("|");
      } else {
        indexData[field] = "";
      }
    });

    const hashData: string[] = [];
    Object.entries(indexData).forEach(([key, value]) => {
      hashData.push(key, String(value));
    });

    await redis.hmset(propertyKey, ...hashData);
    await redis.expire(propertyKey, CACHE_TTL * 24);
    
  } catch (error) {
    logger.error(`Failed to index property ${property.id}:`, error);
    throw error;
  }
};

export const removePropertyFromIndex = async (propertyId: string): Promise<void> => {
  try {
    await redis.del(`property:${propertyId}`);
  } catch (error) {
    logger.error(`Failed to remove property ${propertyId} from index:`, error);
    throw error;
  }
};

const buildSearchQuery = (options: PropertySearchOptions): string => {
  const queryParts: string[] = [];
  
  if (options.query && options.query.trim()) {
    const cleanQuery = options.query.replace(/[^a-zA-Z0-9\s]/g, "");
    queryParts.push(`(name:${cleanQuery}* | overview:${cleanQuery}* | area_name:${cleanQuery}* | developer_name:${cleanQuery}* | community_name:${cleanQuery}*)`);
  }

  if (options.filters) {
    const { filters } = options;

    if (filters.status && filters.status.length > 0) {
      queryParts.push(`@status:{${filters.status.join("|")}}`);
    }
    
    if (filters.type && filters.type.length > 0) {
      queryParts.push(`@type:{${filters.type.join("|")}}`);
    }
    
    if (filters.beds && filters.beds.length > 0) {
      queryParts.push(`@beds:{${filters.beds.join("|")}}`);
    }
    
    if (filters.baths && filters.baths.length > 0) {
      queryParts.push(`@baths:{${filters.baths.join("|")}}`);
    }
    
    if (filters.areaId && filters.areaId.length > 0) {
      queryParts.push(`@areaId:{${filters.areaId.join("|")}}`);
    }
    
    if (filters.developerId && filters.developerId.length > 0) {
      queryParts.push(`@developerId:{${filters.developerId.join("|")}}`);
    }
    
    if (filters.communityId && filters.communityId.length > 0) {
      queryParts.push(`@communityId:{${filters.communityId.join("|")}}`);
    }

    if (filters.isFeatured !== undefined) {
      queryParts.push(`@isFeatured:{${filters.isFeatured ? "true" : "false"}}`);
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const min = filters.priceMin ?? 0;
      const max = filters.priceMax ?? "+inf";
      queryParts.push(`@price:[${min} ${max}]`);
    }

    const multiValueFields = [
      'property_type', 'property_status', 'popular_features', 'community_features',
      'interior_features', 'parking_features', 'view', 'heating',
      'financial_information', 'home_style', 'heating_features', 'property_subtypes',
      'lot_features', 'pool_features', 'green_features', 'stories',
      'exterior_features', 'property_features'
    ];

    multiValueFields.forEach(field => {
      if (filters[field as keyof typeof filters] && Array.isArray(filters[field as keyof typeof filters])) {
        const values = filters[field as keyof typeof filters] as string[];
        if (values.length > 0) {
          queryParts.push(`@${field}:{${values.join("|")}}`);
        }
      }
    });
    
    if (filters.lat !== undefined && filters.long !== undefined && filters.radius !== undefined) {
      // Note: RedisSearch doesn't have built-in geo support like this
      // You'd need to implement distance calculation in post-processing
      // or use a different approach like geo hashing
    }
  }

  return queryParts.length > 0 ? queryParts.join(" ") : "*";
};

export const searchProperties = async (options: PropertySearchOptions = {}): Promise<any> => {
  try {
    const cacheKey = `${SEARCH_CACHE_PREFIX}${JSON.stringify(options)}`;
    
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      logger.info("Returning cached search result");
      return JSON.parse(cachedResult);
    }

    const query = buildSearchQuery(options);
    const offset = options.offset || 0;
    const limit = Math.min(options.limit || 20, MAX_SEARCH_RESULTS);
    
    const results = await redis.call("FT.SEARCH", PROPERTY_INDEX, query, "LIMIT", String(offset), String(limit), ...(options.sort?.by ? ["SORTBY", options.sort.by, options.sort.order || "DESC"] : [])) as any[];
    
    if (!results || results.length < 1) {
      return { total: 0, properties: [] };
    }

    const total = results[0];
    const properties = [];

    for (let i = 1; i < results.length; i += 2) {
      const key = results[i];
      const fields = results[i + 1];
      
      if (fields && Array.isArray(fields)) {
        const property: any = { id: key.replace('property:', '') };
        
        for (let j = 0; j < fields.length; j += 2) {
          const fieldName = fields[j];
          let fieldValue = fields[j + 1];
          
          if (['property_type', 'property_status', 'popular_features', 'community_features',
               'interior_features', 'parking_features', 'view', 'heating',
               'financial_information', 'home_style', 'heating_features', 'property_subtypes',
               'lot_features', 'pool_features', 'green_features', 'stories',
               'exterior_features', 'property_features'].includes(fieldName)) {
            fieldValue = fieldValue ? fieldValue.split('|').filter(Boolean) : [];
          }
          
          if (['price', 'lat', 'long', 'createdAt'].includes(fieldName)) {
            fieldValue = parseFloat(fieldValue) || 0;
          }
          
          if (['isFeatured'].includes(fieldName)) {
            fieldValue = fieldValue === 'true';
          }
          
          property[fieldName] = fieldValue;
        }
        
        properties.push(property);
      }
    }

    const result = { total, properties };
    
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

    logger.info(`Search completed: ${total} properties found`);
    return result;

  } catch (error) {
    logger.error("Property search failed:", error);
    throw new Error("Search operation failed");
  }
};

export const autocompleteProperties = async (query: string, limit: number = 10): Promise<string[]> => {
  try {
    const cacheKey = `${SEARCH_CACHE_PREFIX}autocomplete:${query}:${limit}`;
    
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, "");
    const searchQuery = `name:${cleanQuery}*`;

    const results = await redis.call(
      "FT.SEARCH",
      PROPERTY_INDEX,
      searchQuery,
      "LIMIT", "0", String(limit),
      "RETURN", "1", "name"
    ) as any[];

    const suggestions: string[] = [];
    
    for (let i = 1; i < results.length; i += 2) {
      const fields = results[i + 1];
      if (fields && Array.isArray(fields) && fields.length >= 2) {
        suggestions.push(fields[1]); // Get the name field value
      }
    }

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(suggestions));

    return suggestions;
  } catch (error) {
    logger.error("Autocomplete search failed:", error);
    return [];
  }
};

export const clearSearchCache = async (): Promise<void> => {
  try {
    const keys = await redis.keys(`${SEARCH_CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    logger.info("Search cache cleared");
  } catch (error) {
    logger.error("Failed to clear search cache:", error);
  }
};

export const getSearchStats = async (): Promise<any> => {
  try {
    const info = await redis.call("FT.INFO", PROPERTY_INDEX);
    return info;
  } catch (error) {
    logger.error("Failed to get search stats:", error);
    return null;
  }
};

export const performSearch = async (indexName: string = PROPERTY_INDEX, query: string = "*"): Promise<any> => {
  try {
    const results = await redis.call("FT.SEARCH", indexName, query);
    return results;
  } catch (error) {
    logger.error("Legacy search failed:", error);
    throw error;
  }
};
