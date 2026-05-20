/**
 * Rutas públicas del blog.
 *
 * GET /blog          → listado de posts publicados
 * GET /blog/:slug    → artículo individual (su propia URL para SEO)
 */

import { Router, type Request, type Response } from 'express';
import { getPublishedPosts, getPostBySlug } from '../services/blog.service.js';

export const blogRouter = Router();

blogRouter.get('/', (_req: Request, res: Response) => {
  const posts = getPublishedPosts();
  res.render('pages/blog', {
    title: 'Blog · Protección contra huracanes · Hurricane Solution',
    description:
      'Artículos sobre protección contra huracanes, temporadas, consejos de preparación y novedades de Hurricane Solution en México.',
    posts,
  });
});

blogRouter.get('/:slug', (req: Request, res: Response) => {
  const post = getPostBySlug(String(req.params.slug));

  if (!post || post.status !== 'published') {
    res.status(404).render('error', {
      status: 404,
      message: 'Artículo no encontrado.',
    });
    return;
  }

  res.render('pages/blog-post', {
    title: post.meta_title || `${post.title} · Hurricane Solution`,
    description: post.meta_description || post.excerpt,
    keywords: post.keywords || '',
    post,
  });
});
