import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
    try {
        const resend = new Resend(process.env.RESEND_KEY);
        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@data.untraceable.dev",
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
        })

        if (error) {
          console.error("Email sending failed:", error)
          return { success: false, error: error.message }
        }

        // // Simulate email sending with console.log
        // console.log("📧 SIMULATED EMAIL SEND:");
        // console.log(
        //     "From:",
        //     process.env.EMAIL_FROM || "noreply@yourdomain.com",
        // );
        // console.log("To:", to);
        // console.log("Subject:", subject);
        // console.log("HTML Content:", html);
        // console.log("Text Content:", text || html.replace(/<[^>]*>/g, ""));

        // const mockMessageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // console.log("Mock Email ID:", mockMessageId);
        // console.log("✅ Email simulation completed");

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error("Email sending failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export function generateDSRNotificationEmail(
    dsrRequest: {
        requesterName: string;
        requesterEmail: string;
        requestType: string;
        details?: string;
    },
    companyName: string,
    dashboardUrl: string,
) {
    const subject = `New DSR Request - ${dsrRequest.requestType}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Data Subject Request</h2>
      <p>Hello,</p>
      <p>A new Data Subject Request has been submitted for <strong>${companyName}</strong>.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Request Details:</h3>
        <p><strong>Requester:</strong> ${dsrRequest.requesterName} (${dsrRequest.requesterEmail})</p>
        <p><strong>Request Type:</strong> ${dsrRequest.requestType}</p>
        ${dsrRequest.details ? `<p><strong>Details:</strong> ${dsrRequest.details}</p>` : ""}
      </div>
      
      <p>Please log in to your dashboard to review and process this request:</p>
      <a href="${dashboardUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        This is an automated notification. Please do not reply to this email.
      </p>
    </div>
  `;

    return { subject, html };
}


export function generateDSRConfirmationEmail(
    dsrRequest: {
        requesterName: string;
        requesterEmail: string;
        requestType: string;
        details?: string;
    },
    companyName: string,
) {
    const subject = `DSR Request Confirmation - ${dsrRequest.requestType}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your Data Subject Request</h2>
      <p>Dear ${dsrRequest.requesterName},</p>
      <p>Thank you for submitting your Data Subject Request to <strong>${companyName}</strong>.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Request Details:</h3>
        <p><strong>Requester:</strong> ${dsrRequest.requesterName} (${dsrRequest.requesterEmail})</p>
        <p><strong>Request Type:</strong> ${dsrRequest.requestType}</p>
        ${dsrRequest.details ? `<p><strong>Details:</strong> ${dsrRequest.details}</p>` : ""}
      </div>
      
      <p>Your request has been received and will be processed according to applicable privacy regulations.</p>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        This is an automated confirmation. If you have any questions, please contact ${companyName} support.
      </p>
    </div>
  `;

    return { subject, html };
}