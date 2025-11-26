import { readFileSync } from "fs";
import { join } from "path";

// Convert SVG logo to base64 for email embedding
export const getLogoBase64 = (): string => {
  try {
    const logoPath = join(__dirname, "..", "static", "logo.svg");
    const logoSvg = readFileSync(logoPath, "utf8");
    const base64Logo = Buffer.from(logoSvg).toString("base64");
    return `data:image/svg+xml;base64,${base64Logo}`;
  } catch (error) {
    console.error("Error reading logo file:", error);
    // Return a fallback or empty string if logo cannot be read
    return "";
  }
};
