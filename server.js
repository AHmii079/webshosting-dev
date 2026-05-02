const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const port = Number(process.env.PORT || 3000);
const mailTo = process.env.MAIL_TO || 'info@hostingwebservers.com';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

function createTransport() {
  const hasSmtpHost = Boolean(process.env.SMTP_HOST);

  if (hasSmtpHost) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
  });
}

app.post('/api/contact', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  const subject = String(req.body.subject || '').trim();
  const message = String(req.body.message || '').trim();

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: 'All fields are required.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
  }

  const cleanName = name.replace(/[\r\n]+/g, ' ');
  const cleanEmail = email.replace(/[\r\n]+/g, ' ');
  const cleanSubject = subject.replace(/[\r\n]+/g, ' ');

  const transport = createTransport();
  const emailSubject = `[HostingWebservers.com] ${cleanSubject}`;
  const emailBody = [
    'New contact form submission:',
    '',
    `Name: ${cleanName}`,
    `Email: ${cleanEmail}`,
    `Subject: ${cleanSubject}`,
    '',
    'Message:',
    message,
  ].join('\n');

  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM || 'HostingWebservers.com <no-reply@hostingwebservers.com>',
      to: mailTo,
      replyTo: `${cleanName} <${cleanEmail}>`,
      subject: emailSubject,
      text: emailBody,
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to send contact form email:', error);
    return res.status(500).json({ ok: false, error: 'The message could not be sent.' });
  }
});

app.listen(port, () => {
  console.log(`HostingWebservers site server listening on http://localhost:${port}`);
});
