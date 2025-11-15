// ========================================
// PINTAR TEXTO DE NEGRO AL SCROLL DOWN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const aboutText = document.querySelector('.about-text');

  if (!aboutText) {
    console.warn('about-text no encontrado');
    return;
  }

  let lastScrollTop = 0;
  let isScrollingDown = false;

  window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Detectar si está bajando
    isScrollingDown = currentScroll > lastScrollTop;

    // Obtener posición del elemento
    const elementRect = aboutText.getBoundingClientRect();
    const elementTop = elementRect.top;
    const windowHeight = window.innerHeight;

    // Si el elemento está visible en pantalla Y está bajando
    if (elementTop < windowHeight && elementTop > 0 && isScrollingDown) {
      aboutText.classList.add('painted');
    } else if (elementTop > windowHeight || currentScroll < lastScrollTop) {
      // Si sale de pantalla o sube, quitar clase
      aboutText.classList.remove('painted');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }, { passive: true });
});