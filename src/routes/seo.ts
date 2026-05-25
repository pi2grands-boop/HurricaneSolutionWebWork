/**
 * SEO técnico: sitemap.xml y robots.txt generados desde el server.
 *
 * Las URLs se construyen con SITE_URL (env var), así que cambiar
 * de dominio temporal a hurricanesolution.com no toca código.
 */

import { Router } from 'express';
import { env, isProduction } from '../config/env.js';
import { getPublishedPosts } from '../services/blog.service.js';

export const seoRouter = Router();

// Páginas estáticas en el sitemap.
const sitemapPaths: ReadonlyArray<{ path: string; priority: string; changefreq: string }> = [
  { path: '/',           priority: '1.0', changefreq: 'weekly'  },
  { path: '/hoteles',    priority: '0.9', changefreq: 'monthly' },
  { path: '/residencial',priority: '0.9', changefreq: 'monthly' },
  { path: '/comercial',  priority: '0.9', changefreq: 'monthly' },
  { path: '/aquagrid',   priority: '0.8', changefreq: 'monthly' },
  { path: '/rain',       priority: '0.8', changefreq: 'monthly' },
  { path: '/equipo',     priority: '0.6', changefreq: 'monthly' },
  { path: '/faq',        priority: '0.7', changefreq: 'monthly' },
  { path: '/contacto',   priority: '0.8', changefreq: 'monthly' },
  { path: '/cotizador',  priority: '0.9', changefreq: 'monthly' },
  { path: '/blog',       priority: '0.8', changefreq: 'weekly'  },
];

seoRouter.get('/sitemap.xml', (_req, res) => {
  const today   = new Date().toISOString().split('T')[0];
  const baseUrl = env.SITE_URL.replace(/\/$/, '');

  const staticUrls = sitemapPaths
    .map(({ path, priority, changefreq }) =>
      `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join('\n');

  // Blog posts publicados — se incluyen dinámicamente
  const blogUrls = getPublishedPosts()
    .map((post) => {
      const lastmod = new Date(post.updated_at || post.created_at).toISOString().split('T')[0];
      return `  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
    .join('\n');

  const allUrls = [staticUrls, blogUrls].filter(Boolean).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls}\n</urlset>`;

  res.type('application/xml').send(xml);
});

seoRouter.get('/robots.txt', (_req, res) => {
  const baseUrl = env.SITE_URL.replace(/\/$/, '');

  const body = isProduction
    ? `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`
    : `User-agent: *
Disallow: /
`;

  res.type('text/plain').send(body);
});
