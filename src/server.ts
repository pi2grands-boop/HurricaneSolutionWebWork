/**
 * Entry point del servidor Express.
 *
 * Orden de middleware (CRÍTICO):
 *   1. trust proxy           → para rate-limit detrás del proxy de Hostinger
 *   2. helmet                → headers de seguridad primero
 *   3. compression           → gzip
 *   4. cors                  → allowlist de orígenes
 *   5. http logger (pino)    → log estructurado de cada request
 *   6. body parsers          → JSON y urlencoded
 *   7. static (/public)      → assets
 *   8. view engine EJS       → render de páginas
 *   9. rutas                 → pages, api, seo
 *  10. 404                   → notFoundHandler
 *  11. errorHandler          → último, captura todo
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';

import { env, isProduction } from './config/env.js';
import {
  helmetMiddleware,
  corsMiddleware,
} from './middleware/security.js';
import { logger, httpLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errors.js';

import { pagesRouter } from './routes/pages.js';
import { apiRouter } from './routes/api.js';
import { seoRouter } from './routes/seo.js';

import { site } from './data/site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();

// Hostinger Node.js corre detrás de un reverse proxy.
// Esto permite a express-rate-limit ver la IP real del cliente.
app.set('trust proxy', 1);

// Vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views'));

// Datos disponibles en TODAS las vistas vía res.locals
app.use((req, res, next) => {
  res.locals.site = site;
  res.locals.env = {
    GA_ID: env.GA_ID,
    FB_PIXEL_ID: env.FB_PIXEL_ID,
    SITE_URL: env.SITE_URL,
    isProduction,
  };
  res.locals.currentPath = req.path;
  next();
});

// Seguridad y logging
app.use(helmetMiddleware);
app.use(compression());
app.use(corsMiddleware);
app.use(httpLogger);

// Body parsers
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

// Static — sirve /public en la raíz
app.use(
  express.static(path.join(projectRoot, 'public'), {
    maxAge: isProduction ? '7d' : 0,
    etag: true,
  }),
);

// Healthcheck (antes de rutas con render para que no dependa de vistas)
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, env: env.NODE_ENV, uptime: process.uptime() });
});

// Rutas
app.use('/', seoRouter); // /sitemap.xml, /robots.txt
app.use('/api', apiRouter); // /api/quote, /api/lead
app.use('/', pagesRouter); // /, /hoteles, /residencial, ...

// 404 + error handler (siempre al final)
app.use(notFoundHandler);
app.use(errorHandler);

// Arranque
const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV, siteUrl: env.SITE_URL },
    'Hurricane Solution server listening',
  );
});

// Shutdown ordenado (Hostinger envía SIGTERM al reiniciar)
const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutting down');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
