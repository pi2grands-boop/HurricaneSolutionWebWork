/**
 * Rutas de páginas (HTML).
 *
 * Cada ruta hace res.render('pages/<slug>', { ... }).
 * Datos comunes (site, env) ya están en res.locals desde server.ts.
 *
 * NOTA: durante Fase 2 estas rutas son placeholders. En Fase 3 se
 * conectan con los templates EJS reales (views/pages/*.ejs).
 */

import { Router, type Request, type Response } from 'express';

export const pagesRouter = Router();

interface PageDef {
  path: string;
  view: string;
  title: string;
  description: string;
}

const pages: PageDef[] = [
  {
    path: '/',
    view: 'pages/home',
    title: 'Hurricane Solution · Protección contra huracanes en México',
    description:
      'Sistemas certificados de protección contra huracanes para hoteles, residencias y empresas en la costa de México.',
  },
  {
    path: '/hoteles',
    view: 'pages/hoteles',
    title: 'Hoteles · Hurricane Solution',
    description:
      'Protección certificada Cat 1–5 para hoteles y resorts en la costa de México.',
  },
  {
    path: '/residencial',
    view: 'pages/residencial',
    title: 'Residencial · Hurricane Solution',
    description:
      'Sistemas residenciales de protección contra huracanes para casas de alto valor.',
  },
  {
    path: '/comercial',
    view: 'pages/comercial',
    title: 'Comercial · Hurricane Solution',
    description:
      'Soluciones para empresas, plazas y propiedades comerciales en zona costera.',
  },
  {
    path: '/aquagrid',
    view: 'pages/aquagrid',
    title: 'AquaGrid · Hurricane Solution',
    description:
      'Sistema AquaGrid para aperturas grandes (>3.8 m). Submarca de Hurricane Solution.',
  },
  {
    path: '/rain',
    view: 'pages/rain',
    title: 'HS Rain Protection · Hurricane Solution',
    description:
      'Protección contra lluvia y sol para terrazas, restaurantes y áreas exteriores.',
  },
  {
    path: '/equipo',
    view: 'pages/equipo',
    title: 'Equipo · Hurricane Solution',
    description: 'Conoce al equipo detrás de Hurricane Solution.',
  },
  {
    path: '/faq',
    view: 'pages/faq',
    title: 'Preguntas frecuentes · Hurricane Solution',
    description:
      'Respuestas a preguntas frecuentes sobre nuestros sistemas de protección.',
  },
  {
    path: '/contacto',
    view: 'pages/contacto',
    title: 'Contacto · Hurricane Solution',
    description:
      'Contáctanos para una consulta sobre protección contra huracanes.',
  },
  {
    path: '/cotizador',
    view: 'pages/cotizador',
    title: 'Cotizador · Hurricane Solution',
    description:
      'Cotiza en línea tu sistema de protección contra huracanes.',
  },
];

const renderPage = (def: PageDef) => (_req: Request, res: Response) => {
  res.render(def.view, {
    title: def.title,
    description: def.description,
  });
};

for (const def of pages) {
  pagesRouter.get(def.path, renderPage(def));
}
