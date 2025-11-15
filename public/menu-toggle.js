document.addEventListener('DOMContentLoaded', () => {
  const sideMenu = document.getElementById('side-menu'); 
  const openBtn = document.getElementById('menu-open-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const menuLinks = document.querySelectorAll('#side-menu .menu-link');
  const sectionButtons = document.querySelectorAll('.menu-section-btn');

  // ========================================
  // ABRIR/CERRAR MENÚ
  // ========================================
  
  const openMenu = () => {
    if (sideMenu) {
      sideMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
      
      // Accesibilidad
      openBtn?.setAttribute('aria-expanded', 'true');
    }
  };

  const closeMenu = () => {
    if (sideMenu) {
      sideMenu.classList.remove('is-open');
      document.body.style.overflow = ''; // Restaurar scroll
      
      // Accesibilidad
      openBtn?.setAttribute('aria-expanded', 'false');
      
      // Cerrar todas las secciones al cerrar el menú
      sectionButtons.forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        const content = btn.nextElementSibling;
        if (content) {
          content.classList.remove('is-open');
        }
      });
    }
  };

  // Event listeners para abrir/cerrar
  openBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);

  // Cerrar menú al hacer clic en links simples
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideMenu?.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // ========================================
  // SECCIONES DESPLEGABLES (Acordeón)
  // ========================================
  
  sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const content = button.nextElementSibling;
      
      // Cerrar todas las demás secciones (acordeón único)
      sectionButtons.forEach(btn => {
        if (btn !== button) {
          btn.setAttribute('aria-expanded', 'false');
          const otherContent = btn.nextElementSibling;
          if (otherContent) {
            otherContent.classList.remove('is-open');
          }
        }
      });
      
      // Toggle de la sección actual
      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        content?.classList.remove('is-open');
      } else {
        button.setAttribute('aria-expanded', 'true');
        content?.classList.add('is-open');
      }
    });
  });

  // Cerrar menú al hacer clic en sub-links
  const subLinks = document.querySelectorAll('.menu-section-content a');
  subLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ========================================
  // CERRAR AL HACER CLIC FUERA (Opcional)
  // ========================================
  
  document.addEventListener('click', (e) => {
    if (
      sideMenu?.classList.contains('is-open') &&
      !sideMenu.contains(e.target) &&
      e.target !== openBtn &&
      !openBtn?.contains(e.target)
    ) {
      closeMenu();
    }
  });
});