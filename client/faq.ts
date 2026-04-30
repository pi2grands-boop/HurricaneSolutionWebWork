/**
 * Acordeón FAQ. El markup legacy usa onclick="toggleFaq(this)" inline,
 * por lo que la función debe vivir en el scope global window.
 * El CSS abre el item agregando .open al .faq-item padre.
 */

declare global {
  interface Window {
    toggleFaq?: (button: HTMLElement) => void;
  }
}

export function initFaq(): void {
  window.toggleFaq = (button: HTMLElement): void => {
    const item = button.closest<HTMLElement>('.faq-item');
    if (!item) return;
    item.classList.toggle('open');
  };
}
