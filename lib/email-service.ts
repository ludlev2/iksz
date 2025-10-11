import { Resend } from 'resend';

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string | string[];
};

type SendEmailResult =
  | { success: true }
  | { success: false; error: string; status?: number };

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.APPLICATION_EMAIL_FROM;

const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });

export const formatTextAsHtml = (text: string) => {
  const lines = text.split(/\r?\n/);
  return lines
    .map((line) => {
      if (!line.trim()) {
        return '<br />';
      }
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join('\n');
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: SendEmailArgs): Promise<SendEmailResult> {
  if (!resendClient || !fromEmail) {
    return {
      success: false,
      error:
        'Az email szolgáltatás nincs konfigurálva. Add meg a RESEND_API_KEY és APPLICATION_EMAIL_FROM változókat.',
      status: 503,
    };
  }

  try {
    const response = await resendClient.emails.send({
      from: fromEmail,
      to,
      subject,
      text,
      html: html ?? formatTextAsHtml(text),
      reply_to: replyTo,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message ?? 'Ismeretlen hiba történt az email küldésekor.',
        status: response.error.statusCode,
      };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Ismeretlen hiba történt az email küldésekor.';

    return {
      success: false,
      error: message,
    };
  }
}
