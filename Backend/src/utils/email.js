import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export const sendAccountabilityEmail = async (to, shareToken, userName) => {
  try {
    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accountability/${shareToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `${userName} shared their goals with you for accountability`,
      html: `
        <h2>Accountability Share</h2>
        <p>${userName} has shared their goals with you for accountability.</p>
        <p>Click the link below to view their progress:</p>
        <a href="${shareLink}">View Goals</a>
        <p>This link will expire in 7 days.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Accountability email sent successfully');
  } catch (error) {
    console.error('Error sending accountability email:', error);
    throw new Error('Failed to send accountability email');
  }
};
