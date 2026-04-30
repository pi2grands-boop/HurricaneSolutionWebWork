#!/usr/bin/env node
/**
 * Validador local del webhook Make.com.
 *
 * Envía dos payloads de prueba (cotizador y contacto) directamente al webhook
 * — sin pasar por nuestro server — para verificar que Make.com:
 *   1. Acepta el shape del cotizador (source="Landing Cotizador").
 *   2. Acepta el shape del contacto (source="Landing Contacto").
 *
 * Uso:
 *   node scripts/test-webhook.mjs                 # lee MAKE_WEBHOOK_URL del .env
 *   node scripts/test-webhook.mjs <URL>           # usa la URL que pases
 *   node scripts/test-webhook.mjs --skip-contacto # solo prueba cotizador
 *
 * Los payloads están marcados con full_name="TEST - ..." para que sea fácil
 * filtrarlos/borrarlos en Make.com / Airtable después.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

function readWebhookFromEnv() {
  try {
    const env = readFileSync(resolve(REPO_ROOT, '.env'), 'utf8');
    const match = env.match(/^MAKE_WEBHOOK_URL=(.+)$/m);
    return match?.[1].trim().replace(/^["']|["']$/g, '') ?? null;
  } catch {
    return null;
  }
}

function nowMx() {
  return new Date().toLocaleString('es-MX', { timeZone: 'America/Cancun' });
}

const cotizadorPayload = {
  source: 'Landing Cotizador',
  full_name: 'TEST - Webhook validation (cotizador)',
  phone: '9981234567',
  ubicacion: 'Cancún',
  zona: 'Continental',
  tipo_propiedad: 'Hotel',
  precio_mostrado: '$130 - $170 USD/m²',
  es_prioritario: 'Sí',
  timestamp: new Date().toISOString(),
  fecha_local: nowMx(),
};

const contactoPayload = {
  source: 'Landing Contacto',
  full_name: 'TEST - Webhook validation (contacto)',
  email: 'test@hurricanesolution.test',
  phone: '9981234567',
  tipo_consulta: 'Hotel / Resort',
  mensaje: 'Mensaje de prueba — borrar de Make.com / Airtable.',
  timestamp: new Date().toISOString(),
  fecha_local: nowMx(),
};

async function send(url, label, payload) {
  process.stdout.write(`-> ${label}... `);
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const ms = Date.now() - start;
    const body = await res.text();
    const preview = body.length > 200 ? body.slice(0, 200) + '...' : body;
    console.log(`${res.ok ? 'OK' : 'FAIL'} (${res.status}, ${ms}ms)`);
    console.log(`   body: ${preview || '(empty)'}`);
    return res.ok;
  } catch (err) {
    console.log(`FAIL`);
    console.log(`   error: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const skipContacto = args.includes('--skip-contacto');
  const skipCotizador = args.includes('--skip-cotizador');
  const urlArg = args.find((a) => /^https?:\/\//.test(a));
  const webhookUrl = urlArg || process.env.MAKE_WEBHOOK_URL || readWebhookFromEnv();

  if (!webhookUrl) {
    console.error('ERROR: no MAKE_WEBHOOK_URL.');
    console.error('  Pasa la URL como argumento o defínela en .env / variable de entorno.');
    process.exit(2);
  }

  if (/XXXXXXX|<.*>/.test(webhookUrl)) {
    console.error(`ERROR: la URL parece un placeholder: ${webhookUrl}`);
    process.exit(2);
  }

  const masked = (() => {
    try {
      const u = new URL(webhookUrl);
      const path = u.pathname.replace(/\/$/, '');
      const tail = path.slice(path.lastIndexOf('/') + 1);
      const shown = tail.length > 12 ? `${tail.slice(0, 4)}...${tail.slice(-4)}` : tail;
      return `${u.origin}${path.slice(0, path.lastIndexOf('/') + 1)}${shown}`;
    } catch {
      return webhookUrl;
    }
  })();
  console.log(`Webhook: ${masked}`);
  console.log(`Hora local: ${nowMx()}`);
  console.log('');

  const results = [];
  if (!skipCotizador) results.push(await send(webhookUrl, 'cotizador', cotizadorPayload));
  if (!skipContacto) results.push(await send(webhookUrl, 'contacto ', contactoPayload));

  console.log('');
  if (results.every(Boolean)) {
    console.log('Listo — todos los payloads aceptados.');
    console.log('Verifica en Make.com / Airtable que llegaron y se procesaron correctamente.');
    console.log('Recordá borrar los registros de prueba.');
    return 0;
  } else {
    console.log('Alguno falló — revisar logs de Make.com.');
    return 1;
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error('Fatal:', err);
    process.exitCode = 1;
  });
