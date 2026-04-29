/**
 * Tipos compartidos del proyecto.
 */

export type LeadSource = 'Landing Cotizador' | 'Landing Contacto';

export interface BaseLeadPayload {
  source: LeadSource;
  full_name: string;
  phone: string;
  timestamp: string;
  fecha_local: string;
}

export interface QuoteLeadPayload extends BaseLeadPayload {
  source: 'Landing Cotizador';
  ubicacion: string;
  zona: string;
  tipo_propiedad: string;
  precio_mostrado: string;
  es_prioritario: 'Sí' | 'No';
}

export interface ContactLeadPayload extends BaseLeadPayload {
  source: 'Landing Contacto';
  email: string;
  tipo_consulta: string;
  mensaje: string;
}

export type LeadPayload = QuoteLeadPayload | ContactLeadPayload;

export interface ApiSuccessResponse {
  ok: true;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  details?: Record<string, string[]>;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;
