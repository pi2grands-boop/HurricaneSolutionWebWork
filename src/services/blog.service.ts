/**
 * Blog Service — lectura y escritura de data/posts.json
 * Soporta: bilingüe (lang), programación (scheduled), backward compat.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BlogPost } from '../types/blog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DATA_PATH  = path.resolve(__dirname, '../../data/posts.json');

function ensureDataFile(): void {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '[]', 'utf-8');
}

/** Normaliza posts legacy (sin lang ni canonical_slug) */
function normalize(p: Partial<BlogPost> & { id: string; slug: string }): BlogPost {
  return {
    lang:           (p.lang as 'es' | 'en') || 'es',
    canonical_slug: p.canonical_slug || p.slug,
    status:         (p.status as BlogPost['status']) || 'draft',
    scheduled_at:   p.scheduled_at,
    id:             p.id,
    title:          p.title          ?? '',
    slug:           p.slug           ?? '',
    excerpt:        p.excerpt        ?? '',
    body:           p.body           ?? '',
    image:          p.image          ?? '',
    category:       p.category       ?? 'General',
    tags:           p.tags           ?? [],
    meta_title:     p.meta_title     ?? '',
    meta_description: p.meta_description ?? '',
    keywords:       p.keywords       ?? '',
    date:           p.date           ?? '',
    created_at:     p.created_at     ?? Date.now(),
    updated_at:     p.updated_at     ?? Date.now(),
  };
}

/** Publica automáticamente los posts programados cuya hora ya llegó */
function autoPublishScheduled(posts: BlogPost[]): { posts: BlogPost[]; changed: boolean } {
  const now = Date.now();
  let changed = false;
  const updated = posts.map((p) => {
    if (p.status === 'scheduled' && p.scheduled_at && p.scheduled_at <= now) {
      changed = true;
      return { ...p, status: 'published' as const };
    }
    return p;
  });
  return { posts: updated, changed };
}

export function getAllPosts(): BlogPost[] {
  ensureDataFile();
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) as unknown[];
    const posts = (raw as Array<Partial<BlogPost> & { id: string; slug: string }>).map(normalize);
    const { posts: updated, changed } = autoPublishScheduled(posts);
    if (changed) fs.writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch {
    return [];
  }
}

/** Posts publicados, filtrados por idioma, más recientes primero */
export function getPublishedPosts(lang?: string): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.status === 'published')
    .filter((p) => !lang || p.lang === lang)
    .sort((a, b) => b.created_at - a.created_at);
}

/**
 * Busca un post por canonical_slug + idioma preferido.
 * Si no existe en el idioma preferido, devuelve el del otro idioma (fallback).
 */
export function getPostBySlug(slug: string, preferLang?: string): BlogPost | undefined {
  const all = getAllPosts().filter((p) => p.canonical_slug === slug || p.slug === slug);
  if (all.length === 0) return undefined;
  if (!preferLang) return all[0];
  return all.find((p) => p.lang === preferLang) ?? all[0];
}

export function getPostById(id: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.id === id);
}

export function savePost(post: BlogPost): void {
  ensureDataFile();
  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx === -1) posts.unshift(post); else posts[idx] = post;
  fs.writeFileSync(DATA_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

export function deletePost(id: string): void {
  ensureDataFile();
  const posts = getAllPosts().filter((p) => p.id !== id);
  fs.writeFileSync(DATA_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function generateExcerpt(html: string): string {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 200 ? text.slice(0, 200) + '…' : text;
}
