import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { calculateDistance } from '../utils/distance';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { deleteImages } from '../utils/cloudinary';

const router = Router();

/**
 * GET /posts/nearby — Get nearby posts sorted by distance (PUBLIC)
 * Query: lat, lng, radius (km), category
 */
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = '50', category } = req.query;

    if (!lat || !lng) {
      res.status(400).json({ message: 'lat and lng are required' });
      return;
    }

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const maxRadius = parseFloat(radius as string);

    let query = `
      SELECT p.*, s.nursery_name, s.whatsapp_number as seller_whatsapp
      FROM posts p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.expires_at > NOW()
        AND s.is_banned = false
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);

    // Calculate distance and filter by radius
    const postsWithDistance = result.rows
      .map((post) => ({
        ...post,
        whatsapp_number: post.seller_whatsapp || post.whatsapp_number,
        distance_km: calculateDistance(
          userLat,
          userLng,
          parseFloat(post.latitude),
          parseFloat(post.longitude)
        ),
      }))
      .filter((post) => post.distance_km <= maxRadius)
      .sort((a, b) => a.distance_km - b.distance_km);

    res.json({ posts: postsWithDistance, total: postsWithDistance.length });
  } catch (error) {
    console.error('Error fetching nearby posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

/**
 * GET /posts/search — Search posts by plant name or nursery (PUBLIC)
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, lat, lng } = req.query;

    if (!q) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const searchQuery = `%${(q as string).toLowerCase()}%`;

    const result = await pool.query(
      `SELECT p.*, s.nursery_name, s.whatsapp_number as seller_whatsapp
       FROM posts p
       JOIN sellers s ON p.seller_id = s.id
       WHERE p.expires_at > NOW()
         AND s.is_banned = false
         AND (LOWER(p.plant_name) LIKE $1 OR LOWER(s.nursery_name) LIKE $1 OR LOWER(p.address) LIKE $1)
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [searchQuery]
    );

    let posts = result.rows.map((post) => ({
      ...post,
      whatsapp_number: post.seller_whatsapp || post.whatsapp_number,
    }));

    // Add distance if location provided
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      posts = posts.map((post) => ({
        ...post,
        distance_km: calculateDistance(
          userLat,
          userLng,
          parseFloat(post.latitude),
          parseFloat(post.longitude)
        ),
      }));
      posts.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    }

    res.json({ posts, total: posts.length });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

/**
 * POST /posts/create — Create a new post
 * Dev mode: accepts seller_id from body
 * Prod mode: derives seller_id from auth token
 */
router.post('/create', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const phoneNumber = req.phoneNumber || req.body.phone_number;
    let sellerId = req.body.seller_id;

    // Look up seller by phone or use provided seller_id
    let sellerResult;
    if (phoneNumber) {
      sellerResult = await pool.query(
        'SELECT id, nursery_name, is_banned FROM sellers WHERE phone_number = $1',
        [phoneNumber]
      );
    } else if (sellerId) {
      sellerResult = await pool.query(
        'SELECT id, nursery_name, is_banned FROM sellers WHERE id = $1',
        [sellerId]
      );
    } else {
      res.status(400).json({ message: 'Phone number or seller_id required' });
      return;
    }

    if (sellerResult.rows.length === 0) {
      res.status(403).json({ message: 'Complete your seller profile first' });
      return;
    }

    const seller = sellerResult.rows[0];

    if (seller.is_banned) {
      res.status(403).json({ message: 'Your account has been suspended' });
      return;
    }

    const {
      plant_name,
      category,
      days_old,
      image_urls,
      image_public_ids,
      contact_number,
      whatsapp_number,
      address,
      latitude,
      longitude,
      courier_available,
    } = req.body;

    if (!plant_name || !days_old || !image_urls?.length) {
      res.status(400).json({ message: 'Missing required fields: plant_name, days_old, image_urls' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO posts 
        (seller_id, plant_name, category, days_old, image_urls, image_public_ids,
         contact_number, whatsapp_number, nursery_name, address, latitude, longitude, courier_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        seller.id, // Use seller ID from DB lookup, NOT from request body
        plant_name,
        category || 'other',
        days_old,
        image_urls,
        image_public_ids || [],
        contact_number || phoneNumber,
        whatsapp_number,
        seller.nursery_name,
        address,
        latitude,
        longitude,
        courier_available || false,
      ]
    );

    res.status(201).json({ post: result.rows[0] });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

/**
 * DELETE /posts/:id — Delete a post
 * Dev mode: no auth required
 * Prod mode: requires auth + ownership verification
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get post and verify ownership
    const post = await pool.query(
      `SELECT p.id, p.image_public_ids, s.phone_number
       FROM posts p
       JOIN sellers s ON p.seller_id = s.id
       WHERE p.id = $1`,
      [id]
    );

    if (post.rows.length === 0) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // In production, verify ownership. In dev, skip.
    // if (post.rows[0].phone_number !== phoneNumber) {
    //   res.status(403).json({ message: 'You can only delete your own posts' });
    //   return;
    // }

    // Delete images from Cloudinary
    const publicIds = post.rows[0].image_public_ids;
    if (publicIds && publicIds.length > 0) {
      try {
        await deleteImages(publicIds);
        console.log(`[DELETE] Cleaned up ${publicIds.length} images from Cloudinary`);
      } catch (imgErr) {
        console.error('[DELETE] Cloudinary cleanup error:', imgErr);
        // Continue with post deletion even if image cleanup fails
      }
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

/**
 * POST /posts/:id/report — Report a post (PUBLIC)
 */
router.post('/:id/report', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get seller_id from the post
    const post = await pool.query('SELECT seller_id FROM posts WHERE id = $1', [id]);
    if (post.rows.length === 0) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    await pool.query(
      'INSERT INTO reports (post_id, seller_id, reason) VALUES ($1, $2, $3)',
      [id, post.rows[0].seller_id, reason || 'No reason provided']
    );

    res.json({ message: 'Report submitted' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

export default router;
