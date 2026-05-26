import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin with service account if available
if (!admin.apps.length) {
  try {
    // Try to load service account from file
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[AUTH] Firebase Admin initialized with service account');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Try from environment variable (JSON string)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[AUTH] Firebase Admin initialized from env variable');
    } else {
      // Fallback: project ID only (works for some operations in dev)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('[AUTH] Firebase Admin initialized with project ID only (limited)');
    }
  } catch (error) {
    console.error('[AUTH] Firebase Admin initialization error:', error);
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
}

export interface AuthenticatedRequest extends Request {
  uid?: string;
  phoneNumber?: string;
}

/**
 * Middleware to verify Firebase ID tokens
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid authorization header' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    req.phoneNumber = decodedToken.phone_number;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Admin auth middleware — checks if the authenticated user's phone is in the admin whitelist
 */
export async function adminAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // First run regular auth
  await new Promise<void>((resolve) => {
    authMiddleware(req, res, () => resolve());
  });

  if (!req.phoneNumber) {
    // authMiddleware already sent the 401 response
    return;
  }

  // Check admin whitelist from environment
  const adminPhones = (process.env.ADMIN_PHONE_NUMBERS || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  if (adminPhones.length === 0) {
    // If no admin phones configured, allow all authenticated users (dev mode)
    console.warn('[ADMIN] No ADMIN_PHONE_NUMBERS configured, allowing all authenticated users');
    next();
    return;
  }

  if (!adminPhones.includes(req.phoneNumber)) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
}

export { admin };
