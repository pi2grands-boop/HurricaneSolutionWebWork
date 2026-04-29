/**
 * Entry point del JavaScript del navegador.
 *
 * STUB DE FASE 2. En Fase 7 se reescribe con:
 *  - initReveals()    IntersectionObserver para animaciones scroll
 *  - initFaq()        Toggle del acordeón FAQ
 *  - initNav()        Comportamiento del nav (mobile, scrolled, etc.)
 *
 * Por ahora solo deja constancia en consola para verificar que el
 * bundle se carga correctamente desde /public/js/main.js.
 */

const boot = (): void => {
  // eslint-disable-next-line no-console
  console.info('[hurricane-solution] client bootstrapping');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
