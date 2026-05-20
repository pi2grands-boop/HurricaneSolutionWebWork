import type { RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env, isProduction } from '../config/env.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://connect.facebook.net',
        'https://cdn.quilljs.com',
        'https://cdn.jsdelivr.net',
      ],
      connectSrc: [
        "'self'",
        'https://www.google-analytics.com',
        'https://*.analytics.google.com',
        'https://*.facebook.com',
      ],
      imgSrc: ["'self'", 'data:', 'https:'],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.quilljs.com',
        'https://cdn.jsdelivr.net',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  maxAge: 86_400,
});

export const leadRateLimiter: RequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Demasiados envíos. Intenta de nuevo en una hora.',
  },
  skip: () => !isProduction && false,
});
