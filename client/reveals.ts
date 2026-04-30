/**
 * Animaciones .reveal: agrega .vis cuando el elemento entra al viewport.
 * El CSS ya define .reveal{opacity:0;transform:translateY(20px)} y .reveal.vis{opacity:1;transform:none}.
 * Hay también un fallback <noscript> en head.ejs por si el JS no carga.
 */

export function initReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  if (targets.length === 0) return;

  if (typeof IntersectionObserver === 'undefined') {
    targets.forEach((el) => el.classList.add('vis'));
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    targets.forEach((el) => el.classList.add('vis'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vis');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  );

  targets.forEach((el) => observer.observe(el));
}
