import { sendEmail } from "@/lib/sendEmail";
import { addPropertyTemplate } from "@/templates/addProperty";

export const sendAddPropertyMail = async (to: string, link: string) => {
  const subject = "Add Property Request";

  const html = addPropertyTemplate(link);

  await sendEmail(to, subject, html);
};
