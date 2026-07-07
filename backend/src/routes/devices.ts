import { Router, Request, Response } from 'express';
import pool from '../config/db';

const router = Router();

/**
 * POST /devices/register
 * Register a device for push notifications
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { device_id, fcm_token, latitude, longitude } = req.body;

    if (!device_id || !fcm_token) {
      res.status(400).json({ message: 'device_id and fcm_token are required' });
      return;
    }

    await pool.query(
      `INSERT INTO devices (device_id, fcm_token, latitude, longitude, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (device_id) DO UPDATE SET
         fcm_token = EXCLUDED.fcm_token,
         latitude = COALESCE(EXCLUDED.latitude, devices.latitude),
         longitude = COALESCE(EXCLUDED.longitude, devices.longitude),
         updated_at = NOW()`,
      [device_id, fcm_token, latitude, longitude]
    );

    res.json({ message: 'Device registered successfully' });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ message: 'Failed to register device' });
  }
});

export default router;
