/**
 * Rutas API (JSON).
 *
 * Endpoints que se conectarán en Fase 5 (lead/quote):
 *   POST /api/quote   → formulario del cotizador
 *   POST /api/lead    → formulario de contacto
 *
 * Ambos se validan con Zod, pasan por rate-limiter, y reenvían
 * al webhook Make.com desde lead.service.ts (oculto del cliente).
 */

import { Router } from 'express';

export const apiRouter = Router();

// Placeholder de aliveness para verificar que el router está montado.
apiRouter.get('/healthz', (_req, res) => {
  res.json({ ok: true, scope: 'api' });
});
