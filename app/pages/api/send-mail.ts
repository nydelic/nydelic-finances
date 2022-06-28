import { NextApiRequest, NextApiResponse } from "next";
import Nodemailer from "nodemailer";
import {
  HttpRequestError,
  httpResponse,
  httpErrorResponse,
} from "@nydelic/toolbox";
import throwIfUndefind from "utils/throwIfUndefind";

const GOOGLE_SMTP_AUTH_USER = throwIfUndefind(
  process.env.GOOGLE_SMTP_AUTH_USER
);
const GOOGLE_SMTP_AUTH_ACCESS_TOKEN = throwIfUndefind(
  process.env.GOOGLE_SMTP_AUTH_ACCESS_TOKEN
);
const GOOGLE_SMTP_AUTH_REFRESH_TOKEN = throwIfUndefind(
  process.env.GOOGLE_SMTP_AUTH_REFRESH_TOKEN
);
const GOOGLE_SMTP_AUTH_CLIENT_ID = throwIfUndefind(
  process.env.GOOGLE_SMTP_AUTH_CLIENT_ID
);
const GOOGLE_SMTP_AUTH_CLIENT_SECRET = throwIfUndefind(
  process.env.GOOGLE_SMTP_AUTH_CLIENT_SECRET
);

const GOOGLE_SMTP_MAIL_ALIAS = throwIfUndefind(
  process.env.GOOGLE_SMTP_MAIL_ALIAS
);

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const sendMail = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!req.body.email) {
      throw new HttpRequestError(
        "ESEND_INVALID_EMAIL",
        400,
        "No valid email provided."
      );
    }
    if (!req.body.name) {
      throw new HttpRequestError(
        "ESEND_INVALID_NAME",
        400,
        "No valid name provided."
      );
    }
    if (!req.body.message) {
      throw new HttpRequestError(
        "ESEND_INVALID_MESSAGE",
        400,
        "No valid message provided."
      );
    }
    const message = escapeHtml(req.body.message);

    // create reusable transporter object using the default SMTP transport
    const transporter = Nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: GOOGLE_SMTP_AUTH_USER,
        accessToken: GOOGLE_SMTP_AUTH_ACCESS_TOKEN,
        refreshToken: GOOGLE_SMTP_AUTH_REFRESH_TOKEN,
        clientId: GOOGLE_SMTP_AUTH_CLIENT_ID,
        clientSecret: GOOGLE_SMTP_AUTH_CLIENT_SECRET,
      },
    });
    if (req.body.context === "outgoing-invoice") {
      // outgoing-invoice
      await transporter.sendMail({
        replyTo: `<${GOOGLE_SMTP_MAIL_ALIAS}>`,
        from: `"Nydelic Invoices 💰" <${GOOGLE_SMTP_MAIL_ALIAS}>`,
        to: req.body.email,
        subject: req.body.subject,
        text: req.body.message.replace(/<[^>]*>?/gm, ""),
        html: req.body.message,
      });
    } else {
      // invoices form
      await transporter.sendMail({
        from: `"${req.body.name} 👋🏻" <${GOOGLE_SMTP_MAIL_ALIAS}>`,
        to: GOOGLE_SMTP_MAIL_ALIAS,
        subject: `Nydelic Invoices - ${req.body.subject || "No subject"}`,
        text: message,
        html: `
        <div><i>From: ${req.body.name} - ${req.body.email}</i></div>
        <div><i>Subject: ${req.body.subject || "No subject"}</i></div>
        <h3>Message:</h3>
        <div>${message}</div>`,
      });
      await transporter.sendMail({
        from: `"Nydelic 👋🏻" <${GOOGLE_SMTP_MAIL_ALIAS}>`,
        to: req.body.email,
        subject: `Message received: - ${req.body.subject || "No subject"}`,
        text: `Dear ${req.body.name}
    
        We have reiceved your message.
        If there is anything you want to add to it, please reply to this email.
    
        We have received following message:
        ${message}`,
        html: `
        <div><i>this is an automated email</i></div>
        <br>
        <div>Dear ${req.body.name}<br>
        <br>
        We have reiceved your message.<br>
        If there is anything you want to add to it, please reply to this email.<br>
        <br>
        We have received following message:<br>
        </div>
        <h3>Message:</h3>
        <div>${message}</div>`,
      });
    }

    return httpResponse(res, 200, "Sssssht, email sent ;)");
  } catch (error) {
    return httpErrorResponse(res, error);
  }
};

export default sendMail;
