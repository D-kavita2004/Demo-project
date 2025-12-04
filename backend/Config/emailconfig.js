import nodemailer from "nodemailer";
import logger from "./logger.js";
import dotenv from "dotenv";

dotenv.config();

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.PASSWORD_APP_EMAIL,
  },
});

transporter.verify((error) => {
  if (error) logger.error("Email config error:", error);
  else logger.info("Email server ready");
});

export const forgetPasswordEmailConfig = async (email, token) => {
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: email,
    subject: "Reset password link",
    html: `
      <h1>RESET PASSWORD LINK</h1>
      <p>Please click the link below to reset your password</p>
      <p><a href="${process.env.FRONTEND_URL}/reset-password/${token}">Click Here to Change Password</a></p>
      <p>The link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    logger.error("Reset Email Error:", err);
    return false;
  }
};

export const shareCredentialEmailConfig = async (username, email, password) => {
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to: email,
    subject: "Your Login Credentials",
    html: `
      <h2>Welcome to Our Platform!</h2>

      <p>Your account has been created successfully. Below are your login credentials:</p>

      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${password}</p>

      <p>You can log in using the link below:</p>
      <p><a href="${process.env.FRONTEND_URL}/login">Click Here to Login</a></p>

      <br/>

      <p><strong>Important:</strong> For security reasons, please change your password after logging in for the first time.</p>
      <p>If you did not request this account, please contact support immediately.</p>
      <br/>
      <p>Thank you,<br/>Team Support</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error("Email Error:", error);
    return false;
  }
};

