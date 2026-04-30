/**
 * Servicio que reenvía el lead al webhook Make.com.
 * El URL real vive solo en env (MAKE_WEBHOOK_URL) y nunca se expone al cliente.
 */

import { env } from '../config/env.js';
import { logger } from '../middleware/logger.js';

const FETCH_TIMEOUT_MS = 8_000;

export async function forwardLeadToMake(
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      logger.warn(
        { status: res.status, source: payload.source },
        'Make webhook returned non-2xx',
      );
    }

    return { ok: res.ok, status: res.status };
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err), source: payload.source },
      'Make webhook fetch failed',
    );
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}
