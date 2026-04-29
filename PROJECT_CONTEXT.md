# PROJECT_CONTEXT — Hurricane Solution Web

> Estado vivo del proyecto. **Distinto a `CLAUDE.md`** (que es para agentes IA y describe arquitectura/convenciones) y al `README.md` (que es para humanos clonando el repo).
>
> Este archivo captura: pendientes operativos, configuraciones que faltan, decisiones de negocio en curso, y cualquier "gotcha" que un colaborador (humano o IA) deba saber al entrar al proyecto.
>
> **Actualizar este archivo cada vez que:** cambien decisiones, se resuelvan pendientes, se descubra un nuevo "gotcha", o se reciba instrucción del cliente que afecte el comportamiento del sitio.

---

## Estado actual

**Fecha:** 2026-04-29
**Fase:** Migración en curso de HTML/CSS/JS vanilla → Express + EJS + TypeScript
**Rama de trabajo:** `feat/migrate-typescript-node`
**Hosting destino:** Hostinger Node.js
**Dominio temporal:** https://orange-mandrill-877092.hostingersite.com
**Dominio final (futuro):** https://hurricanesolution.com

---

## Decisiones tomadas

| Tema | Decisión | Razón |
|---|---|---|
| Stack | Express + EJS + TypeScript + Zod | Hostinger soporta Node, permite validación server-side y oculta el webhook |
| Repositorio | Privado en GitHub | Defensa en profundidad además del .gitignore estricto |
| Variables de entorno | Panel de Hostinger (no archivo en servidor) | Sobreviven redeploys, fuente única de verdad |
| Cotizador | Página propia `/cotizador` con widget completo del WP | Tráfico frío que pregunta por precio |
| Formulario `/contacto` | Versión simple, campos limitados | Tráfico cálido que ya quiere hablar |
| Webhook | Único Make.com, payload diferenciado por `source` | Make.com separa flujos internamente |
| Diseño | Se mantiene 100% idéntico al actual | Requisito del cliente |
| Pixel Meta | Variable de entorno; si está vacía no se carga | El plugin original venía con placeholder `TU_PIXEL_ID` sin valor real |
| Versión "buena" del sitio actual | Lo más completo entre `index.html` SPA y `pages/*.html` | Caso por caso, preguntar al cliente si hay duda real |

---

## Pendientes operativos (PRIORIZADOS)

### 🔴 Bloqueantes para producción

1. **Make.com — flujo de formulario `/contacto` no configurado.**
   El webhook actual de Make.com está construido para el cotizador (espera campos: `ubicacion`, `zona`, `tipo_propiedad`, `precio_mostrado`, `es_prioritario`).
   El formulario `/contacto` enviará campos distintos (`email`, `tipo_consulta`, `mensaje`) bajo `source: "Landing Contacto"`.
   **Acción pendiente del cliente:** crear/ajustar el escenario en Make.com para procesar el `source: "Landing Contacto"` y guardar/notificar correctamente. Mientras tanto los leads del formulario `/contacto` llegan al webhook pero pueden no procesarse.

2. **Meta Pixel ID real.**
   El plugin WP original venía con placeholder `TU_PIXEL_ID`. No tenemos el ID real.
   **Acción pendiente del cliente:** obtener el ID desde Meta Business Manager y agregarlo a `FB_PIXEL_ID` en el panel Hostinger.
   **Comportamiento mientras tanto:** el código detecta env var vacía y omite el script del pixel completo. No se rompe nada.

3. **Imágenes AquaGrid faltantes.**
   El sitio referencia `ag1.jpg` … `ag7.jpg` que no existen en el repo.
   **Acción pendiente del cliente:** proveer imágenes reales, o decidir si se reemplazan con placeholders/SVG/imágenes stock licenciadas.

### 🟠 Importantes pero no bloqueantes

4. **Botón "EN" (cambio de idioma).**
   Es placeholder visual sin funcionalidad. Decidir: implementar i18n real (inglés), ocultar el botón, o dejarlo "Coming soon".

5. **Privacidad/Términos.**
   El widget cotizador menciona "Privacidad" y "Términos" en su footer con `href="#"`. Crear las páginas o vincular a las existentes del cliente.

6. **Datos del equipo (`/equipo`).**
   El HTML actual tiene `[Nombre del fundador]` literal como placeholder. Pendiente recibir bios + fotos reales.

7. **Testimonios.**
   Genéricos sin verificación ("Director de Operaciones", "Karla L."). Confirmar si son reales o ilustrativos. Si son reales, idealmente añadir foto y empresa.

### 🟡 Mejoras post-launch

8. **Analítica de conversión.**
   GA4 y Meta Pixel quedan instalados pero hay que definir eventos de conversión específicos en Make.com / GA si se quieren reportes de ROI.

9. **A/B testing del cotizador.**
   El cotizador actual asume el flujo del widget WP. En el futuro se podría testear variantes (sin cotizador, cotizador opcional, etc.).

10. **Páginas individuales por producto.**
    Hoy hay `/hoteles`, `/residencial`, `/comercial` que combinan productos. Considerar páginas dedicadas a HS-1500, HS-1250, HS-875 si se hace una campaña por producto.

---

## Configuración Make.com — referencia

### Webhook único

```
URL: (en .env como MAKE_WEBHOOK_URL — NO commitear)
```

### Diferenciación por `source`

| Origen | Valor `source` | Campos esperados |
|---|---|---|
| Cotizador | `"Landing Cotizador"` | `full_name`, `phone`, `ubicacion`, `zona`, `tipo_propiedad`, `precio_mostrado`, `es_prioritario`, `timestamp`, `fecha_local` |
| Formulario contacto | `"Landing Contacto"` | `full_name`, `email`, `phone`, `tipo_consulta`, `mensaje`, `timestamp`, `fecha_local` |

El backend valida con Zod ANTES de enviar, asegura que cada `source` lleva los campos correctos.

---

## Variables de entorno requeridas

Ver `.env.example` para la lista completa con valores de ejemplo. En producción se configuran en el panel Hostinger → Aplicaciones Node.js → Variables de entorno.

| Variable | Requerida | Notas |
|---|---|---|
| `NODE_ENV` | Sí | `production` en Hostinger |
| `PORT` | No | Hostinger lo asigna automático |
| `SITE_URL` | Sí | Cambia al migrar al dominio real |
| `ALLOWED_ORIGINS` | Sí | Lista CSV. Cambia al migrar al dominio real |
| `MAKE_WEBHOOK_URL` | Sí | **Secreto.** Solo en panel Hostinger |
| `GA_ID` | Sí | `G-J1BSSEHZXV` (verificado del widget WP) |
| `FB_PIXEL_ID` | No | Si vacía, no se carga el pixel |
| `RATE_LIMIT_MAX` | No | Default 5 |
| `RATE_LIMIT_WINDOW_MS` | No | Default 3600000 (1 hora) |
| `LOG_LEVEL` | No | Default `info` |

---

## Migración futura: dominio temporal → hurricanesolution.com

Cuando se haga el switch:

1. Apuntar DNS de `hurricanesolution.com` a Hostinger.
2. Activar SSL gratuito en el panel Hostinger para el dominio nuevo.
3. En el panel Hostinger → Variables de entorno:
   - Cambiar `SITE_URL` a `https://hurricanesolution.com`
   - Cambiar `ALLOWED_ORIGINS` a `https://hurricanesolution.com,https://www.hurricanesolution.com`
4. Configurar redirect 301 desde `orange-mandrill-877092.hostingersite.com` al dominio real (en panel Hostinger).
5. Reenviar `sitemap.xml` a Google Search Console.
6. Verificar que GA y Meta Pixel sigan recibiendo eventos del dominio nuevo.
7. Reiniciar la app desde el panel Hostinger.

Cero cambios de código. Solo variables de entorno.

---

## Histórico de cambios relevantes

- **2026-04-29:** Inicio de migración a Express + EJS + TypeScript. Rama `feat/migrate-typescript-node`. Snapshot de estado HTML/CSS/JS vanilla en `main`.
