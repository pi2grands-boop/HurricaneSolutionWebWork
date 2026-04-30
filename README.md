# Hurricane Solution Web

Sitio web de marketing y captura de leads de **Hurricane Solution** — empresa mexicana de protección contra huracanes con base en Playa del Carmen, Quintana Roo.

**Stack:** Node.js 20 + Express + EJS + TypeScript + Zod
**Hosting:** Hostinger (App Node.js)

---

## Requisitos previos

- Node.js 20.x o superior (`.nvmrc` incluido — usa `nvm use` si tienes nvm)
- npm 10.x o superior
- Git

---

## Setup local (primera vez)

```bash
# 1. Clonar el repo
git clone <URL-DEL-REPO>
cd HurricaneSolutionWeb

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env desde la plantilla
cp .env.example .env

# 4. Editar .env y completar los valores reales
#    (especialmente MAKE_WEBHOOK_URL — pedírselo al admin del proyecto)

# 5. Compilar y arrancar en modo dev
npm run dev
```

El sitio queda disponible en `http://localhost:3000`.

---

## Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Arranca el server con auto-reload (`tsx watch`). |
| `npm run dev:client` | Compila el TypeScript del cliente en modo watch (correr en otra terminal). |
| `npm run build` | Compila todo: server (`dist/`) + client (`public/js/`). |
| `npm start` | Corre el server compilado (lo que usa Hostinger). |
| `npm run typecheck` | Verifica tipos sin generar archivos. |
| `npm run clean` | Borra `dist/` y los `.js` generados en `public/js/`. |

---

## Estructura del proyecto

```
HurricaneSolutionWeb/
├── src/                    Código TypeScript del SERVIDOR
│   ├── server.ts           Entry point Express
│   ├── config/             Configuración tipada (env vars con Zod)
│   ├── routes/             pages, api (POST /api/lead), seo (sitemap, robots)
│   ├── middleware/         security (helmet, rate-limit, CORS), logger, errors
│   ├── services/           lead.service.ts (proxy al webhook Make.com)
│   ├── schemas/            lead.schema.ts (Zod schema unificado)
│   ├── data/               Datos del sitio (contactos, productos, precios)
│   └── types/              Tipos compartidos
├── client/                 Código TypeScript del NAVEGADOR
│   ├── main.ts             Boot: reveals, FAQ, widget, formularios
│   ├── reveals.ts          IntersectionObserver para animaciones
│   ├── faq.ts              Acordeón FAQ
│   ├── widget.ts           Cotizador completo (autocomplete + precio)
│   ├── forms.ts            Handler genérico form[data-form="lead"]
│   └── tsconfig.json       Config TS independiente para el cliente
├── views/                  Templates EJS
│   ├── layouts/            base.ejs (head, GA, FB Pixel)
│   ├── partials/           topbar, nav, footer, whatsapp-button, etc.
│   └── pages/              home, hoteles, residencial, ..., cotizador
├── public/                 Servido como estático
│   ├── css/                styles.css
│   ├── js/                 Compilado desde client/ (NO editar a mano)
│   └── img/                Imágenes
├── dist/                   Output del build del server (gitignored)
├── package.json
├── tsconfig.json           Config TS del server
├── .env.example            Plantilla de variables de entorno
├── .gitignore
├── .nvmrc                  Versión Node fija
├── CLAUDE.md               Contexto para agentes IA
├── PROJECT_CONTEXT.md      Estado vivo del proyecto
└── README.md               Este archivo
```

---

## Variables de entorno

Ver `.env.example` para la lista completa.

**Críticas:**
- `MAKE_WEBHOOK_URL` — webhook secreto para los leads. **Nunca commitear el real.**
- `SITE_URL` — URL pública del sitio (afecta SEO, sitemap, canonicals).
- `ALLOWED_ORIGINS` — orígenes permitidos por CORS.

**Opcionales:**
- `FB_PIXEL_ID` — si está vacía, el pixel no se carga.
- `RATE_LIMIT_MAX` — máximo de envíos al webhook por IP por hora (default 5).

---

## Deploy a Hostinger

### Primera vez

1. Crear repo privado en GitHub y pushear la rama `main`.
2. Entrar a Hostinger → hPanel → Sitios web → tu dominio.
3. En el menú lateral buscar **"Aplicaciones Node.js"** o **"Node.js"**.
4. Crear nueva aplicación:
   - Versión Node: **20.x**
   - Modo: **Production**
   - Repositorio: pegar URL del repo de GitHub (autorizar acceso si es privado)
   - Rama: `main` (o la que decidas como producción)
   - Archivo de inicio: `dist/server.js`
   - Comando de inicio: `npm start`
5. Una vez creada la app, ir a la pestaña **"Variables de entorno"** y añadir todas las del `.env.example` con sus valores reales.
6. Click **"Run npm install"** (Hostinger lo hace automático en algunos planes).
7. Click **"Run npm run build"** (compila TS).
8. Click **"Restart"**.
9. Verificar abriendo el dominio temporal: `https://orange-mandrill-877092.hostingersite.com`.

### Updates posteriores

```bash
# Local
git push origin main

# En Hostinger panel
# 1. Click "Pull from Git"
# 2. Click "Run npm install" (si cambió package.json)
# 3. Click "Run npm run build"
# 4. Click "Restart"
```

### Verificación post-deploy

Reemplazar `$SITE` por el dominio real:

```bash
SITE=https://orange-mandrill-877092.hostingersite.com

# 1. Healthcheck
curl -s $SITE/healthz
# esperado: {"ok":true,"env":"production","uptime":...}

# 2. Las 10 páginas devuelven 200
for r in / /hoteles /residencial /comercial /aquagrid /rain /equipo /faq /contacto /cotizador; do
  printf "%-15s %s\n" "$r" "$(curl -s -o /dev/null -w '%{http_code}' $SITE$r)"
done

# 3. SEO
curl -sI $SITE/sitemap.xml | head -1
curl -sI $SITE/robots.txt | head -1
curl -s $SITE/robots.txt    # en producción debe permitir indexación

# 4. Form end-to-end (debería llegar a Make.com)
curl -s -X POST $SITE/api/lead -H "Content-Type: application/json" \
  --data "{\"source\":\"Landing Home\",\"nombre\":\"Smoke\",\"phone\":\"9981234567\",\"email\":\"smoke@test.com\",\"hp_field\":\"\",\"ts\":\"$(($(date +%s%N)/1000000 - 10000))\"}"
# esperado: {"ok":true} y aparición del lead en Make.com / Airtable
```

Si algún paso falla, revisar logs en Hostinger panel y verificar que las env vars estén bien escritas.

---

## Checklist de seguridad pre-commit

Antes de hacer push, verifica:

```bash
# ¿.env está correctamente ignorado?
git check-ignore .env
# debe imprimir: .env

# ¿Algún secreto se coló en archivos trackeados?
git grep -i "hook.us2.make.com"
git grep -i "MAKE_WEBHOOK_URL=https"
# ambos deben estar vacíos
```

Si alguno falla, **NO hacer push** y arreglar antes.

---

## Documentación adicional

- **`CLAUDE.md`** — contexto y convenciones para agentes IA que trabajen en el repo.
- **`PROJECT_CONTEXT.md`** — estado vivo del proyecto: pendientes operativos, decisiones de negocio, configuraciones que faltan.

---

## Licencia

Propietaria — Hurricane Solution © 2026. Todos los derechos reservados.
