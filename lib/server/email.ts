import nodemailer, { type Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
    if (transporter) return transporter
    const host = process.env.SMTP_HOST
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    if (!host || !user || !pass) return null

    const port = Number(process.env.SMTP_PORT) || 587
    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // implicit TLS on 465, STARTTLS otherwise
        auth: { user, pass },
    })
    return transporter
}

export function isEmailConfigured(): boolean {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

/** Sends an email. Never throws — a mail failure must not break the triggering action. */
export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
    const t = getTransporter()
    if (!t) {
        console.warn('[email] SMTP not configured (SMTP_HOST/USER/PASS) — skipping send')
        return
    }
    const from = process.env.SMTP_FROM || process.env.SMTP_USER
    try {
        await t.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html })
    } catch (err) {
        console.error('[email] send failed:', err)
    }
}

const APP_NAME = 'Manavizha'
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manavizha.com'

/** Wraps body content in a simple branded, email-client-safe layout. */
export function renderEmail(opts: {
    heading: string
    body: string
    ctaText?: string
    ctaUrl?: string
}): string {
    const cta =
        opts.ctaText && opts.ctaUrl
            ? `<tr><td style="padding:8px 0 4px;">
                 <a href="${opts.ctaUrl}" style="display:inline-block;background:#e87898;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">${opts.ctaText}</a>
               </td></tr>`
            : ''

    return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #f0ebe3;border-radius:18px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#fce8ef,#fdf6e3);padding:20px 28px;">
            <span style="font-size:18px;font-weight:700;color:#1F4068;">${APP_NAME}</span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:18px;color:#1F4068;">${opts.heading}</h1>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4b5563;">${opts.body}</p>
            <table role="presentation" cellpadding="0" cellspacing="0">${cta}</table>
          </td></tr>
          <tr><td style="padding:18px 28px;border-top:1px solid #f0ebe3;">
            <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.5;">
              You're receiving this because you enabled email alerts on ${APP_NAME}.
              Manage your preferences in <a href="${APP_URL}/dashboard/settings" style="color:#e87898;">Settings → Alerts</a>.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}
