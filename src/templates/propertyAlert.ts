import { Area, Community, Developer, Property } from "@/generated/prisma";
import { getLogoBase64 } from "@/lib/logoBase64";

interface AlertEmailPropertyType extends Property, Community, Area, Developer {
  community: Community;
  area: Area;
  developer: Developer;
}

interface AlertEmailData {
  userName: string;
  properties: AlertEmailPropertyType[];
  alertCriteria: {
    areas?: string[];
    communities?: string[];
    propertyTypes?: string[];
    propertyStatus?: string[];
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    maxBeds?: number;
    minBaths?: number;
    maxBaths?: number;
    minSqft?: number;
    maxSqft?: number;
    features?: string[];
    developers?: string[];
  };
  unsubscribeUrl: string;
}

export const generatePropertyAlertEmail = (data: AlertEmailData): string => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatCriteria = () => {
    const criteria = [];
    if (data.alertCriteria.areas?.length) {
      criteria.push(`Areas: ${data.alertCriteria.areas.join(", ")}`);
    }
    if (data.alertCriteria.communities?.length) {
      criteria.push(
        `Communities: ${data.alertCriteria.communities.join(", ")}`
      );
    }
    if (data.alertCriteria.propertyTypes?.length) {
      criteria.push(
        `Property Types: ${data.alertCriteria.propertyTypes.join(", ")}`
      );
    }
    if (data.alertCriteria.minPrice || data.alertCriteria.maxPrice) {
      const priceRange = [
        data.alertCriteria.minPrice
          ? formatPrice(data.alertCriteria.minPrice)
          : "Any",
        data.alertCriteria.maxPrice
          ? formatPrice(data.alertCriteria.maxPrice)
          : "Any",
      ].join(" - ");
      criteria.push(`Price Range: ${priceRange}`);
    }
    if (data.alertCriteria.minBeds || data.alertCriteria.maxBeds) {
      const bedsRange = [
        data.alertCriteria.minBeds || "Any",
        data.alertCriteria.maxBeds || "Any",
      ].join(" - ");
      criteria.push(`Bedrooms: ${bedsRange}`);
    }
    return criteria.length ? criteria.join(" • ") : "All properties";
  };

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>New Properties Matching Your Alert</title>
  </head>
  <body style="background-color:#f9f9f9;color:#212121;font-family:Arial,Helvetica,sans-serif">
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="max-width:600px;padding:20px;margin:0 auto;background-color:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-radius:8px">
      <tbody>
        <tr>
          <td style="padding:20px;text-align:center;background-color:#2c3e50;border-radius:8px 8px 0 0">
            <img
              alt="Company Logo"
              height="70"
              src="${getLogoBase64()}"
              style="display:block;margin:0 auto;outline:none;border:none;text-decoration:none"
            />
          </td>
        </tr>
        <tr>
          <td style="padding:30px 40px">
            <h1 style="font-size:22px;font-weight:bold;color:#2c3e50;margin-bottom:20px;text-align:center">
              🏠 New Properties Found!
            </h1>
            <p style="font-size:15px;line-height:24px;color:#555;margin-bottom:20px;text-align:center">
              Hello ${data.userName || "there"}, we found ${
    data.properties.length
  } new ${
    data.properties.length === 1 ? "property" : "properties"
  } matching your search criteria.
            </p>
            
            <div style="background-color:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:30px;border-left:4px solid #2c3e50">
              <h3 style="color:#2c3e50;margin-bottom:10px;font-size:16px;font-weight:bold">Your Search Criteria:</h3>
              <p style="color:#555;font-size:14px;margin:0">${formatCriteria()}</p>
            </div>
            
            ${data.properties
              .map(
                (property) => `
                <div style="border:1px solid #eee;border-radius:8px;margin-bottom:25px;overflow:hidden">
                  ${
                    property.images && property.images.length > 0
                      ? `
                      <img src="${property.images[0]}" alt="${property.name}" style="width:100%;height:200px;object-fit:cover;display:block" />
                  `
                      : `
                      <div style="width:100%;height:200px;background-color:#f8f9fa;display:flex;align-items:center;justify-content:center;color:#6c757d;font-size:14px">
                          No Image Available
                      </div>
                  `
                  }
                  
                  <div style="padding:20px">
                    <h2 style="font-size:20px;font-weight:bold;color:#2c3e50;margin-bottom:10px">${
                      property.name
                    }</h2>
                    <p style="font-size:24px;font-weight:bold;color:#e74c3c;margin-bottom:15px">${formatPrice(
                      property.price
                    )}</p>
                    
                    <div style="margin-bottom:15px">
                      ${
                        property.beds
                          ? `<span style="background-color:#f8f9fa;padding:6px 12px;border-radius:20px;font-size:13px;color:#555;margin-right:10px;display:inline-block;margin-bottom:5px">🛏️ ${property.beds} Beds</span>`
                          : ""
                      }
                      ${
                        property.baths
                          ? `<span style="background-color:#f8f9fa;padding:6px 12px;border-radius:20px;font-size:13px;color:#555;margin-right:10px;display:inline-block;margin-bottom:5px">🚿 ${property.baths} Baths</span>`
                          : ""
                      }
                      ${
                        property.sqft
                          ? `<span style="background-color:#f8f9fa;padding:6px 12px;border-radius:20px;font-size:13px;color:#555;margin-right:10px;display:inline-block;margin-bottom:5px">📐 ${property.sqft} sqft</span>`
                          : ""
                      }
                      ${
                        property.type
                          ? `<span style="background-color:#f8f9fa;padding:6px 12px;border-radius:20px;font-size:13px;color:#555;margin-right:10px;display:inline-block;margin-bottom:5px">🏢 ${property.type}</span>`
                          : ""
                      }
                    </div>
                    
                    <p style="color:#777;font-size:14px;margin-bottom:15px">
                      📍 ${property.community.name}, ${property.area.name}
                      ${
                        property.developer
                          ? ` • By ${property.developer.name}`
                          : ""
                      }
                    </p>
                    
                    ${
                      property.description
                        ? `
                        <p style="color:#555;font-size:14px;line-height:20px;margin-bottom:15px">
                          ${
                            property.description.length > 150
                              ? property.description.substring(0, 150) + "..."
                              : property.description
                          }
                        </p>
                    `
                        : ""
                    }
                    
                    <div style="text-align:center;margin:20px 0">
                      <a href="${
                        process.env.CLIENT_URL || "https://your-website.com"
                      }/p/${
                  property.id
                }" style="background-color:#2c3e50;color:white;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:bold;text-decoration:none;display:inline-block">
                        View Property Details
                      </a>
                    </div>
                  </div>
                </div>
            `
              )
              .join("")}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;color:#888;font-size:12px;line-height:18px">
            This email was sent because you have an active property alert.<br/>
            If you no longer wish to receive these alerts, you can 
            <a href="${
              data.unsubscribeUrl
            }" style="color:#e74c3c;text-decoration:none">unsubscribe from this alert</a>.
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
  `;
};
