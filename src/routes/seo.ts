/**
 * SEO técnico: sitemap.xml y robots.txt generados desde el server.
 *
 * Las URLs se construyen con SITE_URL (env var), así que cambiar
 * de dominio temporal a hurricanesolution.com no toca código.
 */

import { Router } from 'express';
import { env, isProduction } from '../config/env.js';

export const seoRouter = Router();

// Páginas que aparecen en el sitemap.
const sitemapPaths: ReadonlyArray<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/hoteles', priority: '0.9', changefreq: 'monthly' },
  { path: '/residencial', priority: '0.9', changefreq: 'monthly' },
  { path: '/comercial', priority: '0.9', changefreq: 'monthly' },
  { path: '/aquagrid', priority: '0.8', changefreq: 'monthly' },
  { path: '/rain', priority: '0.8', changefreq: 'monthly' },
  { path: '/equipo', priority: '0.6', changefreq: 'monthly' },
  { path: '/faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/contacto', priority: '0.8', changefreq: 'monthly' },
  { path: '/cotizador', priority: '0.9', changefreq: 'monthly' },
];

seoRouter.get('/sitemap.xml', (_req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const baseUrl = env.SITE_URL.replace(/\/$/, '');

  const urls = sitemapPaths
    .map(
      ({ path, priority, changefreq }) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.type('application/xml').send(xml);
});

seoRouter.get('/robots.txt', (_req, res) => {
  const baseUrl = env.SITE_URL.replace(/\/$/, '');
  // En entornos no productivos (dominio temporal de pruebas) bloqueamos indexación.
  const body = isProduction
    ? `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`
    : `User-agent: *
Disallow: /
`;

  res.type('text/plain').send(body);
});
