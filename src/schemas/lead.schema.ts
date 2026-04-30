/**
 * Schema Zod para POST /api/lead.
 *
 * Acepta los tres shapes que llegan desde el frontend:
 *   - Landing Home / Hoteles / Residencial / etc. (form HTML clásico)
 *   - Landing Contacto (form completo)
 *   - Landing Cotizador (widget JS)
 *
 * Diseño: campos opcionales para que un mismo endpoint sirva a todos los
 * formularios. La obligatoriedad real depende del `source`, pero aquí solo
 * exigimos lo común a todos: full_name (o nombre), phone, source, honeypot vacío.
 */

import { z } from 'zod';

const trimmedString = (max: number) => z.string().trim().max(max);

const phoneSchema = z
  .string()
  .min(1)
  .transform((val) => val.replace(/\D/g, ''))
  .refine((digits) => digits.length >= 10, {
    message: 'Phone must contain at least 10 digits',
  });

const optionalTrim = (max: number) => trimmedString(max).optional();

export const leadSchema = z
  .object({
    source: z.enum([
      'Landing Home',
      'Landing Hoteles',
      'Landing Residencial',
      'Landing Comercial',
      'Landing Rain',
      'Landing AquaGrid',
      'Landing Equipo',
      'Landing Contacto',
      'Landing Cotizador',
    ]),

    // Honeypot — el route handler verifica que esté vacío. Aquí solo limita
    // longitud por sanidad. No rechaza, para responder ok:true silente al bot.
    hp_field: z.string().max(200).optional(),

    // Timestamp de cuando se renderizó el form. Anti-bot: rechazar si <2s.
    ts: z.coerce.number().int().nonnegative().optional(),

    // Nombre: el form de cotizador usa full_name, los demás usan nombre/apellido.
    full_name: optionalTrim(120),
    nombre: optionalTrim(80),
    apellido: optionalTrim(80),

    phone: phoneSchema,

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .max(160)
      .optional(),

    // Cotizador y formularios principales
    tipo_propiedad: optionalTrim(120),
    zona: optionalTrim(80),
    ubicacion: optionalTrim(120),

    // Cotizador
    precio_mostrado: optionalTrim(80),
    es_prioritario: z.enum(['Sí', 'No']).optional(),

    // Contacto
    tipo_consulta: optionalTrim(120),
    mensaje: optionalTrim(2000),

    // Cotizador envía estos opcionalmente
    timestamp: optionalTrim(40),
    fecha_local: optionalTrim(60),
  })
  .refine(
    (data) => Boolean(data.full_name?.trim() || data.nombre?.trim()),
    { message: 'Se requiere full_name o nombre', path: ['full_name'] },
  );

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Construye el payload final que se envía al webhook Make.com.
 * Normaliza los dos shapes (clásico vs cotizador) a un objeto único.
 */
export function buildWebhookPayload(input: LeadInput): Record<string, unknown> {
  const fullName =
    input.full_name?.trim() ||
    [input.nombre, input.apellido].filter(Boolean).join(' ').trim();

  const nowIso = new Date().toISOString();
  const fechaLocal =
    input.fecha_local ||
    new Date().toLocaleString('es-MX', { timeZone: 'America/Cancun' });

  const payload: Record<string, unknown> = {
    source: input.source,
    full_name: fullName,
    phone: input.phone,
    email: input.email,
    tipo_propiedad: input.tipo_propiedad,
    zona: input.zona,
    ubicacion: input.ubicacion,
    precio_mostrado: input.precio_mostrado,
    es_prioritario: input.es_prioritario,
    tipo_consulta: input.tipo_consulta,
    mensaje: input.mensaje,
    timestamp: input.timestamp || nowIso,
    fecha_local: fechaLocal,
  };

  // Limpia undefined para no enviar ruido al webhook.
  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined) delete payload[key];
  }

  return payload;
}
