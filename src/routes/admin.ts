/**
 * Rutas del panel admin del blog.
 * Soporta: bilingüe (lang), programación (scheduled_at), traducción de posts.
 */

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { env } from '../config/env.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  getAllPosts, getPostById, savePost, deletePost,
  generateSlug, generateExcerpt,
} from '../services/blog.service.js';
import type { BlogPost } from '../types/blog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
export const adminRouter = Router();

// ─── MULTER ───────────────────────────────────────────────────────────────────
const uploadDir = path.resolve(__dirname, '../../public/img/blog');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `post-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Solo JPG, PNG o WEBP'));
  },
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
adminRouter.get('/login', (req: Request, res: Response) => {
  if ((req.session as any).isAdmin) { res.redirect('/admin'); return; }
  res.render('admin/login', { layout: 'layouts/admin', title: 'Acceso Admin', error: null });
});

adminRouter.post('/login', (req: Request, res: Response) => {
  if ((req.body as any).password === env.ADMIN_PASSWORD) {
    (req.session as any).isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', { layout: 'layouts/admin', title: 'Acceso Admin',
      error: 'Contraseña incorrecta.' });
  }
});

adminRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
adminRouter.get('/', requireAdmin, (_req: Request, res: Response) => {
  res.render('admin/dashboard', {
    layout: 'layouts/admin',
    title: 'Dashboard · Blog Admin',
    posts: getAllPosts(),
  });
});

// ─── NUEVO POST ───────────────────────────────────────────────────────────────
adminRouter.get('/post/new', requireAdmin, (req: Request, res: Response) => {
  // Si viene con ?pair=SLUG&lang=en → pre-rellenar canonical_slug y lang
  const pairSlug = (req.query.pair as string) || '';
  const pairLang = (req.query.lang as string) || 'es';
  res.render('admin/post-form', {
    layout: 'layouts/admin',
    title: 'Nuevo Post',
    post: pairSlug ? { canonical_slug: pairSlug, lang: pairLang } : null,
    error: null,
  });
});

// ─── EDITAR POST ──────────────────────────────────────────────────────────────
adminRouter.get('/post/edit/:id', requireAdmin, (req: Request, res: Response) => {
  const post = getPostById(String(req.params.id));
  if (!post) { res.redirect('/admin'); return; }
  res.render('admin/post-form', {
    layout: 'layouts/admin',
    title: `Editar: ${post.title}`,
    post,
    error: null,
  });
});

// ─── GUARDAR POST ─────────────────────────────────────────────────────────────
adminRouter.post('/post/save', requireAdmin, upload.single('image'),
  (req: Request, res: Response) => {
    const b = req.body as {
      id?: string;
      lang?: string;
      canonical_slug?: string;
      title: string;
      slug?: string;
      body: string;
      category: string;
      tags?: string;
      meta_title: string;
      meta_description: string;
      keywords?: string;
      status: string;
      scheduled_at?: string;      // ISO string del datetime-local input
    };

    if (!b.title?.trim() || !b.body?.trim()) {
      res.render('admin/post-form', {
        layout: 'layouts/admin',
        title: b.id ? 'Editar Post' : 'Nuevo Post',
        post: b, error: 'El título y el contenido son obligatorios.',
      });
      return;
    }

    const isNew      = !b.id;
    const now        = Date.now();
    const id         = b.id?.trim() || String(now);
    const lang       = (b.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
    const slug       = b.slug?.trim() || generateSlug(b.title);
    const canonical  = b.canonical_slug?.trim() || slug;

    // Programación
    let status: BlogPost['status'] = 'draft';
    let scheduled_at: number | undefined;

    if (b.status === 'published') {
      status = 'published';
    } else if (b.status === 'scheduled' && b.scheduled_at) {
      const ts = new Date(b.scheduled_at).getTime();
      if (!isNaN(ts) && ts > now) {
        status = 'scheduled';
        scheduled_at = ts;
      } else {
        // Si la fecha ya pasó → publicar inmediatamente
        status = 'published';
      }
    }

    let image = '';
    if (req.file) {
      image = `/img/blog/${req.file.filename}`;
    } else if (!isNew) {
      image = getPostById(String(id))?.image || '';
    }

    const post: BlogPost = {
      id,
      lang,
      canonical_slug: canonical,
      title:          b.title.trim(),
      slug,
      excerpt:        generateExcerpt(b.body),
      body:           b.body,
      image,
      category:       b.category?.trim() || 'General',
      tags:           b.tags ? b.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      meta_title:     b.meta_title?.trim() || b.title.trim(),
      meta_description: b.meta_description?.trim() || generateExcerpt(b.body).slice(0, 160),
      keywords:       b.keywords?.trim() || '',
      status,
      scheduled_at,
      date:           new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
      created_at:     isNew ? now : (getPostById(String(id))?.created_at ?? now),
      updated_at:     now,
    };

    savePost(post);
    res.redirect('/admin');
  },
);

// ─── ELIMINAR ─────────────────────────────────────────────────────────────────
adminRouter.post('/post/delete/:id', requireAdmin, (req: Request, res: Response) => {
  deletePost(String(req.params.id));
  res.redirect('/admin');
});

// ─── API: slug desde título ───────────────────────────────────────────────────
adminRouter.get('/api/slug', requireAdmin, (req: Request, res: Response) => {
  res.json({ slug: generateSlug((req.query.title as string) || '') });
});
