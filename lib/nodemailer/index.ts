import nodemailer from "nodemailer";
import { WELCOME_EMAIL_TEMPLATE } from "./templates";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export async function sendWelcomeEmail({
  email,
  name,
  intro,
}: WelcomeEmailData) {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro,
  );

  const mailOptions = {
    from: '"PepTickr Team" <no-reply@peptickr.app>',
    to: email,
    subject: "Welcome to PepTickr — Your stock market toolkit is ready!",
    text: "Thanks for joining PepTickr.",
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send welcome email via nodemailer:", error);
  }
}
