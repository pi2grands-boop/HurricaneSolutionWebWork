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
    title: 'Protección contra huracanes Cat 5 en México · Hurricane Solution',
    description:
      'Sistemas certificados Level E para hoteles, residencias y empresas en Riviera Maya, Cancún, Los Cabos y costa de México. Más de 30 tormentas superadas.',
  },
  {
    path: '/hoteles',
    view: 'pages/hoteles',
    title: 'Protección de huracanes para hoteles y resorts · Hurricane Solution',
    description:
      'Sistemas certificados Cat 1–5 para hoteles y resorts en Riviera Maya, Cancún y costa de México. Despliegue en 48h por su propio equipo. Garantía 10 años.',
  },
  {
    path: '/residencial',
    view: 'pages/residencial',
    title: 'Protección residencial contra huracanes · Hurricane Solution',
    description:
      'Sistemas residenciales certificados Cat 5 para casas de alto valor en la costa de México. Diseño limpio, sin obra mayor. Garantía escrita hasta 10 años.',
  },
  {
    path: '/comercial',
    view: 'pages/comercial',
    title: 'Protección comercial contra huracanes · Hurricane Solution',
    description:
      'Soluciones para empresas, hospitales, agencias y plazas comerciales en zona costera. Continuidad operativa garantizada con certificación militar Level E.',
  },
  {
    path: '/aquagrid',
    view: 'pages/aquagrid',
    title: 'AquaGrid · Aperturas grandes (>3.8 m) · Hurricane Solution',
    description:
      'AquaGrid: protección contra huracanes para aperturas mayores a 3.8 m. Para hoteles, lobbies y fachadas singulares en la costa de México.',
  },
  {
    path: '/rain',
    view: 'pages/rain',
    title: 'HS Rain Protection · Lluvia, viento y sol · Hurricane Solution',
    description:
      'Protección contra lluvia, viento y arena para terrazas, restaurantes y áreas exteriores en hoteles y residencias de la costa de México.',
  },
  {
    path: '/equipo',
    view: 'pages/equipo',
    title: 'Equipo · Hurricane Solution',
    description:
      'Ingenieros y especialistas en protección contra huracanes operando en México desde 2008. Más de 30 tormentas superadas con cero fallas en instalaciones correctas.',
  },
  {
    path: '/faq',
    view: 'pages/faq',
    title: 'Preguntas frecuentes · Hurricane Solution',
    description:
      'Respuestas a preguntas frecuentes sobre nuestros sistemas de protección contra huracanes: certificaciones, instalación, tiempos de despliegue y garantía.',
  },
  {
    path: '/contacto',
    view: 'pages/contacto',
    title: 'Contacto · Evaluación gratuita · Hurricane Solution',
    description:
      'Solicite su evaluación gratuita. Le contactamos en menos de 24 horas. Oficinas en Playa del Carmen. WhatsApp, teléfono y correo disponibles.',
  },
  {
    path: '/cotizador',
    view: 'pages/cotizador',
    title: 'Cotizador en línea · Hurricane Solution',
    description:
      'Cotice en línea su sistema de protección contra huracanes. Estimado por zona y tipo de propiedad para Riviera Maya, Cancún y resto de México.',
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
