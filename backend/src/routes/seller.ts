import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /seller/profile — Create or update seller profile
 * In dev mode: phone_number comes from request body
 * In prod mode: phone_number comes from auth middleware (req.phoneNumber)
 */
router.post('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Dev mode: accept phone from body; Prod: from auth middleware
    const phoneNumber = req.phoneNumber || req.body.phone_number;
    if (!phoneNumber) {
      res.status(400).json({ message: 'Phone number is required' });
      return;
    }

    const {
      nursery_name,
      owner_name,
      whatsapp_number,
      address,
      district,
      state,
      latitude,
      longitude,
      courier_available,
    } = req.body;

    // Upsert seller profile
    const result = await pool.query(
      `INSERT INTO sellers 
        (phone_number, nursery_name, owner_name, whatsapp_number, address, district, state, latitude, longitude, courier_available, profile_complete)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       ON CONFLICT (phone_number) DO UPDATE SET
        nursery_name = EXCLUDED.nursery_name,
        owner_name = EXCLUDED.owner_name,
        whatsapp_number = EXCLUDED.whatsapp_number,
        address = EXCLUDED.address,
        district = EXCLUDED.district,
        state = EXCLUDED.state,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        courier_available = EXCLUDED.courier_available,
        profile_complete = true,
        updated_at = NOW()
       RETURNING *`,
      [
        phoneNumber,
        nursery_name,
        owner_name,
        whatsapp_number,
        address,
        district,
        state || 'Andhra Pradesh',
        latitude,
        longitude,
        courier_available || false,
      ]
    );

    res.json({ seller: result.rows[0] });
  } catch (error) {
    console.error('Error saving seller profile:', error);
    res.status(500).json({ message: 'Failed to save profile' });
  }
});

/**
 * GET /seller/profile — Get current seller's profile (auth mode)
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const phoneNumber = req.phoneNumber;
    if (!phoneNumber) {
      res.status(400).json({ message: 'Not authenticated' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM sellers WHERE phone_number = $1',
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Profile not found', profileComplete: false });
      return;
    }

    res.json({ seller: result.rows[0] });
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

/**
 * GET /seller/profile-by-phone — Get seller profile by phone number (dev mode)
 * Will be removed or protected in production
 */
router.get('/profile-by-phone', async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string;
    if (!phone) {
      res.status(400).json({ message: 'Phone number required' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM sellers WHERE phone_number = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Profile not found', profileComplete: false });
      return;
    }

    res.json({ seller: result.rows[0] });
  } catch (error) {
    console.error('Error fetching seller by phone:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

/**
 * GET /seller/posts — Get seller's own posts (auth mode)
 */
router.get('/posts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const phoneNumber = req.phoneNumber;

    const result = await pool.query(
      `SELECT p.* FROM posts p
       JOIN sellers s ON p.seller_id = s.id
       WHERE s.phone_number = $1
       ORDER BY p.created_at DESC`,
      [phoneNumber]
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Error fetching seller posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

/**
 * GET /seller/posts-by-phone — Get seller's posts by phone (dev mode)
 */
router.get('/posts-by-phone', async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string;
    if (!phone) {
      res.status(400).json({ message: 'Phone number required' });
      return;
    }

    const result = await pool.query(
      `SELECT p.* FROM posts p
       JOIN sellers s ON p.seller_id = s.id
       WHERE s.phone_number = $1
       ORDER BY p.created_at DESC`,
      [phone]
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Error fetching seller posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

/**
 * GET /seller/id — Get seller UUID from phone number
 */
router.get('/id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const phoneNumber = req.phoneNumber || (req.query.phone as string);

    const result = await pool.query(
      'SELECT id, nursery_name, profile_complete FROM sellers WHERE phone_number = $1',
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Seller not found' });
      return;
    }

    res.json({
      id: result.rows[0].id,
      nurseryName: result.rows[0].nursery_name,
      profileComplete: result.rows[0].profile_complete,
    });
  } catch (error) {
    console.error('Error fetching seller ID:', error);
    res.status(500).json({ message: 'Failed to fetch seller ID' });
  }
});

export default router;
