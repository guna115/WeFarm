import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

/**
 * Auth rate limiter — 5 OTP requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests. Try again in 15 minutes.' },
});

/**
 * Upload rate limiter — 10 uploads per hour
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Upload limit reached. Try again in an hour.' },
});
