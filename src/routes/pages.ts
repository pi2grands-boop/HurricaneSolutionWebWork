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
  titleKey: string;
  descKey: string;
}

const pages: PageDef[] = [
  {
    path: '/',
    view: 'pages/home',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/hoteles',
    view: 'pages/hoteles',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/residencial',
    view: 'pages/residencial',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/comercial',
    view: 'pages/comercial',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/aquagrid',
    view: 'pages/aquagrid',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/rain',
    view: 'pages/rain',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/equipo',
    view: 'pages/equipo',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/faq',
    view: 'pages/faq',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/contacto',
    view: 'pages/contacto',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/cotizador',
    view: 'pages/cotizador',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
  {
    path: '/about-ai',
    view: 'pages/about-ai',
    titleKey:  'meta_title',
    descKey:   'meta_desc',
  },
];

const renderPage = (def: PageDef) => (_req: Request, res: Response) => {
  // t() was injected by i18nMiddleware into res.locals
  const t = res.locals.t as (key: string) => string;
  // Derive page namespace from view path (e.g. 'pages/home' → 'home')
  const ns = def.view.split('/').pop() ?? 'home';
  const title = t(`${ns}.meta_title`);
  const description = t(`${ns}.meta_desc`);
  res.render(def.view, { title, description });
};

for (const def of pages) {
  pagesRouter.get(def.path, renderPage(def));
}
