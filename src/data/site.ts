/**
 * Datos centralizados del sitio.
 *
 * REGLA: si un dato de contacto cambia (teléfono, email, dirección, redes),
 * se cambia AQUÍ y solo aquí. Nunca hardcodear en EJS o en otros módulos.
 */

export const site = {
  // Identidad
  name: 'Hurricane Solution',
  tagline: 'Protección De Lonas Contra Huracanes',
  description:
    'Fabricados en EE.UU. con patentes exclusivas. Instalados por expertos en México. Sistemas certificados para huracanes Cat 1–5.',

  // Contacto
  phone: {
    display: '984 803 5014',
    e164: '+529848035014',
    href: 'tel:+529848035014',
  },
  whatsapp: {
    display: '+52 1 998 705 2145',
    number: '5219987052145',
    url: 'https://wa.me/5219987052145',
  },
  email: 'info@hurricanesolution.com',
  address: {
    street: '10 Avenida Norte entre 14 Norte bis y 16 Norte',
    neighborhood: 'Centro',
    postalCode: '77500',
    city: 'Playa del Carmen',
    state: 'Quintana Roo',
    country: 'México',
    full: '10 Avenida Norte entre 14 Norte bis y 16 Norte, Centro, 77500 Playa del Carmen, Q.R., México',
  },

  // Redes sociales
  social: {
    facebook: 'https://www.facebook.com/share/16cZAdbkjj/',
    instagram: 'https://www.instagram.com/hurricanesolution',
    youtube: 'https://youtube.com/@hurricanesolution',
    tiktok: 'https://www.tiktok.com/@hurricane.solutio',
  },

  // Año actual para footer
  year: new Date().getFullYear(),
} as const;

export type Site = typeof site;
