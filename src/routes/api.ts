/**
 * Rutas API (JSON).
 *
 * POST /api/lead — endpoint unificado para todos los formularios:
 *   home, hoteles, contacto, cotizador, etc.
 * Diferenciados por el campo `source`.
 *
 * Validación Zod + honeypot + tiempo mínimo + rate-limit. El webhook
 * Make.com es secreto y vive solo en env.MAKE_WEBHOOK_URL.
 */

import { Router } from 'express';
import { ZodError } from 'zod';

import { leadRateLimiter } from '../middleware/security.js';
import { logger } from '../middleware/logger.js';
import { leadSchema, buildWebhookPayload } from '../schemas/lead.schema.js';
import { forwardLeadToMake } from '../services/lead.service.js';

export const apiRouter = Router();

apiRouter.get('/healthz', (_req, res) => {
  res.json({ ok: true, scope: 'api' });
});

const MIN_FORM_FILL_MS = 2_000;

apiRouter.post('/lead', leadRateLimiter, async (req, res) => {
  let parsed;
  try {
    parsed = leadSchema.parse(req.body ?? {});
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_payload',
        issues: err.flatten().fieldErrors,
      });
    }
    throw err;
  }

  // Honeypot: si llegó lleno, fingimos éxito para no dar señal al bot.
  if (parsed.hp_field && parsed.hp_field.length > 0) {
    logger.warn({ source: parsed.source }, 'Honeypot triggered');
    return res.json({ ok: true });
  }

  // Tiempo mínimo: si el form se envió en menos de 2s, probablemente es bot.
  if (typeof parsed.ts === 'number' && parsed.ts > 0) {
    const elapsed = Date.now() - parsed.ts;
    if (elapsed < MIN_FORM_FILL_MS) {
      logger.warn({ elapsed, source: parsed.source }, 'Form filled too fast');
      return res.json({ ok: true });
    }
  }

  const payload = buildWebhookPayload(parsed);
  const { ok, status } = await forwardLeadToMake(payload);

  if (!ok) {
    // No exponemos el detalle del webhook al cliente.
    return res.status(502).json({
      ok: false,
      error: 'upstream_unavailable',
    });
  }

  logger.info({ source: parsed.source, upstreamStatus: status }, 'Lead forwarded');
  return res.json({ ok: true });
});
