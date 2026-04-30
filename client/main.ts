/**
 * Entry point del JavaScript del navegador.
 * Inicializa reveals (IntersectionObserver), FAQ accordion y, si la página lo
 * tiene, el widget cotizador.
 *
 * Nav: el CSS ya declara position:sticky, no requiere JS por ahora.
 * Menú mobile (hamburguesa) queda pendiente — sin diseño aprobado todavía.
 */

import { initReveals } from './reveals.js';
import { initFaq } from './faq.js';
import { initCotizadorWidget } from './widget.js';
import { initLeadForms } from './forms.js';

const boot = (): void => {
  initReveals();
  initFaq();
  initCotizadorWidget();
  initLeadForms();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
