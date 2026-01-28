const nodemailer = require("nodemailer")

export const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

export const transporter = getTransporter()

export const FROM_NAME = process.env.EMAIL_FROM_NAME || "Kriliy Engin"
export const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.ADMIN_EMAIL || process.env.EMAIL_USER
export const MAIL_FROM = `${FROM_NAME} <${FROM_ADDRESS}>`
export const DASHBOARD_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"