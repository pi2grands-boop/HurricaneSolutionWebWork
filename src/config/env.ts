/**
 * Configuración de variables de entorno con validación Zod.
 *
 * Si una variable requerida falta o tiene formato inválido,
 * el server NO arranca y muestra exactamente qué falló.
 * Esto previene deploys silenciosamente rotos.
 */

import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // Entorno
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Puerto. Hostinger asigna su propio valor; default 3000 para local.
  PORT: z.coerce.number().int().positive().default(3000),

  // URL pública del sitio (afecta SEO, sitemap, canonicals).
  SITE_URL: z.string().url(),

  // Lista de orígenes permitidos por CORS, separada por comas.
  ALLOWED_ORIGINS: z
    .string()
    .min(1)
    .transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),

  // Webhook Make.com — SECRETO. Solo en panel Hostinger.
  MAKE_WEBHOOK_URL: z.string().url(),

  // Google Analytics 4 — ID de medición (G-XXXXXXXXXX).
  GA_ID: z.string().min(1),

  // Meta Pixel — opcional. Si vacío, no se carga el script.
  FB_PIXEL_ID: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),

  // Rate limiting.
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(3_600_000),

  // Logging.
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),

  // Blog admin — contraseña de acceso al panel.
  ADMIN_PASSWORD: z.string().min(8),

  // Secreto para firmar las cookies de sesión del admin.
  // Mínimo 32 caracteres. Genera uno con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  SESSION_SECRET: z.string().min(32),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Variables de entorno inválidas:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = typeof env;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
