"use server"

import nodemailer from "nodemailer"

// Fallback configuration if environment variables are not provided
const FALLBACK_SMTP = {
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true" || false,
  auth: {
    user: process.env.SMTP_USER || "hqiahbmvseooiid5@ethereal.email",
    pass: process.env.SMTP_PASS || "qbF26WRSr9bwhn3uNg",
  },
}

const transporter = nodemailer.createTransport(FALLBACK_SMTP)

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
}) {
  try {
    const from = process.env.SMTP_FROM || '"Manavizha" <noreply@manavizha.com>'
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    })

    console.log("Message sent: %s", info.messageId)
    
    // If using Ethereal, log the preview URL
    if (FALLBACK_SMTP.host === "smtp.ethereal.email") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
    }

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
  }
}
