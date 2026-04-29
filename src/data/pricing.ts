/**
 * Tabla de precios del cotizador, por zona.
 *
 * Extraída del widget WordPress original. Si los precios cambian,
 * se cambian aquí (fuente única). El cotizador del cliente NO
 * conoce esta tabla — los rangos llegan ya formateados desde el server.
 */

import type { Zone } from './locations.js';

export interface PriceRange {
  min: number;
  max: number;
  currency: 'USD';
  unit: 'm²';
  nota: string;
}

export const pricing: Record<Zone, PriceRange> = {
  continental: {
    min: 130,
    max: 170,
    currency: 'USD',
    unit: 'm²',
    nota: '⚠️ Este rango es solo orientativo. El precio real se determina tras una visita técnica y puede variar según las características del proyecto.',
  },
  islas: {
    min: 140,
    max: 180,
    currency: 'USD',
    unit: 'm²',
    nota: 'Por cuestiones de logística y traslado, el precio en islas es ligeramente mayor. El costo final depende de las características constructivas, arquitectónicas, el metraje total y el tipo de sistema.',
  },
  foranea: {
    min: 150,
    max: 190,
    currency: 'USD',
    unit: 'm²',
    nota: 'Para zonas fuera del área principal de servicio, es necesario un metraje mínimo de 200 m². El precio final depende de las características constructivas, arquitectónicas y el tipo de sistema.',
  },
};

/**
 * Tipos de propiedad que dispara prioridad alta en el lead.
 * Los hoteles, proyectos y torres se marcan como "es_prioritario": "Sí".
 */
export const tiposPrioritarios = [
  'hotel',
  'proyecto_construccion',
  'torre',
] as const;

export type TipoPropiedad =
  | 'casa'
  | 'departamento'
  | 'hotel'
  | 'comercio'
  | 'proyecto_construccion'
  | 'torre';

export const tiposPropiedadLabels: Record<TipoPropiedad, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  hotel: 'Hotel',
  comercio: 'Comercio',
  proyecto_construccion: 'Proyecto en Construcción',
  torre: 'Torre con varios Departamentos',
};

export function isPrioritario(tipo: string): boolean {
  return (tiposPrioritarios as readonly string[]).includes(tipo);
}

export function formatPriceRange(zone: Zone): string {
  const range = pricing[zone];
  return `$${range.min} - $${range.max} ${range.currency}/${range.unit}`;
}
