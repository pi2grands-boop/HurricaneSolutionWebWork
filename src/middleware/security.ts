/**
 * Middleware de seguridad: Helmet + CORS + Rate limiting.
 *
 * Se monta SIEMPRE primero, antes de cualquier ruta.
 */

import type { RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env, isProduction } from '../config/env.js';

/**
 * Helmet con CSP que permite los scripts inline necesarios para
 * GA4, Meta Pixel, y datos pre-renderizados desde EJS.
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // necesario para scripts inline de GA / FB Pixel
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://connect.facebook.net',
      ],
      connectSrc: [
        "'self'",
        'https://www.google-analytics.com',
        'https://*.analytics.google.com',
        'https://*.facebook.com',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'https://www.google-analytics.com',
        'https://*.facebook.com',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // permite imágenes y videos externos
});

/**
 * CORS restrictivo: solo orígenes de la lista ALLOWED_ORIGINS.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (server-to-server, mobile apps, curl)
    if (!origin) return callback(null, true);

    if (env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  maxAge: 86_400, // cache preflight 24h
});

/**
 * Rate limiter para endpoints de leads.
 * Default: 5 envíos por IP por hora.
 */
export const leadRateLimiter: RequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Demasiados envíos. Intenta de nuevo en una hora.',
  },
  // Trust proxy del provider (Hostinger). Esto se complementa con app.set('trust proxy').
  skip: () => !isProduction && false,
});
