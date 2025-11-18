/**
 * 🍔 MENÚ HAMBURGUESA - RAGE VENTURE
 * Sistema completo de menú responsive con desplegables
 */

document.addEventListener('DOMContentLoaded', () => {
  const sideMenu = document.getElementById('side-menu');
  const menuToggleBtn = document.querySelector('.menu-toggle-btn');
  const menuCloseBtn = document.querySelector('.menu-close-btn');
  const menuLinks = document.querySelectorAll('#side-menu .menu-link');
  const sectionButtons = document.querySelectorAll('.menu-section-btn');
  const bodyElement = document.body;

  // ========================================
  // 🟦 VARIABLES DE ESTADO
  // ========================================
  let isMenuOpen = false;
  let currentWidth = window.innerWidth;

  // ========================================
  // 📱 DETECTAR CAMBIO DE TAMAÑO
  // ========================================
  function updateScreenSize() {
    const newWidth = window.innerWidth;
    
    // Si cambió de desktop a móvil (o viceversa)
    if ((currentWidth >= 768 && newWidth < 768) || (currentWidth < 768 && newWidth >= 768)) {
      closeMenu();
      bodyElement.style.overflow = '';
    }
    currentWidth = newWidth;
  }

  window.addEventListener('resize', updateScreenSize, { passive: true });

  // ========================================
  // 🔓 ABRIR MENÚ
  // ========================================
  function openMenu() {
    if (!sideMenu) return;
    
    sideMenu.classList.add('is-open');
    isMenuOpen = true;
    
    // Prevenir scroll del body en móvil
    if (window.innerWidth < 768) {
      bodyElement.style.overflow = 'hidden';
    }
    
    // Accesibilidad ARIA
    menuToggleBtn?.setAttribute('aria-expanded', 'true');
    sideMenu.setAttribute('aria-hidden', 'false');
    
    // Focus en el botón de cerrar para accesibilidad
    menuCloseBtn?.focus();
  }

  // ========================================
  // 🔒 CERRAR MENÚ
  // ========================================
  function closeMenu() {
    if (!sideMenu) return;
    
    sideMenu.classList.remove('is-open');
    isMenuOpen = false;
    
    // Restaurar scroll
    bodyElement.style.overflow = '';
    
    // Accesibilidad ARIA
    menuToggleBtn?.setAttribute('aria-expanded', 'false');
    sideMenu.setAttribute('aria-hidden', 'true');
    
    // Cerrar todas las secciones al cerrar el menú
    sectionButtons.forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      const content = btn.nextElementSibling;
      if (content?.classList.contains('menu-section-content')) {
        content.classList.remove('is-open');
      }
    });
    
    // Devolver focus al botón de abrir
    menuToggleBtn?.focus();
  }

  // ========================================
  // 🖱️ EVENT LISTENERS - ABRIR/CERRAR
  // ========================================
  
  // Botón de abrir menú
  menuToggleBtn?.addEventListener('click', () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Botón de cerrar menú
  menuCloseBtn?.addEventListener('click', closeMenu);

  // Cerrar menú al hacer clic en un link simple
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Solo cerrar si NO es un botón de sección
      if (!e.target.closest('.menu-section-btn')) {
        closeMenu();
      }
    });
  });

  // Cerrar menú con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideMenu?.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // ========================================
  // 🎯 SECCIONES DESPLEGABLES (Acordeón)
  // ========================================
  
  sectionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const content = button.nextElementSibling;
      
      // Si no es un menu-section-content, busca el siguiente
      if (!content?.classList.contains('menu-section-content')) {
        return;
      }

      // Opción 1: Acordeón único (solo una sección abierta)
      // Descomenta esto si quieres solo UNA sección abierta a la vez
      /*
      sectionButtons.forEach(btn => {
        if (btn !== button) {
          btn.setAttribute('aria-expanded', 'false');
          const otherContent = btn.nextElementSibling;
          if (otherContent?.classList.contains('menu-section-content')) {
            otherContent.classList.remove('is-open');
          }
        }
      });
      */

      // Toggle de la sección actual
      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        content.classList.remove('is-open');
      } else {
        button.setAttribute('aria-expanded', 'true');
        content.classList.add('is-open');
      }
    });
  });

  // Cerrar menú al hacer clic en sub-links
  const subLinks = document.querySelectorAll('.menu-section-content a');
  subLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ========================================
  // 🌑 CERRAR AL HACER CLIC FUERA
  // ========================================
  
  document.addEventListener('click', (e) => {
    // Si el menú está abierto Y se hizo clic fuera del menú Y fuera del botón
    if (
      isMenuOpen &&
      !sideMenu?.contains(e.target) &&
      e.target !== menuToggleBtn &&
      !menuToggleBtn?.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // ========================================
  // ⌨️ NAVEGACIÓN CON TECLADO
  // ========================================
  
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  sideMenu?.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusables = Array.from(sideMenu.querySelectorAll(focusableElements));
      const firstFocusable = focusables[0];
      const lastFocusable = focusables[focusables.length - 1];

      // Si presionó Shift+Tab en el primer elemento, focus al último
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
      // Si presionó Tab en el último elemento, focus al primero
      else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  });

  // ========================================
  // 📐 INICIALIZACIÓN
  // ========================================
  
  // Establecer atributos ARIA iniciales
  sideMenu?.setAttribute('aria-hidden', 'true');
  menuToggleBtn?.setAttribute('aria-expanded', 'false');
  menuToggleBtn?.setAttribute('aria-label', 'Abrir menú de navegación');
  menuCloseBtn?.setAttribute('aria-label', 'Cerrar menú de navegación');

  // Configurar atributos de secciones
  sectionButtons.forEach((btn, index) => {
    btn.setAttribute('aria-expanded', 'false');
    btn.id = `section-btn-${index}`;
    
    const content = btn.nextElementSibling;
    if (content?.classList.contains('menu-section-content')) {
      content.id = `section-content-${index}`;
      btn.setAttribute('aria-controls', `section-content-${index}`);
    }
  });

  console.log('✅ Menú hamburguesa iniciado correctamente');
});