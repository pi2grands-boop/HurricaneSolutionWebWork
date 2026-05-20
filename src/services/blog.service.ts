/**
 * Blog Service — lectura y escritura de data/posts.json
 *
 * El archivo posts.json vive fuera de /public para que no sea
 * accesible directamente desde el navegador.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BlogPost } from '../types/blog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// En dist/services/ → ../../data/posts.json = raíz del proyecto/data/
const DATA_PATH = path.resolve(__dirname, '../../data/posts.json');

/** Crea el archivo si no existe */
function ensureDataFile(): void {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, '[]', 'utf-8');
  }
}

/** Lee todos los posts */
export function getAllPosts(): BlogPost[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as BlogPost[];
  } catch {
    return [];
  }
}

/** Solo posts publicados, más recientes primero */
export function getPublishedPosts(): BlogPost[] {
  return getAllPosts().filter((p) => p.status === 'published');
}

/** Post por slug (solo para páginas públicas) */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Post por id (para el panel admin) */
export function getPostById(id: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.id === id);
}

/**
 * Guarda un post. Si no existe lo inserta al inicio (más reciente primero).
 * Si existe lo actualiza en su posición.
 */
export function savePost(post: BlogPost): void {
  ensureDataFile();
  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx === -1) {
    posts.unshift(post);
  } else {
    posts[idx] = post;
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

/** Elimina un post por id */
export function deletePost(id: string): void {
  ensureDataFile();
  const posts = getAllPosts().filter((p) => p.id !== id);
  fs.writeFileSync(DATA_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

/** Genera slug SEO desde un título */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

/** Genera excerpt automático (primeros 200 chars sin HTML) */
export function generateExcerpt(html: string): string {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 200 ? text.slice(0, 200) + '…' : text;
}
