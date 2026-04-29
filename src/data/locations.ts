/**
 * Ubicaciones del cotizador.
 *
 * Extraídas del widget WordPress original. Define las ubicaciones
 * con autocomplete y a qué zona de pricing pertenecen.
 */

export type Zone = 'continental' | 'islas' | 'foranea';

export interface Location {
  nombre: string;
  estado: string;
  zona: Zone;
}

export const locations: Location[] = [
  // Continental Quintana Roo
  { nombre: 'Cancún', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Playa del Carmen', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Tulum', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Puerto Morelos', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Puerto Aventuras', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Akumal', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Xpu-Ha', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Chemuyil', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Xcaret', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Xel-Há', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Bacalar', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Chetumal', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Felipe Carrillo Puerto', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Leona Vicario', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Mahahual', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Riviera Maya', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Playacar', estado: 'Quintana Roo', zona: 'continental' },

  // Islas
  { nombre: 'Cozumel', estado: 'Quintana Roo', zona: 'islas' },
  { nombre: 'Isla Mujeres', estado: 'Quintana Roo', zona: 'islas' },
  { nombre: 'Holbox', estado: 'Quintana Roo', zona: 'islas' },
];

/**
 * Detecta zona basándose en texto libre.
 * Útil cuando el usuario escribe una ciudad que no está en la lista exacta.
 */
export function detectZone(text: string): Zone {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

  const match = locations.find(
    (loc) =>
      normalize(loc.nombre).includes(normalized) ||
      normalized.includes(normalize(loc.nombre)),
  );

  if (match) return match.zona;

  if (
    ['cancun', 'playa', 'tulum', 'carmen', 'riviera', 'maya'].some((k) =>
      normalized.includes(k),
    )
  ) {
    return 'continental';
  }
  if (['cozumel', 'isla', 'holbox'].some((k) => normalized.includes(k))) {
    return 'islas';
  }

  return 'foranea';
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
