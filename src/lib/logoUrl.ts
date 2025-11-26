import { config } from "@/config/config";

// Get logo URL for email templates
export const getLogoUrl = (): string => {
  // Use absolute URL for the logo served via static file serving
  return `${config.url}/static/logo.svg`;
};

// Alternative fallback to a hosted logo URL
export const getLogoUrlFallback = (): string => {
  // If you have a logo hosted on a CDN or public server, use that URL
  // For example: return "https://yourdomain.com/assets/logo.svg";
  
  // For now, fallback to the base URL static serving
  return getLogoUrl();
};
