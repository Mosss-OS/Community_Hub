
// server/routes/auth.ts
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { config } from '../config';
import { sendVerificationEmail } from '../services/email';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  houseFellowship: z.string().optional(),
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    logger.info('Signup request received', { email: req.body.email });
    
    // Validate request body
    const { email, password, firstName, lastName, phone, address, houseFellowship } = signupSchema.parse(req.body);
    
    logger.debug('Signup form validated', { email, firstName });
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      logger.warn('Signup failed - user already exists', { email });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    logger.debug('Hashing password');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    logger.debug('Creating user in database', { email, firstName, lastName });
    const user = await storage.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      address,
      houseFellowship
    });
    
    logger.info('User created successfully', { userId: user.id, email });
    
    // Generate verification token
    const verificationToken = uuidv4();
    logger.debug('Generated verification token', { userId: user.id });
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await storage.updateUser(user.id, {
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    // Send verification email
    try {
      logger.debug('Sending verification email', { email });
      await sendVerificationEmail(user.email, verificationToken);
      logger.info('Verification email sent', { email });
    } catch (error) {
      logger.error('Failed to send verification email', { 
        error, 
        userId: user.id,
        email 
      });
      // Don't fail the request if email sending fails
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: false,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.warn('Signup validation error', { 
        errors: err.errors,
        input: req.body 
      });
      return res.status(400).json({ 
        message: 'Validation error',
        errors: err.errors 
      });
    }
    
    logger.error('Signup error', { 
      error: err,
      body: req.body,
      stack: err instanceof Error ? err.stack : undefined
    });
    
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (err as Error).message : undefined
    });
  }
});

// Verify Email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Update user as verified
    await storage.updateUser(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    // Redirect to login page or show success message
    res.redirect(`${config.appUrl}/login?verified=true`);
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await storage.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In production, require email verification before login.
    // In development, allow login without verification to simplify local testing.
    if (process.env.NODE_ENV === 'production' && !user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      houseFellowship: user.houseFellowship,
      parish: user.parish,
      role: user.role,
      isVerified: user.isVerified,
      isAdmin: user.email === 'admin@wccrm.com'
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
router.get('/user', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      houseFellowship: user.houseFellowship,
      parish: user.parish,
      role: user.role,
      isVerified: user.isVerified,
      isAdmin: user.email === 'admin@wccrm.com'
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { firstName, lastName, phone, address, houseFellowship, parish } = req.body;

    const updatedUser = await storage.updateUser(user.id, {
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      phone: phone ?? user.phone,
      address: address ?? user.address,
      houseFellowship: houseFellowship ?? user.houseFellowship,
      parish: parish ?? user.parish,
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      address: updatedUser.address,
      houseFellowship: updatedUser.houseFellowship,
      parish: updatedUser.parish,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      isAdmin: updatedUser.email === 'admin@wccrm.com'
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

const api = router;
export { api };


























// import { sql } from "drizzle-orm";
// import { index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// // Session storage table.
// // (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
// export const sessions = pgTable(
//   "sessions",
//   {
//     sid: varchar("sid").primaryKey(),
//     sess: jsonb("sess").notNull(),
//     expire: timestamp("expire").notNull(),
//   },
//   (table) => [index("IDX_session_expire").on(table.expire)]
// );

// // User storage table.
// // (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
// export const users = pgTable("users", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   email: varchar("email").unique(),
//   passwordHash: varchar("password_hash"),
//   firstName: varchar("first_name"),
//   lastName: varchar("last_name"),
//   profileImageUrl: varchar("profile_image_url"),
//   isVerified: boolean("is_verified").default(false),
//   verificationToken: varchar("verification_token"),
//   verificationTokenExpires: timestamp("verification_token_expires"),
//   resetPasswordToken: varchar("reset_password_token"),
//   resetPasswordExpires: timestamp("reset_password_expires"),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export type UpsertUser = typeof users.$inferInsert;
// export type User = typeof users.$inferSelect;
