import cron from 'node-cron';
import pool from '../config/db';
import { deleteImages } from '../utils/cloudinary';

/**
 * Cleanup expired posts — runs daily at midnight
 * Deletes posts older than 5 days and their images from Cloudinary
 */
export function startCleanupCron(): void {
  // Run every day at 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running expired posts cleanup...');

    try {
      // Get expired posts with their image public IDs
      const expired = await pool.query(
        `SELECT id, image_public_ids FROM posts WHERE expires_at <= NOW()`
      );

      if (expired.rows.length === 0) {
        console.log('[CRON] No expired posts found.');
        return;
      }

      console.log(`[CRON] Found ${expired.rows.length} expired posts. Cleaning up...`);

      // Collect all image public IDs for batch deletion
      const allPublicIds: string[] = [];
      for (const post of expired.rows) {
        if (post.image_public_ids && post.image_public_ids.length > 0) {
          allPublicIds.push(...post.image_public_ids);
        }
      }

      // Delete images from Cloudinary (batch)
      if (allPublicIds.length > 0) {
        try {
          await deleteImages(allPublicIds);
          console.log(`[CRON] Deleted ${allPublicIds.length} images from Cloudinary.`);
        } catch (imgErr) {
          console.error('[CRON] Error deleting images from Cloudinary:', imgErr);
        }
      }

      // Delete expired posts from database
      const deleteResult = await pool.query(
        `DELETE FROM posts WHERE expires_at <= NOW()`
      );

      console.log(`[CRON] Deleted ${deleteResult.rowCount} expired posts from database.`);

      // Also clean up orphan reports for deleted posts
      await pool.query(
        `DELETE FROM reports WHERE post_id NOT IN (SELECT id FROM posts)`
      );

      console.log('[CRON] Cleanup complete.');
    } catch (error) {
      console.error('[CRON] Cleanup error:', error);
    }
  });

  console.log('[CRON] Expired posts cleanup scheduled (daily at midnight).');
}
