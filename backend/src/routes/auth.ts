import { Router, Request, Response } from 'express';
import admin from 'firebase-admin';

const router = Router();

/**
 * POST /auth/verify — Verify Firebase ID token
 * Used by frontend after OTP verification to get server-side session info
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ message: 'ID token is required' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    res.json({
      uid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number,
      verified: true,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
