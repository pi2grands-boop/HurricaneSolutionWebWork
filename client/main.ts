/**
 * Entry point del JavaScript del navegador.
 *
 * Por ahora solo arranca el cotizador si la página actual lo contiene.
 * Reveals/FAQ/nav llegan en Fase 6.
 */

import { initCotizadorWidget } from './widget.js';

const boot = (): void => {
  initCotizadorWidget();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
