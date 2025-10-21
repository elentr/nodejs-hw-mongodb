import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async options => {
  try {
    const info = await transporter.sendMail(options);
    console.log('Email sent successfully:', info.response);
    return await transporter.sendMail(options);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};
