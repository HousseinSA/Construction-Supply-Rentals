import { getTransporter, MAIL_FROM } from "../config"
import type { EmailButton, EmailAlert } from "../types"

export const createEmailTemplate = (content: string, button?: EmailButton) => `
  <!DOCTYPE html>
  <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 10px; font-family: Arial, sans-serif; background: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #f97316; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">KRILIY ENGIN</h1>
        </div>
        <div style="padding: 20px;">
          ${content}
          ${button ? `<div style="text-align: center; margin-top: 30px;"><a href="${button.url}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; word-break: break-word;">${button.text}</a></div>` : ""}
        </div>
      </div>
    </body>
  </html>`

export const createHeader = (title: string, refNumber: string, date?: string) => `
  <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #111;">${title}</h2>
  <p style="margin: 0 0 8px 0; color: #f97316; font-size: 14px; font-weight: 600;">Référence: #${refNumber}</p>
  ${date ? `<p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">${date}</p>` : ""}`

export const createAlert = (alert: EmailAlert) => {
  const colors = {
    red: { bg: "#fef2f2", border: "#ef4444", text: "#991b1b" },
    yellow: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    blue: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" }
  }
  const c = colors[alert.color]
  return `<div style="background: ${c.bg}; border-left: 4px solid ${c.border}; padding: 12px 16px; margin: 24px 0;"><p style="margin: 0; font-size: 14px; color: ${c.text}; font-weight: 600;">${alert.message}</p></div>`
}

export const createPriceBadge = (price: number, label: string = "Total") => `
  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 18px; font-weight: 700; color: #92400e;">${label}: ${price.toLocaleString()} MRU</p>
  </div>`

export const createStatusBadge = (status: string) => {
  const statusText = status === "pending" ? "En attente" : "Payée"
  const statusColor = status === "pending" ? "#f59e0b" : "#22c55e"
  return `<p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Statut: <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span></p>`
}

export const sendEmail = async (to: string, subject: string, content: string, button?: EmailButton) =>
  getTransporter().sendMail({
    from: MAIL_FROM,
    to,
    subject,
    html: createEmailTemplate(content, button),
  })