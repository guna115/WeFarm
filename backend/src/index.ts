import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';

import authRoutes from './routes/auth';
import sellerRoutes from './routes/seller';
import postRoutes from './routes/posts';
import adminRoutes from './routes/admin';
import { authMiddleware } from './middleware/auth';
import { generalLimiter, authLimiter, uploadLimiter } from './middleware/rateLimiter';
import { uploadImage } from './utils/cloudinary';
import { addWatermark, compressImage } from './utils/watermark';
import { verifyPlantImage } from './utils/aiModerator';
import { startCleanupCron } from './cron/cleanup';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (needed for rate limiter when behind Render/Localtunnel)
app.set('trust proxy', 1);

// Global middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// Multer for image uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'WeFarm API',
  });
});

// Auth routes (rate limited)
app.use('/api/auth', authLimiter, authRoutes);

// Seller routes — no auth middleware during testing phase
// Auth middleware will be added when OTP login is implemented
app.use('/api/seller', sellerRoutes);

// Post routes (mixed auth — routes handle their own auth internally)
app.use('/api/posts', postRoutes);

// Image upload endpoint — dev mode: no auth; prod: add authMiddleware
// Upload middleware — no auth during testing phase
const uploadMiddleware = [uploadLimiter, upload.array('images', 5)];
app.post(
  '/api/upload',
  ...uploadMiddleware,
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ message: 'No images provided' });
        return;
      }

      const nurseryName = req.body.nursery_name || 'WeFarm';
      const results = [];

      // Moderate and upload each file
      for (const file of files) {
        // Step 1: Compress image
        let processedBuffer = await compressImage(file.buffer);
        
        // Step 2: AI Verification
        const isPlant = await verifyPlantImage(processedBuffer, 'image/jpeg');
        if (!isPlant) {
          res.status(400).json({ 
            message: 'AI detected a non-plant image. Please upload only photos of plants, crops, or nurseries.' 
          });
          return;
        }

        // Step 3: Upload to Cloudinary
        const uploaded = await uploadImage(processedBuffer);
        results.push(uploaded);
      }

      res.json({
        images: results,
        urls: results.map((r) => r.url),
        publicIds: results.map((r) => r.publicId),
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Image upload failed' });
    }
  }
);

// Admin routes (admin auth protected)
app.use('/api/admin', adminRoutes);

// Start cron jobs
startCleanupCron();

// Start server
app.listen(PORT, () => {
  console.log(`
  🌱 WeFarm API Server
  ────────────────────
  Status:  Running
  Port:    ${PORT}
  Env:     ${process.env.NODE_ENV || 'development'}
  Time:    ${new Date().toISOString()}
  ────────────────────
  `);
});

export default app;
