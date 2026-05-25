/**
 * Rutas públicas del blog — bilingüe.
 * GET /blog          → listado filtrado por idioma activo
 * GET /blog/:slug    → artículo en idioma activo (fallback al otro)
 */

import { Router, type Request, type Response } from 'express';
import { getPublishedPosts, getPostBySlug } from '../services/blog.service.js';

export const blogRouter = Router();

blogRouter.get('/', (_req: Request, res: Response) => {
  const lang  = (res.locals.lang as string) || 'es';
  const posts = getPublishedPosts(lang);
  const t     = res.locals.t as (k: string) => string;
  res.render('pages/blog', {
    title:       t ? t('blog.meta_title')  : 'Blog · Hurricane Solution',
    description: t ? t('blog.meta_desc')   : '',
    posts,
  });
});

blogRouter.get('/:slug', (req: Request, res: Response) => {
  const lang = (res.locals.lang as string) || 'es';
  const post = getPostBySlug(String(req.params.slug), lang);

  if (!post || post.status !== 'published') {
    res.status(404).render('error', { status: 404, message: 'Artículo no encontrado.' });
    return;
  }

  // Formatear fecha según idioma activo
  const dateLocale = lang === 'en' ? 'en-US' : 'es-MX';
  const dateFormatted = new Date(post.created_at).toLocaleDateString(dateLocale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  res.render('pages/blog-post', {
    title:       post.meta_title || `${post.title} · Hurricane Solution`,
    description: post.meta_description || post.excerpt,
    keywords:    post.keywords || '',
    post:        { ...post, date: dateFormatted },
  });
});
