const nodemailer = require('nodemailer');

// Transporter is created once and reused. Credentials come from env.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendEmail({ to, subject, html, text }) {
  if (!to || !subject || (!html && !text)) throw new Error('Missing email fields');

  const fromName = process.env.EMAIL_FROM_NAME || 'Auto Service';
  const fromAddr = process.env.EMAIL_FROM || process.env.GMAIL_USER;

  const info = await transporter.sendMail({
    from: `${fromName} <${fromAddr}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = { sendEmail, transporter };