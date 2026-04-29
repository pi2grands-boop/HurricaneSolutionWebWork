/**
 * Productos de Hurricane Solution.
 *
 * Cada producto tiene metadata para SEO + display en páginas de producto.
 * Los datos técnicos (psi, certificaciones) son fuente de verdad para
 * el sitio: si cambian, se cambian aquí.
 */

export type ProductId = 'hs-1500' | 'hs-1250' | 'hs-875' | 'aquagrid' | 'rain';

export interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  category: 'industrial' | 'residencial' | 'comercial' | 'aperturas-grandes' | 'lluvia';
  tagline: string;
  description: string;
  certification: string;
  warrantyYears: number;
  features: string[];
  highlight?: string;
}

export const products: Record<ProductId, Product> = {
  'hs-1500': {
    id: 'hs-1500',
    name: 'HS-1500',
    shortName: 'HS-1500',
    category: 'industrial',
    tagline: 'Sistema insignia con certificación militar Level E',
    description:
      'El sistema más resistente de la línea Hurricane Solution. Certificación militar Level E (EE.UU.) para huracanes Cat 5.',
    certification: 'Military Level E · NOA Miami-Dade · IHPA',
    warrantyYears: 10,
    features: [
      'Resistencia hasta Cat 5',
      'Certificación militar EE.UU.',
      'Patentes exclusivas',
      'Garantía 10 años',
      'Ideal para hoteles y construcciones de alto valor',
    ],
    highlight: 'Premium',
  },
  'hs-1250': {
    id: 'hs-1250',
    name: 'HS-1250',
    shortName: 'HS-1250',
    category: 'residencial',
    tagline: 'Cat 5 certificado, blanco, residencial / diseño',
    description:
      'Sistema certificado para huracanes Cat 5 con acabado blanco. Combina protección extrema con estética para residencias de lujo.',
    certification: 'Cat 5 certificado · NOA Miami-Dade',
    warrantyYears: 7,
    features: [
      'Resistencia Cat 5',
      'Acabado blanco residencial',
      'Diseño discreto',
      'Garantía 7 años',
      'Ideal para residencias de alto valor',
    ],
  },
  'hs-875': {
    id: 'hs-875',
    name: 'HS-875',
    shortName: 'HS-875',
    category: 'residencial',
    tagline: 'Cat 3, polipropileno, residencial accesible',
    description:
      'Solución residencial accesible con polipropileno de alta resistencia. Certificado para huracanes Cat 3.',
    certification: 'Cat 3 certificado',
    warrantyYears: 5,
    features: [
      'Resistencia Cat 3',
      'Polipropileno de alta calidad',
      'Precio accesible',
      'Garantía 5 años',
      'Ideal para residencias estándar',
    ],
  },
  aquagrid: {
    id: 'aquagrid',
    name: 'AquaGrid',
    shortName: 'AquaGrid',
    category: 'aperturas-grandes',
    tagline: 'Submarca para aperturas grandes (>3.8 m)',
    description:
      'Sistema diseñado para aperturas grandes mayores a 3.8 metros. Identidad visual teal distintiva.',
    certification: 'Cat 5 capable',
    warrantyYears: 10,
    features: [
      'Aperturas mayores a 3.8m',
      'Refuerzo estructural integrado',
      'Instalación profesional certificada',
      'Garantía 10 años',
    ],
  },
  rain: {
    id: 'rain',
    name: 'HS Rain Protection',
    shortName: 'Rain',
    category: 'lluvia',
    tagline: 'Protección contra lluvia y sol para terrazas',
    description:
      'Sistema de protección contra lluvia y sol para terrazas, restaurantes y áreas comerciales al aire libre.',
    certification: 'Resistencia ambiental certificada',
    warrantyYears: 5,
    features: [
      'Protección lluvia y sol',
      'Ideal para terrazas y restaurantes',
      'Operación rápida',
      'Garantía 5 años',
    ],
  },
};

export const productsList: Product[] = Object.values(products);
