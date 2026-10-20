/**
 * Pluggable Transactional Email Service
 * Supports development logging mode and production email gateways (Resend, SendGrid, SMTP)
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailService {
  sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string }>;
}

export class DevelopmentEmailService implements EmailService {
  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string }> {
    const messageId = `dev-email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    console.log("📨 [Transactional Email Sent]");
    console.log(`To: ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`Body: ${message.text}`);
    return { success: true, messageId };
  }
}

export class ProductionRestEmailService implements EmailService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string }> {
    // If RESEND_API_KEY is configured
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "notifications@opportunity.ai",
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html || `<p>${message.text}</p>`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, messageId: data.id };
      }
      return { success: false };
    } catch (e) {
      console.error("Failed to dispatch production email:", e);
      return { success: false };
    }
  }
}

export function getEmailService(): EmailService {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    return new ProductionRestEmailService(apiKey);
  }
  return new DevelopmentEmailService();
}
