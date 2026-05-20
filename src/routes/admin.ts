/**
 * Rutas del panel de administración del blog.
 *
 * GET  /admin/login          → pantalla de login
 * POST /admin/login          → autenticación
 * POST /admin/logout         → cerrar sesión
 * GET  /admin                → dashboard (lista de posts)
 * GET  /admin/post/new       → formulario nuevo post
 * GET  /admin/post/edit/:id  → formulario editar post
 * POST /admin/post/save      → guardar (crear o actualizar)
 * POST /admin/post/delete/:id→ eliminar post
 * GET  /admin/api/slug       → genera slug desde título (llamada AJAX)
 */

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { env } from '../config/env.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  getAllPosts,
  getPostById,
  savePost,
  deletePost,
  generateSlug,
  generateExcerpt,
} from '../services/blog.service.js';
import type { BlogPost } from '../types/blog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const adminRouter = Router();

// ─── MULTER — subida de imágenes ─────────────────────────────────────────────
const uploadDir = path.resolve(__dirname, '../../public/img/blog');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `post-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo JPG, PNG o WEBP'));
    }
  },
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

adminRouter.get('/login', (req: Request, res: Response) => {
  if ((req.session as any).isAdmin) { res.redirect('/admin'); return; }
  res.render('admin/login', {
    layout: 'layouts/admin',
    title: 'Acceso Admin · Hurricane Solution',
    error: null,
  });
});

adminRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body as { password: string };
  if (password === env.ADMIN_PASSWORD) {
    (req.session as any).isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', {
      layout: 'layouts/admin',
      title: 'Acceso Admin · Hurricane Solution',
      error: 'Contraseña incorrecta. Intenta de nuevo.',
    });
  }
});

adminRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => { res.redirect('/admin/login'); });
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

adminRouter.get('/', requireAdmin, (_req: Request, res: Response) => {
  const posts = getAllPosts();
  res.render('admin/dashboard', {
    layout: 'layouts/admin',
    title: 'Dashboard · Blog Admin',
    posts,
  });
});

// ─── NUEVO POST ───────────────────────────────────────────────────────────────

adminRouter.get('/post/new', requireAdmin, (_req: Request, res: Response) => {
  res.render('admin/post-form', {
    layout: 'layouts/admin',
    title: 'Nuevo Post',
    post: null,
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

adminRouter.post(
  '/post/save',
  requireAdmin,
  upload.single('image'),
  (req: Request, res: Response) => {
    const b = req.body as {
      id?: string;
      title: string;
      slug?: string;
      body: string;
      category: string;
      tags?: string;
      meta_title: string;
      meta_description: string;
      keywords?: string;
      status: 'draft' | 'published';
    };

    if (!b.title?.trim() || !b.body?.trim()) {
      res.render('admin/post-form', {
        layout: 'layouts/admin',
        title: b.id ? 'Editar Post' : 'Nuevo Post',
        post: b,
        error: 'El título y el contenido son obligatorios.',
      });
      return;
    }

    const isNew = !b.id;
    const now = Date.now();
    const id = b.id?.trim() || String(now);
    const slug = b.slug?.trim() || generateSlug(b.title);
    const excerpt = generateExcerpt(b.body);

    // Imagen: nueva subida > imagen existente > sin imagen
    let image = '';
    if (req.file) {
      image = `/img/blog/${req.file.filename}`;
    } else if (!isNew) {
      image = getPostById(String(id))?.image || '';
    }

    const post: BlogPost = {
      id,
      title: b.title.trim(),
      slug,
      excerpt,
      body: b.body,
      image,
      category: b.category?.trim() || 'General',
      tags: b.tags
        ? b.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      meta_title: b.meta_title?.trim() || b.title.trim(),
      meta_description: b.meta_description?.trim() || excerpt.slice(0, 160),
      keywords: b.keywords?.trim() || '',
      status: b.status === 'published' ? 'published' : 'draft',
      date: new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      created_at: isNew ? now : (getPostById(String(id))?.created_at ?? now),
      updated_at: now,
    };

    savePost(post);
    res.redirect('/admin');
  },
);

// ─── ELIMINAR POST ────────────────────────────────────────────────────────────

adminRouter.post('/post/delete/:id', requireAdmin, (req: Request, res: Response) => {
  deletePost(String(req.params.id));
  res.redirect('/admin');
});

// ─── API: generar slug desde título (llamada AJAX del formulario) ─────────────

adminRouter.get('/api/slug', requireAdmin, (req: Request, res: Response) => {
  const title = (req.query.title as string) || '';
  res.json({ slug: generateSlug(title) });
});
