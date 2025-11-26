import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "AGENT", "MANAGER"]).optional(),
  area: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const addDeveloperSchema = z.object({
  logo: z.url({ message: "Provide a valid logo URL" }).optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export const updateDeveloperSchema = z.object({
  logo: z.url({ message: "Provide a valid logo URL" }).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

// Area schemas
export const addAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z
    .array(z.url({ message: "Provide a valid link" }))
    .min(1, "At least one image is required"),
});

export const updateAreaSchema = z.object({
  name: z.string().optional(),
  image: z.array(z.url({ message: "Provide a valid link" })).optional(),
});

// Community schemas
export const addCommunitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  areaId: z.array(z.string().min(1, "Area ID is required")),
  developerId: z.array(z.string().min(1, "Developer ID is required")),
});

export const updateCommunitySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  areaId: z.array(z.string()).optional(),
  developerId: z.array(z.string()).optional(),
});

// PaymentPlan schemas
export const addPaymentPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
});

export const updatePaymentPlanSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

// FeatureAmenities schemas
export const addFeatureAmenitiesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo: z.string().url("Logo must be a valid URL"),
});

export const updateFeatureAmenitiesSchema = z.object({
  name: z.string().optional(),
  logo: z.string().url("Logo must be a valid URL").optional(),
});

export const propertyFiltersSchema = z.object({
  // Single selection fields
  beds: z.enum(["ANY", "1", "2", "3", "4+"]).optional(),
  baths: z.enum(["ANY", "1", "2", "3", "4+"]).optional(),

  // Range fields
  price_range_min: z.string().optional(),
  price_range_max: z.string().optional(),
  sqft_min: z.string().optional(),
  sqft_max: z.string().optional(),
  lot_size_min: z.string().optional(),
  lot_size_max: z.string().optional(),
  year_built_min: z.string().optional(),
  year_built_max: z.string().optional(),
  garage_min: z.string().optional(),
  garage_max: z.string().optional(),

  // Multi-select fields
  property_type: z
    .array(
      z.enum([
        "Business Opportunity",
        "Commercial Sale",
        "Condo/Townhome",
        "Farm/Ranch",
        "Manufactured Home",
        "Multi-Family",
        "Residential",
        "Residential Lease",
        "Vacant Land",
      ])
    )
    .optional(),
  property_status: z
    .array(
      z.enum([
        "All",
        "Active",
        "Pending",
        "Active with contingency",
        "Open Houses",
        "New Listings",
        "Price Reduced",
      ])
    )
    .optional(),
  popular_features: z
    .array(z.enum(["Basement", "Waterfront", "New Construction"]))
    .optional(),
  community_features: z
    .array(
      z.enum([
        "Golf Community",
        "Boat Launch",
        "Tennis Courts",
        "Community Waterfront/Pvt",
        "Airfield",
        "Gated",
        "Golf",
        "Senior Community",
        "No CCRs",
        "Has CCRs",
        "No Age Restrictions",
      ])
    )
    .optional(),
  interior_features: z
    .array(
      z.enum([
        "Basement: Daylight",
        "Built-In Vacuum",
        "Loft",
        "Security System",
        "Wired for Generator",
        "2nd Master Bedroom",
        "Hardwood",
        "Basement: Finished",
        "Second Kitchen",
        "Basement: Partially Finished",
        "Basement: Unfinished",
        "Master on Main",
        "Furnished",
        "Second Primary Bedroom",
        "Elevator",
      ])
    )
    .optional(),
  parking_features: z
    .array(
      z.enum(["Off Street", "RV Parking", "Attached Garage", "Common Garage"])
    )
    .optional(),
  view: z
    .array(
      z.enum([
        "Bay",
        "City",
        "Golf Course",
        "Jetty",
        "Lake",
        "Ocean",
        "River",
        "Sound",
        "Strait",
        "Canal",
        "Mountain(s)",
      ])
    )
    .optional(),
  heating: z
    .array(
      z.enum([
        "90%+ High Efficiency",
        "Baseboard",
        "Ductless HP-Mini Split",
        "Electric",
        "Forced Air",
        "Heat Pump",
        "HEPA Air Filtration",
        "High Efficiency (Unspecified)",
        "HRV/ERV System",
        "Insert",
        "Natural Gas",
        "Oil",
        "Pellet",
        "Propane",
        "Radiant",
        "Solar (Unspecified)",
        "Solar PV",
        "Tankless Water Heater",
        "Wood",
        "Hot Water Recirculation Pump",
      ])
    )
    .optional(),
  financial_information: z
    .array(
      z.enum([
        "Cash Out",
        "Farm Home Loan",
        "FHA",
        "Owner Financing",
        "Rehab Loan",
        "State Bond",
        "VA Loan",
        "USDA Loan",
        "Has HOA",
        "No HOA",
        "Conventional",
        "Assumable",
        "Short Sale",
        "Bank Or REO",
      ])
    )
    .optional(),
  home_style: z
    .array(
      z.enum([
        "Townhouse",
        "Contemporary",
        "Craftsman",
        "NW Contemporary",
        "Duplex",
        "Triplex",
        "Quadruplex",
        "Dock",
        "Floating House",
        "Cabin",
      ])
    )
    .optional(),
  heating_features: z
    .array(z.enum(["Stove/Free Standing", "Central A/C"]))
    .optional(),
  property_subtypes: z.array(z.enum(["ADU", "Condominium"])).optional(),
  lot_features: z
    .array(
      z.enum([
        "Bank-Medium",
        "No Bank",
        "Bank-High",
        "Bulkhead",
        "Lake",
        "Creek",
        "Saltwater",
        "Sound",
        "Strait",
        "Tideland Rights",
        "Fenced-Fully",
        "RV Parking",
        "Sprinkler System",
        "Shop",
        "Bay/Harbor",
        "Green House",
        "Electric Car Charging",
        "Zoning: HDC-1",
        "River Access",
      ])
    )
    .optional(),
  pool_features: z
    .array(z.enum(["Community", "Above Ground", "In-Ground", "Indoor"]))
    .optional(),
  green_features: z
    .array(z.enum(["High Efficiency - 90%+", "Insulated Windows"]))
    .optional(),
  stories: z.array(z.enum(["1 Story", "2 Story", "3+ Story"])).optional(),
  exterior_features: z
    .array(
      z.enum([
        "Under Construction",
        "Average",
        "Very Good",
        "Good",
        "Fair",
        "Fixer",
        "Has ADU",
        "Remodeled",
      ])
    )
    .optional(),
  property_features: z.array(z.enum(["Equestrian", "Pasture Land"])).optional(),
});

export const getPropertiesQuerySchema = z.object({
  // Basic filters
  mode: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  isFeatured: z.string().optional(),
  areas: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minSize: z.string().optional(),
  maxSize: z.string().optional(),

  // Property filter fields
  beds: z.string().optional(),
  baths: z.string().optional(),
  price_range_min: z.string().optional(),
  price_range_max: z.string().optional(),
  sqft_min: z.string().optional(),
  sqft_max: z.string().optional(),
  lot_size_min: z.string().optional(),
  lot_size_max: z.string().optional(),
  year_built_min: z.string().optional(),
  year_built_max: z.string().optional(),
  garage_min: z.string().optional(),
  garage_max: z.string().optional(),
  property_type: z.string().optional(),
  property_status: z.string().optional(),
  popular_features: z.string().optional(),
  community_features: z.string().optional(),
  interior_features: z.string().optional(),
  parking_features: z.string().optional(),
  view: z.string().optional(),
  heating: z.string().optional(),
  financial_information: z.string().optional(),
  home_style: z.string().optional(),
  heating_features: z.string().optional(),
  property_subtypes: z.string().optional(),
  lot_features: z.string().optional(),
  pool_features: z.string().optional(),
  green_features: z.string().optional(),
  stories: z.string().optional(),
  exterior_features: z.string().optional(),
  property_features: z.string().optional(),
});

export const addPropertySchema = z.object({
  areaId: z.string().min(1, "Area ID is required"),
  developerId: z.string().min(1, "Developer ID is required"),
  communityId: z.string().min(1, "Community ID is required"),
  paymentPlanId: z.string().min(1, "Payment plan ID is required").optional(),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  name: z.string().min(1, "Name is required"),
  overview: z.string().min(1, "Overview is required"),
  status: z.enum(["Coming_Soon", "Offplan", "Ready_To_Move", "Resale"]),
  price: z.number().positive("Price must be positive"),
  type: z.enum([
    "Apartments",
    "Villas",
    "Townhouses",
    "Penthouses",
    "Lands",
    "Offices",
    "Mansions",
    "Duplex",
    "Warehouse",
    "Lofts",
  ]),
  isFeatured: z.boolean().optional(),
  brochure: z.string().url("Brochure must be a valid URL").optional(),
  floorPlanBrochure: z
    .string()
    .url("Floor plan brochure must be a valid URL")
    .optional(),
  paymentPlanBrochure: z
    .string()
    .url("Payment plan brochure must be a valid URL")
    .optional(),
  lat: z.string().min(1, "Latitude is required"),
  long: z.string().min(1, "Longitude is required"),
  availableDates: z.array(z.coerce.date()).optional(),
  handover: z.coerce.date({ message: "Invalid handover date" }).optional(),

  // Property filter fields (optional for add)
  beds: z.enum(["ANY", "1", "2", "3", "4+"]).optional(),
  baths: z.enum(["ANY", "1", "2", "3", "4+"]).optional(),
  sqft: z.string().optional(),
  lot_size: z.string().optional(),
  year_built: z.string().optional(),
  garage: z.string().optional(),
  property_type: z
    .array(
      z.enum([
        "Business Opportunity",
        "Commercial Sale",
        "Condo/Townhome",
        "Farm/Ranch",
        "Manufactured Home",
        "Multi-Family",
        "Residential",
        "Residential Lease",
        "Vacant Land",
      ])
    )
    .optional(),
  property_status: z
    .array(
      z.enum([
        "All",
        "Active",
        "Pending",
        "Active with contingency",
        "Open Houses",
        "New Listings",
        "Price Reduced",
      ])
    )
    .optional(),
  popular_features: z
    .array(z.enum(["Basement", "Waterfront", "New Construction"]))
    .optional(),
  community_features: z
    .array(
      z.enum([
        "Golf Community",
        "Boat Launch",
        "Tennis Courts",
        "Community Waterfront/Pvt",
        "Airfield",
        "Gated",
        "Golf",
        "Senior Community",
        "No CCRs",
        "Has CCRs",
        "No Age Restrictions",
      ])
    )
    .optional(),
  interior_features: z
    .array(
      z.enum([
        "Basement: Daylight",
        "Built-In Vacuum",
        "Loft",
        "Security System",
        "Wired for Generator",
        "2nd Master Bedroom",
        "Hardwood",
        "Basement: Finished",
        "Second Kitchen",
        "Basement: Partially Finished",
        "Basement: Unfinished",
        "Master on Main",
        "Furnished",
        "Second Primary Bedroom",
        "Elevator",
      ])
    )
    .optional(),
  parking_features: z
    .array(
      z.enum(["Off Street", "RV Parking", "Attached Garage", "Common Garage"])
    )
    .optional(),
  view: z
    .array(
      z.enum([
        "Bay",
        "City",
        "Golf Course",
        "Jetty",
        "Lake",
        "Ocean",
        "River",
        "Sound",
        "Strait",
        "Canal",
        "Mountain(s)",
      ])
    )
    .optional(),
  heating: z
    .array(
      z.enum([
        "90%+ High Efficiency",
        "Baseboard",
        "Ductless HP-Mini Split",
        "Electric",
        "Forced Air",
        "Heat Pump",
        "HEPA Air Filtration",
        "High Efficiency (Unspecified)",
        "HRV/ERV System",
        "Insert",
        "Natural Gas",
        "Oil",
        "Pellet",
        "Propane",
        "Radiant",
        "Solar (Unspecified)",
        "Solar PV",
        "Tankless Water Heater",
        "Wood",
        "Hot Water Recirculation Pump",
      ])
    )
    .optional(),
  financial_information: z
    .array(
      z.enum([
        "Cash Out",
        "Farm Home Loan",
        "FHA",
        "Owner Financing",
        "Rehab Loan",
        "State Bond",
        "VA Loan",
        "USDA Loan",
        "Has HOA",
        "No HOA",
        "Conventional",
        "Assumable",
        "Short Sale",
        "Bank Or REO",
      ])
    )
    .optional(),
  home_style: z
    .array(
      z.enum([
        "Townhouse",
        "Contemporary",
        "Craftsman",
        "NW Contemporary",
        "Duplex",
        "Triplex",
        "Quadruplex",
        "Dock",
        "Floating House",
        "Cabin",
      ])
    )
    .optional(),
  heating_features: z
    .array(z.enum(["Stove/Free Standing", "Central A/C"]))
    .optional(),
  property_subtypes: z.array(z.enum(["ADU", "Condominium"])).optional(),
  lot_features: z
    .array(
      z.enum([
        "Bank-Medium",
        "No Bank",
        "Bank-High",
        "Bulkhead",
        "Lake",
        "Creek",
        "Saltwater",
        "Sound",
        "Strait",
        "Tideland Rights",
        "Fenced-Fully",
        "RV Parking",
        "Sprinkler System",
        "Shop",
        "Bay/Harbor",
        "Green House",
        "Electric Car Charging",
        "Zoning: HDC-1",
        "River Access",
      ])
    )
    .optional(),
  pool_features: z
    .array(z.enum(["Community", "Above Ground", "In-Ground", "Indoor"]))
    .optional(),
  green_features: z
    .array(z.enum(["High Efficiency - 90%+", "Insulated Windows"]))
    .optional(),
  stories: z.array(z.enum(["1 Story", "2 Story", "3+ Story"])).optional(),
  exterior_features: z
    .array(
      z.enum([
        "Under Construction",
        "Average",
        "Very Good",
        "Good",
        "Fair",
        "Fixer",
        "Has ADU",
        "Remodeled",
      ])
    )
    .optional(),
  property_features: z.array(z.enum(["Equestrian", "Pasture Land"])).optional(),
});

export const updatePropertySchema = z.object({
  developerId: z.string().optional(),
  communityId: z.string().optional(),
  areaId: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  name: z.string().optional(),
  overview: z.string().optional(),
  accommodation: z.string().optional(),
  possession: z.string().optional(),
  status: z
    .enum(["Coming_Soon", "Offplan", "Ready_To_Move", "Resale"])
    .optional(),
  type: z
    .enum([
      "Apartments",
      "Villas",
      "Townhouses",
      "Penthouses",
      "Lands",
      "Offices",
      "Mansions",
      "Duplex",
      "Warehouse",
      "Lofts",
    ])
    .optional(),
  isFeatured: z.boolean().optional(),
  paymentPlanId: z.string().optional(),
  handover: z.coerce.date().optional(),
  brochure: z.string().url().optional(),
  floorPlanBrochure: z.string().url().optional(),
  paymentPlanBrochure: z.string().url().optional(),
  price: z.number().positive().optional(),
  lat: z.string().optional(),
  long: z.string().optional(),
  availableDates: z.array(z.coerce.date()).optional(),

  // Property filter fields (all optional for update)
  beds: z.enum(["ANY", "1", "2", "3", "4+"]).optional(),
  baths: z.enum(["ANY", "1", "2", "3", "4+"]).optional(),
  sqft: z.string().optional(),
  lot_size: z.string().optional(),
  year_built: z.string().optional(),
  garage: z.string().optional(),
  property_type: z
    .array(
      z.enum([
        "Business Opportunity",
        "Commercial Sale",
        "Condo/Townhome",
        "Farm/Ranch",
        "Manufactured Home",
        "Multi-Family",
        "Residential",
        "Residential Lease",
        "Vacant Land",
      ])
    )
    .optional(),
  property_status: z
    .array(
      z.enum([
        "All",
        "Active",
        "Pending",
        "Active with contingency",
        "Open Houses",
        "New Listings",
        "Price Reduced",
      ])
    )
    .optional(),
  popular_features: z
    .array(z.enum(["Basement", "Waterfront", "New Construction"]))
    .optional(),
  community_features: z
    .array(
      z.enum([
        "Golf Community",
        "Boat Launch",
        "Tennis Courts",
        "Community Waterfront/Pvt",
        "Airfield",
        "Gated",
        "Golf",
        "Senior Community",
        "No CCRs",
        "Has CCRs",
        "No Age Restrictions",
      ])
    )
    .optional(),
  interior_features: z
    .array(
      z.enum([
        "Basement: Daylight",
        "Built-In Vacuum",
        "Loft",
        "Security System",
        "Wired for Generator",
        "2nd Master Bedroom",
        "Hardwood",
        "Basement: Finished",
        "Second Kitchen",
        "Basement: Partially Finished",
        "Basement: Unfinished",
        "Master on Main",
        "Furnished",
        "Second Primary Bedroom",
        "Elevator",
      ])
    )
    .optional(),
  parking_features: z
    .array(
      z.enum(["Off Street", "RV Parking", "Attached Garage", "Common Garage"])
    )
    .optional(),
  view: z
    .array(
      z.enum([
        "Bay",
        "City",
        "Golf Course",
        "Jetty",
        "Lake",
        "Ocean",
        "River",
        "Sound",
        "Strait",
        "Canal",
        "Mountain(s)",
      ])
    )
    .optional(),
  heating: z
    .array(
      z.enum([
        "90%+ High Efficiency",
        "Baseboard",
        "Ductless HP-Mini Split",
        "Electric",
        "Forced Air",
        "Heat Pump",
        "HEPA Air Filtration",
        "High Efficiency (Unspecified)",
        "HRV/ERV System",
        "Insert",
        "Natural Gas",
        "Oil",
        "Pellet",
        "Propane",
        "Radiant",
        "Solar (Unspecified)",
        "Solar PV",
        "Tankless Water Heater",
        "Wood",
        "Hot Water Recirculation Pump",
      ])
    )
    .optional(),
  financial_information: z
    .array(
      z.enum([
        "Cash Out",
        "Farm Home Loan",
        "FHA",
        "Owner Financing",
        "Rehab Loan",
        "State Bond",
        "VA Loan",
        "USDA Loan",
        "Has HOA",
        "No HOA",
        "Conventional",
        "Assumable",
        "Short Sale",
        "Bank Or REO",
      ])
    )
    .optional(),
  home_style: z
    .array(
      z.enum([
        "Townhouse",
        "Contemporary",
        "Craftsman",
        "NW Contemporary",
        "Duplex",
        "Triplex",
        "Quadruplex",
        "Dock",
        "Floating House",
        "Cabin",
      ])
    )
    .optional(),
  heating_features: z
    .array(z.enum(["Stove/Free Standing", "Central A/C"]))
    .optional(),
  property_subtypes: z.array(z.enum(["ADU", "Condominium"])).optional(),
  lot_features: z
    .array(
      z.enum([
        "Bank-Medium",
        "No Bank",
        "Bank-High",
        "Bulkhead",
        "Lake",
        "Creek",
        "Saltwater",
        "Sound",
        "Strait",
        "Tideland Rights",
        "Fenced-Fully",
        "RV Parking",
        "Sprinkler System",
        "Shop",
        "Bay/Harbor",
        "Green House",
        "Electric Car Charging",
        "Zoning: HDC-1",
        "River Access",
      ])
    )
    .optional(),
  pool_features: z
    .array(z.enum(["Community", "Above Ground", "In-Ground", "Indoor"]))
    .optional(),
  green_features: z
    .array(z.enum(["High Efficiency - 90%+", "Insulated Windows"]))
    .optional(),
  stories: z.array(z.enum(["1 Story", "2 Story", "3+ Story"])).optional(),
  exterior_features: z
    .array(
      z.enum([
        "Under Construction",
        "Average",
        "Very Good",
        "Good",
        "Fair",
        "Fixer",
        "Has ADU",
        "Remodeled",
      ])
    )
    .optional(),
  property_features: z.array(z.enum(["Equestrian", "Pasture Land"])).optional(),
});

// PropertyContact schemas
export const addPropertyContactSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email format"),
  message: z.string().min(1, "Message is required"),
});

export const updatePropertyContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  message: z.string().optional(),
});

// Contact schemas
export const addContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.email("Invalid email format"),
  type: z.string().min(1),
  message: z.string().min(1),
});

export const updateContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

// Collection schemas
export const addCollectionSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
});

export const getCollectionsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

// RequestTour schemas
export const addRequestTourSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  mode: z.enum(["OFFLINE", "ONLINE"], { message: "Mode is required" }),
  date: z.coerce.date({ message: "Invalid date" }),
  timeframe: z.enum(["MORNING", "AFTERNOON", "EVENING", "ANYTIME"], {
    message: "Timeframe is required",
  }),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  message: z.string().min(1, "Message is required"),
});

export const getRequestToursSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const updateRequestTourSchema = z.object({
  mode: z.enum(["OFFLINE", "ONLINE"]).optional(),
  date: z.coerce.date({ message: "Invalid date" }).optional(),
  timeframe: z.enum(["MORNING", "AFTERNOON", "EVENING", "ANYTIME"]).optional(),
  name: z.string().optional(),
  email: z.email().optional(),
  message: z.string().optional(),
});

export const agentRegistration = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

export const addQuerySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email({ message: "Invalid email" }),
  phone: z.string().min(7, { message: "Invalid mobile number" }),
  message: z.string(),
  area: z.array(z.string()),
});
