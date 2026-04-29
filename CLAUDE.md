# HurricaneSolutionWeb — contexto para agentes IA

> Documento de orientación para futuros agentes (Claude Sonnet / Opus / Haiku u otro LLM) que vayan a trabajar sobre este repositorio. Léelo antes de proponer cambios.
>
> **Para estado vivo del proyecto** (pendientes, decisiones del cliente, configuraciones faltantes), ver `PROJECT_CONTEXT.md`.
>
> **Para instrucciones de uso humano** (clonar, instalar, deployar), ver `README.md`.

---

## 1. Qué es esto

Sitio web de marketing y captura de leads para **Hurricane Solution**, empresa mexicana (Playa del Carmen, Quintana Roo) que vende sistemas de protección contra huracanes para hoteles, residencias y empresas en la costa de México.

- **Objetivo del sitio:** generación de leads. El "éxito" es que el visitante llene el formulario de contacto, complete el cotizador, o haga clic en WhatsApp / teléfono.
- **Audiencia:** dueños de hoteles, gerentes corporativos y propietarios residenciales de alto valor en zonas costeras (Riviera Maya, Cancún, Los Cabos, Vallarta, Mazatlán, Acapulco).
- **Idioma:** español (México). Botón "EN" pendiente de implementación (placeholder).

### Productos
- **HS-1500** — sistema insignia, certificación militar Level E.
- **HS-1250** — Cat 5 certificado, blanco, residencial / diseño.
- **HS-875** — Cat 3, polipropileno, residencial accesible.
- **AquaGrid** — submarca para aperturas grandes (>3.8 m).
- **HS Rain Protection** — protección contra lluvia/sol para terrazas/restaurantes.

---

## 2. Stack actual

**A partir de abril 2026, el sitio está siendo migrado de HTML/CSS/JS vanilla a Express + EJS + TypeScript.**

### Rama `main`
Sitio original HTML/CSS/JS vanilla. Es la versión "snapshot pre-migración". No editar a menos que el cliente pida un fix urgente que no pueda esperar al deploy de la nueva versión.

### Rama `feat/migrate-typescript-node`
Migración en curso. **Esta es donde se debe trabajar.**

**Stack:**
- Node.js 20 LTS
- TypeScript 5.6+ con `strict: true`
- Express 4 (server HTTP)
- EJS (templates HTML)
- Zod (validación schemas)
- Helmet + express-rate-limit + CORS (seguridad)
- Pino (logging estructurado)
- tsx (dev) + tsc (build)

**Sin frameworks de frontend.** El JS del cliente es TypeScript vanilla compilado a `public/js/`. El diseño y la experiencia de usuario se preservan 100% del sitio original.

**Hosting:** Hostinger Node.js. Variables de entorno gestionadas en el panel Hostinger (no en archivos del servidor).

---

## 3. Estructura del repositorio

```
HurricaneSolutionWeb/
├── src/                    Código TypeScript del SERVIDOR
│   ├── server.ts           Entry point Express
│   ├── config/env.ts       Env vars validadas con Zod
│   ├── routes/             pages, api, seo
│   ├── middleware/         security, logger, errors
│   ├── services/           lead, analytics
│   ├── schemas/            Zod schemas
│   ├── data/               site, products, locations, pricing
│   └── types/
├── client/                 Código TypeScript del NAVEGADOR
│   ├── main.ts             reveals, FAQ, nav
│   ├── widget.ts           Cotizador
│   ├── contact-form.ts     Validación + fetch al backend
│   └── tsconfig.json       Config TS independiente (target ES2020, DOM lib)
├── views/                  Templates EJS
│   ├── layouts/base.ejs
│   ├── partials/
│   └── pages/
├── public/                 Estático
│   ├── css/styles.css
│   ├── js/                 Compilado desde client/ (NO editar manual)
│   └── img/
├── dist/                   Build del server (gitignored)
├── pages/                  ⚠️ HTML legacy del sitio vanilla — se irá borrando
├── css/                    ⚠️ CSS legacy — fuente de referencia para portar
├── js/                     ⚠️ JS legacy roto — descartar
├── index.html              ⚠️ HTML SPA legacy — fuente de referencia para portar
└── (config files)
```

Las carpetas marcadas con ⚠️ son del sitio anterior. Se mantienen durante la migración como referencia, se borran al final.

---

## 4. Convenciones

### TypeScript
- `strict: true` en ambos `tsconfig.json` (server y client). No bajar la guardia.
- Imports con extensión `.js` en server (ESM + NodeNext).
- Imports sin extensión en client (bundler resolution).
- Nada de `any`. Usar `unknown` y narrowing si hace falta.
- Validar inputs externos (env, body de requests, respuestas de fetch) **siempre** con Zod.

### Express
- Rutas de páginas en `src/routes/pages.ts` — montan `res.render('pages/xxx', { ... })`.
- Rutas API en `src/routes/api.ts` — siempre validar body con Zod, devolver JSON tipado.
- Errores: lanzar errores tipados, manejarlos en el middleware de errores. Nunca `res.send` en mitad de un servicio.
- Middleware de seguridad cargado siempre primero: helmet, compression, cors, rate-limit.

### EJS
- Layouts y partials en `views/layouts/` y `views/partials/`.
- Datos centralizados pasan por `res.locals` (set en middleware). Páginas individuales solo añaden datos específicos suyos.
- HTML escapado por default (`<%= %>`). Solo usar `<%- %>` para HTML pre-renderizado controlado.

### CSS
- **Variables de tema** en `:root` (no cambiar nombres):
  - `--navy: #0D2137` · `--navy2: #163552`
  - `--blue: #1B6CA8` · `--blue2: #2E8FD8`
  - `--accent: #E8A020`
  - `--teal: #0E7C86` (exclusivo AquaGrid)
  - `--off: #F4F7FA` · `--light: #E8EDF2` · `--border: #D4DCE5`
  - `--text: #1A2733` · `--gray: #6B7A8D`
- **Naming legacy:** clases cortas (`.fcard`, `.bcard`, `.wcard`, `.pcard`, `.tcard`, etc.). **NO renombrar** — están entrelazadas con todo el HTML.
- Un solo breakpoint: `@media (max-width: 960px)`. Mobile <600px sin hamburguesa todavía (pendiente).

### Naming de archivos
- TypeScript: `kebab-case.ts` (ej: `lead.service.ts`, `quote.schema.ts`).
- EJS: `kebab-case.ejs`.
- Componentes/partials EJS: nombre descriptivo (`whatsapp-button.ejs`).

---

## 5. Flujo de leads (CRÍTICO)

Hay **dos puntos de captura**: cotizador (`/cotizador`) y formulario de contacto (`/contacto`). Ambos van al **mismo webhook Make.com** pero con payloads diferentes y se distinguen por el campo `source`.

### Cotizador → Make.com
```
Usuario llena cotizador → client/widget.ts
  → POST /api/quote (con datos)
  → src/middleware: helmet, rate-limit, CORS
  → src/routes/api.ts: valida con Zod
  → src/services/lead.service.ts: POST a MAKE_WEBHOOK_URL
  → Respuesta {ok: true} al cliente
```

Payload al webhook:
```json
{
  "source": "Landing Cotizador",
  "full_name": "...", "phone": "...",
  "ubicacion": "...", "zona": "...",
  "tipo_propiedad": "...", "precio_mostrado": "...",
  "es_prioritario": "Sí|No",
  "timestamp": "...", "fecha_local": "..."
}
```

### Contacto → Make.com
Mismo flujo, payload distinto:
```json
{
  "source": "Landing Contacto",
  "full_name": "...", "email": "...",
  "phone": "...", "tipo_consulta": "...",
  "mensaje": "...",
  "timestamp": "...", "fecha_local": "..."
}
```

**Crítico:** el webhook NO debe quedar expuesto en el JS del cliente. Toda llamada externa pasa por el backend.

---

## 6. Seguridad

- **Helmet:** headers HTTP por default.
- **express-rate-limit:** 5 envíos por IP por hora en endpoints de leads. Configurable vía env.
- **CORS:** solo orígenes en `ALLOWED_ORIGINS`. Lista CSV.
- **Honeypot:** input oculto en formularios. Si llega lleno, descartamos.
- **Timestamp mínimo:** rechazar formularios enviados <2 segundos (bots).
- **Zod en server:** validar body antes de procesar.
- **Sanitización:** teléfono solo dígitos, email lowercase trim.

---

## 7. Datos hardcoded — un solo lugar

Todos los datos que aparecían repetidos en el sitio anterior se centralizan en `src/data/site.ts`:

```ts
export const site = {
  phone: { display: "984 803 5014", e164: "+529848035014" },
  whatsapp: { display: "+52 1 998 705 2145", url: "https://wa.me/5219987052145" },
  email: "info@hurricanesolution.com",
  address: "10 Avenida Norte entre 14 Norte bis y 16 Norte, Centro, 77500 Playa del Carmen, Q.R., México",
  social: {
    facebook: "https://www.facebook.com/share/16cZAdbkjj/",
    instagram: "https://www.instagram.com/hurricanesolution",
    youtube: "https://youtube.com/@hurricanesolution",
    tiktok: "https://www.tiktok.com/@hurricane.solutio"
  }
}
```

**Si cambia un dato de contacto, se cambia AQUÍ y solo aquí.** Las plantillas EJS lo leen vía `res.locals.site`.

---

## 8. Reglas de oro para agentes

1. **Mantener el diseño 100%.** El cliente fue explícito. Preservar layout, colores, tipografías, animaciones del sitio original. Si tienes que tocar CSS, mantener clases existentes.
2. **No exponer secretos.** `MAKE_WEBHOOK_URL` y demás env vars secretas viven en `.env` (gitignored) y panel Hostinger. Nunca en código.
3. **Validar siempre con Zod** los inputs externos (env, request bodies, responses de fetch).
4. **Un cambio de dato de contacto = un cambio en `src/data/site.ts`.** Nunca hardcodear teléfonos, emails, etc. en EJS.
5. **Antes de borrar archivos legacy** (`pages/`, `index.html`, `css/`, `js/`), confirmar con el usuario que la migración cubre todo el contenido.
6. **No introducir dependencias nuevas sin justificación clara.** Stack pequeño y enfocado.
7. **Hostinger Node.js no soporta worker threads ni cron persistentes.** Si hace falta scheduling, usar Make.com o cron externo.
8. **Tests:** no hay framework de tests aún. Si se añade, vitest preferido (encaja con tsx).
9. **Cuando termines un cambio que afecte producción**, actualizar `PROJECT_CONTEXT.md` con la decisión / pendiente nuevo / resuelto.

---

## 9. Cómo trabajar en este repo (workflow recomendado)

1. Asegúrate de estar en la rama `feat/migrate-typescript-node` (durante la migración) o en una rama feature derivada.
2. `npm install` para instalar dependencias.
3. `cp .env.example .env` y completar valores reales (pídelos al admin).
4. `npm run dev` para arrancar server con hot-reload.
5. En otra terminal: `npm run dev:client` para compilar el TS del cliente en watch.
6. Antes de commit: `npm run typecheck` para asegurar que tipos estén limpios.
7. Antes de push: verificar que `.env` no esté trackeado (`git check-ignore .env`).

---

## 10. Glosario

- **Level E** — certificación militar de EUA. Vector de venta del HS-1500.
- **NOA (Notice of Acceptance)** — aprobación de Miami-Dade County.
- **IHPA** — International Hurricane Protection Association.
- **Cat 1–5** — escala Saffir-Simpson de huracanes.
- **psi** — pounds per square inch.
- **AquaGrid** — submarca para aperturas grandes, identidad teal.
- **Make.com** — automatizador que recibe leads del webhook y dispara Airtable + WhatsApp Cloud API.
- **GHL** — GoHighLevel, CRM mencionado en el plugin original (no confirmado si activo).
