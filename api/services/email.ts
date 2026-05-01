import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

// Create a test account if in development
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      logger.debug('Creating test email account with Ethereal');
      const testAccount = await nodemailer.createTestAccount();
      logger.debug('Ethereal test account created', { 
        user: testAccount.user,
        pass: testAccount.pass 
      });
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      logger.error('Failed to create test email account', { error });
      throw error;
    }
  }
  
  // Production - use configured email service
  logger.debug('Creating production email transport', { 
    service: config.email.service,
    user: config.email.user
  });
  return nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.pass, // Using 'pass' to match config.ts
    },
  });
};

// Create and verify transporter
const transporterPromise = (async () => {
  try {
    const transporter = await createTransporter();
    await new Promise<void>((resolve, reject) => {
      transporter.verify((error) => {
        if (error) {
          logger.error('Error verifying email configuration', { error });
          reject(error);
        } else {
          logger.info('Email server is ready to take our messages');
          resolve();
        }
      });
    });
    return transporter;
  } catch (error) {
    logger.error('Failed to initialize email transporter', { error });
    throw error;
  }
})();

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const verificationUrl = `${config.appUrl}/verify-email?token=${token}`;
    const transporter = await transporterPromise;
    
    const mailOptions = {
      from: `"WCCRM Lagos" <${config.email.from || config.email.user}>`,
      to: email,
      subject: 'Verify Your Email',
      html: `
      <h2>Welcome to WCCRM Lagos!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #3b82f6; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `,
    };

    logger.debug('Sending verification email', { to: email });
    const info = await transporter.sendMail(mailOptions);
    logger.info('Verification email sent', { 
      messageId: info.messageId,
      to: email 
    });
    
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.debug('Ethereal email preview', { previewUrl });
    }
    
    return info;
  } catch (error) {
    logger.error('Error sending verification email', { 
      error,
      to: email 
    });
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const resetUrl = `${config.appUrl}/reset-password?token=${token}`;
    const transporter = await transporterPromise;
    
    const mailOptions = {
      from: `"WCCRM Lagos" <${config.email.from || config.email.user}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #3b82f6; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};
