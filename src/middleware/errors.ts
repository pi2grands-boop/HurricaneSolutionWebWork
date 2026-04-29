/**
 * Middleware de manejo de errores centralizado.
 */

import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger.js';
import { isProduction } from '../config/env.js';

/**
 * 404 — debe ser el último handler antes del errorHandler.
 */
export const notFoundHandler: RequestHandler = (req, res) => {
  if (req.accepts('html')) {
    res.status(404).render('error', {
      status: 404,
      message: 'Página no encontrada',
      title: 'Página no encontrada · Hurricane Solution',
      layout: false,
    });
    return;
  }

  res.status(404).json({
    ok: false,
    error: 'Not found',
  });
};

/**
 * Manejador centralizado de errores.
 * Distingue:
 *  - ZodError → 400 con detalles
 *  - Error genérico → 500 sin filtrar mensaje en producción
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // ZodError de validación
  if (err instanceof ZodError) {
    logger.warn({ err: err.flatten() }, 'Validation error');
    res.status(400).json({
      ok: false,
      error: 'Datos inválidos',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // Error CORS
  if (err instanceof Error && err.message.startsWith('Origin not allowed')) {
    logger.warn({ origin: err.message }, 'CORS rejection');
    res.status(403).json({ ok: false, error: 'Origen no permitido' });
    return;
  }

  // Error genérico
  logger.error({ err }, 'Unhandled error');

  const message = isProduction
    ? 'Error interno del servidor'
    : err instanceof Error
      ? err.message
      : 'Unknown error';

  if (req.accepts('html')) {
    res.status(500).render('error', {
      status: 500,
      message,
      title: 'Error · Hurricane Solution',
      layout: false,
    });
    return;
  }

  res.status(500).json({ ok: false, error: message });
};
