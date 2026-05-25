/**
 * Lightweight i18n middleware — no external dependencies.
 * Reads locales/es.json and locales/en.json at startup.
 * Injects t() and lang into res.locals for every request.
 *
 * Language detection order:
 *   1. Cookie `lang`
 *   2. Default: 'es'
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

// ── Load translation files at startup ──────────────────────────────────────
function loadLocale(lang: string): Record<string, unknown> {
  const filePath = path.join(projectRoot, 'locales', `${lang}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const translations: Record<string, Record<string, unknown>> = {
  es: loadLocale('es'),
  en: loadLocale('en'),
};

// ── Nested key lookup ────────────────────────────────────────────────────────
function lookup(obj: Record<string, unknown>, keys: string[]): string | undefined {
  let current: unknown = obj;
  for (const k of keys) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[k];
  }
  return typeof current === 'string' ? current : undefined;
}

// ── t() function ─────────────────────────────────────────────────────────────
function createT(lang: string) {
  return function t(key: string): string {
    const keys = key.split('.');
    const active = translations[lang] ?? {};
    const fallback = translations['es'] ?? {};

    return lookup(active, keys) ?? lookup(fallback, keys) ?? key;
  };
}

// ── Middleware ────────────────────────────────────────────────────────────────
export function i18nMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Parse cookies manually (no cookie-parser required)
  const cookieHeader = req.headers.cookie ?? '';
  const cookieMap: Record<string, string> = {};
  cookieHeader.split(';').forEach((pair) => {
    const [k, ...v] = pair.trim().split('=');
    if (k) cookieMap[k.trim()] = decodeURIComponent(v.join('=').trim());
  });
  const lang = cookieMap['lang'] === 'en' ? 'en' : 'es';

  res.locals.lang = lang;
  res.locals.t = createT(lang);

  next();
}
