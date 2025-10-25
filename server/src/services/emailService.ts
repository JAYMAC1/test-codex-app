import { Resend } from "resend";
import { env } from "../config/env.js";

const resendClient = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resendClient) {
    console.log("📧 Email (dev log only):", { to, subject, html });
    return;
  }

  await resendClient.emails.send({
    from: env.emailFrom,
    to,
    subject,
    html,
  });
}
