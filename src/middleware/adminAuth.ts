/**
 * Middleware de protección del panel admin.
 * Si no hay sesión activa, redirige al login.
 */

import type { Request, Response, NextFunction } from 'express';

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if ((req.session as any).isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}
