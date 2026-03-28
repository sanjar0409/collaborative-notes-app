const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendResetEmail(to, resetUrl) {
  const mailOptions = {
    from: `"CollabNotes" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your password — CollabNotes',
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #faf8f5; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 40px; height: 40px; background: #1a6b5a; border-radius: 10px; line-height: 40px; color: #fff; font-size: 20px; font-weight: bold;">N</div>
          <h1 style="color: #2d2a26; font-size: 22px; margin: 12px 0 4px;">Reset your password</h1>
          <p style="color: #78716c; font-size: 14px; margin: 0;">We received a request to reset your password.</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #1a6b5a; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #78716c; font-size: 13px; text-align: center; margin-top: 24px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
