// Shared email utility for all edge functions
// Consolidates email sending logic across: send-email, send-forum-notification, 
// send-support-email, send-donor-invitations, send-announcement-email, etc.

import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Standard sender addresses
export const SENDER = {
  support: "Axanar Support <axanartech@gmail.com>",
  noreply: "Axanar <noreply@axanardonors.com>",
  announcements: "Axanar Announcements <announcements@axanardonors.com>",
} as const;

// CC addresses for admin tracking
export const CC_ADDRESSES = {
  support: "axanartech@gmail.com",
} as const;

// Base URL for links
export const BASE_URL = "https://axanardonors.com";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const { to, subject, html, from = SENDER.support, cc, replyTo } = options;

    console.log(`[Email] Sending to: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`[Email] Subject: ${subject}`);

    const response = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      reply_to: replyTo,
    });

    console.log(`[Email] Sent successfully: ${response.id}`);

    return {
      success: true,
      id: response.id,
    };
  } catch (error: any) {
    console.error(`[Email] Failed to send:`, error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Send a forum notification email when admin replies
 */
export async function sendForumNotification(params: {
  recipientEmail: string;
  recipientUsername: string;
  adminUsername: string;
  threadTitle: string;
  threadId: string;
  commentContent: string;
}): Promise<EmailResult> {
  const { recipientEmail, recipientUsername, adminUsername, threadTitle, threadId, commentContent } = params;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Reply from ${adminUsername}</h2>
      <p>Hi ${recipientUsername},</p>
      <p><strong>${adminUsername}</strong> replied to the thread "<strong>${threadTitle}</strong>":</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        ${commentContent}
      </div>
      <p>
        <a href="${BASE_URL}/forum/thread/${threadId}" 
           style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Thread
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        You received this because you are participating in this forum thread.
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `[Axanar Forum] ${adminUsername} replied to "${threadTitle}"`,
    html,
    cc: CC_ADDRESSES.support,
  });
}

/**
 * Send a support ticket notification email
 */
export async function sendSupportNotification(params: {
  recipientEmail: string;
  recipientUsername: string;
  adminUsername: string;
  messageContent: string;
  threadId?: string;
}): Promise<EmailResult> {
  const { recipientEmail, recipientUsername, adminUsername, messageContent, threadId } = params;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Support Response from ${adminUsername}</h2>
      <p>Hi ${recipientUsername},</p>
      <p>You have received a response to your support request:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        ${messageContent}
      </div>
      <p>
        <a href="${BASE_URL}/direct-messages${threadId ? `?thread=${threadId}` : ''}" 
           style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Message
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        If you have additional questions, please reply to this message or contact us at axanartech@gmail.com
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `[Axanar Support] Response from ${adminUsername}`,
    html,
    cc: CC_ADDRESSES.support,
    replyTo: CC_ADDRESSES.support,
  });
}

/**
 * Send a donor account invitation email
 */
export async function sendDonorInvitation(params: {
  recipientEmail: string;
  recipientName: string;
  inviteToken?: string;
  totalPledged?: number;
}): Promise<EmailResult> {
  const { recipientEmail, recipientName, inviteToken, totalPledged } = params;

  const activationUrl = inviteToken 
    ? `${BASE_URL}/auth?token=${inviteToken}&email=${encodeURIComponent(recipientEmail)}`
    : `${BASE_URL}/auth?email=${encodeURIComponent(recipientEmail)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Activate Your Axanar Donor Account</h2>
      <p>Hi ${recipientName || 'there'},</p>
      <p>We've upgraded the Axanar donor portal, and your contribution history is waiting for you!</p>
      ${totalPledged ? `<p>Your total contributions: <strong>$${totalPledged.toLocaleString()}</strong></p>` : ''}
      <p>Click below to create your account and access:</p>
      <ul>
        <li>Your complete pledge history</li>
        <li>Reward fulfillment status</li>
        <li>Ambassadorial titles and XP</li>
        <li>Community forums</li>
      </ul>
      <p>
        <a href="${activationUrl}" 
           style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Activate Your Account
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        Questions? Contact us at axanartech@gmail.com
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: "Activate Your Axanar Donor Account",
    html,
    from: SENDER.noreply,
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordReset(params: {
  recipientEmail: string;
  resetToken: string;
}): Promise<EmailResult> {
  const { recipientEmail, resetToken } = params;

  const resetUrl = `${BASE_URL}/auth/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p>
        <a href="${resetUrl}" 
           style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </p>
      <p style="color: #666;">This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        For security, this request was received from your account. If you did not make this request, please contact support.
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: "Reset Your Axanar Password",
    html,
    from: SENDER.noreply,
  });
}

/**
 * Send an announcement email
 */
export async function sendAnnouncement(params: {
  recipientEmails: string[];
  subject: string;
  content: string;
  senderName?: string;
}): Promise<{ sent: number; failed: number; errors: string[] }> {
  const { recipientEmails, subject, content, senderName = "Axanar Team" } = params;

  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 20px;">
        ${content}
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        You received this announcement because you are a registered Axanar donor.
        <br>Visit <a href="${BASE_URL}">${BASE_URL}</a> to manage your preferences.
      </p>
    </div>
  `;

  // Send in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < recipientEmails.length; i += batchSize) {
    const batch = recipientEmails.slice(i, i + batchSize);
    
    for (const email of batch) {
      const result = await sendEmail({
        to: email,
        subject: `[Axanar] ${subject}`,
        html,
        from: SENDER.announcements,
      });

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`${email}: ${result.error}`);
      }
    }

    // Small delay between batches
    if (i + batchSize < recipientEmails.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`[Email] Announcement sent: ${results.sent} succeeded, ${results.failed} failed`);
  return results;
}
