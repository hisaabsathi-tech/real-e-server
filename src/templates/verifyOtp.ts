import { getLogoBase64 } from "@/lib/logoBase64";

export const verifyOtpTemplate = (
  otp: string
) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Your OTP Code</title>
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
              Your One-Time Password (OTP)
            </h1>
            <p style="font-size:15px;line-height:24px;color:#555;margin-bottom:20px;text-align:center">
              Use the OTP below to complete your verification.  
              Do not share this code with anyone.
            </p>
            <div style="text-align:center;margin:30px 0">
              <p style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#e74c3c;margin:0">
                ${otp}
              </p>
            </div>
            <p style="font-size:13px;line-height:20px;color:#777;text-align:center;margin-top:20px">
              This code will expire in 10 minutes.  
              If you didn’t request this, please ignore the email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;color:#888;font-size:12px;line-height:18px">
            For your security, never share this OTP with anyone.  
            Our team will never ask for it.
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;
