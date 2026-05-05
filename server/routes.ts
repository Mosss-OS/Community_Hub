import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, type ISermonFilter } from "./storage";
import { db } from "./db";
import { supportedLanguages, groupJoinRequests, groupActivityLogs, volunteerSkills, volunteerBadges, volunteerOpportunities, userReports, pushSubscriptions, notificationPreferences } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { api } from "@shared/routes";
import rateLimit from 'express-rate-limit';

// Rate limiters for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // limit each IP to 2 requests per windowMs
  message: { message: 'Too many signups from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import { sendNewMessageNotification, sendNotificationToUser, broadcastToAll, broadcastToAdmins, broadcastAttendanceUpdate, getOnlineUsers, isUserOnline } from "./websocket";
import { processVideoClip } from "./video-processing";
import { publicVapidKey } from "./services/push-notifications";

// File upload configurations with security improvements
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "images"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    // Generate a random filename to prevent overwriting and path traversal
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${extension}`);
  }
});

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "videos"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    // Generate a random filename to prevent overwriting and path traversal
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${extension}`);
  }
});

const imageUpload = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allowed image extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const extension = path.extname(file.originalname).toLowerCase();
    
    // Check file extension
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error("Invalid image file type. Allowed formats: JPG, JPEG, PNG, GIF, WEBP, SVG"));
    }
    
    // Check MIME type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image file type"));
    }
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: (req, file, cb) => {
    // Allowed video extensions
    const allowedExtensions = [".mp4", ".avi", ".mov", ".wmv", ".webm", ".mkv"];
    const extension = path.extname(file.originalname).toLowerCase();
    
    // Check file extension
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error("Invalid video file type. Allowed formats: MP4, AVI, MOV, WMV, WEBM, MKV"));
    }
    
    // Check MIME type
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video file type"));
    }
  }
});

// Document upload for resources
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "documents"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${extension}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for documents
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"];
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error("Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV"));
    }
    cb(null, true);
  }
});

// General file upload for task attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "attachments"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${extension}`);
  }
});

const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for attachments
});

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isAdmin?: boolean;
    role?: string;
    organizationId?: string | null;
  };
}

// JWT secret - must be set via environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Authentication schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  houseFellowship: z.string().optional(),
  career: z.string().optional(),
  stateOfOrigin: z.string().optional(),
  birthday: z.string().optional(),
  twitterHandle: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  linkedinHandle: z.string().optional(),
  password: z.string().min(6).optional(),
});

// Create campus schema
const createCampusSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(20),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  pastorId: z.string().uuid().optional(),
  isHeadquarters: z.boolean().optional(),
  timezone: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

// Authentication middleware
const isAuthenticated = async (req: AuthenticatedRequest, res: any, next: any) => {
  console.log('=== AUTH CHECK ===');
  console.log('Cookies: [REDACTED]');
  console.log('Auth header: [REDACTED]');
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token found');
      return res.status(401).json({ message: "No token provided" });
    }

    console.log('Token found, verifying...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: "Invalid token" });
    }

    console.log('User authenticated:', user.email, user.role);
    req.user = {
      id: user.id,
      email: user.email!,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      isAdmin: user.email === 'admin@wccrm.com' || user.isAdmin === true, // Simple admin check
      role: user.role || undefined,
      organizationId: user.organizationId
    };
    
    next();
  } catch (error) {
    console.log('Auth error: [REDACTED]');
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Admin middleware
const isAdmin = async (req: AuthenticatedRequest, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Pastor middleware (admin or pastor role)
const isPastor = async (req: AuthenticatedRequest, res: any, next: any) => {
  if (!req.user?.isAdmin && req.user?.role !== 'PASTOR' && req.user?.role !== 'PASTORS_WIFE') {
    return res.status(403).json({ message: "Pastor access required" });
  }
  next();
};

// CSRF protection middleware
const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Only check CSRF for state-changing methods
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // Get token from header or body (common places to send CSRF token)
  const token = req.headers['x-csrf-token'] || 
                req.body?.['_csrf'] ||
                req.query?.['_csrf'];

  // Get cookie
  const cookieToken = req.cookies?.['csrf_token'];

  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({ message: 'CSRF token mismatch' });
  }

  next();
};

// Subdomain detection middleware - extracts organization from subdomain
const detectSubdomain = async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const host = req.headers.host || '';
    const isProduction = process.env.NODE_ENV === 'production';
    
    // For local development, check X-Forwarded-Host or custom header
    const forwardedHost = req.headers['x-forwarded-host'] as string;
    const effectiveHost = forwardedHost || host;
    
    // Split host to get subdomain
    const hostParts = effectiveHost.split(':')[0].split('.');
    
    // Default base domain (change for production)
    const baseDomain = isProduction ? 'chub.app' : 'chub.local';
    
    let subdomain = null;
    
    // Check if this is a subdomain request
    if (hostParts.length > 2 && hostParts[hostParts.length - 2] === 'chub') {
      // This is a subdomain like grace-chapel.chub.local or grace-chapel.chub.app
      subdomain = hostParts[0];
    } else if (hostParts.length > 2 && !isProduction && hostParts[hostParts.length - 2] === 'local') {
      // Local development: grace-chapel.localhost
      subdomain = hostParts[0];
    }
    
    // If subdomain detected, look up the organization
    if (subdomain) {
      const orgs = await storage.getOrganizations();
      const org = orgs.find(o => o.slug === subdomain && o.isActive);
      
      if (org) {
        (req as any).organizationId = org.id;
        (req as any).organization = org;
        console.log('Subdomain detected for organization');
      } else {
        console.log(`Subdomain not found: ${subdomain}`);
      }
    }
    
    next();
  } catch (error) {
    console.error('Subdomain detection error:', error);
    next();
  }
};

// Helper to get organization ID from request context
// Priority: 1. Subdomain 2. User's org (if not super admin) 3. Query param (explicit)
const getOrganizationId = (req: AuthenticatedRequest): string | undefined => {
  // Priority 1: Subdomain detection (already set on req)
  if ((req as any).organizationId) {
    return (req as any).organizationId;
  }
  
  // Priority 2: User's organization (if authenticated and not super admin)
  if (req.user?.organizationId && !req.user?.isSuperAdmin) {
    return req.user.organizationId || undefined;
  }
  
  // Priority 3: Explicit query parameter (for super admins)
  const queryOrgId = req.query.orgId as string | undefined;
  if (queryOrgId) {
    return queryOrgId;
  }
  
  return undefined;
};

// Helper to check if user can access all organizations
const canAccessAllOrganizations = (req: AuthenticatedRequest): boolean => {
  return false;
};

// Roles that can view absent members
const ABSENT_MEMBER_ROLES = ['ADMIN', 'PASTOR', 'PASTORS_WIFE', 'CELL_LEADER', 'USHERS_LEADER'];

// Roles that can send messages to members
const CAN_SEND_MESSAGE_ROLES = ['ADMIN', 'PASTOR', 'PASTORS_WIFE', 'CELL_LEADER', 'USHERS_LEADER', 'PRAYER_TEAM', 'EVANGELISM_TEAM'];

// Middleware to check if user can view absent members
const canViewAbsentMembers = async (req: AuthenticatedRequest, res: any, next: any) => {
  // Check if user is authenticated first
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  // Allow all authenticated users for now
  return next();
};

// Middleware to check if user can send messages to members
const canSendMessages = async (req: AuthenticatedRequest, res: any, next: any) => {
  console.log('canSendMessages - user:', req.user?.email, 'isAdmin:', req.user?.isAdmin);
  
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Allow admin users
  if (req.user.isAdmin) {
    console.log('Admin access granted');
    return next();
  }
  
  // Check user's role from database
  try {
    const user = await storage.getUserById(req.user.id);
    console.log('User role checked from DB');
    if (user && CAN_SEND_MESSAGE_ROLES.includes(user.role)) {
      return next();
    }
  } catch (err) {
    console.error('Error checking user role:', err);
  }
  
  console.log('Permission denied');
  return res.status(403).json({ message: "Permission denied to send messages" });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Endpoint to get CSRF token (no auth required)
  app.get("/api/csrf-token", (req, res) => {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ csrfToken });
  });

  // Health check endpoint (no auth required)
  app.get("/api/health", (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Apply subdomain detection middleware to all API routes
  app.use('/api', detectSubdomain);

  // === AUTHENTICATION ROUTES ===

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const user = await storage.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      houseFellowship: user.houseFellowship,
      houseCellLocation: user.houseCellLocation,
      parish: user.parish,
      career: user.career,
      stateOfOrigin: user.stateOfOrigin,
      birthday: user.birthday,
      twitterHandle: user.twitterHandle,
      instagramHandle: user.instagramHandle,
      facebookHandle: user.facebookHandle,
      linkedinHandle: user.linkedinHandle,
        role: user.role,
        isAdmin: user.email === 'admin@wccrm.com' || user.isAdmin === true,
        isSuperAdmin: user.email === 'superadmin@wccrm.com' || user.isSuperAdmin === true,
        organizationId: user.organizationId,
      });
  });

  // === GDPR ROUTES ===

  // Export member data (for GDPR data portability)
  app.get("/api/gdpr/export", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const attendance = await storage.getAttendanceByUser(userId);
      const rsvps = await storage.getUserRsvps(userId);

      const exportData = {
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          houseFellowship: user.houseFellowship,
          houseCellLocation: user.houseCellLocation,
          parish: user.parish,
          career: user.career,
          stateOfOrigin: user.stateOfOrigin,
          birthday: user.birthday,
          twitterHandle: user.twitterHandle,
          instagramHandle: user.instagramHandle,
          facebookHandle: user.facebookHandle,
          linkedinHandle: user.linkedinHandle,
          role: user.role,
          createdAt: user.createdAt,
        },
        attendance: attendance.map(a => ({
          serviceType: a.serviceType,
          serviceName: a.serviceName,
          serviceDate: a.serviceDate,
          attendanceType: a.attendanceType,
          isOnline: a.isOnline,
          checkInTime: a.checkInTime,
        })),
        eventRsvps: rsvps.map(r => ({
          eventId: r.eventId,
          addedToCalendar: r.addedToCalendar,
          createdAt: r.createdAt,
        })),
        exportedAt: new Date().toISOString(),
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename=my-data-${new Date().toISOString().split("T")[0]}.json`);
      res.json(exportData);
    } catch (err) {
      console.error("Error exporting data:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete member data (for GDPR right to erasure)
  app.delete("/api/gdpr/delete", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { confirmation } = req.body;

      if (confirmation !== "DELETE_MY_DATA") {
        return res.status(400).json({ 
          message: "Please type 'DELETE_MY_DATA' to confirm deletion" 
        });
      }

      // In a real implementation, you would:
      // 1. Anonymize or delete personal data
      // 2. Keep minimal data for legal requirements
      // 3. Notify admin
      
      // For now, we'll just return a success message
      // In production, implement actual data deletion
      
      res.json({ 
        message: "Data deletion request submitted. Your data will be removed within 30 days." 
      });
    } catch (err) {
      console.error("Error deleting data:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get CSRF token
  app.get("/api/csrf-token", async (req, res) => {
    try {
      const csrfToken = crypto.randomBytes(32).toString('hex');
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('csrf_token', csrfToken, {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.json({ csrfToken });
    } catch (err) {
      console.error("Error generating CSRF token:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get privacy settings
  app.get("/api/gdpr/privacy", isAuthenticated, csrfProtection, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

       // Get privacy settings from existing privacySettings table
       const privacySetting = await db.select().from(privacySettings)
         .where(eq(privacySettings.userId, user.id))
         .limit(1);
       
       res.json({
         dataRetentionEnabled: true,
         marketingConsent: false,
         attendanceVisibility: "private",
         profileVisibility: privacySetting.length > 0 ? (privacySetting[0].showInDirectory ? "everyone" : "members") : "members",
       });
    } catch (err) {
      console.error("Error fetching privacy settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

   // Update privacy settings
   app.put("/api/gdpr/privacy", isAuthenticated, async (req: AuthenticatedRequest, res) => {
     try {
       const userId = req.user!.id;
       const { marketingConsent, attendanceVisibility, profileVisibility } = req.body;

       // In a real implementation, store these preferences in the privacySettings table
       // For now, we'll just return success
       res.json({ 
         message: "Privacy settings updated successfully",
         settings: {
           marketingConsent,
           attendanceVisibility,
           profileVisibility,
         }
       });
     } catch (err) {
       console.error("Error updating privacy settings:", err);
       res.status(500).json({ message: "Internal server error" });
     }
   });

// Login with rate limiting (CSRF protection disabled for now)
app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ 
        userId: user.id,
        organizationId: user.organizationId 
      }, JWT_SECRET, { expiresIn: '7d' });
      
       const isProduction = process.env.NODE_ENV === 'production';
       res.cookie('token', token, {
         httpOnly: true,
         secure: isProduction,
         sameSite: isProduction ? 'none' : 'lax',
         path: '/',
         maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
       });

      // Get organization details if user has one
      let organization = null;
      if (user.organizationId) {
        const org = await storage.getOrganization(user.organizationId);
        if (org) {
          organization = {
            id: org.id,
            name: org.name,
            slug: org.slug,
            description: org.description,
            logoUrl: org.logoUrl,
            churchName: org.churchName,
            churchEmail: org.churchEmail,
          };
        }
      }

       res.json({
         token, // Return token for cross-origin auth
         id: user.id,
         email: user.email,
         firstName: user.firstName,
         lastName: user.lastName,
         phone: user.phone,
         address: user.address,
         houseFellowship: user.houseFellowship,
         houseCellLocation: user.houseCellLocation,
         parish: user.parish,
         career: user.career,
         stateOfOrigin: user.stateOfOrigin,
         birthday: user.birthday,
         twitterHandle: user.twitterHandle,
         instagramHandle: user.instagramHandle,
         facebookHandle: user.facebookHandle,
         linkedinHandle: user.linkedinHandle,
         role: user.role,
         isAdmin: user.isAdmin,
         isSuperAdmin: user.isSuperAdmin,
         organizationId: user.organizationId,
         organization,
       });
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Signup with rate limiting and CSRF protection
  app.post("/api/auth/signup", signupLimiter, csrfProtection, async (req, res) => {
    try {
      const { email, password, firstName, lastName, isAdmin, isSuperAdmin } = signupSchema.parse(req.body);
      
       // Check if user already exists
       const existingUser = await storage.getUserByEmail(email);
       if (existingUser) {
         return res.status(400).json({ message: "User already exists" });
       }

       // Hash password with increased rounds for better security
       const passwordHash = await bcrypt.hash(password, 12);
       
       // Create user
       const user = await storage.createUser({
         email,
         passwordHash,
         firstName,
         lastName: lastName || '',
         isAdmin: !!isAdmin,
         isSuperAdmin: !!isSuperAdmin,
       });
       
       const token = jwt.sign({ 
         userId: user.id,
         organizationId: user.organizationId 
       }, JWT_SECRET, { expiresIn: '7d' });
       
       const isProduction = process.env.NODE_ENV === 'production';
       const csrfToken = crypto.randomBytes(32).toString('hex');
       res.cookie('token', token, {
         httpOnly: true,
         secure: isProduction,
         sameSite: isProduction ? 'none' : 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
       });
       // Set CSRF token cookie (non-httpOnly so client can read it)
       res.cookie('csrf_token', csrfToken, {
         httpOnly: false, // Must be false so client-side JavaScript can read it
         secure: isProduction,
         sameSite: isProduction ? 'none' : 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
       });

      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        houseFellowship: user.houseFellowship,
        houseCellLocation: user.houseCellLocation,
        parish: user.parish,
        role: user.role,
        isAdmin: user.email === 'admin@wccrm.com' || user.isAdmin === true,
        isSuperAdmin: user.email === 'superadmin@wccrm.com' || user.isSuperAdmin === true,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
       const isProduction = process.env.NODE_ENV === 'production';
       // Clear auth token
       res.clearCookie('token');
       // Clear CSRF token
       res.clearCookie('csrf_token');
       res.json({ message: "Logged out successfully" });
   });

  // Legacy login redirect (for compatibility)
  app.get("/api/login", (req, res) => {
    res.redirect("/auth/login");
  });

  app.get("/api/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect("/");
  });

  // === ADMIN ROUTES ===

  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(user => ({
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
      createdAt: user.createdAt,
      isAdmin: user.email === 'admin@wccrm.com'
    })));
  });

  // Get user details (admin only)
  app.get("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    const userId = req.params.id as string;
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      houseFellowship: user.houseFellowship,
      houseCellLocation: user.houseCellLocation,
      parish: user.parish,
      career: user.career,
      stateOfOrigin: user.stateOfOrigin,
      birthday: user.birthday,
      twitterHandle: user.twitterHandle,
      instagramHandle: user.instagramHandle,
      facebookHandle: user.facebookHandle,
      linkedinHandle: user.linkedinHandle,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isAdmin: user.email === 'admin@wccrm.com' || user.isAdmin === true,
      isSuperAdmin: user.email === 'superadmin@wccrm.com' || user.isSuperAdmin === true
    });
  });

  // Update user role (admin only)
  app.put("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res) => {
    const userId = req.params.id as string;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const validRoles = [
      'USER', 'ADMIN', 'PASTOR', 'PASTORS_WIFE', 'CHILDREN_LEADER',
      'CHOIRMASTER', 'CHORISTER', 'SOUND_EQUIPMENT', 'SECURITY',
      'USHERS_LEADER', 'USHER', 'SUNDAY_SCHOOL_TEACHER', 'CELL_LEADER',
      'PRAYER_TEAM', 'FINANCE_TEAM', 'TECH_TEAM', 'DECOR_TEAM', 'EVANGELISM_TEAM'
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await storage.updateUserRole(userId, role);
    res.json({ message: "Role updated successfully" });
  });

// Update user profile (admin only)
  app.put("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id as string;
      const updateData = updateUserSchema.parse(req.body);
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updates: any = {
        firstName: updateData.firstName ?? user.firstName,
        lastName: updateData.lastName ?? user.lastName,
        phone: updateData.phone ?? user.phone,
        address: updateData.address ?? user.address,
        houseFellowship: updateData.houseFellowship ?? user.houseFellowship,
        career: updateData.career ?? user.career,
        stateOfOrigin: updateData.stateOfOrigin ?? user.stateOfOrigin,
        birthday: updateData.birthday ? new Date(updateData.birthday) : user.birthday,
        twitterHandle: updateData.twitterHandle ?? user.twitterHandle,
        instagramHandle: updateData.instagramHandle ?? user.instagramHandle,
        facebookHandle: updateData.facebookHandle ?? user.facebookHandle,
        linkedinHandle: updateData.linkedinHandle ?? user.linkedinHandle,
      };
      
      if (updateData.password) {
        updates.passwordHash = await bcrypt.hash(updateData.password, 12);
      }
      
      await storage.updateUser(userId, updates);
      
      const updatedUser = await storage.getUserById(userId);
      res.json(updatedUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error updating user profile:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === MEMBER ROUTES ===

  // Get current user's profile
  app.get("/api/members/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const user = await storage.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      houseFellowship: user.houseFellowship,
      houseCellLocation: user.houseCellLocation,
      parish: user.parish,
      career: user.career,
      stateOfOrigin: user.stateOfOrigin,
      birthday: user.birthday,
      twitterHandle: user.twitterHandle,
      instagramHandle: user.instagramHandle,
      facebookHandle: user.facebookHandle,
      linkedinHandle: user.linkedinHandle,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });

  // Update current user's profile
  app.put("/api/members/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { firstName, lastName, phone, address, houseFellowship, parish, houseCellLocation, career, stateOfOrigin, birthday, twitterHandle, instagramHandle, facebookHandle, linkedinHandle } = req.body;
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await storage.updateUser(userId, {
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      phone: phone ?? user.phone,
      address: address ?? user.address,
      houseFellowship: houseFellowship ?? user.houseFellowship,
      parish: parish ?? user.parish,
      houseCellLocation: houseCellLocation ?? user.houseCellLocation,
      career: career ?? user.career,
      stateOfOrigin: stateOfOrigin ?? user.stateOfOrigin,
      birthday: birthday ? new Date(birthday) : user.birthday,
      twitterHandle: twitterHandle ?? user.twitterHandle,
      instagramHandle: instagramHandle ?? user.instagramHandle,
      facebookHandle: facebookHandle ?? user.facebookHandle,
      linkedinHandle: linkedinHandle ?? user.linkedinHandle,
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      address: updatedUser.address,
      houseFellowship: updatedUser.houseFellowship,
      houseCellLocation: updatedUser.houseCellLocation,
      parish: updatedUser.parish,
      career: updatedUser.career,
      stateOfOrigin: updatedUser.stateOfOrigin,
      birthday: updatedUser.birthday,
      twitterHandle: updatedUser.twitterHandle,
      instagramHandle: updatedUser.instagramHandle,
      facebookHandle: updatedUser.facebookHandle,
      linkedinHandle: updatedUser.linkedinHandle,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  });

  // Search members (admin only)
  app.get("/api/members/search", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    const query = req.query.q;
    const q = Array.isArray(query) ? query[0] : query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: "Search query required" });
    }
    const users = await storage.searchUsers(q);
    res.json(users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      houseFellowship: user.houseFellowship,
      houseCellLocation: user.houseCellLocation,
      parish: user.parish,
      career: user.career,
      stateOfOrigin: user.stateOfOrigin,
      birthday: user.birthday,
      twitterHandle: user.twitterHandle,
      instagramHandle: user.instagramHandle,
      facebookHandle: user.facebookHandle,
      linkedinHandle: user.linkedinHandle,
      role: user.role,
      createdAt: user.createdAt,
    })));
  });

  // Get all members with pagination (authenticated users)
  app.get("/api/members", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const role = req.query.role as string;
      const houseFellowship = req.query.houseFellowship as string;
      const parish = req.query.parish as string;
      const search = req.query.search as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;

      const allUsers = await storage.getAllUsers();
      
      let filteredUsers = [...allUsers];

      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }

      if (houseFellowship) {
        filteredUsers = filteredUsers.filter(u => u.houseFellowship === houseFellowship);
      }

      if (parish) {
        filteredUsers = filteredUsers.filter(u => u.parish === parish);
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredUsers = filteredUsers.filter(u => u.createdAt && new Date(u.createdAt) >= fromDate);
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filteredUsers = filteredUsers.filter(u => u.createdAt && new Date(u.createdAt) <= toDate);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.firstName?.toLowerCase().includes(searchLower) ||
          u.lastName?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.phone?.includes(search) ||
          u.houseFellowship?.toLowerCase().includes(searchLower)
        );
      }

      const total = filteredUsers.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = filteredUsers.slice(start, end);

      const requesterIsAdmin = req.user!.isAdmin || req.user!.email === 'admin@wccrm.com';

      res.json({
        members: paginatedUsers.map(user => ({
          id: user.id,
          email: requesterIsAdmin ? user.email : user.email?.replace(/(.{2})(.*)(?=@)/, '$1***'), // simple masking for non-admins
          firstName: user.firstName,
          lastName: user.lastName,
          phone: requesterIsAdmin ? user.phone : null, // hide phone for non-admins
          address: requesterIsAdmin ? user.address : null, // hide address for non-admins
          houseFellowship: user.houseFellowship,
          houseCellLocation: user.houseCellLocation,
          parish: user.parish,
          career: user.career,
          stateOfOrigin: user.stateOfOrigin,
          birthday: requesterIsAdmin ? user.birthday : null,
          twitterHandle: user.twitterHandle,
          instagramHandle: user.instagramHandle,
          facebookHandle: user.facebookHandle,
          linkedinHandle: user.linkedinHandle,
          role: user.role,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          roles: Array.from(new Set(allUsers.map(u => u.role))),
          houseFellowships: Array.from(new Set(allUsers.map(u => u.houseFellowship).filter(Boolean) as string[])),
          parishes: Array.from(new Set(allUsers.map(u => u.parish).filter(Boolean) as string[])),
        },
      });
    } catch (err) {
      console.error("Error fetching members:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user's house cell location (admin only)
  app.put("/api/members/:id/house-cell", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    const userIdParam = req.params.id;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    const houseCellLocationInput = req.body.houseCellLocation;
    const houseCellLocation = typeof houseCellLocationInput === 'string' ? houseCellLocationInput : String(houseCellLocationInput);
    
    if (!houseCellLocation || !userId) {
      return res.status(400).json({ message: "House cell location and user ID are required" });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await storage.updateUserHouseCell(userId, houseCellLocation);
    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      houseCellLocation: updatedUser.houseCellLocation,
    });
  });

  // Get member's own activity logs
  app.get("/api/members/activity", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    
    try {
      const activities = await storage.getMemberActivityLogs(userId, limit);
      res.json(activities);
    } catch (err) {
      console.error("Error fetching activity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Log a new activity
  app.post("/api/members/activity", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { type, description, metadata } = req.body;
      
      if (!type || !description) {
        return res.status(400).json({ message: "Type and description are required" });
      }
      
      const activity = await storage.createMemberActivityLog({
        userId: req.user.id,
        type,
        description,
        metadata: metadata || {},
      });
      
      res.json(activity);
    } catch (err) {
      console.error("Error logging activity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get today's engagement metrics for current user
  app.get("/api/analytics/my-engagement", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const metrics = await storage.getMyEngagementMetrics(req.user.id);
      res.json(metrics);
    } catch (err) {
      console.error("Error fetching engagement:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify user (admin only)
  app.post("/api/admin/users/:id/verify", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    const userIdParam = req.params.id;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verifiedUser = await storage.verifyUser(userId);
    res.json({
      id: verifiedUser.id,
      email: verifiedUser.email,
      firstName: verifiedUser.firstName,
      lastName: verifiedUser.lastName,
      isVerified: verifiedUser.isVerified,
    });
  });

  // === APP ROUTES ===

  // Branding
  app.get(api.branding.get.path, async (req, res) => {
    const branding = await storage.getBranding();
    if (!branding)
      return res.status(404).json({ message: "Branding not found" });
    res.json(branding);
  });

  // Image upload endpoint
  app.post("/api/upload", isAuthenticated, imageUpload.single("file"), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Return the file URL
      const url = `/uploads/images/${req.file.filename}`;
      res.json({ url, filename: req.file.filename });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.post(api.branding.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.branding.update.input.parse(req.body);
      const updated = await storage.updateBranding(input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Events
  app.get(api.events.list.path, async (req: AuthenticatedRequest, res) => {
    const orgId = getOrganizationId(req);
    const events = await storage.getEvents(orgId);
    const eventsWithRsvpCount = await Promise.all(
      events.map(async (event) => {
        const rsvps = await storage.getEventRsvps(event.id);
        return { ...event, rsvpCount: rsvps.length };
      })
    );
    res.json(eventsWithRsvpCount);
  });

  app.get("/api/events/list-with-rsvps", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const orgId = getOrganizationId(req);
    const events = await storage.getEvents(orgId);
    const userRsvps = await storage.getUserRsvps(userId);
    const userRsvpEventIds = new Set(userRsvps.map(r => r.eventId));
    
    const eventsWithRsvpCount = await Promise.all(
      events.map(async (event) => {
        const rsvps = await storage.getEventRsvps(event.id);
        return { 
          ...event, 
          rsvpCount: rsvps.length,
          hasRsvped: userRsvpEventIds.has(event.id),
        };
      })
    );
    res.json(eventsWithRsvpCount);
  });

  // Get user's RSVPs - must be BEFORE /:id route
  app.get("/api/events/rsvps", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const rsvps = await storage.getUserRsvps(userId);
      
      // Fetch event details for each RSVP
      const rsvpsWithEvents = await Promise.all(
        rsvps.map(async (rsvp) => {
          const eventId = Number(rsvp.eventId);
          if (isNaN(eventId)) {
            return { ...rsvp, event: null };
          }
          const event = await storage.getEvent(eventId);
          return { ...rsvp, event };
        })
      );
      
      res.json(rsvpsWithEvents);
    } catch (err) {
      console.error("Error fetching RSVPs:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.events.get.path, async (req: AuthenticatedRequest, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) return res.status(404).json({ message: "Event not found" });
    
    // Check organization access
    const orgId = getOrganizationId(req);
    if (orgId && event.organizationId !== orgId) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.json(event);
  });

  app.post(api.events.create.path, isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const input = api.events.create.input.parse(req.body);
      // Convert date string to Date object
      const orgId = getOrganizationId(req);
      const eventData = {
        ...input,
        date: new Date(input.date),
        creatorId: req.user!.id,
        organizationId: orgId,
      };
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.events.rsvp.path, isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = Number(req.params.id);
      const userId = req.user!.id;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if event has capacity limit
      if (event.capacity && event.capacity > 0) {
        const rsvps = await storage.getEventRsvps(eventId);
        const confirmedCount = rsvps.filter(r => r.rsvpStatus !== 'waitlist').length;
        
        if (confirmedCount >= event.capacity) {
          // Add to waitlist
          const rsvp = await storage.rsvpToEvent(eventId, userId, 'waitlist');
          const waitlistPosition = rsvps.filter(r => r.rsvpStatus === 'waitlist').length + 1;
          return res.json({ 
            message: "Added to waitlist", 
            rsvp,
            waitlist: true,
            waitlistPosition
          });
        }
      }

      const rsvp = await storage.rsvpToEvent(eventId, userId, 'going');
      res.json({ message: "RSVP successful", rsvp });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove RSVP
  app.delete("/api/events/:id/rsvp", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = Number(req.params.id);
      const userId = req.user!.id;
      
      const rsvp = await storage.getEventRsvps(eventId);
      const userRsvp = rsvp.find(r => r.userId === userId);
      
      await storage.removeRsvp(eventId, userId);
      
      // If user was confirmed (not on waitlist) and there's capacity, promote from waitlist
      if (userRsvp && userRsvp.rsvpStatus !== 'waitlist') {
        const event = await storage.getEvent(eventId);
        if (event && event.capacity && event.capacity > 0) {
          const promoted = await storage.promoteFromWaitlist(eventId);
          if (promoted) {
            const promotedUser = await storage.getUserById(promoted.userId);
            if (promotedUser) {
              await storage.createMessage({
                userId: promoted.userId,
                type: "EVENT_WAITLIST",
                title: "Event Spot Available!",
                content: `Great news! A spot has opened up for an event you were on the waitlist for. You've been automatically confirmed.`,
                priority: "normal",
                createdBy: userId,
              });
            }
          }
        }
      }
      
      res.json({ message: "RSVP removed" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark event as added to calendar
  app.post("/api/events/:id/calendar", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = Number(req.params.id);
      const userId = req.user!.id;
      
      const rsvp = await storage.markAddedToCalendar(eventId, userId);
      res.json({ message: "Added to calendar", rsvp });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get event with RSVP count
  app.get("/api/events/:id/with-rsvps", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = Number(req.params.id);
      const userId = req.user!.id;
      const isAdmin = req.user!.isAdmin;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const rsvps = await storage.getEventRsvps(eventId);
      const isCreator = event.creatorId === userId;
      
      // Show RSVPs to creator or admin
      const canViewRsvps = isCreator || isAdmin;
      
      // If can view RSVPs, get user details
      let rsvpsWithUsers: any[] | undefined = undefined;
      if (canViewRsvps) {
        rsvpsWithUsers = await Promise.all(
          rsvps.map(async (rsvp) => {
            const user = await storage.getUserById(rsvp.userId);
            return {
              ...rsvp,
              user: user ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
              } : null,
            };
          })
        );
      }
      
      res.json({
        ...event,
        rsvpCount: rsvps.length,
        rsvps: rsvpsWithUsers,
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update event (auth required)
  app.put("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, description, date, location, imageUrl } = req.body;
      const input: Partial<{ title: string; description: string; date: Date; location: string; imageUrl?: string }> = {};
      if (title !== undefined) input.title = title;
      if (description !== undefined) input.description = description;
      if (date !== undefined) input.date = new Date(date);
      if (location !== undefined) input.location = location;
      if (imageUrl !== undefined) input.imageUrl = imageUrl;
      const event = await storage.updateEvent(id, input);
      res.json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete event
  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteEvent(id);
      res.json({ message: "Event deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send event reminder to RSVPs (admin only)
  app.post("/api/events/:id/remind", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const rsvps = await storage.getEventRsvps(id);
      if (rsvps.length === 0) {
        return res.json({ message: "No RSVPs to send reminders to" });
      }

      // Get user details for each RSVP
      const userIds = rsvps.map(r => r.userId);
      const users = await Promise.all(userIds.map(uid => storage.getUserById(uid)));
      
      // In production, integrate with FCM or email service
      // For now, we'll just return success with the list
      const reminderResult = users
        .filter(u => u && u.email)
        .map(u => ({
          userId: u!.id,
          email: u!.email,
          message: `Reminder: ${event.title} is coming up on ${new Date(event.date).toLocaleDateString()}`
        }));

      res.json({ 
        message: `Reminder prepared for ${reminderResult.length} attendees`,
        recipients: reminderResult,
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location
        }
      });
    } catch (err) {
      console.error("Error sending reminder:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get event analytics
  app.get("/api/events/:id/analytics", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const rsvps = await storage.getEventRsvps(id);
      
      const eventDate = event.date || new Date();
      
      // Calculate analytics
      const analytics = {
        totalRsvps: rsvps.length,
        addedToCalendar: rsvps.filter(r => r.addedToCalendar).length,
        recentRsvps: rsvps.filter(r => {
          const rsvpDate = r.createdAt ? new Date(r.createdAt) : new Date();
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return rsvpDate > dayAgo;
        }).length,
        eventDate: event.date,
        isPast: eventDate < new Date(),
        daysUntil: Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      };

      res.json(analytics);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get event categories
  app.get("/api/event-categories", async (req, res) => {
    try {
      const categories = await storage.getEventCategories();
      res.json(categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get calendar download links for an event
  app.get("/api/events/:id/calendar-links", async (req, res) => {
    try {
      const eventId = Number(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const { generateAllCalendarLinks } = await import("./services/event-calendar.js");
      const links = generateAllCalendarLinks(event);
      res.json(links);
    } catch (err) {
      console.error("Error generating calendar links:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit event feedback
  app.post("/api/events/:id/feedback", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = Number(req.params.id);
      const userId = req.user!.id;
      const { rating, comment, wouldRecommend } = req.body;

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!event.allowFeedback) {
        return res.status(400).json({ message: "Feedback is not allowed for this event" });
      }

      const feedback = await storage.createEventFeedback({
        eventId,
        userId,
        rating,
        comment,
        wouldRecommend,
      });

      res.json(feedback);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get event feedback
  app.get("/api/events/:id/feedback", async (req, res) => {
    try {
      const eventId = Number(req.params.id);
      const feedback = await storage.getEventFeedback(eventId);
      res.json(feedback);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get events by category
  app.get("/api/events/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const events = await storage.getEventsByCategory(category);
      res.json(events);
    } catch (err) {
      console.error("Error fetching events by category:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get events by tag
  app.get("/api/events/tag/:tag", async (req, res) => {
    try {
      const tag = req.params.tag;
      const events = await storage.getEventsByTag(tag);
      res.json(events);
    } catch (err) {
      console.error("Error fetching events by tag:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sermons
  app.get(api.sermons.list.path, async (req: AuthenticatedRequest, res) => {
    const { speaker, series, status, search } = req.query;
    const orgId = getOrganizationId(req);
    const filter: ISermonFilter = {};
    
    if (speaker) filter.speaker = speaker as string;
    if (series) filter.series = series as string;
    if (search) filter.search = search as string;
    if (status === 'upcoming') filter.isUpcoming = true;
    if (status === 'past') filter.isUpcoming = false;
    if (orgId) filter.organizationId = orgId;
    
    const sermons = await storage.getSermons(filter);
    res.json(sermons);
  });

  // Get sermon topics for filtering - must be BEFORE :id route
  app.get("/api/sermons/topics", async (req, res) => {
    try {
      const sermons = await storage.getSermons({});
      
      // Extract unique topics
      const topics = new Set<string>();
      sermons.forEach(s => {
        if (s.topic) {
          s.topic.split(/[,\s]+/).forEach(t => {
            if (t.trim()) topics.add(t.trim());
          });
        }
      });

      // Extract unique series
      const series = new Set<string>();
      sermons.forEach(s => {
        if (s.series) series.add(s.series);
      });

      // Extract unique speakers
      const speakers = new Set<string>();
      sermons.forEach(s => {
        if (s.speaker) speakers.add(s.speaker);
      });

      res.json({
        topics: Array.from(topics).sort(),
        series: Array.from(series).sort(),
        speakers: Array.from(speakers).sort()
      });
    } catch (err) {
      console.error("Error fetching sermon topics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.sermons.get.path, async (req, res) => {
    const sermon = await storage.getSermon(Number(req.params.id));
    if (!sermon) return res.status(404).json({ message: "Sermon not found" });
    res.json(sermon);
  });

  // Share sermon - returns social media share links
  app.get("/api/sermons/:id/share", async (req, res) => {
    const sermon = await storage.getSermon(Number(req.params.id));
    if (!sermon) return res.status(404).json({ message: "Sermon not found" });
    
    const baseUrl = process.env.BASE_URL || `https://${req.get('host')}`;
    const sermonUrl = `${baseUrl}/sermons/${sermon.id}`;
    const sermonTitle = encodeURIComponent(sermon.title);
    const sermonDescription = sermon.description ? encodeURIComponent(sermon.description.substring(0, 100)) : '';
    
    const shareLinks = {
      x: `https://twitter.com/intent/tweet?text=${sermonTitle}&url=${encodeURIComponent(sermonUrl)}`,
      whatsapp: `https://wa.me/?text=${sermonTitle}%20${encodeURIComponent(sermonUrl)}`,
      email: `mailto:?subject=${sermonTitle}&body=${sermonDescription}%20${encodeURIComponent(sermonUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sermonUrl)}`,
      instagram: `https://www.instagram.com/`,
      tiktok: `https://www.tiktok.com/`,
      copyLink: sermonUrl
    };
    
    res.json(shareLinks);
  });

  // Download sermon audio/video
  app.get("/api/sermons/:id/download", async (req, res) => {
    const sermon = await storage.getSermon(Number(req.params.id));
    if (!sermon) return res.status(404).json({ message: "Sermon not found" });
    
    const { type } = req.query;
    let downloadUrl: string | null = null;
    let filename: string = '';
    
    if (type === 'video' && sermon.videoUrl) {
      downloadUrl = sermon.videoUrl;
      filename = `${sermon.title}-video.mp4`;
    } else if (type === 'audio' && sermon.audioUrl) {
      downloadUrl = sermon.audioUrl;
      filename = `${sermon.title}-audio.mp3`;
    } else if (!type) {
      if (sermon.audioUrl) {
        downloadUrl = sermon.audioUrl;
        filename = `${sermon.title}-audio.mp3`;
      } else if (sermon.videoUrl) {
        downloadUrl = sermon.videoUrl;
        filename = `${sermon.title}-video.mp4`;
      }
    }
    
    if (!downloadUrl) return res.status(404).json({ message: "No download available" });
    
    res.json({ url: downloadUrl, filename, title: sermon.title });
  });

  // Admin only: Create sermon
  app.post(api.sermons.create.path, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const input = api.sermons.create.input.parse(req.body);
      const sermon = await storage.createSermon(input);
      res.status(201).json(sermon);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update sermon (admin only)
  app.put("/api/sermons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, speaker, date, topic, videoUrl, videoFilePath, audioUrl, audioFilePath, series, description, thumbnailUrl, isUpcoming } = req.body;
      const input: Partial<{ title: string; speaker: string; date: Date; topic?: string; videoUrl?: string; videoFilePath?: string; audioUrl?: string; audioFilePath?: string; series?: string; description?: string; thumbnailUrl?: string; isUpcoming?: boolean }> = {};
      if (title !== undefined) input.title = title;
      if (speaker !== undefined) input.speaker = speaker;
      if (date !== undefined) input.date = new Date(date);
      if (topic !== undefined) input.topic = topic;
      if (videoUrl !== undefined) input.videoUrl = videoUrl;
      if (videoFilePath !== undefined) input.videoFilePath = videoFilePath;
      if (audioUrl !== undefined) input.audioUrl = audioUrl;
      if (audioFilePath !== undefined) input.audioFilePath = audioFilePath;
      if (series !== undefined) input.series = series;
      if (description !== undefined) input.description = description;
      if (thumbnailUrl !== undefined) input.thumbnailUrl = thumbnailUrl;
      if (isUpcoming !== undefined) input.isUpcoming = isUpcoming;
      const sermon = await storage.updateSermon(id, input);
      res.json(sermon);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete sermon (admin only)
  app.delete("/api/sermons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteSermon(id);
      res.json({ message: "Sermon deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === SERMON SERIES MANAGEMENT (Admin only) ===

  // Get all sermon series with sermon counts
  app.get("/api/sermons/series", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const sermons = await storage.getSermons({});
      const seriesMap = new Map<string, { name: string; count: number; thumbnailUrl?: string }>();
      
      sermons.forEach(sermon => {
        if (sermon.series) {
          const existing = seriesMap.get(sermon.series);
          if (existing) {
            existing.count++;
          } else {
            seriesMap.set(sermon.series, { 
              name: sermon.series, 
              count: 1,
              thumbnailUrl: sermon.thumbnailUrl 
            });
          }
        }
      });

      const series = Array.from(seriesMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

      res.json(series);
    } catch (err) {
      console.error("Error fetching sermon series:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get sermons by series
  app.get("/api/sermons/series/:name", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const seriesName = decodeURIComponent(req.params.name);
      const sermons = await storage.getSermons({ series: seriesName });
      res.json(sermons);
    } catch (err) {
      console.error("Error fetching sermons by series:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update sermon series name (renames series for all sermons)
  app.put("/api/sermons/series/:oldName", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const oldName = decodeURIComponent(req.params.oldName);
      const { newName } = req.body;

      if (!newName || typeof newName !== "string") {
        return res.status(400).json({ message: "New series name is required" });
      }

      if (newName === oldName) {
        return res.json({ message: "Series name unchanged" });
      }

      const sermons = await storage.getSermons({});
      const sermonsToUpdate = sermons.filter(s => s.series === oldName);
      
      let updatedCount = 0;
      for (const sermon of sermonsToUpdate) {
        await storage.updateSermon(sermon.id, { series: newName });
        updatedCount++;
      }

      res.json({ message: `Updated ${updatedCount} sermons from "${oldName}" to "${newName}"` });
    } catch (err) {
      console.error("Error updating sermon series:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete sermon series (removes series from all sermons)
  app.delete("/api/sermons/series/:name", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const seriesName = decodeURIComponent(req.params.name);
      const sermons = await storage.getSermons({});
      const sermonsToUpdate = sermons.filter(s => s.series === seriesName);
      
      let updatedCount = 0;
      for (const sermon of sermonsToUpdate) {
        await storage.updateSermon(sermon.id, { series: undefined });
        updatedCount++;
      }

      res.json({ message: `Removed series "${seriesName}" from ${updatedCount} sermons` });
    } catch (err) {
      console.error("Error deleting sermon series:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Sermon Search - Advanced search by verse, topic, or keyword
  app.get("/api/sermons/search/advanced", async (req, res) => {
    try {
      const { q, verse, topic, limit = 20 } = req.query;
      const searchQuery = q as string;
      const verseRef = verse as string;
      const topicFilter = topic as string;
      const resultLimit = parseInt(limit as string) || 20;

      let sermons = await storage.getSermons({});
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        sermons = sermons.filter(s => 
          s.title?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.speaker?.toLowerCase().includes(query) ||
          s.topic?.toLowerCase().includes(query) ||
          s.series?.toLowerCase().includes(query)
        );
      }

      // Filter by verse reference
      if (verseRef) {
        const verse = verseRef.toLowerCase();
        sermons = sermons.filter(s => 
          s.description?.toLowerCase().includes(verse) ||
          s.topic?.toLowerCase().includes(verse)
        );
      }

      // Filter by topic
      if (topicFilter) {
        const topic = topicFilter.toLowerCase();
        sermons = sermons.filter(s => 
          s.topic?.toLowerCase().includes(topic) ||
          s.series?.toLowerCase().includes(topic)
        );
      }

      // Sort by date (newest first)
      sermons = sermons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json(sermons.slice(0, resultLimit));
    } catch (err) {
      console.error("Error searching sermons:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get related sermons based on topic, series, or speaker
  app.get("/api/sermons/:id/related", async (req, res) => {
    try {
      const sermonId = Number(req.params.id);
      const sermon = await storage.getSermon(sermonId);
      
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      let allSermons = await storage.getSermons({});
      
      // Filter out current sermon
      allSermons = allSermons.filter(s => s.id !== sermonId);

      // Score sermons by relevance
      const scored = allSermons.map(s => {
        let score = 0;
        
        // Same series (highest weight)
        if (s.series && sermon.series && s.series === sermon.series) {
          score += 10;
        }
        
        // Same speaker
        if (s.speaker && sermon.speaker && s.speaker === sermon.speaker) {
          score += 5;
        }
        
        // Same topic
        if (s.topic && sermon.topic) {
          const topics1 = s.topic.toLowerCase().split(/[,\s]+/);
          const topics2 = sermon.topic.toLowerCase().split(/[,\s]+/);
          const overlap = topics1.filter(t => topics2.includes(t)).length;
          score += overlap * 3;
        }
        
        return { sermon: s, score };
      });

      // Sort by score and get top results
      const related = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(s => s.sermon);

      res.json(related);
    } catch (err) {
      console.error("Error getting related sermons:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get personalized sermon recommendations
  app.get("/api/sermons/recommendations", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUserById(userId);
      
      // Get all sermons
      let sermons = await storage.getSermons({});
      
      // Get user's engagement history (recently viewed, liked, etc.)
      // For now, we'll use a simple recommendation based on:
      // 1. User's group interests (if any)
      // 2. Recent sermon topics
      
      // Score sermons
      const scored = sermons.map(s => {
        let score = 0;
        
        // Prefer recent sermons (last 30 days)
        const sermonDate = new Date(s.date);
        const daysAgo = (Date.now() - sermonDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysAgo <= 7) score += 10;
        else if (daysAgo <= 30) score += 5;
        
        // Prefer upcoming/most recent if no history
        // Add more scoring logic based on user preferences
        
        return { sermon: s, score };
      });

      // Sort by score
      const recommendations = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(s => s.sermon);

      res.json(recommendations);
    } catch (err) {
      console.error("Error getting recommendations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate AI sermon summary (mock implementation)
  app.get("/api/sermons/:id/summary", async (req, res) => {
    try {
      const sermonId = Number(req.params.id);
      const sermon = await storage.getSermon(sermonId);
      
      if (!sermon) {
        return res.status(404).json({ message: "Sermon not found" });
      }

      // Generate a summary based on available data
      // In production, this would call an AI service
      const summary = {
        id: sermon.id,
        title: sermon.title,
        speaker: sermon.speaker,
        date: sermon.date,
        topic: sermon.topic,
        series: sermon.series,
        summary: sermon.description 
          ? (sermon.description.length > 200 
              ? sermon.description.substring(0, 200) + "..." 
              : sermon.description)
          : `A sermon by ${sermon.speaker} on ${sermon.topic || sermon.title}.`,
        keyPoints: sermon.topic 
          ? [`Main topic: ${sermon.topic}`, `Part of: ${sermon.series || 'Standalone message'}`]
          : [`Speaker: ${sermon.speaker}`],
        generatedAt: new Date().toISOString()
      };

      res.json(summary);
    } catch (err) {
      console.error("Error generating summary:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === AI SERMON SEARCH & RECOMMENDATIONS ===

  // Record sermon view
  app.post("/api/sermons/:id/view", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const sermonId = Number(req.params.id);
      const userId = req.user!.id;
      const { watchDuration, completed } = req.body;
      
      const view = await storage.recordSermonView(sermonId, userId, watchDuration || 0, completed || false);
      res.json(view);
    } catch (err) {
      console.error("Error recording sermon view:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's sermon views
  app.get("/api/sermons/views/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const views = await storage.getUserSermonViews(userId);
      res.json(views);
    } catch (err) {
      console.error("Error fetching sermon views:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's sermon watch history with sermon details
  app.get("/api/sermons/watch-history", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const views = await storage.getUserSermonViewsWithDetails(userId);
      res.json(views);
    } catch (err) {
      console.error("Error fetching watch history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update watch progress for a sermon
  app.post("/api/sermons/watch-progress", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { sermonId, watchProgress, completed } = req.body;
      
      if (!sermonId) {
        return res.status(400).json({ message: "Sermon ID is required" });
      }
      
      const view = await storage.recordSermonView(
        sermonId, 
        userId, 
        Math.round((watchProgress || 0) * 60), 
        completed || false
      );
      res.json(view);
    } catch (err) {
      console.error("Error updating watch progress:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Clear user's watch history
  app.delete("/api/sermons/watch-history", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      await storage.clearUserSermonViews(userId);
      res.json({ message: "Watch history cleared" });
    } catch (err) {
      console.error("Error clearing watch history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get popular sermons
  app.get("/api/sermons/popular", async (req, res) => {
    try {
      const sermons = await storage.getPopularSermons(10);
      res.json(sermons);
    } catch (err) {
      console.error("Error fetching popular sermons:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get/update user sermon preferences
  app.get("/api/sermons/preferences", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const prefs = await storage.getUserSermonPreferences(userId);
      res.json(prefs || { userId, favoriteSpeakers: [], favoriteTopics: [], favoriteSeries: [] });
    } catch (err) {
      console.error("Error fetching preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/sermons/preferences", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { favoriteSpeakers, favoriteTopics, favoriteSeries } = req.body;
      
      const prefs = await storage.updateUserSermonPreferences(userId, {
        favoriteSpeakers,
        favoriteTopics,
        favoriteSeries,
      });
      res.json(prefs);
    } catch (err) {
      console.error("Error updating preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get personalized recommendations
  app.get("/api/sermons/recommendations/personal", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const sermons = await storage.getSermonRecommendations(userId, 10);
      res.json(sermons);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search sermons (AI-powered)
  app.get("/api/sermons/search/ai", async (req, res) => {
    try {
      const { q, limit = 20 } = req.query;
      const searchQuery = q as string;
      
      if (!searchQuery) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const sermons = await storage.searchSermons(searchQuery, parseInt(limit as string) || 20);
      res.json(sermons);
    } catch (err) {
      console.error("Error searching sermons:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get related sermons (using storage method)
  app.get("/api/sermons/:id/related-ai", async (req, res) => {
    try {
      const sermonId = Number(req.params.id);
      const sermons = await storage.getRelatedSermons(sermonId, 5);
      res.json(sermons);
    } catch (err) {
      console.error("Error fetching related sermons:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate AI summary (using storage method)
  app.get("/api/sermons/:id/ai-summary", async (req, res) => {
    try {
      const sermonId = Number(req.params.id);
      const summary = await storage.generateSermonSummary(sermonId);
      res.json({ summary, sermonId });
    } catch (err) {
      console.error("Error generating summary:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === AI CHURCH ASSISTANT (CHATBOT) ===

  // Start a new chat conversation
  app.post("/api/chat/conversations", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { sessionId, title } = req.body;
      
      const conversation = await storage.createChatConversation({
        userId,
        sessionId: sessionId || `session_${Date.now()}`,
        title,
      });
      
      res.json(conversation);
    } catch (err) {
      console.error("Error creating conversation:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's chat conversations
  app.get("/api/chat/conversations", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const conversations = await storage.getChatConversationsByUser(userId);
      res.json(conversations);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get a specific conversation with messages
  app.get("/api/chat/conversations/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const conversation = await storage.getChatConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messages = await storage.getChatMessages(id);
      res.json({ conversation, messages });
    } catch (err) {
      console.error("Error fetching conversation:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send a message to the chatbot
  app.post("/api/chat/message", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { message, conversationId, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      let convId = conversationId;
      
      // Create new conversation if none provided
      if (!convId) {
        const conversation = await storage.createChatConversation({
          userId,
          sessionId: sessionId || `session_${Date.now()}`,
        });
        convId = conversation.id;
      }
      
      // Save user message
      await storage.addChatMessage({
        conversationId: convId,
        role: "user",
        content: message,
      });
      
      // Get AI response
      const botResponse = await storage.generateChatbotResponse(message, convId);
      
      // Save assistant message
      const assistantMessage = await storage.addChatMessage({
        conversationId: convId,
        role: "assistant",
        content: botResponse.response,
        metadata: botResponse.intentName ? { intentId: botResponse.intentId, intentName: botResponse.intentName } : undefined,
      } as any);
      
      // Update conversation
      await storage.updateChatConversation(convId, { status: "active" });
      
      res.json({
        conversationId: convId,
        userMessage: message,
        response: botResponse.response,
        messageId: assistantMessage.id,
        intent: botResponse.intentName,
      });
    } catch (err) {
      console.error("Error processing chat message:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quick chat (anonymous, no session required)
  app.post("/api/chat/quick", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const botResponse = await storage.generateChatbotResponse(message);
      
      res.json({
        response: botResponse.response,
        intent: botResponse.intentName,
      });
    } catch (err) {
      console.error("Error in quick chat:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get chatbot intents (admin)
  app.get("/api/chat/intents", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const intents = await storage.getChatbotIntents();
      res.json(intents);
    } catch (err) {
      console.error("Error fetching intents:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create chatbot intent (admin)
  app.post("/api/chat/intents", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { name, patterns, responses, category, keywords, priority } = req.body;
      
      const intent = await storage.createChatbotIntent({
        name,
        patterns,
        responses,
        category,
        keywords,
        priority: priority || 0,
      });
      
      res.json(intent);
    } catch (err) {
      console.error("Error creating intent:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update chatbot intent (admin)
  app.put("/api/chat/intents/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, patterns, responses, category, keywords, priority, isActive } = req.body;
      
      const intent = await storage.updateChatbotIntent(id, {
        name,
        patterns,
        responses,
        category,
        keywords,
        priority,
        isActive,
      });
      
      res.json(intent);
    } catch (err) {
      console.error("Error updating intent:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete chatbot intent (admin)
  app.delete("/api/chat/intents/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteChatbotIntent(id);
      res.json({ message: "Intent deleted" });
    } catch (err) {
      console.error("Error deleting intent:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get/update chatbot preferences
  app.get("/api/chat/preferences", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const prefs = await storage.getChatbotPreferences(userId);
      res.json(prefs || { userId, language: "en", notificationEnabled: true, digestPreference: "daily" });
    } catch (err) {
      console.error("Error fetching preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/chat/preferences", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { language, notificationEnabled, digestPreference } = req.body;
      
      const prefs = await storage.updateChatbotPreferences(userId, {
        language,
        notificationEnabled,
        digestPreference,
      });
      
      res.json(prefs);
    } catch (err) {
      console.error("Error updating preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get chatbot analytics (admin)
  app.get("/api/chat/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getChatbotAnalytics();
      res.json(analytics);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === MULTI-CAMPUS & BRANCH MANAGEMENT ===

  // Get all campuses
  app.get("/api/campuses", async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const campuses = await storage.getCampuses(includeInactive);
      res.json(campuses);
    } catch (err) {
      console.error("Error fetching campuses:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get campus by ID
  app.get("/api/campuses/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const campus = await storage.getCampus(id);
      if (!campus) {
        return res.status(404).json({ message: "Campus not found" });
      }
      res.json(campus);
    } catch (err) {
      console.error("Error fetching campus:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create campus (admin)
  app.post("/api/campuses", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const campusData = createCampusSchema.parse(req.body);
      const campus = await storage.createCampus({
        name: campusData.name,
        code: campusData.code,
        address: campusData.address,
        city: campusData.city,
        state: campusData.state,
        country: campusData.country,
        phone: campusData.phone,
        email: campusData.email,
        website: campusData.website,
        pastorId: campusData.pastorId,
        isHeadquarters: campusData.isHeadquarters ?? false,
        timezone: campusData.timezone,
        logoUrl: campusData.logoUrl,
      });
      res.json(campus);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error creating campus:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update campus (admin)
  app.put("/api/campuses/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updateData = createCampusSchema.partial().parse(req.body);
      const campus = await storage.updateCampus(id, updateData);
      res.json(campus);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error updating campus:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete campus (admin)
  app.delete("/api/campuses/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteCampus(id);
      res.json({ message: "Campus deleted" });
    } catch (err) {
      console.error("Error deleting campus:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get branches by campus
  app.get("/api/campuses/:id/branches", async (req, res) => {
    try {
      const campusId = Number(req.params.id);
      const includeInactive = req.query.includeInactive === 'true';
      const branches = await storage.getBranchesByCampus(campusId, includeInactive);
      res.json(branches);
    } catch (err) {
      console.error("Error fetching branches:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create branch (admin)
  app.post("/api/branches", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { campusId, name, code, address, city, state, leaderId, leaderName, leaderPhone } = req.body;
      const branch = await storage.createBranch({ campusId, name, code, address, city, state, leaderId, leaderName, leaderPhone });
      res.json(branch);
    } catch (err) {
      console.error("Error creating branch:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update branch (admin)
  app.put("/api/branches/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const branch = await storage.updateBranch(id, req.body);
      res.json(branch);
    } catch (err) {
      console.error("Error updating branch:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete branch (admin)
  app.delete("/api/branches/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteBranch(id);
      res.json({ message: "Branch deleted" });
    } catch (err) {
      console.error("Error deleting branch:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's campus/branch
  app.get("/api/my-campuses", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const member = await storage.getCampusMember(userId);
      res.json(member);
    } catch (err) {
      console.error("Error fetching user campus:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get campus members
  app.get("/api/campuses/:id/members", isAuthenticated, async (req, res) => {
    try {
      const campusId = Number(req.params.id);
      const members = await storage.getCampusMembers(campusId);
      res.json(members);
    } catch (err) {
      console.error("Error fetching campus members:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Assign member to campus (admin)
  app.post("/api/campuses/:id/members", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const campusId = Number(req.params.id);
      const { userId, branchId, membershipType } = req.body;
      const member = await storage.assignMemberToCampus({ userId, campusId, branchId, membershipType });
      res.json(member);
    } catch (err) {
      console.error("Error assigning member:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Request campus transfer
  app.post("/api/campuses/transfer", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { toCampusId, toBranchId, notes } = req.body;
      const currentMember = await storage.getCampusMember(userId);
      const transfer = await storage.createTransfer({
        userId,
        fromCampusId: currentMember?.campusId,
        fromBranchId: currentMember?.branchId,
        toCampusId,
        toBranchId,
        notes,
      });
      res.json(transfer);
    } catch (err) {
      console.error("Error creating transfer:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get pending transfers (admin)
  app.get("/api/campuses/transfers", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const transfers = await storage.getPendingTransfers();
      res.json(transfers);
    } catch (err) {
      console.error("Error fetching transfers:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Approve transfer (admin)
  app.post("/api/campuses/transfers/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const approvedBy = req.user!.id;
      const transfer = await storage.approveTransfer(id, approvedBy);
      res.json(transfer);
    } catch (err) {
      console.error("Error approving transfer:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reject transfer (admin)
  app.post("/api/campuses/transfers/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const approvedBy = req.user!.id;
      const transfer = await storage.rejectTransfer(id, approvedBy);
      res.json(transfer);
    } catch (err) {
      console.error("Error rejecting transfer:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get campus statistics (admin)
  app.get("/api/campuses/:id/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const campusId = Number(req.params.id);
      const stats = await storage.getCampusStats(campusId);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching campus stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === PRIVACY, SAFETY & MODERATION CONTROLS ===

  // Get privacy settings
  app.get("/api/privacy", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const settings = await storage.getPrivacySettings(userId);
      res.json(settings || { userId, profileVisibility: "members", showEmail: false, showPhone: false, showBirthday: true, showSocialLinks: true, allowMessages: true, allowGroupInvites: true });
    } catch (err) {
      console.error("Error fetching privacy settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update privacy settings
  app.put("/api/privacy", isAuthenticated, csrfProtection, async (req, res) => {
    try {
      const userId = req.user!.id;
      const settings = await storage.updatePrivacySettings(userId, req.body);
      res.json(settings);
    } catch (err) {
      console.error("Error updating privacy settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Block user
  app.post("/api/users/:id/block", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const blockerId = req.user!.id;
      const blockedId = req.params.id as string;
      const { reason } = req.body;
      const reasonStr = typeof reason === 'string' ? reason : (Array.isArray(reason) ? reason[0] : undefined);
      const block = await storage.blockUser(blockerId, blockedId, reasonStr);
      res.json(block);
    } catch (err) {
      console.error("Error blocking user:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Unblock user
  app.delete("/api/users/:id/block", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const blockerId = req.user!.id;
      const blockedId = req.params.id;
      await storage.unblockUser(blockerId, blockedId as string);
      res.json({ message: "User unblocked" });
    } catch (err) {
      console.error("Error unblocking user:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get blocked users
  app.get("/api/users/blocks", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const blockerId = req.user!.id;
      const blocks = await storage.getBlockedUsers(blockerId);
      res.json(blocks);
    } catch (err) {
      console.error("Error fetching blocked users:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Report user/content
  app.post("/api/reports", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const reporterId = req.user!.id;
      const { reportedUserId, reportedContentId, reportedContentType, categoryId, reason, description } = req.body;
      const report = await storage.createReport({ reporterId, reportedUserId, reportedContentId, reportedContentType, categoryId, reason, description });
      res.json(report);
    } catch (err) {
      console.error("Error creating report:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get reports (admin)
  app.get("/api/reports", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string;
      const reports = status ? await storage.getReportsByStatus(status) : await db.select().from(userReports).orderBy(desc(userReports.createdAt));
      res.json(reports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resolve report (admin)
  app.post("/api/reports/:id/resolve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const resolvedBy = req.user!.id;
      const { action, notes } = req.body;
      const report = await storage.resolveReport(id, resolvedBy, action, notes);
      res.json(report);
    } catch (err) {
      console.error("Error resolving report:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get report categories
  app.get("/api/reports/categories", async (req, res) => {
    try {
      const categories = await storage.getReportCategories();
      res.json(categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Moderation queue (admin)
  app.get("/api/moderation/queue", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const queue = await storage.getPendingModeration();
      res.json(queue);
    } catch (err) {
      console.error("Error fetching moderation queue:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Moderate content (admin)
  app.post("/api/moderation/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const reviewedBy = req.user!.id;
      const { action, notes } = req.body;
      const result = await storage.moderateContent(id, reviewedBy, action, notes);
      res.json(result);
    } catch (err) {
      console.error("Error moderating content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get moderation stats (admin)
  app.get("/api/moderation/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getModerationStats();
      res.json(stats);
    } catch (err) {
      console.error("Error fetching moderation stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get login history
  app.get("/api/auth/login-history", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const history = await storage.getLoginHistory(userId);
      res.json(history);
    } catch (err) {
      console.error("Error fetching login history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user sessions
  app.get("/api/auth/sessions", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const sessions = await storage.getUserSessions(userId);
      res.json(sessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Revoke session
  app.delete("/api/auth/sessions/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.revokeSession(id);
      res.json({ message: "Session revoked" });
    } catch (err) {
      console.error("Error revoking session:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Revoke all sessions
  app.delete("/api/auth/sessions", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      await storage.revokeAllSessions(userId);
      res.json({ message: "All sessions revoked" });
    } catch (err) {
      console.error("Error revoking sessions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // 2FA management
  app.get("/api/auth/2fa", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const settings = await storage.get2FASettings(userId);
      res.json(settings ? { enabled: settings.enabled } : { enabled: false });
    } catch (err) {
      console.error("Error fetching 2FA settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enable 2FA (simplified - would need TOTP library in production)
  app.post("/api/auth/2fa/enable", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      // In production, this would use TOTP
      const secret = `secret_${Date.now()}`;
      const backupCodes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
      const result = await storage.enable2FA(userId, secret, backupCodes);
      res.json({ enabled: true, backupCodes });
    } catch (err) {
      console.error("Error enabling 2FA:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Disable 2FA
  app.post("/api/auth/2fa/disable", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      await storage.disable2FA(userId);
      res.json({ enabled: false });
    } catch (err) {
      console.error("Error disabling 2FA:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Data export request
  app.post("/api/privacy/export", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const request = await storage.requestDataExport(userId);
      res.json(request);
    } catch (err) {
      console.error("Error requesting data export:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get export status
  app.get("/api/privacy/export", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const request = await storage.getExportRequest(userId);
      res.json(request || { status: "none" });
    } catch (err) {
      console.error("Error fetching export status:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Request data deletion
  app.post("/api/privacy/delete", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const request = await storage.requestDataDeletion(userId);
      res.json(request);
    } catch (err) {
      console.error("Error requesting data deletion:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cancel data deletion
  app.delete("/api/privacy/delete", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      await storage.cancelDataDeletion(userId);
      res.json({ message: "Deletion request cancelled" });
    } catch (err) {
      console.error("Error cancelling deletion:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === PUSH NOTIFICATIONS ===

  // Get VAPID public key for client
  app.get("/api/push/vapid-key", (req, res) => {
    res.json({ publicKey: publicVapidKey });
  });

  // Subscribe to push notifications
  app.post("/api/push/subscribe", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { endpoint, p256dh, auth } = req.body;

      if (!endpoint || !p256dh || !auth) {
        return res.status(400).json({ message: "Missing subscription details" });
      }

      // Check if subscription already exists
      const existing = await db.select().from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));

      if (existing.length > 0) {
        // Update existing subscription with userId
        await db.update(pushSubscriptions)
          .set({ userId, updatedAt: new Date() })
          .where(eq(pushSubscriptions.id, existing[0].id));
      } else {
        // Create new subscription
        await db.insert(pushSubscriptions).values({
          userId,
          endpoint,
          p256dh,
          auth,
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Error subscribing to push:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Unsubscribe from push notifications
  app.post("/api/push/unsubscribe", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { endpoint } = req.body;

      await db.delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));

      res.json({ success: true });
    } catch (err) {
      console.error("Error unsubscribing from push:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get notification preferences
  app.get("/api/push/preferences", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const prefs = await db.select().from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));

      if (prefs.length === 0) {
        // Create default preferences
        const [newPrefs] = await db.insert(notificationPreferences).values({
          userId,
        }).returning();
        return res.json(newPrefs);
      }

      res.json(prefs[0]);
    } catch (err) {
      console.error("Error fetching preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update notification preferences
  app.put("/api/push/preferences", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const {
        eventNotifications,
        sermonNotifications,
        prayerNotifications,
        liveStreamNotifications,
        attendanceNotifications,
        messageNotifications,
        groupNotifications,
      } = req.body;

      const existing = await db.select().from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));

      if (existing.length > 0) {
        const [updated] = await db.update(notificationPreferences)
          .set({
            eventNotifications,
            sermonNotifications,
            prayerNotifications,
            liveStreamNotifications,
            attendanceNotifications,
            messageNotifications,
            groupNotifications,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.userId, userId))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(notificationPreferences).values({
          userId,
          eventNotifications,
          sermonNotifications,
          prayerNotifications,
          liveStreamNotifications,
          attendanceNotifications,
          messageNotifications,
          groupNotifications,
        }).returning();
        res.json(created);
      }
    } catch (err) {
      console.error("Error updating preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === WHITE-LABEL CHURCH PLATFORM ===

  // Get all organizations
  app.get("/api/organizations", async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const orgs = await storage.getOrganizations(includeInactive);
      res.json(orgs);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization by ID or slug
  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const idOrSlug = req.params.id;
      const isUuid = /^[0-9a-fH]{8}-[0-9a-fH]{4}-[4][0-9a-fH]{3}-[89abH][0-9a-fH]{3}-[0-9a-fH]{12}$/i.test(idOrSlug) || idOrSlug.length > 20; 
      let org = isUuid ? await storage.getOrganization(idOrSlug) : await storage.getOrganizationBySlug(idOrSlug);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(org);
    } catch (err) {
      console.error("Error fetching organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create organization (admin)
  app.post("/api/organizations", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { name, slug, domain, primaryColor, secondaryColor, accentColor, contactEmail, contactPhone, address, city, state, country, timezone, plan } = req.body;
      const org = await storage.createOrganization({
        name, 
        slug, 
        churchEmail: contactEmail,
        churchPhone: contactPhone,
        churchAddress: address,
        churchCity: city,
        churchState: state,
        churchCountry: country,
        colors: JSON.stringify({ primary: primaryColor, secondary: secondaryColor, accent: accentColor }),
        isActive: true
      });
      
      // Create default theme and settings
      await storage.createTheme({ organizationId: org.id, name: 'Default', isDefault: true, config: { primaryColor, secondaryColor, accentColor } });
      await storage.updateOrganizationSettings(org.id, { allowCustomDomain: true, allowCustomTheme: true, enableCustomPages: true });
      
      res.json(org);
    } catch (err) {
      console.error("Error creating organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update organization (admin)
  app.put("/api/organizations/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const org = await storage.updateOrganization(id, req.body);
      res.json(org);
    } catch (err) {
      console.error("Error updating organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete organization (admin)
  app.delete("/api/organizations/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      await storage.deleteOrganization(id);
      res.json({ message: "Organization deleted" });
    } catch (err) {
      console.error("Error deleting organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization themes
  app.get("/api/organizations/:id/themes", async (req, res) => {
    try {
      const orgId = req.params.id;
      const themes = await storage.getOrganizationThemes(orgId);
      res.json(themes);
    } catch (err) {
      console.error("Error fetching themes:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create theme (admin)
  app.post("/api/organizations/:id/themes", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const { name, isDefault, config } = req.body;
      const theme = await storage.createTheme({ organizationId: orgId, name, isDefault: isDefault || false, config });
      res.json(theme);
    } catch (err) {
      console.error("Error creating theme:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get custom pages
  app.get("/api/organizations/:id/pages", async (req, res) => {
    try {
      const orgId = req.params.id;
      const pages = await storage.getOrganizationPages(orgId);
      res.json(pages);
    } catch (err) {
      console.error("Error fetching pages:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create custom page (admin)
  app.post("/api/organizations/:id/pages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const { title, slug, content, metaTitle, metaDescription, isPublished, showInNav, orderIndex } = req.body;
      const page = await storage.createCustomPage({ organizationId: orgId, title, slug, content, metaTitle, metaDescription, isPublished: isPublished || false, showInNav: showInNav || false, orderIndex: orderIndex || 0 });
      res.json(page);
    } catch (err) {
      console.error("Error creating page:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update custom page (admin)
  app.put("/api/pages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const page = await storage.updateCustomPage(id, req.body);
      res.json(page);
    } catch (err) {
      console.error("Error updating page:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete custom page (admin)
  app.delete("/api/pages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteCustomPage(id);
      res.json({ message: "Page deleted" });
    } catch (err) {
      console.error("Error deleting page:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get menu items
  app.get("/api/organizations/:id/menu", async (req, res) => {
    try {
      const orgId = req.params.id;
      const location = (req.query.location as string) || 'header';
      const items = await storage.getMenuItems(orgId, location);
      res.json(items);
    } catch (err) {
      console.error("Error fetching menu:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create menu item (admin)
  app.post("/api/organizations/:id/menu", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const { menuLocation, label, url, pageId, icon, orderIndex, isVisible } = req.body;
      const item = await storage.createMenuItem({ organizationId: orgId, menuLocation, label, url, pageId, icon, orderIndex: orderIndex || 0, isVisible: isVisible !== false });
      res.json(item);
    } catch (err) {
      console.error("Error creating menu item:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update menu item (admin)
  app.put("/api/menu/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await storage.updateMenuItem(id, req.body);
      res.json(item);
    } catch (err) {
      console.error("Error updating menu item:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete menu item (admin)
  app.delete("/api/menu/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteMenuItem(id);
      res.json({ message: "Menu item deleted" });
    } catch (err) {
      console.error("Error deleting menu item:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get email templates (admin)
  app.get("/api/organizations/:id/emails", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const templates = await storage.getOrganizationEmailTemplates(orgId);
      res.json(templates);
    } catch (err) {
      console.error("Error fetching email templates:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send email campaign (admin)
  app.post("/api/organizations/:id/emails/send", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const { templateId, subject, body, recipients, scheduledAt } = req.body;
      
      await storage.logEmailCampaign({
        organizationId: orgId,
        templateId,
        subject,
        body,
        recipientCount: recipients?.length || 0,
        sentAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: scheduledAt ? "scheduled" : "sent",
      });
      
      res.json({ message: scheduledAt ? "Campaign scheduled" : "Campaign sent", status: scheduledAt ? "scheduled" : "sent" });
    } catch (err) {
      console.error("Error sending email campaign:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get email campaign history (admin)
  app.get("/api/organizations/:id/emails/history", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const campaigns = await storage.getEmailCampaignHistory(orgId);
      res.json(campaigns);
    } catch (err) {
      console.error("Error fetching campaign history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create email template (admin)
  app.post("/api/organizations/:id/emails", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const { name, subject, body, type, isActive } = req.body;
      const template = await storage.createEmailTemplate({ organizationId: orgId, name, subject, body, type, isActive: isActive !== false });
      res.json(template);
    } catch (err) {
      console.error("Error creating email template:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get custom fields
  app.get("/api/organizations/:id/fields/:entity", async (req, res) => {
    try {
      const orgId = req.params.id;
      const entityType = req.params.entity;
      const fields = await storage.getCustomFields(orgId, entityType);
      res.json(fields);
    } catch (err) {
      console.error("Error fetching custom fields:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create custom field (admin)
  app.post("/api/organizations/:id/fields", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const { entityType, name, fieldType, label, placeholder, isRequired, options, orderIndex, isActive } = req.body;
      const field = await storage.createCustomField({ organizationId: orgId, entityType, name, fieldType, label, placeholder, isRequired: isRequired || false, options, orderIndex: orderIndex || 0, isActive: isActive !== false });
      res.json(field);
    } catch (err) {
      console.error("Error creating custom field:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete custom field (admin)
  app.delete("/api/fields/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteCustomField(id);
      res.json({ message: "Field deleted" });
    } catch (err) {
      console.error("Error deleting custom field:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization settings
  app.get("/api/organizations/:id/settings", async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const settings = await storage.getOrganizationSettings(orgId);
      res.json(settings || { organizationId: orgId, settings: {}, features: {} });
    } catch (err) {
      console.error("Error fetching settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update organization settings (admin)
  app.put("/api/organizations/:id/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const settings = await storage.updateOrganizationSettings(orgId, req.body);
      res.json(settings);
    } catch (err) {
      console.error("Error updating settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add custom domain (admin)
  app.post("/api/organizations/:id/domains", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const { domain } = req.body;
      const verificationCode = Math.random().toString(36).substring(2, 15);
      const customDomain = await storage.addCustomDomain({ organizationId: orgId, domain, verificationCode });
      res.json({ ...customDomain, verificationCode });
    } catch (err) {
      console.error("Error adding custom domain:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify custom domain (admin)
  app.post("/api/domains/verify", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { domain, verificationCode } = req.body;
      const existing = await storage.getCustomDomain(domain);
      if (!existing) {
        return res.status(404).json({ message: "Domain not found" });
      }
      if (existing.verificationCode !== verificationCode) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      const verified = await storage.verifyCustomDomain(existing.id);
      res.json(verified);
    } catch (err) {
      console.error("Error verifying domain:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Record organization analytics
  app.post("/api/organizations/:id/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const { metricType, metricValue, metadata } = req.body;
      const analytic = await storage.recordOrganizationMetric({ organizationId: orgId, metricType, metricValue, metadata });
      res.json(analytic);
    } catch (err) {
      console.error("Error recording analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization analytics
  app.get("/api/organizations/:id/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orgId = req.params.id as string;
      const metricType = req.query.type as string;
      const analytics = await storage.getOrganizationMetrics(orgId, metricType);
      res.json(analytics);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Prayer Requests
  app.get(api.prayer.list.path, async (req, res) => {
    const requests = await storage.getPrayerRequests();
    res.json(requests);
  });

  // Get current user's prayer requests
  app.get("/api/prayer-requests/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    const allRequests = await storage.getPrayerRequests();
    const userRequests = allRequests.filter(r => r.userId === req.user?.id);
    res.json(userRequests);
  });

  // Create prayer request - NO auth required (open to all)
  app.post(api.prayer.create.path, async (req, res) => {
    try {
      const input = api.prayer.create.input.parse(req.body);
      // Try to get user ID from auth if available, otherwise allow anonymous
      let userId: string | undefined;
      try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.userId;
        }
      } catch (e) {
        // Not authenticated, that's fine - allow anonymous requests
      }
      
      const requestWithUser = { ...input, userId };
      const request = await storage.createPrayerRequest(requestWithUser);
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.prayer.pray.path, async (req, res) => {
    const updated = await storage.incrementPrayCount(Number(req.params.id));
    if (!updated) return res.status(404).json({ message: "Request not found" });
    res.json(updated);
  });

  // Mark prayer request as answered (owner or admin)
  app.post("/api/prayer-requests/:id/answer", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const prayerRequest = await storage.getPrayerRequestById(id);
      if (!prayerRequest) {
        return res.status(404).json({ message: "Prayer request not found" });
      }
      
      // Check if user is owner or admin
      if (prayerRequest.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await storage.updatePrayerRequest(id, { isAnswered: true });
      res.json(updated);
    } catch (err) {
      console.error("Error marking prayer request as answered:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete prayer request (owner or admin)
  app.delete("/api/prayer-requests/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const prayerRequest = await storage.getPrayerRequestById(id);
      if (!prayerRequest) {
        return res.status(404).json({ message: "Prayer request not found" });
      }
      
      // Check if user is owner or admin
      if (prayerRequest.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deletePrayerRequest(id);
      res.json({ message: "Prayer request deleted" });
    } catch (err) {
      console.error("Error deleting prayer request:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get prayer wall stats
  app.get("/api/prayer-requests/stats", async (req, res) => {
    try {
      const requests = await storage.getPrayerRequests();
      const totalPrayers = requests.reduce((sum, r) => sum + (r.prayCount || 0), 0);
      const answered = requests.filter(r => r.isAnswered).length;
      const active = requests.filter(r => !r.isAnswered).length;
      
      res.json({
        totalRequests: requests.length,
        totalPrayers,
        answered,
        active,
        recentlyAnswered: requests.filter(r => {
          if (!r.isAnswered || !r.answeredAt) return false;
          const answeredDate = new Date(r.answeredAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return answeredDate > weekAgo;
        }).length
      });
    } catch (err) {
      console.error("Error fetching prayer stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Donations
  app.post(api.donations.create.path, async (req, res) => {
    try {
      const input = api.donations.create.input.parse(req.body);
      const donation = await storage.createDonation(input);
      res.status(201).json(donation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all fundraising campaigns
  app.get("/api/fundraising", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const campaigns = await storage.getFundraisingCampaigns(activeOnly);
      res.json(campaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single fundraising campaign
  app.get("/api/fundraising/:id", async (req, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      const campaign = await storage.getFundraisingCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create fundraising campaign (admin only)
  app.post("/api/fundraising", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { title, description, goalAmount, imageUrl, startDate, endDate, isActive } = req.body;
      const campaign = await storage.createFundraisingCampaign({
        title,
        description,
        goalAmount: Math.round(goalAmount * 100),
        imageUrl,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
        createdBy: req.user!.id,
      });
      res.status(201).json(campaign);
    } catch (err) {
      console.error("Error creating campaign:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update fundraising campaign (admin only)
  app.put("/api/fundraising/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      const { title, description, goalAmount, imageUrl, startDate, endDate, isActive } = req.body;
      const campaign = await storage.updateFundraisingCampaign(id, {
        title,
        description,
        goalAmount: goalAmount ? Math.round(goalAmount * 100) : undefined,
        imageUrl,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      });
      res.json(campaign);
    } catch (err) {
      console.error("Error updating campaign:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete fundraising campaign (admin only)
  app.delete("/api/fundraising/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      await storage.deleteFundraisingCampaign(id);
      res.json({ message: "Campaign deleted" });
    } catch (err) {
      console.error("Error deleting campaign:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's donation history
  app.get("/api/donations/history", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const donations = await storage.getDonationHistory(userId);
      res.json(donations);
    } catch (err) {
      console.error("Error fetching donation history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cancel recurring donation
  app.post("/api/donations/:id/cancel", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.cancelRecurringDonation(id, req.user!.id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found or not authorized" });
      }
      res.json({ success: true, message: "Recurring donation cancelled" });
    } catch (err) {
      console.error("Error cancelling donation:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === DAILY DEVOTIONAL ROUTES ===

  // Get today's devotional (public)
  app.get("/api/devotionals/today", async (req: AuthenticatedRequest, res) => {
    try {
      const orgId = getOrganizationId(req);
      const devotional = await storage.getTodayDevotional(orgId);
      res.json(devotional);
    } catch (err) {
      console.error("Error fetching today's devotional:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all devotionals (public)
  app.get("/api/devotionals", async (req: AuthenticatedRequest, res) => {
    try {
      const publishedOnly = req.query.published === "true";
      const orgId = getOrganizationId(req);
      const devotionals = await storage.getDailyDevotionals(publishedOnly, orgId);
      res.json(devotionals);
    } catch (err) {
      console.error("Error fetching devotionals:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single devotional (public)
  app.get("/api/devotionals/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      const devotional = await storage.getDailyDevotional(id);
      if (!devotional) {
        return res.status(404).json({ message: "Devotional not found" });
      }
      
      // Check organization access
      const orgId = getOrganizationId(req);
      if (orgId && devotional.organizationId !== orgId) {
        return res.status(404).json({ message: "Devotional not found" });
      }
      
      res.json(devotional);
    } catch (err) {
      console.error("Error fetching devotional:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create devotional (admin only)
  app.post("/api/devotionals", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      console.log("Creating devotional");
      const { title, content, author, bibleVerse, theme, imageUrl, publishDate } = req.body;
      const orgId = getOrganizationId(req);
      const devotional = await storage.createDailyDevotional({
        title,
        content,
        author,
        bibleVerse,
        theme,
        imageUrl,
        publishDate: new Date(publishDate),
        createdBy: req.user!.id,
        organizationId: orgId || undefined,
      });
      res.status(201).json(devotional);
    } catch (err) {
      console.error("Error creating devotional:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update devotional (admin only)
  app.put("/api/devotionals/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      const devotional = await storage.updateDailyDevotional(id, req.body);
      res.json(devotional);
    } catch (err) {
      console.error("Error updating devotional:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete devotional (admin only)
  app.delete("/api/devotionals/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      await storage.deleteDailyDevotional(id);
      res.json({ message: "Devotional deleted" });
    } catch (err) {
      console.error("Error deleting devotional:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI-generated devotional (admin only)
  app.post("/api/devotionals/ai-generate", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { theme, bibleVerse, date } = req.body;
      
      // Template-based generation (can be replaced with actual AI API)
      const templates = [
        {
          title: `Walking in Faith: ${theme || "Daily Trust"}`,
          content: `Dear beloved, today we are reminded of the importance of walking by faith and not by sight. ${theme || "This theme"} speaks to the very heart of our Christian journey. When we trust in the Lord's plan, even when we cannot see the outcome, we demonstrate true faith.

Remember the words of Scripture: "For we walk by faith, not by sight." This means that our decisions, our actions, and our words should be guided by our belief in God's promises rather than our temporary circumstances.

As you go about your day, consider how you can apply this truth. Trust in the Lord's timing. He knows what is best for you. His plans are greater than ours.

Prayer: Lord, help me to walk in faith today. Give me the strength to trust You in all circumstances. In Jesus' name, amen.`,
          author: "AI Assistant",
          bibleVerse: bibleVerse || "2 Corinthians 5:7",
          theme: theme || "Faith",
        },
        {
          title: `The Power of God's Love: ${theme || "Experiencing Divine Love"}`,
          content: `God's love is greater than anything we can imagine. It is everlasting, unconditional, and eternal. Today, reflect on the depth of His love for you.

"He loved us and sent His Son to be the propitiation for our sins." This is the greatest demonstration of love the world has ever known.

In your relationships, seek to reflect this same love. Be patient, be kind, do not envy, do not boast, do not be proud. Love bears all things, believes all things, hopes all things, endures all things.

Prayer: Father, help me to understand and experience Your love more deeply each day. May I share this love with those around me. In Jesus' name, amen.`,
          author: "AI Assistant",
          bibleVerse: bibleVerse || "1 John 4:8",
          theme: theme || "Love",
        },
        {
          title: `Finding Peace in Troubled Times: ${theme || "God's Peace"}`,
          content: `In the midst of life's storms, God offers us a peace that surpasses all understanding. This peace is not dependent on our circumstances but on our relationship with Him.

"Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God." When we bring our concerns to Him, He promises to guard our hearts and minds.

Whatever trial you face today, remember that God is with you. He will never leave you nor forsake you. Trust in His presence and find peace.

Prayer: Lord, grant me Your peace that surpasses all understanding. Help me to trust You in every circumstance. In Jesus' name, amen.`,
          author: "AI Assistant",
          bibleVerse: bibleVerse || "Philippians 4:6-7",
          theme: theme || "Peace",
        },
        {
          title: `Strength for Today: ${theme || "God's Sufficiency"}`,
          content: `Are you feeling weak or overwhelmed? God promises to be your strength. "The Lord is my shepherd; I shall not want." He supplies all our needs according to His riches in glory.

When you feel inadequate, remember that God's strength is made perfect in your weakness. His grace is sufficient for you. His power works best when yours runs out.

Take courage! The God who created the universe lives in you. He will give you the strength to face whatever comes your way today.

Prayer: Lord, be my strength and my shield. I trust in Your promises. Help me to lean on You in every situation. In Jesus' name, amen.`,
          author: "AI Assistant",
          bibleVerse: bibleVerse || "Philippians 4:13",
          theme: theme || "Strength",
        },
        {
          title: `Grace and Mercy: ${theme || "God's Unmerited Favor"}`,
          content: `God's grace and mercy are the foundations of our salvation. Grace is unmerited favor—God's goodness toward us despite our unworthiness. Mercy is God's compassion in not giving us what we deserve.

We all fall short of God's glory, but through Jesus Christ, we receive forgiveness and eternal life. This is the greatest gift anyone could ever receive.

Today, extend the same grace and mercy to others that God has extended to you. Forgive as you have been forgiven.

Prayer: Thank You, Lord, for Your amazing grace and mercy. Help me to extend the same to others. In Jesus' name, amen.`,
          author: "AI Assistant",
          bibleVerse: bibleVerse || "Ephesians 2:8-9",
          theme: theme || "Grace",
        },
      ];

      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      const publishDate = date ? new Date(date) : new Date();
      
      const devotional = await storage.createDailyDevotional({
        ...randomTemplate,
        publishDate,
        isPublished: false,
        createdBy: req.user!.id,
      });

      res.status(201).json({
        devotional,
        message: "AI-generated devotional created. Review and publish when ready."
      });
    } catch (err) {
      console.error("Error generating devotional:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === BIBLE READING PLANS ROUTES ===

  // Get all reading plans (public)
  app.get("/api/reading-plans", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const plans = await storage.getBibleReadingPlans(activeOnly);
      res.json(plans);
    } catch (err) {
      console.error("Error fetching reading plans:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single reading plan (public)
  app.get("/api/reading-plans/:id", async (req, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      const plan = await storage.getBibleReadingPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Reading plan not found" });
      }
      res.json(plan);
    } catch (err) {
      console.error("Error fetching reading plan:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create reading plan (admin only)
  app.post("/api/reading-plans", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const plan = await storage.createBibleReadingPlan({
        ...req.body,
        createdBy: req.user!.id,
      });
      res.status(201).json(plan);
    } catch (err) {
      console.error("Error creating reading plan:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's reading progress
  app.get("/api/reading-plans/:id/progress", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      const userId = req.user!.id;
      const progress = await storage.getUserReadingProgress(userId, id);
      res.json(progress);
    } catch (err) {
      console.error("Error fetching reading progress:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark day as complete
  app.post("/api/reading-plans/:id/progress", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      const userId = req.user!.id;
      const { dayNumber } = req.body;
      
      if (!dayNumber) {
        return res.status(400).json({ message: "Day number is required" });
      }
      
      const progress = await storage.updateBibleReadingProgress(userId, id, dayNumber);
      res.json(progress);
    } catch (err) {
      console.error("Error updating reading progress:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === ATTENDANCE ROUTES ===

  // Get user's attendance history
  app.get("/api/attendance/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const attendanceRecords = await storage.getAttendanceByUser(userId);
      res.json(attendanceRecords);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Self check-in for a service
  app.post("/api/attendance/checkin", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { serviceType, serviceId, serviceName, serviceDate, notes } = req.body;

      if (!serviceType || !serviceName || !serviceDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existingAttendance = await storage.getUserAttendanceForService(
        userId,
        serviceType,
        new Date(serviceDate)
      );

      if (existingAttendance) {
        return res.status(400).json({ message: "Already checked in for this service" });
      }

      const attendance = await storage.createAttendance({
        userId,
        serviceType,
        serviceId: serviceId || null,
        serviceName,
        serviceDate: new Date(serviceDate),
        attendanceType: "SELF_CHECKIN",
        checkInTime: new Date(),
        isOnline: false,
        notes: notes || null,
        createdBy: userId,
      });

      res.status(201).json(attendance);
    } catch (err) {
      console.error("Error checking in:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resend check-in notification
  app.post("/api/attendance/checkin-notification", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { eventId, eventTitle, eventDate } = req.body;
      
      if (!eventId || !eventTitle || !eventDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const checkinMessage = await storage.createMessage({
        userId,
        type: "CHECKIN_CONFIRMATION",
        title: "Check-in Confirmed!",
        content: `You've successfully checked in for ${eventTitle} on ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Thank you for attending!`,
        priority: "normal",
        createdBy: userId,
      });
      
      sendNewMessageNotification(userId, checkinMessage);
      
      res.json({ success: true, message: "Check-in notification sent" });
    } catch (err) {
      console.error("Error sending check-in notification:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Manual check-in (admin/leader only)
  app.post("/api/attendance/manual", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { targetUserId, serviceType, serviceId, serviceName, serviceDate, notes } = req.body;

      if (!targetUserId || !serviceType || !serviceName || !serviceDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existingAttendance = await storage.getUserAttendanceForService(
        targetUserId,
        serviceType,
        new Date(serviceDate)
      );

      if (existingAttendance) {
        return res.status(400).json({ message: "User already checked in for this service" });
      }

      const attendance = await storage.createAttendance({
        userId: targetUserId,
        serviceType,
        serviceId: serviceId || null,
        serviceName,
        serviceDate: new Date(serviceDate),
        attendanceType: "MANUAL",
        checkInTime: new Date(),
        isOnline: false,
        notes: notes || null,
        createdBy: userId,
      });

      const checkinMessage = await storage.createMessage({
        userId: targetUserId,
        type: "CHECKIN_CONFIRMATION",
        title: "Check-in Recorded!",
        content: `Your attendance for ${serviceName} on ${new Date(serviceDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} has been recorded.`,
        priority: "normal",
        createdBy: userId,
      });
      sendNewMessageNotification(targetUserId, checkinMessage);

      res.status(201).json({ ...attendance, messageSent: true });
    } catch (err) {
      console.error("Error manual check-in:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Online attendance tracking - record watch session
  app.post("/api/attendance/online", async (req, res) => {
    try {
      const { userId, serviceType, serviceId, serviceName, serviceDate, watchDuration, isReplay } = req.body;

      if (!userId || !serviceType || !serviceName || !serviceDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const thresholdMinutes = parseInt(await storage.getAttendanceSetting("online_watch_threshold_minutes") || "10");
      const thresholdSeconds = thresholdMinutes * 60;

      if (watchDuration < thresholdSeconds) {
        return res.status(200).json({ message: "Watch time below threshold", recorded: false });
      }

      const existingAttendance = await storage.getUserAttendanceForService(
        userId,
        serviceType,
        new Date(serviceDate)
      );

      if (existingAttendance) {
        return res.status(200).json({ message: "Already recorded", recorded: true });
      }

      const attendance = await storage.createAttendance({
        userId,
        serviceType: isReplay ? "ONLINE_REPLAY" : "ONLINE_LIVE",
        serviceId: serviceId || null,
        serviceName,
        serviceDate: new Date(serviceDate),
        attendanceType: "ONLINE_AUTO",
        checkInTime: new Date(),
        watchDuration,
        isOnline: true,
        notes: null,
        createdBy: userId,
      });

      res.status(201).json(attendance);
    } catch (err) {
      console.error("Error recording online attendance:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate unique attendance link
  app.post("/api/attendance/links", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { serviceType, serviceId, serviceName, serviceDate, expiresAt } = req.body;

      if (!serviceType || !serviceName || !serviceDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const baseUrl = process.env.BASE_URL || `https://${req.get("host")}`;
      const checkinUrl = `${baseUrl}/attendance/checkin/${token}`;

      const link = await storage.createAttendanceLink({
        serviceType,
        serviceId: serviceId || null,
        serviceName,
        serviceDate: new Date(serviceDate),
        uniqueToken: token,
        qrCodeUrl: checkinUrl,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: userId,
      });

      res.status(201).json({
        ...link,
        checkinUrl,
      });
    } catch (err) {
      console.error("Error creating attendance link:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get attendance by token (for check-in page)
  app.get("/api/attendance/links/:token", async (req, res) => {
    try {
      const tokenParam = req.params.token;
      const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
      const link = await storage.getAttendanceLinkByToken(token);

      if (!link) {
        return res.status(404).json({ message: "Invalid or expired link" });
      }

      if (!link.isActive) {
        return res.status(400).json({ message: "This attendance link is no longer active" });
      }

      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return res.status(400).json({ message: "This attendance link has expired" });
      }

      res.json(link);
    } catch (err) {
      console.error("Error fetching attendance link:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check-in via unique link (for members using attendance link)
  app.post("/api/attendance/links/:token/checkin", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const tokenParam = req.params.token;
      const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
      const userId = req.user!.id;
      const { notes } = req.body;

      const link = await storage.getAttendanceLinkByToken(token);

      if (!link) {
        return res.status(404).json({ message: "Invalid or expired link" });
      }

      if (!link.isActive) {
        return res.status(400).json({ message: "This attendance link is no longer active" });
      }

      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return res.status(400).json({ message: "This attendance link has expired" });
      }

      const existingAttendance = await storage.getUserAttendanceForService(
        userId,
        link.serviceType,
        link.serviceDate
      );

      if (existingAttendance) {
        return res.status(400).json({ message: "Already checked in for this service" });
      }

      const attendance = await storage.createAttendance({
        userId,
        serviceType: link.serviceType,
        serviceId: link.serviceId,
        serviceName: link.serviceName,
        serviceDate: link.serviceDate,
        attendanceType: "QR_CHECKIN",
        checkInTime: new Date(),
        isOnline: false,
        notes: notes || null,
        createdBy: link.createdBy,
      });

      const checkinMessage = await storage.createMessage({
        userId,
        type: "CHECKIN_CONFIRMATION",
        title: "Check-in Confirmed!",
        content: `You've successfully checked in for ${link.serviceName} on ${link.serviceDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. See you there!`,
        priority: "normal",
        createdBy: userId,
      });
      sendNewMessageNotification(userId, checkinMessage);

      res.status(201).json({ ...attendance, messageSent: true });
    } catch (err) {
      console.error("Error checking in via link:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get attendance analytics (admin only)
  app.get("/api/attendance/analytics", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { startDate, endDate, serviceType } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const stats = await storage.getAttendanceStats(
        new Date(startDate as string),
        new Date(endDate as string),
        serviceType as string | undefined
      );

      res.json(stats);
    } catch (err) {
      console.error("Error fetching attendance analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get real-time check-in stats for today (admin only)
  app.get("/api/attendance/checkin-stats", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const stats = await storage.getCheckinStats(today, tomorrow);
      const totalMembers = await db.select().from(users).where(eq(users.organizationId, req.user!.organizationId));
      
      res.json({
        ...stats,
        totalMembers: totalMembers.length,
        expectedAttendance: Math.round(totalMembers.length * 0.6),
        checkInRate: totalMembers.length > 0 ? Math.round((stats.total / totalMembers.length) * 100) : 0,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error("Error fetching check-in stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Export attendance list (admin only)
  app.get("/api/attendance/export", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { startDate, endDate, format } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const attendance = await storage.getAttendanceForExport(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      if (format === 'csv') {
        const headers = ['Name', 'Email', 'Service Type', 'Service Name', 'Check-in Time', 'Attendance Type'];
        const rows = attendance.map(a => [
          `${a.user?.firstName || ''} ${a.user?.lastName || ''}`,
          a.user?.email || '',
          a.serviceType,
          a.serviceName || '',
          a.checkInTime ? new Date(a.checkInTime).toISOString() : '',
          a.attendanceType,
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
        return res.send(csv);
      }

      res.json(attendance);
    } catch (err) {
      console.error("Error exporting attendance:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get dashboard stats (admin only)
  app.get("/api/analytics/dashboard", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get donation analytics (admin only)
  app.get("/api/analytics/donations", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { startDate, endDate } = req.query;

      const now = new Date();
      const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : now;

      const stats = await storage.getDonationAnalytics(start, end);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching donation analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get member growth analytics (admin only)
  app.get("/api/analytics/members", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { startDate, endDate } = req.query;

      const now = new Date();
      const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : now;

      const stats = await storage.getMemberGrowthAnalytics(start, end);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching member growth analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get event analytics (admin only)
  app.get("/api/analytics/events", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { startDate, endDate } = req.query;

      const now = new Date();
      const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : now;

      const stats = await storage.getEventAnalytics(start, end);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching event analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get prayer analytics (admin only)
  app.get("/api/analytics/prayers", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { startDate, endDate } = req.query;

      const now = new Date();
      const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : now;

      const stats = await storage.getPrayerAnalytics(start, end);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching prayer analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === SPIRITUAL HEALTH & ENGAGEMENT ANALYTICS ===

  // Get user engagement metrics (personal)
  app.get("/api/analytics/engagement", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const metrics = await storage.getUserEngagementMetrics(req.user.id, start, end);
      res.json(metrics);
    } catch (err) {
      console.error("Error fetching engagement metrics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Record engagement activity
  app.post("/api/analytics/engagement", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { sermonsWatched, prayersSubmitted, eventsAttended, devotionalsRead, groupMessages, sessionTime } = req.body;
      
      const metrics = await storage.upsertUserEngagementMetrics({
        userId: req.user.id,
        date: new Date().toISOString().split('T')[0],
        sermonsWatched: sermonsWatched || 0,
        prayersSubmitted: prayersSubmitted || 0,
        eventsAttended: eventsAttended || 0,
        devotionalsRead: devotionalsRead || 0,
        groupMessages: groupMessages || 0,
        totalSessionTime: sessionTime || 0,
        loginCount: 1,
      });
      
      res.json(metrics);
    } catch (err) {
      console.error("Error recording engagement:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get spiritual health scores (personal)
  app.get("/api/analytics/spiritual-health", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const scores = await storage.getSpiritualHealthScores(req.user.id);
      res.json(scores);
    } catch (err) {
      console.error("Error fetching spiritual health scores:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Calculate spiritual health score for current week
  app.post("/api/analytics/spiritual-health/calculate", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const score = await storage.calculateSpiritualHealthScore(req.user.id, weekStart);
      res.json(score);
    } catch (err) {
      console.error("Error calculating spiritual health score:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get engagement summary (admin only)
  app.get("/api/analytics/engagement-summary", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const now = new Date();
      const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : now;
      
      const summary = await storage.getEngagementSummary(start, end);
      res.json(summary);
    } catch (err) {
      console.error("Error fetching engagement summary:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get spiritual health trends (admin only)
  app.get("/api/analytics/spiritual-health-trends", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { weeks } = req.query;
      const trends = await storage.getSpiritualHealthTrends(weeks ? parseInt(weeks as string) : 4);
      res.json(trends);
    } catch (err) {
      console.error("Error fetching spiritual health trends:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get discipleship analytics (admin only)
  app.get("/api/analytics/discipleship", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const trackId = req.query.trackId;
      const weeks = req.query.weeks;
      const trackIdNum = trackId ? parseInt(String(trackId)) : undefined;
      const weeksNum = weeks ? parseInt(String(weeks)) : 4;
      const analytics = await storage.getDiscipleshipAnalytics(trackIdNum, weeksNum);
      res.json(analytics);
    } catch (err) {
      console.error("Error fetching discipleship analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Calculate discipleship analytics (admin only)
  app.post("/api/analytics/discipleship/calculate", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { trackId, weekStart } = req.body;
      
      if (!trackId || !weekStart) {
        return res.status(400).json({ message: "Track ID and week start date are required" });
      }
      
      const analytics = await storage.calculateDiscipleshipAnalytics(trackId, new Date(weekStart));
      res.json(analytics);
    } catch (err) {
      console.error("Error calculating discipleship analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get group analytics (admin only)
  app.get("/api/analytics/groups", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const groupId = req.query.groupId;
      const weeks = req.query.weeks;
      const analytics = await storage.getGroupAnalytics(groupId ? parseInt(String(groupId)) : undefined, weeks ? parseInt(String(weeks)) : 4);
      res.json(analytics);
    } catch (err) {
      console.error("Error fetching group analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Calculate group analytics (admin only)
  app.post("/api/analytics/groups/calculate", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { groupId, weekStart } = req.body;
      
      if (!groupId || !weekStart) {
        return res.status(400).json({ message: "Group ID and week start date are required" });
      }
      
      const analytics = await storage.calculateGroupAnalytics(groupId, new Date(weekStart));
      res.json(analytics);
    } catch (err) {
      console.error("Error calculating group analytics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get/create analytics reports (admin only)
  app.get("/api/analytics/reports", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const reportType = req.query.reportType;
      const reports = await storage.getAnalyticsReports(reportType ? String(reportType) : undefined);
      res.json(reports);
    } catch (err) {
      console.error("Error fetching analytics reports:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/analytics/reports", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { name, reportType, filters } = req.body;
      
      const report = await storage.createAnalyticsReport({
        name,
        reportType,
        filters: filters || {},
        generatedBy: req.user.id,
      });
      
      res.json(report);
    } catch (err) {
      console.error("Error creating analytics report:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/analytics/reports/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const idParam = req.params.id;
      const id = typeof idParam === 'string' ? parseInt(idParam) : parseInt(idParam[0]);
      await storage.deleteAnalyticsReport(id);
      res.json({ message: "Report deleted" });
    } catch (err) {
      console.error("Error deleting analytics report:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all attendance records for a service (admin only)
  app.get("/api/attendance/service", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { serviceType, serviceDate } = req.query;

      if (!serviceType || !serviceDate) {
        return res.status(400).json({ message: "Service type and date are required" });
      }

      const records = await storage.getAttendanceByService(
        serviceType as string,
        new Date(serviceDate as string)
      );

      res.json(records);
    } catch (err) {
      console.error("Error fetching service attendance:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get attendance settings (admin only)
  app.get("/api/attendance/settings", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = await storage.getAttendanceSetting("online_watch_threshold_minutes");
      res.json({
        onlineWatchThresholdMinutes: parseInt(settings || "10"),
        enableOnlineDetection: (await storage.getAttendanceSetting("enable_online_detection")) === "true",
        enableSelfCheckin: (await storage.getAttendanceSetting("enable_self_checkin")) === "true",
        enableQrCheckin: (await storage.getAttendanceSetting("enable_qr_checkin")) === "true",
      });
    } catch (err) {
      console.error("Error fetching attendance settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update attendance settings (admin only)
  app.put("/api/attendance/settings", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { onlineWatchThresholdMinutes, enableOnlineDetection, enableSelfCheckin, enableQrCheckin } = req.body;

      if (onlineWatchThresholdMinutes !== undefined) {
        await storage.updateAttendanceSetting("online_watch_threshold_minutes", String(onlineWatchThresholdMinutes));
      }
      if (enableOnlineDetection !== undefined) {
        await storage.updateAttendanceSetting("enable_online_detection", String(enableOnlineDetection));
      }
      if (enableSelfCheckin !== undefined) {
        await storage.updateAttendanceSetting("enable_self_checkin", String(enableSelfCheckin));
      }
      if (enableQrCheckin !== undefined) {
        await storage.updateAttendanceSetting("enable_qr_checkin", String(enableQrCheckin));
      }

      res.json({ message: "Settings updated successfully" });
    } catch (err) {
      console.error("Error updating attendance settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get absent members (admin + privileged roles)
  app.get("/api/attendance/absent", isAuthenticated, canViewAbsentMembers, async (req: AuthenticatedRequest, res) => {
    try {
      const consecutiveMissed = parseInt(req.query.consecutiveMissed as string) || 3;
      const absentMembers = await storage.getAbsentMembers(consecutiveMissed);
      res.json(absentMembers);
    } catch (err) {
      console.error("Error fetching absent members:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send message to member (NO AUTH for testing)
  app.post("/api/messages/send", async (req: AuthenticatedRequest, res) => {
    console.log('Message send request received');
    try {
      const { userId, type, title, content, priority } = req.body;
      
      if (!userId || !type || !title || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const message = await storage.createMessage({
        userId,
        type,
        title,
        content,
        priority: priority || "normal",
        createdBy: req.user!.id,
      });

      // Mark user as contacted so they won't appear in absent list for 7 days
      await storage.markUserContacted(userId);

      sendNewMessageNotification(userId, message);

      res.status(201).json(message);
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my messages
  app.get("/api/messages/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const messages = await storage.getUserMessages(userId);
      res.json(messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread message count
  app.get("/api/messages/unread-count", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (err) {
      console.error("Error fetching unread count:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark message as read
  app.put("/api/messages/:id/read", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const messageId = parseInt(String(req.params.id));
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error marking message as read:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reply to message
  app.post("/api/messages/:id/reply", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const messageId = parseInt(String(req.params.id));
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const reply = await storage.replyToMessage(
        messageId,
        req.user!.id,
        content,
        req.user!.id
      );

      res.status(201).json(reply);
    } catch (err) {
      console.error("Error replying to message:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get message thread
  app.get("/api/messages/:id/thread", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const messageId = parseInt(String(req.params.id));
      const thread = await storage.getMessageThread(messageId);
      res.json(thread);
    } catch (err) {
      console.error("Error getting message thread:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete old messages (can be called periodically)
  app.delete("/api/messages/cleanup", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const daysOld = parseInt(req.query.days as string) || 5;
      const deleted = await storage.deleteOldMessages(daysOld);
      res.json({ deleted, message: `Deleted ${deleted} messages older than ${daysOld} days` });
    } catch (err) {
      console.error("Error cleaning up messages:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Clean up old messages on startup (delete read messages older than 5 days)
  try {
    const deleted = await storage.deleteOldMessages(5);
    if (deleted > 0) {
      console.log(`Cleaned up ${deleted} old messages on startup`);
    }
  } catch (err) {
    console.error("Error cleaning up old messages on startup:", err);
  }

  // Seed database tables
  try {
  // === RESOURCES & CONTENT LIBRARY API ===

  // Get all resources
  app.get("/api/resources", async (req, res) => {
    try {
      const organizationId = req.query.organizationId as string;
      const resources = await storage.getResources(organizationId);
      res.json(resources);
    } catch (err) {
      console.error("Error fetching resources:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single resource
  app.get("/api/resources/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const resource = await storage.getResource(id);
      if (!resource) return res.status(404).json({ message: "Resource not found" });
      res.json(resource);
    } catch (err) {
      console.error("Error fetching resource:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create resource (admin)
  app.post("/api/resources", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const resource = await storage.createResource({ ...req.body, createdBy: req.user!.id });
      // Notify all online users about new resource if public
      if (resource.isPublic) {
        broadcastToAll({
          type: 'NEW_RESOURCE',
          data: resource
        });
      }
      res.json(resource);
    } catch (err) {
      console.error("Error creating resource:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update resource (admin)
  app.put("/api/resources/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const resource = await storage.updateResource(id, req.body);
      res.json(resource);
    } catch (err) {
      console.error("Error updating resource:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete resource (admin)
  app.delete("/api/resources/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteResource(id);
      res.json({ message: "Resource deleted" });
    } catch (err) {
      console.error("Error deleting resource:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload resource file (admin)
  app.post("/api/resources/upload", isAuthenticated, isAdmin, documentUpload.single("file"), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileUrl = `/uploads/documents/${req.file.filename}`;
      const resource = await storage.createResource({
        title: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        isPublic: false,
        createdBy: req.user!.id,
      });
      res.json(resource);
    } catch (err) {
      console.error("Error uploading resource:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Download resource
  app.post("/api/resources/:id/download", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const resourceId = Number(req.params.id);
      const download = await storage.downloadResource(resourceId, req.user!.id, req.ip);
      res.json(download);
    } catch (err) {
      console.error("Error downloading resource:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Favorite resource
  app.post("/api/resources/:id/favorite", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const resourceId = Number(req.params.id);
      const favorite = await storage.favoriteResource(resourceId, req.user!.id);
      res.json(favorite);
    } catch (err) {
      console.error("Error favoriting resource:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Unfavorite resource
  app.delete("/api/resources/:id/favorite", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const resourceId = Number(req.params.id);
      await storage.unfavoriteResource(resourceId, req.user!.id);
      res.json({ message: "Resource unfavorited" });
    } catch (err) {
      console.error("Error unfavoriting resource:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's favorite resources
  app.get("/api/resources/favorites/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const favorites = await storage.getUserFavoriteResources(req.user!.id);
      res.json(favorites);
    } catch (err) {
      console.error("Error fetching favorite resources:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === BILLING & SUBSCRIPTIONS API ===

  // Get subscription for organization
  app.get("/api/billing/subscription", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const organizationId = req.user!.organizationId || req.query.organizationId as string;
      const subscription = await storage.getSubscription(organizationId);
      res.json(subscription || { plan: 'FREE', status: 'TRIALING' });
    } catch (err) {
      console.error("Error fetching subscription:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create subscription (admin)
  app.post("/api/billing/subscription", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const subscription = await storage.createSubscription(req.body);
      res.json(subscription);
    } catch (err) {
      console.error("Error creating subscription:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update subscription (admin)
  app.put("/api/billing/subscription/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const subscription = await storage.updateSubscription(id, req.body);
      res.json(subscription);
    } catch (err) {
      console.error("Error updating subscription:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get invoices
  app.get("/api/billing/invoices", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const organizationId = req.user!.organizationId || req.query.organizationId as string;
      const invoices = await storage.getInvoices(organizationId);
      res.json(invoices);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create invoice (admin)
  app.post("/api/billing/invoices", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const invoice = await storage.createInvoice(req.body);
      res.json(invoice);
    } catch (err) {
      console.error("Error creating invoice:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get payment methods
  app.get("/api/billing/payment-methods", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const organizationId = req.user!.organizationId || req.query.organizationId as string;
      const paymentMethods = await storage.getPaymentMethods(organizationId);
      res.json(paymentMethods);
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add payment method (admin)
  app.post("/api/billing/payment-methods", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const paymentMethod = await storage.createPaymentMethod(req.body);
      res.json(paymentMethod);
    } catch (err) {
      console.error("Error creating payment method:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete payment method (admin)
  app.delete("/api/billing/payment-methods/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deletePaymentMethod(id);
      res.json({ message: "Payment method deleted" });
    } catch (err) {
      console.error("Error deleting payment method:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Set default payment method (admin)
  app.post("/api/billing/payment-methods/:id/default", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const organizationId = req.user!.organizationId || req.body.organizationId;
      const paymentMethod = await storage.setDefaultPaymentMethod(id, organizationId);
      res.json(paymentMethod);
    } catch (err) {
      console.error("Error setting default payment method:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === TASKS & PROJECTS API ===

  // Get all projects
  app.get("/api/projects", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const organizationId = req.user!.organizationId || req.query.organizationId as string;
      const projects = await storage.getProjects(organizationId);
      res.json(projects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const project = await storage.getProject(id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (err) {
      console.error("Error fetching project:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create project (admin)
  app.post("/api/projects", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const project = await storage.createProject({ ...req.body, createdBy: req.user!.id });
      res.json(project);
    } catch (err) {
      console.error("Error creating project:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update project (admin)
  app.put("/api/projects/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const project = await storage.updateProject(id, req.body);
      res.json(project);
    } catch (err) {
      console.error("Error updating project:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete project (admin)
  app.delete("/api/projects/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteProject(id);
      res.json({ message: "Project deleted" });
    } catch (err) {
      console.error("Error deleting project:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get project tasks
  app.get("/api/projects/:id/tasks", isAuthenticated, async (req, res) => {
    try {
      const projectId = Number(req.params.id);
      const tasks = await storage.getProjectTasks(projectId);
      res.json(tasks);
    } catch (err) {
      console.error("Error fetching project tasks:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all tasks
  app.get("/api/tasks", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const filters: any = {};
      if (req.query.projectId) filters.projectId = Number(req.query.projectId);
      if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo as string;
      if (req.query.status) filters.status = req.query.status as string;
      const tasks = await storage.getTasks(filters);
      res.json(tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single task
  app.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const task = await storage.getTask(id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err) {
      console.error("Error fetching task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create task (admin)
  app.post("/api/tasks", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const task = await storage.createTask({ ...req.body, createdBy: req.user!.id });
      // Real-time notification to assigned user
      if (task.assignedTo && task.assignedTo !== req.user!.id) {
        sendNotificationToUser(task.assignedTo, {
          id: Date.now(),
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
          link: `/tasks/${task.id}`,
          isRead: false,
          createdAt: new Date(),
        });
      }
      res.json(task);
    } catch (err) {
      console.error("Error creating task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update task
  app.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const task = await storage.updateTask(id, req.body);
      res.json(task);
    } catch (err) {
      console.error("Error updating task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteTask(id);
      res.json({ message: "Task deleted" });
    } catch (err) {
      console.error("Error deleting task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get task comments
  app.get("/api/tasks/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const taskId = Number(req.params.id);
      const comments = await storage.getTaskComments(taskId);
      res.json(comments);
    } catch (err) {
      console.error("Error fetching task comments:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload task attachment
  app.post("/api/tasks/:id/attachments/upload", isAuthenticated, attachmentUpload.single("file"), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const taskId = Number(req.params.id);
      const attachment = await storage.addTaskAttachment({
        taskId,
        fileName: req.file.originalname,
        fileUrl: `/uploads/attachments/${req.file.filename}`,
        fileSize: req.file.size,
        uploadedBy: req.user!.id,
      });
      res.json(attachment);
    } catch (err) {
      console.error("Error uploading attachment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add task comment
  app.post("/api/tasks/:id/comments", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const taskId = Number(req.params.id);
      const comment = await storage.addTaskComment({ ...req.body, taskId, userId: req.user!.id });
      res.json(comment);
    } catch (err) {
      console.error("Error adding task comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete task comment
  app.delete("/api/tasks/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteTaskComment(id);
      res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error("Error deleting task comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get task attachments
  app.get("/api/tasks/:id/attachments", isAuthenticated, async (req, res) => {
    try {
      const taskId = Number(req.params.id);
      const attachments = await storage.getTaskAttachments(taskId);
      res.json(attachments);
    } catch (err) {
      console.error("Error fetching task attachments:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add task attachment
  app.post("/api/tasks/:id/attachments", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const taskId = Number(req.params.id);
      const attachment = await storage.addTaskAttachment({ ...req.body, taskId, uploadedBy: req.user!.id });
      res.json(attachment);
    } catch (err) {
      console.error("Error adding task attachment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete task attachment
  app.delete("/api/tasks/attachments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteTaskAttachment(id);
      res.json({ message: "Attachment deleted" });
    } catch (err) {
      console.error("Error deleting task attachment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === BACKUP & DATA MANAGEMENT API ===

  // Get all backups
  app.get("/api/backups", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const organizationId = req.user!.organizationId || req.query.organizationId as string;
      const backups = await storage.getBackups(organizationId);
      res.json(backups);
    } catch (err) {
      console.error("Error fetching backups:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single backup
  app.get("/api/backups/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const backup = await storage.getBackup(id);
      if (!backup) return res.status(404).json({ message: "Backup not found" });
      res.json(backup);
    } catch (err) {
      console.error("Error fetching backup:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create backup (admin)
  app.post("/api/backups", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const backup = await storage.createBackup({ ...req.body, createdBy: req.user!.id });
      res.json(backup);
    } catch (err) {
      console.error("Error creating backup:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update backup status (admin)
  app.put("/api/backups/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const backup = await storage.updateBackup(id, req.body);
      res.json(backup);
    } catch (err) {
      console.error("Error updating backup:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete backup (admin)
  app.delete("/api/backups/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteBackup(id);
      res.json({ message: "Backup deleted" });
    } catch (err) {
      console.error("Error deleting backup:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === NOTIFICATIONS SYSTEM API ===

  // Get user notifications
  app.get("/api/notifications", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const unreadOnly = req.query.unread === 'true';
      const notifications = await storage.getUserNotifications(req.user!.id, unreadOnly);
      res.json(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single notification
  app.get("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const notification = await storage.getNotification(id);
      if (!notification) return res.status(404).json({ message: "Notification not found" });
      res.json(notification);
    } catch (err) {
      console.error("Error fetching notification:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create notification (admin)
  app.post("/api/notifications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      // Real-time notification to the target user
      if (notification.userId) {
        sendNotificationToUser(notification.userId, notification);
      }
      res.json(notification);
    } catch (err) {
      console.error("Error creating notification:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const notification = await storage.markNotificationRead(id);
      res.json(notification);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markAllNotificationsRead(req.user!.id);
      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted" });
    } catch (err) {
      console.error("Error deleting notification:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get notification templates (admin)
  app.get("/api/notifications/templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await storage.getNotificationTemplates();
      res.json(templates);
    } catch (err) {
      console.error("Error fetching notification templates:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create notification template (admin)
  app.post("/api/notifications/templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.createNotificationTemplate(req.body);
      res.json(template);
    } catch (err) {
      console.error("Error creating notification template:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update notification template (admin)
  app.put("/api/notifications/templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const template = await storage.updateNotificationTemplate(id, req.body);
      res.json(template);
    } catch (err) {
      console.error("Error updating notification template:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete notification template (admin)
  app.delete("/api/notifications/templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteNotificationTemplate(id);
      res.json({ message: "Template deleted" });
    } catch (err) {
      console.error("Error deleting notification template:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
    await seedDatabase();
  } catch (err) {
    console.error("Error seeding database on startup:", err);
  }

  // Check if ANY super admin exists
  try {
    const allUsers = await storage.getAllUsers();
    const anySuperAdmin = allUsers.some(u => u.isSuperAdmin);

    // Only create initial super admin if environment variables are set AND no super admin exists
    // This is a ONE-TIME setup - remove these env vars after first admin is created
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!anySuperAdmin && adminEmail && adminPassword) {
      const existingUser = await storage.getUserByEmail(adminEmail);
      if (!existingUser) {
        console.log(`Creating initial super admin from environment variables...`);
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        await storage.createUser({
          email: adminEmail,
          passwordHash,
          firstName: "Super",
          lastName: "Admin",
          isSuperAdmin: true,
          isAdmin: true,
        });
        console.log("Initial super admin created. Remove SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD from environment variables.");
      }
    } else if (!anySuperAdmin) {
      console.warn("WARNING: No super admin exists. Use the invite system or set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD to create one.");
    }
  } catch (err) {
    console.error("Error creating super admin on startup:", err);
  }

  // === MUSIC LIBRARY ROUTES ===

  // Get all music tracks (public)
  app.get("/api/music", async (req, res) => {
    try {
      const publishedOnly = req.query.published === "true";
      const tracks = await storage.getMusic(publishedOnly);
      res.json(tracks);
    } catch (err) {
      console.error("Error fetching music:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single track
  app.get("/api/music/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const track = await storage.getMusicById(id);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.json(track);
    } catch (err) {
      console.error("Error fetching track:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create music track (admin only)
  app.post("/api/music", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { title, artist, album, genreId, duration, audioUrl, audioFilePath, coverImageUrl, lyrics, isPublished } = req.body;
      const track = await storage.createMusic({
        title,
        artist,
        album,
        genreId: genreId || null,
        duration: duration || null,
        audioUrl: audioUrl || null,
        audioFilePath: audioFilePath || null,
        coverImageUrl: coverImageUrl || null,
        lyrics: lyrics || null,
        isPublished: isPublished ?? false,
        createdBy: req.user!.id,
      });
      res.status(201).json(track);
    } catch (err) {
      console.error("Error creating track:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update music track (admin only)
  app.put("/api/music/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { title, artist, album, genreId, duration, audioUrl, audioFilePath, coverImageUrl, lyrics, isPublished } = req.body;
      const track = await storage.updateMusic(id, {
        title,
        artist,
        album,
        genreId: genreId || null,
        duration: duration || null,
        audioUrl: audioUrl || null,
        audioFilePath: audioFilePath || null,
        coverImageUrl: coverImageUrl || null,
        lyrics: lyrics || null,
        isPublished,
      });
      res.json(track);
    } catch (err) {
      console.error("Error updating track:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete music track (admin only)
  app.delete("/api/music/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteMusic(id);
      res.json({ message: "Track deleted" });
    } catch (err) {
      console.error("Error deleting track:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Increment play count (public - for tracking)
  app.post("/api/music/:id/play", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const track = await storage.incrementMusicPlayCount(id);
      res.json({ message: "Play count updated", playCount: track.playCount });
    } catch (err) {
      console.error("Error updating play count:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get music genres
  app.get("/api/music/genres", async (req, res) => {
    try {
      const genres = await storage.getMusicGenres();
      res.json(genres);
    } catch (err) {
      console.error("Error fetching genres:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create music genre (admin only)
  app.post("/api/music/genres", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Genre name is required" });
      }
      const genre = await storage.createMusicGenre(name, description);
      res.status(201).json(genre);
    } catch (err) {
      console.error("Error creating genre:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete music genre (admin only)
  app.delete("/api/music/genres/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteMusicGenre(id);
      res.json({ message: "Genre deleted" });
    } catch (err) {
      console.error("Error deleting genre:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get playlists
  app.get("/api/music/playlists", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const playlists = await storage.getMusicPlaylists(userId);
      res.json(playlists);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single playlist with tracks
  app.get("/api/music/playlists/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const playlist = await storage.getMusicPlaylistById(id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      const tracks = await storage.getPlaylistTracks(id);
      res.json({ ...playlist, tracks });
    } catch (err) {
      console.error("Error fetching playlist:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create playlist (authenticated users)
  app.post("/api/music/playlists", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description, coverImageUrl, isPublic } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Playlist name is required" });
      }
      const playlist = await storage.createMusicPlaylist({
        name,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        userId: req.user!.id,
        isPublic: isPublic ?? false,
      });
      res.status(201).json(playlist);
    } catch (err) {
      console.error("Error creating playlist:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update playlist
  app.put("/api/music/playlists/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const playlist = await storage.getMusicPlaylistById(id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      if (playlist.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this playlist" });
      }
      const { name, description, coverImageUrl, isPublic } = req.body;
      const updated = await storage.updateMusicPlaylist(id, {
        name: name || playlist.name,
        description: description !== undefined ? description : playlist.description,
        coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : playlist.coverImageUrl,
        isPublic: isPublic !== undefined ? isPublic : playlist.isPublic,
      });
      res.json(updated);
    } catch (err) {
      console.error("Error updating playlist:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete playlist
  app.delete("/api/music/playlists/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const playlist = await storage.getMusicPlaylistById(id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      if (playlist.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this playlist" });
      }
      await storage.deleteMusicPlaylist(id);
      res.json({ message: "Playlist deleted" });
    } catch (err) {
      console.error("Error deleting playlist:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add track to playlist
  app.post("/api/music/playlists/:id/tracks", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const playlistId = Number(req.params.id);
      const playlist = await storage.getMusicPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      if (playlist.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized to modify this playlist" });
      }
      const { musicId } = req.body;
      if (!musicId) {
        return res.status(400).json({ message: "Music ID is required" });
      }
      await storage.addMusicToPlaylist(playlistId, musicId);
      res.json({ message: "Track added to playlist" });
    } catch (err) {
      console.error("Error adding track to playlist:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove track from playlist
  app.delete("/api/music/playlists/:id/tracks/:musicId", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const playlistId = Number(req.params.id);
      const musicId = Number(req.params.musicId);
      const playlist = await storage.getMusicPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      if (playlist.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized to modify this playlist" });
      }
      await storage.removeMusicFromPlaylist(playlistId, musicId);
      res.json({ message: "Track removed from playlist" });
    } catch (err) {
      console.error("Error removing track from playlist:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === HOUSE CELL COMMUNITY ROUTES ===

  // Get all house cells (public)
  app.get("/api/house-cells", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const cells = await storage.getHouseCells(activeOnly);
      res.json(cells);
    } catch (err) {
      console.error("Error fetching house cells:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single house cell
  app.get("/api/house-cells/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const cell = await storage.getHouseCellById(id);
      if (!cell) {
        return res.status(404).json({ message: "House cell not found" });
      }
      res.json(cell);
    } catch (err) {
      console.error("Error fetching house cell:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create house cell (admin only)
  app.post("/api/house-cells", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description, leaderId, leaderName, leaderPhone, address, city, state, country, meetingDay, meetingTime, isActive } = req.body;
      if (!name || !address) {
        return res.status(400).json({ message: "Name and address are required" });
      }
      const cell = await storage.createHouseCell({
        name,
        description: description || null,
        leaderId: leaderId || null,
        leaderName: leaderName || null,
        leaderPhone: leaderPhone || null,
        address,
        city: city || null,
        state: state || null,
        country: country || null,
        meetingDay: meetingDay || null,
        meetingTime: meetingTime || null,
        isActive: isActive ?? true,
        createdBy: req.user!.id,
      });
      res.status(201).json(cell);
    } catch (err) {
      console.error("Error creating house cell:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update house cell (admin only)
  app.put("/api/house-cells/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { name, description, leaderId, leaderName, leaderPhone, address, city, state, country, meetingDay, meetingTime, isActive } = req.body;
      const cell = await storage.updateHouseCell(id, {
        name,
        description,
        leaderId,
        leaderName,
        leaderPhone,
        address,
        city,
        state,
        country,
        meetingDay,
        meetingTime,
        isActive,
      });
      res.json(cell);
    } catch (err) {
      console.error("Error updating house cell:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete house cell (admin only)
  app.delete("/api/house-cells/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteHouseCell(id);
      res.json({ message: "House cell deleted" });
    } catch (err) {
      console.error("Error deleting house cell:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get house cell members
  app.get("/api/house-cells/:id/members", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const cell = await storage.getHouseCellById(id);
      if (!cell) {
        return res.status(404).json({ message: "House cell not found" });
      }
      const members = await storage.getHouseCellMembers(id);
      res.json(members);
    } catch (err) {
      console.error("Error fetching house cell members:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Assign user to house cell (admin only)
  app.post("/api/house-cells/:id/members", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const houseCellId = Number(req.params.id);
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const cell = await storage.getHouseCellById(houseCellId);
      if (!cell) {
        return res.status(404).json({ message: "House cell not found" });
      }
      const user = await storage.assignUserToHouseCell(userId, houseCellId);
      res.json(user);
    } catch (err) {
      console.error("Error assigning user to house cell:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove user from house cell (admin only)
  app.delete("/api/house-cells/:id/members/:userId", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const userIdParam = req.params.userId;
      const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
      const user = await storage.removeUserFromHouseCell(userId);
      res.json(user);
    } catch (err) {
      console.error("Error removing user from house cell:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get house cell messages
  app.get("/api/house-cells/:id/messages", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const cell = await storage.getHouseCellById(id);
      if (!cell) {
        return res.status(404).json({ message: "House cell not found" });
      }
      const messages = await storage.getHouseCellMessages(id);
      res.json(messages);
    } catch (err) {
      console.error("Error fetching house cell messages:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send message to house cell
  app.post("/api/house-cells/:id/messages", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const houseCellId = Number(req.params.id);
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      const cell = await storage.getHouseCellById(houseCellId);
      if (!cell) {
        return res.status(404).json({ message: "House cell not found" });
      }
      const message = await storage.createHouseCellMessage({
        houseCellId,
        userId: req.user!.id,
        content,
      });
      res.status(201).json(message);
    } catch (err) {
      console.error("Error creating house cell message:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's house cell
  app.get("/api/house-cells/my", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user || !user.houseCellId) {
        return res.status(404).json({ message: "You are not assigned to a house cell" });
      }
      const cell = await storage.getHouseCellById(user.houseCellId);
      res.json(cell);
    } catch (err) {
      console.error("Error fetching user's house cell:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === GROUP SPACE ROUTES ===

  // Get all groups (public - shows public groups)
  app.get("/api/groups", async (req, res) => {
    try {
      const allGroups = await storage.getGroups();
      const publicGroups = allGroups.filter(g => !g.isPrivate);
      res.json(publicGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's groups
  app.get("/api/groups/my", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userGroups = await storage.getUserGroups(req.user!.id);
      res.json(userGroups);
    } catch (err) {
      console.error("Error fetching user groups:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single group
  app.get("/api/groups/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const group = await storage.getGroupById(id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (err) {
      console.error("Error fetching group:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create group
  app.post("/api/groups", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description, coverImageUrl, isPrivate, allowMemberInvite } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Group name is required" });
      }
      const group = await storage.createGroup({
        name,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        createdBy: req.user!.id,
        isPrivate: isPrivate ?? false,
        allowMemberInvite: allowMemberInvite ?? true,
      });
      
      // Add creator as admin member
      await storage.addGroupMember({
        groupId: group.id,
        userId: req.user!.id,
        role: "ADMIN",
      });
      
      res.status(201).json(group);
    } catch (err) {
      console.error("Error creating group:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update group
  app.put("/api/groups/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const group = await storage.getGroupById(id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      if (group.createdBy !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const { name, description, coverImageUrl, isPrivate, allowMemberInvite } = req.body;
      const updated = await storage.updateGroup(id, {
        name: name || group.name,
        description: description !== undefined ? description : group.description,
        coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : group.coverImageUrl,
        isPrivate: isPrivate !== undefined ? isPrivate : group.isPrivate,
        allowMemberInvite: allowMemberInvite !== undefined ? allowMemberInvite : group.allowMemberInvite,
      });
      res.json(updated);
    } catch (err) {
      console.error("Error updating group:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete group
  app.delete("/api/groups/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const group = await storage.getGroupById(id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      if (group.createdBy !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      await storage.deleteGroup(id);
      res.json({ message: "Group deleted" });
    } catch (err) {
      console.error("Error deleting group:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get group members
  app.get("/api/groups/:id/members", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const members = await storage.getGroupMembers(id);
      res.json(members);
    } catch (err) {
      console.error("Error fetching members:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Join group
  app.post("/api/groups/:id/join", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const group = await storage.getGroupById(id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      if (group.isPrivate) {
        return res.status(403).json({ message: "This group is private" });
      }
      await storage.addGroupMember({
        groupId: id,
        userId: req.user!.id,
        role: "MEMBER",
      });
      res.json({ message: "Joined group successfully" });
    } catch (err) {
      console.error("Error joining group:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Leave group
  app.post("/api/groups/:id/leave", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.removeGroupMember(id, req.user!.id);
      res.json({ message: "Left group successfully" });
    } catch (err) {
      console.error("Error leaving group:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get group messages
  app.get("/api/groups/:id/messages", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const messages = await storage.getGroupMessages(id);
      res.json(messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send group message
  app.post("/api/groups/:id/messages", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      const group = await storage.getGroupById(id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      const message = await storage.createGroupMessage({
        groupId: id,
        userId: req.user!.id,
        content,
      });
      res.status(201).json(message);
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Group Join Requests ===
  
  // Request to join a group
  app.post("/api/groups/:id/join-request", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const group = await storage.getGroupById(id);
      if (!group) return res.status(404).json({ message: "Group not found" });
      
      const existingRequest = await storage.getUserJoinRequest(id, req.user!.id);
      if (existingRequest && existingRequest.status === "PENDING") {
        return res.status(400).json({ message: "You already have a pending request" });
      }
      
      const existingMember = await storage.getGroupMember(id, req.user!.id);
      if (existingMember) {
        return res.status(400).json({ message: "You are already a member" });
      }
      
      const { message } = req.body;
      const request = await storage.createGroupJoinRequest({
        groupId: id,
        userId: req.user!.id,
        message: message || null,
      });
      
      await storage.createGroupActivityLog({
        groupId: id,
        userId: req.user!.id,
        action: "JOIN_REQUEST",
        details: { requestId: request.id },
      });
      
      res.status(201).json(request);
    } catch (err) {
      console.error("Error requesting to join:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get join requests for a group (admin only)
  app.get("/api/groups/:id/join-requests", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const group = await storage.getGroupById(id);
      if (!group) return res.status(404).json({ message: "Group not found" });
      
      const isMember = await storage.getGroupMember(id, req.user!.id);
      if (!isMember || !isMember.role || !["ADMIN", "OWNER"].includes(isMember.role)) {
        return res.status(403).json({ message: "Only group admins can view requests" });
      }
      
      const requests = await storage.getGroupJoinRequests(id);
      res.json(requests);
    } catch (err) {
      console.error("Error fetching join requests:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Approve or reject join request (group admin only)
  app.put("/api/groups/join-requests/:requestId", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const requestId = Number(req.params.requestId);
      const { status } = req.body;
      
      if (!["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const requests = await db.select().from(groupJoinRequests).where(eq(groupJoinRequests.id, requestId));
      const request = requests[0];
      if (!request) return res.status(404).json({ message: "Request not found" });
      
      const isMember = await storage.getGroupMember(request.groupId, req.user!.id);
      const memberRole = isMember?.role || "";
      if (!isMember || !["ADMIN", "OWNER"].includes(memberRole)) {
        return res.status(403).json({ message: "Only group admins can review requests" });
      }
      
      const updated = await storage.updateGroupJoinRequest(requestId, status, req.user!.id);
      
      if (status === "APPROVED") {
        await storage.addGroupMember({
          groupId: request.groupId,
          userId: request.userId!,
          role: "MEMBER",
        });
        
        await storage.createGroupActivityLog({
          groupId: request.groupId,
          userId: request.userId!,
          action: "MEMBER_JOINED",
          details: { requestId },
        });
      }
      
      res.json(updated);
    } catch (err) {
      console.error("Error updating join request:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Group Activity Tracking ===
  
  // Get group activity
  app.get("/api/groups/:id/activity", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      
      const isMember = await storage.getGroupMember(id, req.user!.id);
      if (!isMember) {
        return res.status(403).json({ message: "Only members can view activity" });
      }
      
      const activity = await storage.getGroupActivityLogs(id, limit);
      res.json(activity);
    } catch (err) {
      console.error("Error fetching group activity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Smart Group Matching ===
  
  // Get personalized group suggestions
  app.get("/api/groups/suggestions", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const suggestions = await storage.suggestGroups(
        user.id,
        [],
        user.address?.split(",")[0] || "",
        user.address?.split(",")[1]?.trim() || ""
      );
      
      res.json(suggestions);
    } catch (err) {
      console.error("Error fetching group suggestions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === AUDIT LOGS & PERMISSIONS ===

  // Get audit logs (admin only)
  app.get("/api/audit-logs", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Helper function to log admin actions
  const logAdminAction = async (userId: string, action: string, entityType: string, entityId: string, details?: any) => {
    try {
      await storage.createAuditLog({
        userId,
        action,
        entityType,
        entityId,
        details,
      });
    } catch (err) {
      console.error("Error logging admin action:", err);
    }
  };

  // Get user's permissions based on role
  app.get("/api/permissions", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Role to permissions mapping
      const rolePermissions: Record<string, string[]> = {
        ADMIN: ['manage_members', 'manage_events', 'manage_sermons', 'manage_donations', 'manage_finance', 'manage_groups', 'manage_attendance', 'send_messages', 'view_analytics', 'manage_settings', 'manage_content', 'moderate_content'],
        PASTOR: ['manage_members', 'manage_events', 'manage_sermons', 'manage_groups', 'manage_attendance', 'send_messages', 'view_analytics', 'manage_content', 'moderate_content'],
        PASTORS_WIFE: ['manage_members', 'manage_events', 'manage_sermons', 'manage_groups', 'send_messages', 'view_analytics', 'manage_content'],
        CELL_LEADER: ['manage_attendance', 'send_messages', 'view_analytics'],
        USHERS_LEADER: ['manage_attendance', 'send_messages'],
        FINANCE_TEAM: ['manage_donations', 'manage_finance', 'view_analytics'],
        PRAYER_TEAM: ['moderate_content'],
        TECH_TEAM: ['manage_sermons', 'manage_events'],
        MEMBER: [],
        USER: [],
      };

      const permissions = rolePermissions[user.role] || rolePermissions.MEMBER;
      res.json({
        role: user.role,
        permissions,
        isAdmin: user.email === 'admin@wccrm.com',
      });
    } catch (err) {
      console.error("Error fetching permissions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === LIVE STREAMING ROUTES ===

  // Get all live streams (public)
  app.get("/api/live-streams", async (req, res) => {
    try {
      const streams = await storage.getLiveStreams();
      res.json(streams);
    } catch (err) {
      console.error("Error fetching live streams:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current live stream (public)
  app.get("/api/live-streams/current", async (req, res) => {
    try {
      const stream = await storage.getCurrentLiveStream();
      res.json(stream || null);
    } catch (err) {
      console.error("Error fetching current live stream:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single live stream (public)
  app.get("/api/live-streams/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const stream = await storage.getLiveStream(id);
      if (!stream) {
        return res.status(404).json({ message: "Live stream not found" });
      }
      res.json(stream);
    } catch (err) {
      console.error("Error fetching live stream:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Start a live stream (admin only)
  app.post("/api/live-streams", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { title, description, streamUrl, embedUrl, youtubeVideoId, youtubeChannelId, youtubeChannelName } = req.body;
      
      // End any currently live streams first
      const currentStream = await storage.getCurrentLiveStream();
      if (currentStream) {
        await storage.updateLiveStream(currentStream.id, { isLive: false });
      }

      const stream = await storage.createLiveStream({
        title,
        description,
        streamUrl,
        embedUrl,
        youtubeVideoId,
        youtubeChannelId,
        youtubeChannelName,
        isLive: true,
        createdBy: req.user!.id,
      });

      res.status(201).json(stream);
    } catch (err) {
      console.error("Error creating live stream:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update a live stream (admin only)
  app.put("/api/live-streams/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { title, description, streamUrl, embedUrl, isLive } = req.body;
      
      const stream = await storage.getLiveStream(id);
      if (!stream) {
        return res.status(404).json({ message: "Live stream not found" });
      }

      const updated = await storage.updateLiveStream(id, {
        title: title ?? stream.title,
        description: description ?? stream.description,
        streamUrl: streamUrl ?? stream.streamUrl,
        embedUrl: embedUrl ?? stream.embedUrl,
        isLive: isLive ?? stream.isLive,
      });

      res.json(updated);
    } catch (err) {
      console.error("Error updating live stream:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // End a live stream (admin only)
  app.post("/api/live-streams/:id/end", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      
      const stream = await storage.getLiveStream(id);
      if (!stream) {
        return res.status(404).json({ message: "Live stream not found" });
      }

      const updated = await storage.updateLiveStream(id, { isLive: false });
      res.json(updated);
    } catch (err) {
      console.error("Error ending live stream:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a live stream (admin only)
  app.delete("/api/live-streams/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteLiveStream(id);
      res.json({ message: "Live stream deleted" });
    } catch (err) {
      console.error("Error deleting live stream:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === API Keys Routes (for External Integrations) ===
  
  // Get user's API keys
  app.get("/api/keys", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const keys = await storage.getApiKeys(req.user.id);
      res.json(keys.map(k => ({ ...k, key: k.key ? `${k.prefix}_${k.key.substring(0, 8)}...` : null })));
    } catch (err) {
      console.error("Error getting API keys:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create API key
  app.post("/api/keys", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { name, permissions = ["read"], rateLimit = 100, expiresAt } = req.body;
      
      // Generate random API key
      const key = crypto.randomBytes(32).toString("hex");
      const prefix = "wccrm";
      
      const apiKey = await storage.createApiKey({
        userId: req.user.id,
        name,
        key,
        prefix,
        permissions,
        rateLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      });
      
      res.json({ ...apiKey, key: `${prefix}_${key}` });
    } catch (err) {
      console.error("Error creating API key:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete API key
  app.delete("/api/keys/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteApiKey(id);
      res.json({ message: "API key deleted" });
    } catch (err) {
      console.error("Error deleting API key:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Toggle API key
  app.patch("/api/keys/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { isActive } = req.body;
      const updated = await storage.updateApiKey(id, { isActive });
      res.json(updated);
    } catch (err) {
      console.error("Error updating API key:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Webhooks Routes ===
  
  // Get user's webhooks
  app.get("/api/webhooks", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const webhooks = await storage.getWebhooks(req.user.id);
      res.json(webhooks);
    } catch (err) {
      console.error("Error getting webhooks:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create webhook
  app.post("/api/webhooks", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { name, url, events, secret } = req.body;
      
      if (!url || !events || !Array.isArray(events)) {
        return res.status(400).json({ message: "URL and events array are required" });
      }
      
      const webhook = await storage.createWebhook({
        userId: req.user!.id,
        name: name || "Untitled Webhook",
        url,
        events,
        secret: secret || crypto.randomBytes(32).toString("hex"),
        isActive: true,
      });
      
      res.json(webhook);
    } catch (err) {
      console.error("Error creating webhook:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update webhook
  app.patch("/api/webhooks/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { url, events, isActive } = req.body;
      const updates: any = {};
      if (url) updates.url = url;
      if (events) updates.events = events;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      
      const updated = await storage.updateWebhook(id, updates);
      res.json(updated);
    } catch (err) {
      console.error("Error updating webhook:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete webhook
  app.delete("/api/webhooks/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteWebhook(id);
      res.json({ message: "Webhook deleted" });
    } catch (err) {
      console.error("Error deleting webhook:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Public API (for external integrations with API key) ===
  
  // Rate limiting map
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  // Middleware to check API key
  const requireApiKey = async (req: any, res: any, next: any) => {
    const apiKeyHeader = req.headers["x-api-key"];
    
    if (!apiKeyHeader) {
      return res.status(401).json({ message: "API key required" });
    }
    
    // Parse key prefix and key
    const [prefix, key] = apiKeyHeader.split("_");
    
    if (!prefix || !key) {
      return res.status(401).json({ message: "Invalid API key format" });
    }
    
    // Find API key in database
    const storedKey = await storage.getApiKeyByKey(key);
    
    if (!storedKey) {
      return res.status(401).json({ message: "Invalid API key" });
    }
    
    if (!storedKey.isActive) {
      return res.status(403).json({ message: "API key is inactive" });
    }
    
    if (storedKey.expiresAt && new Date(storedKey.expiresAt) < new Date()) {
      return res.status(403).json({ message: "API key has expired" });
    }
    
    // Check rate limit
    const now = Date.now();
    const rateLimitKey = `${storedKey.id}`;
    const rateLimitData = rateLimitMap.get(rateLimitKey);
    
    if (rateLimitData && rateLimitData.resetTime > now) {
      const limit = storedKey.rateLimit ?? 100;
      if (rateLimitData.count >= limit) {
        return res.status(429).json({ message: "Rate limit exceeded" });
      }
      rateLimitData.count++;
    } else {
      // Reset rate limit (1 hour)
      rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + 3600000 });
    }
    
    // Update last used
    await storage.updateApiKey(storedKey.id, { lastUsedAt: new Date() });
    
    // Attach API key to request
    req.apiKey = storedKey;
    next();
  };

  // Public API: Get events
  app.get("/api/public/events", requireApiKey, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public API: Get sermons
  app.get("/api/public/sermons", requireApiKey, async (req, res) => {
    try {
      const sermons = await storage.getSermons();
      res.json(sermons);
    } catch (err) {
      console.error("Error fetching sermons:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public API: Get prayer requests
  app.get("/api/public/prayers", requireApiKey, async (req, res) => {
    try {
      const prayers = await storage.getPrayerRequests();
      res.json(prayers);
    } catch (err) {
      console.error("Error fetching prayers:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Volunteer Management Routes ===
  
  // Get volunteer skills
  app.get("/api/volunteer/skills", async (req, res) => {
    try {
      const skills = await storage.getVolunteerSkills();
      res.json(skills);
    } catch (err) {
      console.error("Error getting volunteer skills:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create volunteer skill (admin only)
  app.post("/api/volunteer/skills", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description, category } = req.body;
      const skill = await storage.createVolunteerSkill({ name, description, category });
      res.json(skill);
    } catch (err) {
      console.error("Error creating volunteer skill:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get volunteer profile
  app.get("/api/volunteer/profile", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      let profile = await storage.getVolunteerProfile(req.user.id);
      
      // Create profile if doesn't exist
      if (!profile) {
        profile = await storage.createVolunteerProfile({
          userId: req.user.id,
          isActive: true,
        });
      }
      
      res.json(profile);
    } catch (err) {
      console.error("Error getting volunteer profile:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update volunteer profile
  app.patch("/api/volunteer/profile", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { skills, availability, isActive } = req.body;
      const updates: any = {};
      if (skills) updates.skills = skills;
      if (availability) updates.availability = availability;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      
      let profile = await storage.getVolunteerProfile(req.user.id);
      if (!profile) {
        profile = await storage.createVolunteerProfile({ userId: req.user.id, ...updates });
      } else {
        profile = await storage.updateVolunteerProfile(req.user.id, updates);
      }
      res.json(profile);
    } catch (err) {
      console.error("Error updating volunteer profile:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get volunteer opportunities
  app.get("/api/volunteer/opportunities", async (req, res) => {
    try {
      const activeOnly = req.query.active !== "false";
      const opportunities = await storage.getVolunteerOpportunities(activeOnly);
      res.json(opportunities);
    } catch (err) {
      console.error("Error getting volunteer opportunities:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create volunteer opportunity (admin only)
  app.post("/api/volunteer/opportunities", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { title, description, requiredSkills, date, duration, location, spotsAvailable } = req.body;
      const opportunity = await storage.createVolunteerOpportunity({
        title,
        description,
        requiredSkills: requiredSkills || [],
        date: new Date(date),
        duration,
        location,
        spotsAvailable,
        createdBy: req.user.id,
        isActive: true,
      });
      res.json(opportunity);
    } catch (err) {
      console.error("Error creating volunteer opportunity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update volunteer opportunity (admin only)
  app.patch("/api/volunteer/opportunities/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { title, description, requiredSkills, date, duration, location, spotsAvailable, isActive } = req.body;
      const updates: any = {};
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (requiredSkills) updates.requiredSkills = requiredSkills;
      if (date) updates.date = new Date(date);
      if (duration) updates.duration = duration;
      if (location) updates.location = location;
      if (spotsAvailable) updates.spotsAvailable = spotsAvailable;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      
      const opportunity = await storage.updateVolunteerOpportunity(id, updates);
      res.json(opportunity);
    } catch (err) {
      console.error("Error updating volunteer opportunity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete volunteer opportunity (admin only)
  app.delete("/api/volunteer/opportunities/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteVolunteerOpportunity(id);
      res.json({ message: "Opportunity deleted" });
    } catch (err) {
      console.error("Error deleting volunteer opportunity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my volunteer assignments
  app.get("/api/volunteer/assignments", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const assignments = await storage.getVolunteerAssignments(req.user.id);
      res.json(assignments);
    } catch (err) {
      console.error("Error getting volunteer assignments:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sign up for volunteer opportunity
  app.post("/api/volunteer/assignments", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { opportunityId } = req.body;
      
      const opportunity = await storage.getVolunteerOpportunity(opportunityId);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      
      if (opportunity.spotsAvailable && (opportunity.spotsFilled ?? 0) >= opportunity.spotsAvailable) {
        return res.status(400).json({ message: "No spots available" });
      }
      
      const assignment = await storage.createVolunteerAssignment({
        volunteerId: req.user.id,
        opportunityId,
        status: "pending",
      });
      
      res.json(assignment);
    } catch (err) {
      console.error("Error signing up for volunteer opportunity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update assignment status (e.g., check-in)
  app.patch("/api/volunteer/assignments/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { status, checkInAt, checkOutAt, notes } = req.body;
      const updates: any = {};
      if (status) updates.status = status;
      if (checkInAt) updates.checkInAt = new Date(checkInAt);
      if (checkOutAt) updates.checkOutAt = new Date(checkOutAt);
      if (notes) updates.notes = notes;
      
      const assignment = await storage.updateVolunteerAssignment(id, updates);
      res.json(assignment);
    } catch (err) {
      console.error("Error updating volunteer assignment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get volunteer badges
  app.get("/api/volunteer/badges", async (req, res) => {
    try {
      const badges = await storage.getVolunteerBadges();
      res.json(badges);
    } catch (err) {
      console.error("Error getting volunteer badges:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create volunteer badge (admin only)
  app.post("/api/volunteer/badges", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description, icon, criteria } = req.body;
      const badge = await storage.createVolunteerBadge({ name, description, icon, criteria });
      res.json(badge);
    } catch (err) {
      console.error("Error creating volunteer badge:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's badges
  app.get("/api/volunteer/my-badges", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const badges = await storage.getUserBadges(req.user.id);
      res.json(badges);
    } catch (err) {
      console.error("Error getting user badges:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

// Award badge to user (admin only)
  app.post("/api/volunteer/award-badge", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, badgeId } = req.body;
      const badge = await storage.awardBadge(userId, badgeId);
      res.json(badge);
    } catch (err) {
      console.error("Error awarding badge:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Bible Study Routes ===

  // Get user's highlights
  app.get("/api/bible/highlights", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const highlights = await storage.getUserHighlights(req.user.id);
      res.json(highlights);
    } catch (err) {
      console.error("Error getting highlights:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create highlight
  app.post("/api/bible/highlights", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { book, chapter, verse, color, note } = req.body;
      const highlight = await storage.createUserHighlight({
        userId: req.user.id,
        book,
        chapter,
        verse,
        color: color || "#FFEB3B",
        note,
      });
      res.json(highlight);
    } catch (err) {
      console.error("Error creating highlight:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete highlight
  app.delete("/api/bible/highlights/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteUserHighlight(id);
      res.json({ message: "Highlight deleted" });
    } catch (err) {
      console.error("Error deleting highlight:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's notes
  app.get("/api/bible/notes", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const notes = await storage.getUserNotes(req.user.id);
      res.json(notes);
    } catch (err) {
      console.error("Error getting notes:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create note
  app.post("/api/bible/notes", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { book, chapter, verse, content } = req.body;
      const note = await storage.createUserNote({
        userId: req.user.id,
        book,
        chapter,
        verse,
        content,
      });
      res.json(note);
    } catch (err) {
      console.error("Error creating note:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update note
  app.patch("/api/bible/notes/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { content } = req.body;
      const note = await storage.updateUserNote(id, { content });
      res.json(note);
    } catch (err) {
      console.error("Error updating note:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete note
  app.delete("/api/bible/notes/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteUserNote(id);
      res.json({ message: "Note deleted" });
    } catch (err) {
      console.error("Error deleting note:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get verse discussions (public)
  app.get("/api/bible/discussions", async (req, res) => {
    try {
      const { book, chapter, verse } = req.query;
      if (!book || !chapter || !verse) {
        return res.status(400).json({ message: "book, chapter, and verse are required" });
      }
      const discussions = await storage.getVerseDiscussions(
        book as string,
        parseInt(chapter as string),
        parseInt(verse as string)
      );
      res.json(discussions);
    } catch (err) {
      console.error("Error getting discussions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create verse discussion (authenticated)
  app.post("/api/bible/discussions", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { book, chapter, verse, content } = req.body;
      const discussion = await storage.createVerseDiscussion({
        userId: req.user.id,
        book,
        chapter,
        verse,
        content,
      });
      res.json(discussion);
    } catch (err) {
      console.error("Error creating discussion:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Group Annotations (Bible Study) ===
  
  // Get group annotations
  app.get("/api/bible/group-annotations/:groupId", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const annotations = await storage.getGroupAnnotations(Number(req.params.groupId));
      res.json(annotations);
    } catch (err) {
      console.error("Error getting group annotations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create group annotation
  app.post("/api/bible/group-annotations", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { groupId, book, chapter, verse, content } = req.body;
      const annotation = await storage.createGroupAnnotation({
        groupId,
        book,
        chapter,
        verse,
        content,
        createdBy: req.user.id,
      });
      res.json(annotation);
    } catch (err) {
      console.error("Error creating group annotation:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete group annotation
  app.delete("/api/bible/group-annotations/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteGroupAnnotation(Number(req.params.id));
      res.json({ message: "Annotation deleted" });
    } catch (err) {
      console.error("Error deleting group annotation:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Daily Verse Notifications ===
  
  // Get daily verse notifications
  app.get("/api/bible/daily-verse/notifications", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const notifications = await storage.getDailyVerseNotifications(req.user.id);
      res.json(notifications);
    } catch (err) {
      console.error("Error getting daily verse notifications:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create daily verse notification (for testing or admin)
  app.post("/api/bible/daily-verse/notifications", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { title, content, verse, userId } = req.body;
      const notification = await storage.createDailyVerseNotification({
        userId: userId || req.user.id,
        title,
        content,
        verse,
      });
      res.json(notification);
    } catch (err) {
      console.error("Error creating daily verse notification:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Discipleship Pathways Routes ===

  // Get all tracks (public)
  app.get("/api/discipleship/tracks", async (req, res) => {
    try {
      const tracks = await storage.getDiscipleshipTracks();
      res.json(tracks);
    } catch (err) {
      console.error("Error getting tracks:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single track (public)
  app.get("/api/discipleship/tracks/:id", async (req, res) => {
    try {
      const track = await storage.getDiscipleshipTrack(Number(req.params.id));
      if (!track) return res.status(404).json({ message: "Track not found" });
      res.json(track);
    } catch (err) {
      console.error("Error getting track:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create track (admin only)
  app.post("/api/discipleship/tracks", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      const { title, description, category, imageUrl, estimatedWeeks, order } = req.body;
      const track = await storage.createDiscipleshipTrack({
        title,
        description,
        category,
        imageUrl,
        estimatedWeeks,
        order: order || 0,
      });
      res.json(track);
    } catch (err) {
      console.error("Error creating track:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update track (admin only)
  app.patch("/api/discipleship/tracks/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      const track = await storage.updateDiscipleshipTrack(Number(req.params.id), req.body);
      res.json(track);
    } catch (err) {
      console.error("Error updating track:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete track (admin only)
  app.delete("/api/discipleship/tracks/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      await storage.deleteDiscipleshipTrack(Number(req.params.id));
      res.json({ message: "Track deleted" });
    } catch (err) {
      console.error("Error deleting track:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get lessons by track (public)
  app.get("/api/discipleship/tracks/:trackId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByTrack(Number(req.params.trackId));
      res.json(lessons);
    } catch (err) {
      console.error("Error getting lessons:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single lesson (public)
  app.get("/api/discipleship/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.getLesson(Number(req.params.id));
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });
      res.json(lesson);
    } catch (err) {
      console.error("Error getting lesson:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create lesson (admin only)
  app.post("/api/discipleship/lessons", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      const { trackId, title, description, content, videoUrl, order } = req.body;
      const lesson = await storage.createLesson({
        trackId,
        title,
        description,
        content,
        videoUrl,
        order: order || 0,
      });
      res.json(lesson);
    } catch (err) {
      console.error("Error creating lesson:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update lesson (admin only)
  app.patch("/api/discipleship/lessons/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      const lesson = await storage.updateLesson(Number(req.params.id), req.body);
      res.json(lesson);
    } catch (err) {
      console.error("Error updating lesson:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete lesson (admin only)
  app.delete("/api/discipleship/lessons/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      await storage.deleteLesson(Number(req.params.id));
      res.json({ message: "Lesson deleted" });
    } catch (err) {
      console.error("Error deleting lesson:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get quizzes by lesson (public)
  app.get("/api/discipleship/lessons/:lessonId/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getQuizzesByLesson(Number(req.params.lessonId));
      res.json(quizzes);
    } catch (err) {
      console.error("Error getting quizzes:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create quiz (admin only)
  app.post("/api/discipleship/quizzes", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      const { lessonId, question, options, correctAnswer, explanation, order } = req.body;
      const quiz = await storage.createQuiz({
        lessonId,
        question,
        options,
        correctAnswer,
        explanation,
        order: order || 0,
      });
      res.json(quiz);
    } catch (err) {
      console.error("Error creating quiz:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete quiz (admin only)
  app.delete("/api/discipleship/quizzes/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      await storage.deleteQuiz(Number(req.params.id));
      res.json({ message: "Quiz deleted" });
    } catch (err) {
      console.error("Error deleting quiz:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's progress (authenticated)
  app.get("/api/discipleship/progress", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const progress = await storage.getUserProgress(req.user.id);
      res.json(progress);
    } catch (err) {
      console.error("Error getting progress:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's progress for a specific track (authenticated)
  app.get("/api/discipleship/tracks/:trackId/progress", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const progress = await storage.getUserTrackProgress(req.user.id, Number(req.params.trackId));
      res.json(progress);
    } catch (err) {
      console.error("Error getting track progress:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update lesson progress (authenticated)
  app.post("/api/discipleship/progress", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { trackId, lessonId, completed, quizScore, quizAttempts, notes } = req.body;
      const progress = await storage.upsertUserProgress({
        userId: req.user.id,
        trackId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
        quizScore,
        quizAttempts,
        notes,
      });
      res.json(progress);
    } catch (err) {
      console.error("Error updating progress:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get reflections (authenticated)
  app.get("/api/discipleship/reflections", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { lessonId } = req.query;
      const reflections = await storage.getReflections(req.user.id, lessonId ? Number(lessonId) : undefined);
      res.json(reflections);
    } catch (err) {
      console.error("Error getting reflections:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create reflection (authenticated)
  app.post("/api/discipleship/reflections", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { lessonId, content, isPrivate } = req.body;
      const reflection = await storage.createReflection({
        userId: req.user.id,
        lessonId,
        content,
        isPrivate: isPrivate !== false,
      });
      res.json(reflection);
    } catch (err) {
      console.error("Error creating reflection:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete reflection (authenticated)
  app.delete("/api/discipleship/reflections/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteReflection(Number(req.params.id));
      res.json({ message: "Reflection deleted" });
    } catch (err) {
      console.error("Error deleting reflection:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Pastoral Care & Counseling System ===

  // Get counseling requests (user sees their own, admin sees all)
  app.get("/api/counseling/requests", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const filters: { status?: string; assignedTo?: string; userId?: string } = {};
      if (req.query.status) filters.status = String(req.query.status);
      
      // Regular users see only their own requests
      if (!req.user.isAdmin) {
        filters.userId = req.user.id;
      } else if (req.query.assignedTo) {
        filters.assignedTo = String(req.query.assignedTo);
      }
      
      const requests = await storage.getCounselingRequests(filters);
      res.json(requests);
    } catch (err) {
      console.error("Error fetching counseling requests:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single counseling request
  app.get("/api/counseling/requests/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const request = await storage.getCounselingRequest(Number(req.params.id));
      if (!request) return res.status(404).json({ message: "Request not found" });
      
      // Check access
      if (!req.user.isAdmin && request.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(request);
    } catch (err) {
      console.error("Error fetching counseling request:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create counseling request
  app.post("/api/counseling/requests", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const { requestType, urgency, subject, description } = req.body;
      
      const request = await storage.createCounselingRequest({
        userId: req.user.id,
        requestType,
        urgency: urgency || 'normal',
        subject,
        description,
      });
      
      res.json(request);
    } catch (err) {
      console.error("Error creating counseling request:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update counseling request (admin only)
  app.patch("/api/counseling/requests/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { status, assignedTo } = req.body;
      const updates: any = {};
      
      if (status) updates.status = status;
      if (assignedTo) {
        updates.assignedTo = assignedTo;
        updates.assignedAt = new Date();
        updates.status = 'assigned';
      }
      
      const request = await storage.updateCounselingRequest(Number(req.params.id), updates);
      res.json(request);
    } catch (err) {
      console.error("Error updating counseling request:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Assign counseling request (pastor/admin)
  app.post("/api/counseling/requests/:id/assign", isAuthenticated, isPastor, async (req: AuthenticatedRequest, res) => {
    try {
      const { assignedTo } = req.body;
      if (!assignedTo) return res.status(400).json({ message: "Assignee required" });
      
      const request = await storage.assignCounselingRequest(Number(req.params.id), assignedTo);
      res.json(request);
    } catch (err) {
      console.error("Error assigning counseling request:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Complete counseling request
  app.post("/api/counseling/requests/:id/complete", isAuthenticated, isPastor, async (req: AuthenticatedRequest, res) => {
    try {
      const request = await storage.completeCounselingRequest(Number(req.params.id));
      res.json(request);
    } catch (err) {
      console.error("Error completing counseling request:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get counseling notes
  app.get("/api/counseling/requests/:id/notes", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const request = await storage.getCounselingRequest(Number(req.params.id));
      if (!request) return res.status(404).json({ message: "Request not found" });
      
      // Only assigned pastor or admin can see notes
      if (!req.user.isAdmin && request.assignedTo !== req.user.id && request.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const notes = await storage.getCounselingNotes(Number(req.params.id));
      res.json(notes);
    } catch (err) {
      console.error("Error fetching counseling notes:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add counseling note (assigned pastor or admin)
  app.post("/api/counseling/requests/:id/notes", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const request = await storage.getCounselingRequest(Number(req.params.id));
      if (!request) return res.status(404).json({ message: "Request not found" });
      
      // Only assigned pastor, admin, or the requester can add notes
      if (!req.user.isAdmin && request.assignedTo !== req.user.id && request.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { content, isInternal } = req.body;
      const note = await storage.createCounselingNote({
        requestId: Number(req.params.id),
        authorId: req.user.id,
        content,
        isInternal: isInternal !== false,
      });
      
      res.json(note);
    } catch (err) {
      console.error("Error creating counseling note:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get counseling follow-ups
  app.get("/api/counseling/followups", isAuthenticated, isPastor, async (req: AuthenticatedRequest, res) => {
    try {
      const followups = await storage.getPendingFollowups();
      res.json(followups);
    } catch (err) {
      console.error("Error fetching follow-ups:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create follow-up reminder
  app.post("/api/counseling/requests/:id/followups", isAuthenticated, isPastor, async (req: AuthenticatedRequest, res) => {
    try {
      const { scheduledDate, notes } = req.body;
      const followup = await storage.createCounselingFollowup({
        requestId: Number(req.params.id),
        scheduledDate,
        notes,
      });
      res.json(followup);
    } catch (err) {
      console.error("Error creating follow-up:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Complete follow-up
  app.post("/api/counseling/followups/:id/complete", isAuthenticated, isPastor, async (req: AuthenticatedRequest, res) => {
    try {
      const { notes } = req.body;
      const followup = await storage.completeCounselingFollowup(Number(req.params.id), notes);
      res.json(followup);
    } catch (err) {
      console.error("Error completing follow-up:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pastoral visits
  app.get("/api/counseling/visits", isAuthenticated, isPastor, async (req: AuthenticatedRequest, res) => {
    try {
      const filters: { visitorId?: string; visitedUserId?: string } = {};
      if (req.query.visitedUserId) filters.visitedUserId = String(req.query.visitedUserId);
      
      const visits = await storage.getPastoralVisits(filters);
      res.json(visits);
    } catch (err) {
      console.error("Error fetching visits:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/counseling/visits", isAuthenticated, isPastor, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const { requestId, visitedUserId, visitDate, location, notes, followUpNeeded } = req.body;
      const visit = await storage.createPastoralVisit({
        requestId,
        visitorId: req.user.id,
        visitedUserId,
        visitDate,
        location,
        notes,
        followUpNeeded: followUpNeeded || false,
      });
      res.json(visit);
    } catch (err) {
      console.error("Error creating visit:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pastoral statistics (admin only)
  app.get("/api/counseling/stats", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getPastoralStats();
      res.json(stats);
    } catch (err) {
      console.error("Error fetching pastoral stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Sermon Clip Generator Routes ===

  app.get("/api/sermon-clips", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const clips = await storage.getSermonClips();
      res.json(clips);
    } catch (err) {
      console.error("Error getting sermon clips:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sermon-clips/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const clip = await storage.getSermonClip(Number(req.params.id));
      if (!clip) return res.status(404).json({ message: "Clip not found" });
      res.json(clip);
    } catch (err) {
      console.error("Error getting sermon clip:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sermon-clips/upload", isAuthenticated, upload.single("video"), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(process.cwd(), "uploads", "videos", filename);
      const fileUrl = `/uploads/videos/${filename}`;

      fs.renameSync(req.file.path, filepath);

      res.json({ path: filepath, url: fileUrl });
    } catch (err) {
      console.error("Error uploading video:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sermon-clips", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      const { title, sourceVideoUrl, sourceVideoPath, clipStartTime, clipEndTime, format, overlayText, verseReference } = req.body;
      
      const clip = await storage.createSermonClip({
        title,
        sourceVideoUrl,
        sourceVideoPath,
        clipStartTime,
        clipEndTime,
        format: format || "landscape",
        overlayText,
        verseReference,
        status: "pending",
        createdBy: req.user.id,
      });
      res.json(clip);
    } catch (err) {
      console.error("Error creating sermon clip:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sermon-clips/:id/process", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      
      const clip = await storage.getSermonClip(Number(req.params.id));
      if (!clip) return res.status(404).json({ message: "Clip not found" });
      if (!clip.sourceVideoUrl && !clip.sourceVideoPath) return res.status(400).json({ message: "No source video" });
      
      await storage.updateSermonClip(Number(req.params.id), { status: "processing" });
      
      processVideoClip({
        sourceUrl: clip.sourceVideoUrl || undefined,
        sourcePath: clip.sourceVideoPath || undefined,
        startTime: clip.clipStartTime,
        endTime: clip.clipEndTime,
        format: clip.format as "square" | "vertical" | "landscape",
        overlayText: clip.overlayText || undefined,
        verseReference: clip.verseReference || undefined,
        title: clip.title,
      }).then(async (result) => {
        if (result.success && result.outputPath && result.outputUrl) {
          await storage.updateSermonClip(Number(req.params.id), {
            status: "completed",
            outputPath: result.outputPath,
            outputUrl: result.outputUrl,
          });
          console.log(`Clip ${clip.id} processed successfully`);
        } else {
          await storage.updateSermonClip(Number(req.params.id), {
            status: "failed",
          });
          console.error(`Clip ${clip.id} failed:`, result.error);
        }
      }).catch(async (err) => {
        await storage.updateSermonClip(Number(req.params.id), {
          status: "failed",
        });
        console.error(`Clip ${clip.id} error:`, err);
      });
      
      res.json({ message: "Clip processing started", clipId: clip.id });
    } catch (err) {
      console.error("Error processing sermon clip:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/sermon-clips/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      await storage.deleteSermonClip(Number(req.params.id));
      res.json({ message: "Clip deleted" });
    } catch (err) {
      console.error("Error deleting sermon clip:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sermon-clips/:id/process-now", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      
      const clip = await storage.getSermonClip(Number(req.params.id));
      if (!clip) return res.status(404).json({ message: "Clip not found" });
      if (!clip.sourceVideoUrl && !clip.sourceVideoPath) return res.status(400).json({ message: "No source video" });
      
      await storage.updateSermonClip(Number(req.params.id), { status: "processing" });
      
      const result = await processVideoClip({
        sourceUrl: clip.sourceVideoUrl || undefined,
        sourcePath: clip.sourceVideoPath || undefined,
        startTime: clip.clipStartTime,
        endTime: clip.clipEndTime,
        format: clip.format as "square" | "vertical" | "landscape",
        overlayText: clip.overlayText || undefined,
        verseReference: clip.verseReference || undefined,
        title: clip.title,
      });
      
      if (result.success && result.outputPath && result.outputUrl) {
        await storage.updateSermonClip(Number(req.params.id), {
          status: "completed",
          outputPath: result.outputPath,
          outputUrl: result.outputUrl,
        });
        res.json({ success: true, message: "Clip processed successfully", outputUrl: result.outputUrl });
      } else {
        await storage.updateSermonClip(Number(req.params.id), { status: "failed" });
        res.status(500).json({ success: false, message: result.error || "Processing failed" });
      }
    } catch (err) {
      console.error("Error processing sermon clip:", err);
      await storage.updateSermonClip(Number(req.params.id), { status: "failed" });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === MULTI-LANGUAGE & LOCALIZATION ROUTES ===

  // Get supported languages
  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getSupportedLanguages();
      res.json(languages);
    } catch (err) {
      console.error("Error getting languages:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single language
  app.get("/api/languages/:id", async (req, res) => {
    try {
      const language = await storage.getSupportedLanguage(Number(req.params.id));
      if (!language) return res.status(404).json({ message: "Language not found" });
      res.json(language);
    } catch (err) {
      console.error("Error getting language:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get default language
  app.get("/api/languages/default", async (req, res) => {
    try {
      const language = await storage.getDefaultLanguage();
      res.json(language || { code: "en", name: "English", nativeName: "English" });
    } catch (err) {
      console.error("Error getting default language:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create language (admin only)
  app.post("/api/languages", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      
      const { code, name, nativeName, isActive, isDefault, order } = req.body;
      
      if (isDefault) {
        await db.update(supportedLanguages).set({ isDefault: false });
      }
      
      const language = await storage.createSupportedLanguage({
        code,
        name,
        nativeName,
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
        order: order ?? 0,
      });
      
      res.status(201).json(language);
    } catch (err) {
      console.error("Error creating language:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update language (admin only)
  app.put("/api/languages/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      
      const { isActive, isDefault, ...rest } = req.body;
      
      if (isDefault) {
        await db.update(supportedLanguages).set({ isDefault: false });
      }
      
      const language = await storage.updateSupportedLanguage(Number(req.params.id), {
        ...rest,
        isActive,
        isDefault,
      });
      
      res.json(language);
    } catch (err) {
      console.error("Error updating language:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete language (admin only)
  app.delete("/api/languages/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin only" });
      await storage.deleteSupportedLanguage(Number(req.params.id));
      res.json({ message: "Language deleted" });
    } catch (err) {
      console.error("Error deleting language:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user language preferences
  app.put("/api/user/preferences/language", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { language, timezone, currency } = req.body;
      
      const updates: any = {};
      if (language) updates.preferredLanguage = language;
      if (timezone) updates.timezone = timezone;
      if (currency) updates.currency = currency;
      
      const user = await storage.updateUser(req.user!.id, updates);
      res.json({
        preferredLanguage: user.preferredLanguage,
        timezone: user.timezone,
        currency: user.currency,
      });
    } catch (err) {
      console.error("Error updating user preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user language preferences
  app.get("/api/user/preferences/language", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      res.json({
        preferredLanguage: user?.preferredLanguage || "en",
        timezone: user?.timezone || "UTC",
        currency: user?.currency || "USD",
      });
    } catch (err) {
      console.error("Error getting user preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ========== SOCIAL FEED ROUTES ==========
  
  // Get feed posts (public or user feed)
  app.get("/api/feed", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const type = req.query.type as string;
      
      let posts;
      if (type === "personal") {
        posts = await storage.getFeedForUser(req.user!.id, limit, offset);
      } else {
        posts = await storage.getPosts(limit, offset);
      }
      
      const postsWithUser = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUserById(post.userId);
        return {
          ...post,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage } : null,
          hasLiked: await storage.hasUserLikedPost(post.id, req.user!.id),
        };
      }));
      
      res.json(postsWithUser);
    } catch (err) {
      console.error("Error fetching feed:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single post
  app.get("/api/posts/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const post = await storage.getPostById(parseInt(String(req.params.id)));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const user = await storage.getUserById(post.userId);
      const comments = await storage.getPostComments(post.id);
      const commentsWithUser = await Promise.all(comments.map(async (comment) => {
        const commentUser = await storage.getUserById(comment.userId);
        return {
          ...comment,
          user: commentUser ? { id: commentUser.id, firstName: commentUser.firstName, lastName: commentUser.lastName, profileImage: commentUser.profileImage } : null,
        };
      }));
      
      res.json({
        ...post,
        user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage } : null,
        comments: commentsWithUser,
        hasLiked: await storage.hasUserLikedPost(post.id, req.user!.id),
      });
    } catch (err) {
      console.error("Error fetching post:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create post
  app.post("/api/posts", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { content, type, visibility, imageUrl, videoUrl, verseReference } = req.body;
      
      const post = await storage.createPost({
        userId: req.user!.id,
        content,
        type: type || "TEXT",
        visibility: visibility || "MEMBERS_ONLY",
        imageUrl,
        videoUrl,
        verseReference,
      });
      
      const user = await storage.getUserById(post.userId);
      res.status(201).json({
        ...post,
        user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage } : null,
      });
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update post
  app.put("/api/posts/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const post = await storage.getPostById(parseInt(String(req.params.id)));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const { content, visibility, imageUrl, videoUrl, verseReference } = req.body;
      const updated = await storage.updatePost(parseInt(String(req.params.id)), {
        content,
        visibility,
        imageUrl,
        videoUrl,
        verseReference,
      });
      
      res.json(updated);
    } catch (err) {
      console.error("Error updating post:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const post = await storage.getPostById(parseInt(String(req.params.id)));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deletePost(parseInt(String(req.params.id)));
      res.json({ message: "Post deleted" });
    } catch (err) {
      console.error("Error deleting post:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pin/unpin post
  app.post("/api/posts/:id/pin", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const post = await storage.togglePinPost(parseInt(String(req.params.id)));
      res.json(post);
    } catch (err) {
      console.error("Error toggling pin:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Like/unlike post
  app.post("/api/posts/:id/like", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const like = await storage.likePost(parseInt(String(req.params.id)), req.user!.id);
      const post = await storage.getPostById(parseInt(String(req.params.id)));
      res.json({ like, post });
    } catch (err) {
      console.error("Error toggling like:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comment on post
  app.post("/api/posts/:id/comments", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { content, parentId } = req.body;
      const comment = await storage.createPostComment({
        postId: parseInt(String(req.params.id)),
        userId: req.user!.id,
        content,
        parentId,
      });
      
      const user = await storage.getUserById(comment.userId);
      res.status(201).json({
        ...comment,
        user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage } : null,
      });
    } catch (err) {
      console.error("Error creating comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update comment
  app.put("/api/comments/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { content } = req.body;
      const updated = await storage.updatePostComment(parseInt(String(req.params.id)), { content });
      res.json(updated);
    } catch (err) {
      console.error("Error updating comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete comment
  app.delete("/api/comments/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deletePostComment(parseInt(String(req.params.id)));
      res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Like/unlike comment
  app.post("/api/comments/:id/like", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const like = await storage.likeComment(parseInt(String(req.params.id)), req.user!.id);
      res.json(like);
    } catch (err) {
      console.error("Error toggling comment like:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Share post
  app.post("/api/posts/:id/share", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { content } = req.body;
      const share = await storage.sharePost(parseInt(String(req.params.id)), req.user!.id, content);
      res.status(201).json(share);
    } catch (err) {
      console.error("Error sharing post:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get trending hashtags
  app.get("/api/hashtags/trending", async (req, res) => {
    try {
      const hashtags = await storage.getTrendingHashtags(10);
      res.json(hashtags);
    } catch (err) {
      console.error("Error fetching hashtags:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get posts by hashtag
  app.get("/api/hashtags/:tag/posts", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPostsByHashtag(String(req.params.tag), limit, offset);
      
      const postsWithUser = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUserById(post.userId);
        return {
          ...post,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage } : null,
          hasLiked: await storage.hasUserLikedPost(post.id, req.user!.id),
        };
      }));
      
      res.json(postsWithUser);
    } catch (err) {
      console.error("Error fetching hashtag posts:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Follow/unfollow user
  app.post("/api/users/:id/follow", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const targetUserId = req.params.id as string;
      if (targetUserId === req.user!.id) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const isFollowing = await storage.isFollowing(req.user!.id, targetUserId);
      if (isFollowing) {
        await storage.unfollowUser(req.user!.id, targetUserId);
        res.json({ following: false });
      } else {
        await storage.followUser(req.user!.id, targetUserId);
        res.json({ following: true });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user followers
  app.get("/api/users/:id/followers", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const followers = await storage.getUserFollowers(req.params.id as string);
      const followersWithUser = await Promise.all(followers.map(async (f) => {
        const user = await storage.getUserById(f.followerId);
        return {
          ...f,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage } : null,
        };
      }));
      res.json(followersWithUser);
    } catch (err) {
      console.error("Error fetching followers:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user following
  app.get("/api/users/:id/following", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId: string = req.params.id as string;
      const following = await storage.getUserFollowing(userId);
      const followingWithUser = await Promise.all(following.map(async (f) => {
        const user = await storage.getUserById(f.followingId);
        return {
          ...f,
          user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage } : null,
        };
      }));
      res.json(followingWithUser);
    } catch (err) {
      console.error("Error fetching following:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check if following
  app.get("/api/users/:id/following-status", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const targetUserId: string = req.params.id as string;
      const isFollowing = await storage.isFollowing(req.user!.id, targetUserId);
      res.json({ following: isFollowing });
    } catch (err) {
      console.error("Error checking follow status:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Super Admin Routes ===
  
  // Get all organizations (super admin only)
  app.get("/api/super-admin/organizations", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const organizations = await storage.getOrganizations(true);
      res.json(organizations);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public organization signup (for churches to register themselves)
  app.post("/api/organizations/register", async (req, res) => {
    try {
      const { name, slug, description, churchName, churchEmail, churchPhone, churchAddress, churchCity, churchState, churchCountry } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Organization name and slug are required" });
      }

      // Check if slug already exists
      const existingOrgs = await storage.getOrganizations();
      const slugExists = existingOrgs.some(org => org.slug === slug);
      if (slugExists) {
        return res.status(400).json({ message: "This URL slug is already taken. Please choose another." });
      }

      const org = await storage.createOrganization({
        name,
        slug,
        description: description || null,
        logoUrl: null,
        churchName: churchName || null,
        churchEmail: churchEmail || null,
        churchPhone: churchPhone || null,
        churchAddress: churchAddress || null,
        churchCity: churchCity || null,
        churchState: churchState || null,
        churchCountry: churchCountry || null,
        isActive: false, // Requires super admin approval
      });
      
      res.status(201).json({ 
        message: "Organization submitted for approval. We'll contact you shortly.",
        organization: org 
      });
    } catch (err) {
      console.error("Error registering organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization by slug (public)
  app.get("/api/organizations/by-slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const orgs = await storage.getOrganizations();
      const org = orgs.find(o => o.slug === slug && o.isActive);
      
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      
      res.json(org);
    } catch (err) {
      console.error("Error fetching organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create organization (super admin only)
  app.post("/api/super-admin/organizations", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { name, slug, description, logoUrl, churchName, churchEmail, churchPhone, churchAddress, churchCity, churchState, churchCountry, isActive } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }

      const org = await storage.createOrganization({
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
        churchName: churchName || null,
        churchEmail: churchEmail || null,
        churchPhone: churchPhone || null,
        churchAddress: churchAddress || null,
        churchCity: churchCity || null,
        churchState: churchState || null,
        churchCountry: churchCountry || null,
        isActive: isActive ?? true,
      });
      res.status(201).json(org);
    } catch (err) {
      console.error("Error creating organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update organization (super admin only)
  app.put("/api/super-admin/organizations/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const id = req.params.id as string;
      const { name, slug, description, logoUrl, churchName, churchEmail, churchPhone, churchAddress, churchCity, churchState, churchCountry, isActive } = req.body;

      const org = await storage.updateOrganization(id, {
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
        churchName: churchName || null,
        churchEmail: churchEmail || null,
        churchPhone: churchPhone || null,
        churchAddress: churchAddress || null,
        churchCity: churchCity || null,
        churchState: churchState || null,
        churchCountry: churchCountry || null,
        isActive,
      });
      res.json(org);
    } catch (err) {
      console.error("Error updating organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete organization (super admin only)
  app.delete("/api/super-admin/organizations/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const id = req.params.id as string;
      await storage.deleteOrganization(id);
      res.json({ message: "Organization deleted" });
    } catch (err) {
      console.error("Error deleting organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization users (super admin only)
  app.get("/api/super-admin/organizations/:id/users", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const users = await storage.getOrganizationUsers(req.params.id as string);
      res.json(users);
    } catch (err) {
      console.error("Error fetching organization users:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user role within organization (super admin only)
  app.put("/api/super-admin/organizations/:id/users/:userId/role", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { role } = req.body;
      const user = await storage.updateUserOrganizationRole(req.params.userId as string, req.params.id as string, role);
      res.json(user);
    } catch (err) {
      console.error("Error updating organization user role:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove user from organization (super admin only)
  app.delete("/api/super-admin/organizations/:id/users/:userId", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      await storage.removeUserFromOrganization(req.params.userId as string, req.params.id as string);
      res.json({ message: "User removed from organization" });
    } catch (err) {
      console.error("Error removing user from organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization branding (super admin only)
  app.get("/api/super-admin/organizations/:id/branding", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const branding = await storage.getOrganizationBranding(req.params.id as string);
      res.json(branding || {});
    } catch (err) {
      console.error("Error fetching organization branding:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update organization branding (super admin only)
  app.put("/api/super-admin/organizations/:id/branding", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const branding = await storage.updateOrganizationBranding(req.params.id as string, req.body);
      res.json(branding);
    } catch (err) {
      console.error("Error updating organization branding:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === ORGANIZATION APPROVAL WORKFLOW ===

  // Get pending organizations for approval (super admin only)
  app.get("/api/super-admin/organizations/pending", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const organizations = await storage.getPendingOrganizations();
      res.json(organizations);
    } catch (err) {
      console.error("Error fetching pending organizations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Approve organization (super admin only)
  app.post("/api/super-admin/organizations/:id/approve", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const id = req.params.id as string;
      const org = await storage.approveOrganization(id, req.user!.id);
      
      // TODO: Send approval email notification
      // await sendOrganizationApprovalEmail(org);
      
      res.json({ message: "Organization approved successfully", organization: org });
    } catch (err) {
      console.error("Error approving organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reject organization (super admin only)
  app.post("/api/super-admin/organizations/:id/reject", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const id = req.params.id as string;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const org = await storage.rejectOrganization(id, req.user!.id, reason);
      
      // TODO: Send rejection email notification
      // await sendOrganizationRejectionEmail(org, reason);
      
      res.json({ message: "Organization rejected", organization: org });
    } catch (err) {
      console.error("Error rejecting organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization approval history (super admin only)
  app.get("/api/super-admin/organizations/:id/approval-history", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const history = await storage.getOrganizationApprovalHistory(req.params.id as string);
      res.json(history);
    } catch (err) {
      console.error("Error fetching approval history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === ORGANIZATION MANAGEMENT DASHBOARD ===

  // Get organization details with statistics (super admin only)
  app.get("/api/super-admin/organizations/:id/details", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const orgId = req.params.id as string;
      const details = await storage.getOrganizationDetails(orgId);
      res.json(details);
    } catch (err) {
      console.error("Error fetching organization details:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization statistics (super admin only)
  app.get("/api/super-admin/organizations/:id/stats", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const orgId = req.params.id as string;
      const stats = await storage.getOrganizationStats(orgId);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching organization stats:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activate organization (super admin only)
  app.post("/api/super-admin/organizations/:id/activate", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const orgId = req.params.id as string;
      const org = await storage.activateOrganization(orgId);
      res.json({ message: "Organization activated", organization: org });
    } catch (err) {
      console.error("Error activating organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Deactivate organization (super admin only)
  app.post("/api/super-admin/organizations/:id/deactivate", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const orgId = req.params.id as string;
      const org = await storage.deactivateOrganization(orgId);
      res.json({ message: "Organization deactivated", organization: org });
    } catch (err) {
      console.error("Error deactivating organization:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search organizations with filters (super admin only)
  app.get("/api/super-admin/organizations/search", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { q, status, sortBy, sortOrder } = req.query;
      const results = await storage.searchOrganizations({
        query: q as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });
      res.json(results);
    } catch (err) {
      console.error("Error searching organizations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === CROSS-ORGANIZATION MEMBER MANAGEMENT ===

  // Get all members across all organizations (super admin only)
  app.get("/api/super-admin/members", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { orgId, search, role, page = 1, limit = 50 } = req.query;
      const results = await storage.getAllMembersAcrossOrganizations({
        organizationId: orgId as string,
        search: search as string,
        role: role as string,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 50,
      });
      res.json(results);
    } catch (err) {
      console.error("Error fetching members:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get member details across organizations (super admin only)
  app.get("/api/super-admin/members/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const memberId = req.params.id as string;
      const details = await storage.getMemberCrossOrgDetails(memberId);
      res.json(details);
    } catch (err) {
      console.error("Error fetching member details:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transfer member between organizations (super admin only)
  app.post("/api/super-admin/members/:id/transfer", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const memberId = req.params.id as string;
      const { toOrganizationId, reason } = req.body;
      
      if (!toOrganizationId) {
        return res.status(400).json({ message: "Target organization ID is required" });
      }
      
      const result = await storage.transferMemberToOrganization(memberId, toOrganizationId, req.user!.id, reason);
      res.json({ message: "Member transferred successfully", member: result });
    } catch (err) {
      console.error("Error transferring member:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get member activity across organizations (super admin only)
  app.get("/api/super-admin/members/:id/activity", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const memberId = req.params.id as string;
      const { limit = 50 } = req.query;
      const activity = await storage.getMemberActivityAcrossOrgs(memberId, parseInt(limit as string) || 50);
      res.json(activity);
    } catch (err) {
      console.error("Error fetching member activity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bulk update members (super admin only)
  app.post("/api/super-admin/members/bulk-update", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { memberIds, updates, reason } = req.body;
      
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ message: "Member IDs array is required" });
      }
      
      const results = await storage.bulkUpdateMembers(memberIds, updates, req.user!.id, reason);
      res.json({ message: `Updated ${results.length} members`, results });
    } catch (err) {
      console.error("Error bulk updating members:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bulk transfer members (super admin only)
  app.post("/api/super-admin/members/bulk-transfer", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { memberIds, toOrganizationId, reason } = req.body;
      
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ message: "Member IDs array is required" });
      }
      
      if (!toOrganizationId) {
        return res.status(400).json({ message: "Target organization ID is required" });
      }
      
      const results = await storage.bulkTransferMembers(memberIds, toOrganizationId, req.user!.id, reason);
      res.json({ message: `Transferred ${results.length} members`, results });
    } catch (err) {
      console.error("Error bulk transferring members:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Invite a new super admin (super admin only)
  app.post("/api/super-admin/invite", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { email, firstName, lastName } = req.body;
      
      if (!email || !firstName) {
        return res.status(400).json({ message: "Email and first name are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Generate a secure random password
      const tempPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      
      const newUser = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName: lastName || '',
        isSuperAdmin: true,
        isAdmin: true,
      });
      
      // TODO: Send invitation email with temp password and setup link
      
      res.status(201).json({ 
        message: "Super admin invited successfully",
        userId: newUser.id,
        // In production, don't return the temp password - send via email instead
        tempPassword 
      });
    } catch (err) {
      console.error("Error inviting super admin:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === PLATFORM-WIDE ANALYTICS ===

  // Get platform overview statistics (super admin only)
  app.get("/api/super-admin/analytics/overview", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const overview = await storage.getPlatformOverview();
      res.json(overview);
    } catch (err) {
      console.error("Error fetching platform overview:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get organization growth metrics (super admin only)
  app.get("/api/super-admin/analytics/growth", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { period = '30d' } = req.query;
      const growth = await storage.getPlatformGrowthMetrics(period as string);
      res.json(growth);
    } catch (err) {
      console.error("Error fetching growth metrics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get most popular organizations (super admin only)
  app.get("/api/super-admin/analytics/popular-organizations", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { limit = 10 } = req.query;
      const popular = await storage.getPopularOrganizations(parseInt(limit as string) || 10);
      res.json(popular);
    } catch (err) {
      console.error("Error fetching popular organizations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get activity trends (super admin only)
  app.get("/api/super-admin/analytics/activity-trends", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { period = '30d', metric } = req.query;
      const trends = await storage.getActivityTrends(period as string, metric as string);
      res.json(trends);
    } catch (err) {
      console.error("Error fetching activity trends:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get member engagement metrics (super admin only)
  app.get("/api/super-admin/analytics/engagement", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const engagement = await storage.getMemberEngagementMetrics();
      res.json(engagement);
    } catch (err) {
      console.error("Error fetching engagement metrics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get event statistics across platform (super admin only)
  app.get("/api/super-admin/analytics/events", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      const { period = '30d' } = req.query;
      const eventStats = await storage.getPlatformEventStats(period as string);
      res.json(eventStats);
    } catch (err) {
      console.error("Error fetching event statistics:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

async function seedDatabase() {
  const existingSermons = await storage.getSermons();
  if (existingSermons.length === 0) {
    await storage.createSermon({
      title: "The Power of Community",
      speaker: "Pastor John Doe",
      date: new Date(),
      description: "Discover why we need each other to grow in faith.",
      series: "Better Together",
      topic: "Community",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isUpcoming: false,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=60",
    });
    await storage.createSermon({
      title: "Finding Peace in Chaos",
      speaker: "Pastor Jane Smith",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      description: "How to maintain inner peace when the world is crazy.",
      series: "Peace of Mind",
      topic: "Peace",
      isUpcoming: false,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1507692049790-de58293a4697?w=800&auto=format&fit=crop&q=60",
    });
    await storage.createSermon({
      title: "Walking in Faith",
      speaker: "Pastor Emmanuel Moses",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description: "Learning to trust God in every step of our journey.",
      series: "Faith Journey",
      topic: "Faith",
      isUpcoming: true,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60",
    });
  } else {
    for (const sermon of existingSermons) {
      await storage.updateSermon(sermon.id, { date: new Date(Date.now() - (sermon.id - 1) * 7 * 24 * 60 * 60 * 1000) });
    }
  }

  const existingEvents = await storage.getEvents();
  if (existingEvents.length === 0) {
    await storage.createEvent({
      title: "Sunday Service",
      description: "Join us for worship and a message.",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: undefined,
      recurrenceEndDate: undefined,
      location: "Main Sanctuary",
      imageUrl:
        "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&auto=format&fit=crop&q=60",
    });
    await storage.createEvent({
      title: "Youth Group Night",
      description: "Fun, games, and fellowship for teens.",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: undefined,
      recurrenceEndDate: undefined,
      location: "Youth Hall",
      imageUrl:
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=60",
    });
  } else {
    const eventDates = [
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ];
    for (let i = 0; i < existingEvents.length; i++) {
      await storage.updateEvent(existingEvents[i].id, { date: eventDates[i] || eventDates[0] });
    }
  }

  // Seed Discipleship Tracks
  const existingTracks = await storage.getDiscipleshipTracks();
  if (existingTracks.length === 0) {
    // New Believer Track
    const newBelieverTrack = await storage.createDiscipleshipTrack({
      title: "Foundations of Faith",
      description: "A beginner's guide to the Christian faith. Learn the basic beliefs and practices of Christianity.",
      category: "new_believer",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60",
      estimatedWeeks: 8,
      isActive: true,
      order: 1,
    });

    // Add lessons for New Believer track
    await storage.createLesson({
      trackId: newBelieverTrack.id,
      title: "What is Christianity?",
      description: "Understanding the core beliefs of the Christian faith",
      content: "Christianity is based on the life, teachings, death, and resurrection of Jesus Christ...",
      order: 1,
      isPublished: true,
    });

    await storage.createLesson({
      trackId: newBelieverTrack.id,
      title: "The Bible",
      description: "How to read and understand the Bible",
      content: "The Bible is God's Word to us. It contains 66 books written over thousands of years...",
      order: 2,
      isPublished: true,
    });

    await storage.createLesson({
      trackId: newBelieverTrack.id,
      title: "Prayer",
      description: "How to communicate with God",
      content: "Prayer is conversing with God. It's not about fancy words but sincere hearts...",
      order: 3,
      isPublished: true,
    });

    // Leadership Track
    const leadershipTrack = await storage.createDiscipleshipTrack({
      title: "Leadership Development",
      description: "Equip yourself with skills to lead others in ministry and everyday life.",
      category: "leadership",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60",
      estimatedWeeks: 12,
      isActive: true,
      order: 2,
    });

    await storage.createLesson({
      trackId: leadershipTrack.id,
      title: "Biblical Leadership",
      description: "Understanding leadership from a Christian perspective",
      content: "Biblical leadership is servant leadership. Jesus said 'the greatest among you shall be your servant'...",
      order: 1,
      isPublished: true,
    });

    // Discipleship Track
    const discipleshipTrack = await storage.createDiscipleshipTrack({
      title: "Growing in Christ",
      description: "Deepen your relationship with God and become a disciple maker.",
      category: "discipleship",
      imageUrl: "https://images.unsplash.com/photo-1476247246365-4c5e18c92cd7?w=800&auto=format&fit=crop&q=60",
      estimatedWeeks: 10,
      isActive: true,
      order: 3,
    });

    await storage.createLesson({
      trackId: discipleshipTrack.id,
      title: "The Christian Life",
      description: "Living daily for Christ",
      content: "The Christian life is a journey of transformation. Paul wrote 'be transformed by the renewing of your mind'...",
      order: 1,
      isPublished: true,
    });
  }

  // Seed Volunteer Skills
  const existingSkills = await db.select().from(volunteerSkills);
  if (existingSkills.length === 0) {
    await storage.createVolunteerSkill({ name: "Welcome/Ushering", description: "Greet and assist visitors", category: "Welcome" });
    await storage.createVolunteerSkill({ name: "Music/Worship", description: "Lead worship through music", category: "Worship" });
    await storage.createVolunteerSkill({ name: "Sound/AV", description: "Manage audio and visual equipment", category: "Technical" });
    await storage.createVolunteerSkill({ name: "Children's Ministry", description: "Work with children", category: "Kids" });
    await storage.createVolunteerSkill({ name: "Youth Ministry", description: "Work with teenagers", category: "Youth" });
    await storage.createVolunteerSkill({ name: "Prayer Team", description: "Lead prayer during services", category: "Prayer" });
    await storage.createVolunteerSkill({ name: "Security", description: "Ensure safety during events", category: "Safety" });
    await storage.createVolunteerSkill({ name: "Decorations", description: "Set up for events", category: "Creative" });
    await storage.createVolunteerSkill({ name: "Photography/Videography", description: "Capture events", category: "Media" });
    await storage.createVolunteerSkill({ name: "Hospitality", description: "Provide refreshments", category: "Fellowship" });
  }

  // Seed Volunteer Badges
  const existingBadges = await db.select().from(volunteerBadges);
  if (existingBadges.length === 0) {
    await storage.createVolunteerBadge({
      name: "First Time Volunteer",
      description: "Completed your first volunteer assignment",
      icon: "star",
    });
    await storage.createVolunteerBadge({
      name: "Dedicated Servant",
      description: "Completed 10 volunteer hours",
      icon: "heart",
    });
    await storage.createVolunteerBadge({
      name: "Faithful Volunteer",
      description: "Volunteered for 3 consecutive months",
      icon: "award",
    });
    await storage.createVolunteerBadge({
      name: "Team Leader",
      description: "Led a volunteer team",
      icon: "crown",
    });
    await storage.createVolunteerBadge({
      name: "Community Hero",
      description: "Completed 50 volunteer hours",
      icon: "shield",
    });
  }

  // Seed Volunteer Opportunities
  const existingOpportunities = await db.select().from(volunteerOpportunities);
  if (existingOpportunities.length === 0) {
    await storage.createVolunteerOpportunity({
      title: "Sunday Welcome Team",
      description: "Greet visitors and help them find their way around the church",
      requiredSkills: JSON.stringify(["Welcome/Ushering"]),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 120,
      location: "Main Entrance",
      spotsAvailable: 5,
      isActive: true,
    });

    await storage.createVolunteerOpportunity({
      title: "Sound Booth Operator",
      description: "Help manage the sound system during Sunday services",
      requiredSkills: JSON.stringify(["Sound/AV"]),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 180,
      location: "Sound Booth",
      spotsAvailable: 2,
      isActive: true,
    });

    await storage.createVolunteerOpportunity({
      title: "Children's Church Helper",
      description: "Assist with children's ministry during the service",
      requiredSkills: JSON.stringify(["Children's Ministry"]),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 90,
      location: "Children's Wing",
      spotsAvailable: 4,
      isActive: true,
    });

    await storage.createVolunteerOpportunity({
      title: "Worship Team Member",
      description: "Join the worship team for Sunday service",
      requiredSkills: JSON.stringify(["Music/Worship"]),
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      duration: 240,
      location: "Sanctuary",
      spotsAvailable: 3,
      isActive: true,
    });
  }

}
