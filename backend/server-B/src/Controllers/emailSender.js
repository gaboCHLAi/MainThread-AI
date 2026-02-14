// src/Controllers/email.js
import * as Brevo from "@getbrevo/brevo";

export const sendEmail = async ({ to, subject, html }) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY,
  );

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: "MainThreadAi",
    email: process.env.EMAIL_USER,
  };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("📧 Email sent successfully to:", to);
    return data;
  } catch (error) {
    console.error(
      "❌ Brevo API Error:",
      error.response ? error.response.body : error,
    );
    throw error;
  }
};
