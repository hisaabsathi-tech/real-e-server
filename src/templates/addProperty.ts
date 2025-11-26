import { getLogoBase64 } from "@/lib/logoBase64";

export const addPropertyTemplate = (
  link: string
) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Add Property Invitation</title>
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
            <h1 style="font-size:22px;font-weight:bold;color:#2c3e50;margin-bottom:20px">
              Add Your Property
            </h1>
            <p style="font-size:15px;line-height:24px;color:#555;margin-bottom:20px">
              We’re excited to have your property listed on our platform!  
              Please click the button below to add your property details and make it available for interested buyers or renters.
            </p>
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:30px auto">
              <tbody>
                <tr>
                  <td align="center" bgcolor="#2c3e50" style="border-radius:6px">
                    <a
                      href="${link}"
                      target="_blank"
                      style="display:inline-block;padding:12px 28px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;background-color:#2c3e50">
                      Add Property
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:13px;line-height:20px;color:#777;text-align:center;margin-top:20px">
              (This link is valid for the next 24 hours)
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;color:#888;font-size:12px;line-height:18px">
            You received this email because you requested to add a property.  
            If you did not make this request, please ignore this email.
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
