import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { adminAuthMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All admin routes require admin authentication
router.use(adminAuthMiddleware as any);

/**
 * GET /admin/sellers — List all sellers
 */
router.get('/sellers', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sellers ORDER BY created_at DESC'
    );
    res.json({ sellers: result.rows });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ message: 'Failed to fetch sellers' });
  }
});

/**
 * PUT /admin/sellers/:id/ban — Ban/unban a seller
 */
router.put('/sellers/:id/ban', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    await pool.query(
      'UPDATE sellers SET is_banned = $1 WHERE id = $2',
      [banned, id]
    );

    res.json({ message: `Seller ${banned ? 'banned' : 'unbanned'}` });
  } catch (error) {
    console.error('Error banning seller:', error);
    res.status(500).json({ message: 'Failed to update seller' });
  }
});

/**
 * DELETE /admin/sellers/:id — Delete a seller and all their posts
 */
router.delete('/sellers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sellers WHERE id = $1', [id]);
    res.json({ message: 'Seller deleted' });
  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({ message: 'Failed to delete seller' });
  }
});

/**
 * GET /admin/reports — Get all reports
 */
router.get('/reports', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.plant_name, p.image_urls, s.nursery_name, s.phone_number
       FROM reports r
       LEFT JOIN posts p ON r.post_id = p.id
       LEFT JOIN sellers s ON r.seller_id = s.id
       ORDER BY r.created_at DESC`
    );
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

/**
 * PUT /admin/reports/:id/resolve — Resolve a report
 */
router.put('/reports/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'resolved', 'dismissed'

    await pool.query(
      'UPDATE reports SET status = $1 WHERE id = $2',
      [status || 'resolved', id]
    );

    res.json({ message: 'Report updated' });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
});

/**
 * DELETE /admin/posts/:id — Admin delete any post
 */
router.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted by admin' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

/**
 * GET /admin/stats — Dashboard statistics
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const sellers = await pool.query('SELECT COUNT(*) FROM sellers');
    const posts = await pool.query('SELECT COUNT(*) FROM posts WHERE expires_at > NOW()');
    const reports = await pool.query('SELECT COUNT(*) FROM reports WHERE status = $1', ['pending']);
    const banned = await pool.query('SELECT COUNT(*) FROM sellers WHERE is_banned = true');

    res.json({
      totalSellers: parseInt(sellers.rows[0].count),
      activePosts: parseInt(posts.rows[0].count),
      pendingReports: parseInt(reports.rows[0].count),
      bannedSellers: parseInt(banned.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

export default router;
