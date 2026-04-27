import nodemailer from 'nodemailer';
import env from '../../../config/env.service.js';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: false,
      auth: env.smtpUser && env.smtpPass ? { user: env.smtpUser, pass: env.smtpPass } : undefined
    });
  }

  return transporter;
};

export default async ({ to, subject, html, text }) => {
  if (!env.smtpHost) return;

  await getTransporter().sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html
  });
};
