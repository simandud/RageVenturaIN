/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🚀 PERFORMANCE OPTIMIZER - Lazy Loading & Optimizations
 * ═══════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════
  // 📸 LAZY LOADING PARA IMÁGENES
  // ═══════════════════════════════════════════════════════════════════════

  const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;

          // Si tiene data-src, cargarlo
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }

          // Si tiene data-srcset, cargarlo
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }

          // Remover el atributo loading lazy y observer
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Cargar 50px antes de que sea visible
      threshold: 0.01
    });

    // Observar todas las imágenes con loading="lazy"
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 🎭 INTERSECTION OBSERVER PARA ANIMACIONES DE SECCIONES
  // ═══════════════════════════════════════════════════════════════════════

  const animateOnScroll = () => {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          // Animar elementos internos con stagger
          const animatedElements = entry.target.querySelectorAll(
            '.news-item, .popular-card, .featured-news, h2, h3, p'
          );

          animatedElements.forEach((el, index) => {
            setTimeout(() => {
              el.style.animation = `fade-in-up 0.6s ease-out forwards`;
              el.style.opacity = '1';
            }, index * 100); // Stagger de 100ms entre elementos
          });
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-50px'
    });

    // Observar todas las secciones
    document.querySelectorAll('.panel').forEach(section => {
      sectionObserver.observe(section);
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ⚡ DEBOUNCE UTILITY
  // ═══════════════════════════════════════════════════════════════════════

  const debounce = (func, wait = 150) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 🔄 SMOOTH SCROLL OPTIMIZADO
  // ═══════════════════════════════════════════════════════════════════════

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Ignorar # solo
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();

          const headerOffset = 80; // Altura del header
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 📊 PERFORMANCE MONITORING (Solo en desarrollo)
  // ═══════════════════════════════════════════════════════════════════════

  const monitorPerformance = () => {
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const connectTime = perfData.responseEnd - perfData.requestStart;
          const renderTime = perfData.domComplete - perfData.domLoading;

          console.log('⚡ Performance Metrics:');
          console.log(`├─ Page Load: ${pageLoadTime}ms`);
          console.log(`├─ Connection: ${connectTime}ms`);
          console.log(`└─ Render Time: ${renderTime}ms`);
        }, 0);
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 🎯 PREFETCH DE RECURSOS CRÍTICOS
  // ═══════════════════════════════════════════════════════════════════════

  const prefetchCriticalResources = () => {
    // Prefetch de páginas que probablemente visitará el usuario
    const criticalPages = [
      '/eventos.html',
      '/tienda.html',
      '/alquiler.html',
      '/label.html'
    ];

    criticalPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 🖼️ OPTIMIZAR IMÁGENES CON WEBP
  // ═══════════════════════════════════════════════════════════════════════

  const checkWebPSupport = () => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 🌐 SERVICE WORKER PARA CACHE (OPCIONAL)
  // ═══════════════════════════════════════════════════════════════════════

  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('✅ Service Worker registrado:', reg.scope))
          .catch(err => console.log('❌ Service Worker falló:', err));
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 📱 DETECCIÓN DE VIEWPORT Y DEVICE
  // ═══════════════════════════════════════════════════════════════════════

  const detectDevice = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);

    document.body.classList.add(
      isMobile ? 'is-mobile' : isTablet ? 'is-tablet' : 'is-desktop'
    );

    // Optimizaciones específicas para móvil
    if (isMobile) {
      // Reducir calidad de sombras en móvil
      document.body.classList.add('reduced-shadows');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 🎨 PREFERS COLOR SCHEME
  // ═══════════════════════════════════════════════════════════════════════

  const detectColorScheme = () => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (e) => {
      if (e.matches) {
        document.body.classList.add('dark-mode-preferred');
      } else {
        document.body.classList.remove('dark-mode-preferred');
      }
    };

    updateTheme(darkMode);
    darkMode.addEventListener('change', updateTheme);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 🚀 INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════════════

  const init = () => {
    // Detectar características del dispositivo
    detectDevice();
    detectColorScheme();

    // Optimizaciones de carga
    lazyLoadImages();
    animateOnScroll();
    initSmoothScroll();

    // Performance
    monitorPerformance();

    // Prefetch (solo en conexiones rápidas)
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.effectiveType === '4g' || connection.effectiveType === '5g') {
        prefetchCriticalResources();
      }
    }

    // WebP support check
    checkWebPSupport().then(supported => {
      if (supported) {
        document.body.classList.add('webp-supported');
      }
    });
  };

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 💾 EXPORTAR UTILIDADES GLOBALES
  // ═══════════════════════════════════════════════════════════════════════

  window.RageVentureOptimizer = {
    debounce,
    lazyLoadImages,
    animateOnScroll
  };

})();
