// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 RAGE VENTURE - ANIMATIONS ENGINE
// Sistema profesional de animaciones de textos y efectos de entrada
// ═══════════════════════════════════════════════════════════════════════════════

class AnimationsEngine {
  constructor() {
    this.animations = [];
    this.isInitialized = false;
    this.scrollObserver = null;
    this.pageLoadAnimations = [];
    this.init();
  }

  // ── INICIALIZACIÓN ──
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Ejecutar animaciones de carga de página
    this.playPageLoadAnimations();

    // 2. Configurar observador de scroll
    this.setupScrollObserver();

    // 3. Configurar animaciones de elementos individuales
    this.attachAnimationTriggers();

    // 4. Observar cambios en el DOM
    this.observeDOMChanges();
  }

  // ═══ ANIMACIONES DE CARGA DE PÁGINA ═══
  playPageLoadAnimations() {
    const container = document.getElementById('content');
    if (!container) return;

    // Fade-in del hero
    const hero = container.querySelector('.hero');
    if (hero) {
      hero.classList.add('animate-fade-in-down');
    }

    // Stagger animación del logo
    const heroLogo = container.querySelector('#hero-logo-main');
    if (heroLogo) {
      heroLogo.classList.add('animate-bounce-in');
      heroLogo.style.animationDelay = '0.2s';
    }

    // Animación del tagline
    const tagline = container.querySelector('.hero-tagline');
    if (tagline) {
      this.animateTextCharacters(tagline, 'animate-char-pop', 0.05);
    }

    // Animación del botón CTA
    const ctaBtn = container.querySelector('.hero .cta');
    if (ctaBtn) {
      ctaBtn.classList.add('animate-pulse-border');
      ctaBtn.style.animationDelay = '1s';
    }

    // Marquee animación
    const marquee = container.querySelector('.marquee');
    if (marquee) {
      marquee.classList.add('animate-marquee-slide');
    }
  }

  // ═══ ANIMACIÓN DE CARACTERES INDIVIDUALES ═══
  animateTextCharacters(element, animationClass, delay) {
    const text = element.textContent;
    element.textContent = '';

    const span = document.createElement('span');
    span.setAttribute('aria-label', text);

    text.split('').forEach((char, index) => {
      const charSpan = document.createElement('span');
      charSpan.textContent = char === ' ' ? '\u00A0' : char;
      charSpan.className = animationClass;
      charSpan.style.animationDelay = `${index * delay}s`;
      charSpan.style.display = 'inline-block';
      span.appendChild(charSpan);
    });

    element.appendChild(span);
  }

  // ═══ ANIMACIÓN DE PALABRAS (SPLIT) ═══
  animateTextWords(element, animationClass, delay = 0.1) {
    const text = element.textContent;
    element.textContent = '';

    const words = text.split(' ');
    words.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.textContent = word;
      wordSpan.className = animationClass;
      wordSpan.style.animationDelay = `${index * delay}s`;
      wordSpan.style.display = 'inline-block';
      wordSpan.style.marginRight = '0.3em';
      element.appendChild(wordSpan);
    });
  }

  // ═══ OBSERVADOR DE SCROLL PARA ELEMENTOS ═══
  setupScrollObserver() {
    const container = document.getElementById('content');
    const rootElement = container || window;

    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px',
      root: container ? container : null
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.triggerElementAnimation(entry.target);
          this.scrollObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observar todos los elementos animables
    this.observeAnimatableElements();
  }

  // ═══ OBSERVAR ELEMENTOS ANIMABLES ═══
  observeAnimatableElements() {
    const selectors = [
      '.section-header h2',
      '.section-header > p',
      '.card',
      '.label-card',
      '.rental-card',
      '.vcard',
      '.booking-callout',
      '[data-animate]'
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (!element.dataset.animated) {
          this.scrollObserver.observe(element);
        }
      });
    });
  }

  // ═══ DISPARAR ANIMACIÓN DE ELEMENTO ═══
  triggerElementAnimation(element) {
    const animationType = element.dataset.animate || this.getDefaultAnimation(element);

    switch (animationType) {
      case 'char':
        this.animateTextCharacters(element, 'animate-char-pop', 0.03);
        break;
      case 'word':
        this.animateTextWords(element, 'animate-word-slide', 0.1);
        break;
      case 'slide-up':
        element.classList.add('animate-slide-up');
        break;
      case 'fade-up':
        element.classList.add('animate-fade-in-up');
        break;
      case 'scale-in':
        element.classList.add('animate-scale-in');
        break;
      default:
        element.classList.add('animate-fade-in-up');
    }

    element.dataset.animated = 'true';
  }

  // ═══ OBTENER ANIMACIÓN POR DEFECTO SEGÚN EL ELEMENTO ═══
  getDefaultAnimation(element) {
    if (element.tagName === 'H2') return 'char';
    if (element.tagName === 'P' && element.parentElement?.classList.contains('section-header')) return 'word';
    if (element.classList.contains('card') || element.classList.contains('label-card')) return 'scale-in';
    if (element.classList.contains('rental-card') || element.classList.contains('vcard')) return 'fade-in-up';
    return 'fade-in-up';
  }

  // ═══ ADJUNTAR DISPARADORES DE ANIMACIÓN ═══
  attachAnimationTriggers() {
    // Animar botones al pasar mouse
    document.querySelectorAll('.cta, .ghost').forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        btn.classList.add('animate-button-glow');
      });

      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('animate-button-glow');
      });
    });

    // Animar links del header
    document.querySelectorAll('.header-nav a, .footer-nav a').forEach((link) => {
      link.addEventListener('mouseenter', () => {
        link.classList.add('animate-link-underline');
      });

      link.addEventListener('mouseleave', () => {
        link.classList.remove('animate-link-underline');
      });
    });
  }

  // ═══ OBSERVAR CAMBIOS EN EL DOM ═══
  observeDOMChanges() {
    let observerTimeout;
    const observer = new MutationObserver((mutations) => {
      // Throttle to avoid performance issues
      clearTimeout(observerTimeout);
      observerTimeout = setTimeout(() => {
        this.observeAnimatableElements();
      }, 200);
    });

    // Observe only content container, not entire body
    const config = { childList: true, subtree: true, attributes: false };
    const container = document.querySelector('#content') || document.body;
    observer.observe(container, config);
  }

  // ═══ ANIMAR SECCIÓN COMPLETA ═══
  animateSection(sectionId, animationType = 'fade-in-up') {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const elements = section.querySelectorAll('.card, .label-card, .rental-card, h2, p');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.animation = `${animationType} 0.8s ease-out ${index * 0.1}s forwards`;
    });
  }

  // ═══ EFECTO GLITCH EN TEXTO ═══
  glitchText(element, duration = 600) {
    const originalText = element.textContent;
    let isGlitching = true;
    const glitchChars = '!@#$%^&*|><';
    const startTime = Date.now();

    const glitch = () => {
      if (!isGlitching) return;

      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        element.textContent = originalText;
        isGlitching = false;
        return;
      }

      let glitchedText = '';
      for (let i = 0; i < originalText.length; i++) {
        if (Math.random() > 0.7) {
          glitchedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          glitchedText += originalText[i];
        }
      }
      element.textContent = glitchedText;
      requestAnimationFrame(glitch);
    };

    glitch();
  }

  // ═══ EFECTO TYPING EN TEXTO ═══
  typeText(element, text, speed = 50) {
    element.textContent = '';
    let index = 0;

    const type = () => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
        setTimeout(type, speed);
      }
    };

    type();
  }

  // ═══ EFECTO REVELACIÓN DE TEXTO ═══
  revealText(element, speed = 50) {
    const text = element.textContent;
    element.innerHTML = text
      .split('')
      .map((char) => `<span style="opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('');

    const chars = element.querySelectorAll('span');
    chars.forEach((char, index) => {
      setTimeout(() => {
        char.style.transition = 'opacity 0.3s ease-out';
        char.style.opacity = '1';
      }, index * speed);
    });
  }

  // ═══ PULSE ANIMATION ═══
  pulse(element, times = 3) {
    let count = 0;
    const originalScale = window.getComputedStyle(element).transform;

    const pulse = () => {
      if (count < times * 2) {
        if (count % 2 === 0) {
          element.style.transform = `scale(1.1)`;
        } else {
          element.style.transform = originalScale;
        }
        count++;
        setTimeout(pulse, 200);
      }
    };

    pulse();
  }

  // ═══ SHAKE ANIMATION ═══
  shake(element, intensity = 5) {
    const originalPos = element.style.transform;
    let count = 0;

    const shake = () => {
      if (count < 10) {
        const x = (Math.random() - 0.5) * intensity;
        const y = (Math.random() - 0.5) * intensity;
        element.style.transform = `translate(${x}px, ${y}px)`;
        count++;
        setTimeout(shake, 50);
      } else {
        element.style.transform = originalPos;
      }
    };

    shake();
  }

  // ═══ BOUNCE ANIMATION ═══
  bounce(element, height = 20) {
    const originalPos = element.style.transform;
    let isUp = true;
    let count = 0;

    const bounce = () => {
      if (count < 8) {
        if (isUp) {
          element.style.transform = `translateY(-${height}px)`;
        } else {
          element.style.transform = `translateY(0)`;
        }
        isUp = !isUp;
        count++;
        setTimeout(bounce, 150);
      } else {
        element.style.transform = originalPos;
      }
    };

    bounce();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 INICIAR EL MOTOR DE ANIMACIONES
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const animationsEngine = new AnimationsEngine();

  // Exponer globalmente para acceso desde otros scripts
  window.animationsEngine = animationsEngine;
});

// Esperar a que el DOM esté completamente cargado
window.addEventListener('load', () => {
  if (window.animationsEngine) {
    // Re-observar elementos después de que los scripts extern os terminen
    window.animationsEngine.observeAnimatableElements();
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ✨ INTERACTIVE WHITE MODE - CLICK ANIMATIONS (OPTIMIZADO)
// Sistema interactivo de animaciones al hacer click - Versión mejorada
// ═══════════════════════════════════════════════════════════════════════════════

class WhiteModeController {
  constructor() {
    // Estado
    this.isWhiteMode = false;
    this.isTransitioning = false;
    this.overlay = null;
    this.toggleButton = null;

    // Configuración
    this.config = {
      transitionDuration: 800,
      rippleDuration: 1000,
      waveDuration: 1500,
      particleCount: 30,
      animationDelay: 50
    };

    // Referencias de event handlers para poder removerlos
    this.handlers = {
      buttonClick: null,
      buttonKeydown: null,
      documentDblclick: null
    };

    // Inicializar solo si no existe ya
    if (!window.whiteModeController) {
      this.init();
    }
  }

  // ── INICIALIZACIÓN ──
  init() {
    // Verificar que estamos en el DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.createOverlay();
    this.createToggleButton();
    this.attachEventListeners();
    this.loadSavedState();
    console.log('✨ White Mode Controller initialized!');
  }

  // ═══ CREAR OVERLAY DE FLASH BLANCO ═══
  createOverlay() {
    // Solo crear si no existe
    if (document.querySelector('.white-flash-overlay')) return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'white-flash-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.overlay);
  }

  // ═══ CREAR BOTÓN TOGGLE ═══
  createToggleButton() {
    // Solo crear si no existe
    if (document.querySelector('.white-mode-toggle')) return;

    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'white-mode-toggle';
    this.toggleButton.innerHTML = '💡';
    this.toggleButton.setAttribute('aria-label', 'Activar modo blanco');
    this.toggleButton.setAttribute('aria-pressed', 'false');
    this.toggleButton.setAttribute('type', 'button');
    this.toggleButton.setAttribute('title', 'Doble click en cualquier parte o presiona este botón');
    document.body.appendChild(this.toggleButton);
  }

  // ═══ ADJUNTAR EVENT LISTENERS ═══
  attachEventListeners() {
    // Prevenir listeners duplicados
    this.removeEventListeners();

    // Click en el botón toggle
    this.handlers.buttonClick = (e) => this.toggleWhiteMode(e);
    this.toggleButton.addEventListener('click', this.handlers.buttonClick);

    // Keyboard accessibility
    this.handlers.buttonKeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleWhiteMode(e);
      }
    };
    this.toggleButton.addEventListener('keydown', this.handlers.buttonKeydown);

    // Doble click en cualquier parte para activar
    this.handlers.documentDblclick = (e) => {
      // No activar en inputs, textareas o elementos editables
      if (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable ||
          e.target.closest('button') ||
          e.target.closest('a')) {
        return;
      }
      this.toggleWhiteMode(e);
    };
    document.addEventListener('dblclick', this.handlers.documentDblclick);
  }

  // ═══ REMOVER EVENT LISTENERS ═══
  removeEventListeners() {
    if (this.handlers.buttonClick && this.toggleButton) {
      this.toggleButton.removeEventListener('click', this.handlers.buttonClick);
    }
    if (this.handlers.buttonKeydown && this.toggleButton) {
      this.toggleButton.removeEventListener('keydown', this.handlers.buttonKeydown);
    }
    if (this.handlers.documentDblclick) {
      document.removeEventListener('dblclick', this.handlers.documentDblclick);
    }
  }

  // ═══ TOGGLE MODO BLANCO ═══
  toggleWhiteMode(event) {
    // Prevenir múltiples toggles simultáneos
    if (this.isTransitioning) return;

    this.isTransitioning = true;

    if (this.isWhiteMode) {
      this.deactivateWhiteMode(event);
    } else {
      this.activateWhiteMode(event);
    }

    // Reset transitioning flag
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  // ═══ ACTIVAR MODO BLANCO CON EFECTOS ═══
  activateWhiteMode(event) {
    const x = event.clientX || window.innerWidth / 2;
    const y = event.clientY || window.innerHeight / 2;

    // Crear efectos visuales
    this.createRippleEffect(x, y);
    this.createWaveEffect();
    this.createParticles(x, y);

    // Flash overlay
    this.overlay.classList.add('active');

    // Esperar un momento antes de aplicar el modo blanco
    setTimeout(() => {
      document.body.classList.add('white-mode');
      this.isWhiteMode = true;

      // Actualizar botón
      this.updateButton();

      // Guardar estado
      this.saveState();

      // Iniciar fade out del overlay
      setTimeout(() => {
        this.overlay.classList.remove('active');
        this.overlay.classList.add('fade-out');

        setTimeout(() => {
          this.overlay.classList.remove('fade-out');
        }, 1200);
      }, 300);

      // Animar elementos uno por uno
      this.animateElementsSequentially();
    }, 200);
  }

  // ═══ DESACTIVAR MODO BLANCO ═══
  deactivateWhiteMode(event) {
    const x = event.clientX || window.innerWidth / 2;
    const y = event.clientY || window.innerHeight / 2;

    // Crear efecto ripple oscuro
    this.createDarkRippleEffect(x, y);

    // Transición suave de vuelta
    document.body.classList.remove('white-mode');
    this.isWhiteMode = false;

    // Actualizar botón
    this.updateButton();

    // Guardar estado
    this.saveState();

    // Shake effect en algunos elementos
    this.shakeElements();
  }

  // ═══ ACTUALIZAR BOTÓN ═══
  updateButton() {
    if (this.isWhiteMode) {
      this.toggleButton.innerHTML = '🌙';
      this.toggleButton.setAttribute('aria-label', 'Desactivar modo blanco');
      this.toggleButton.setAttribute('aria-pressed', 'true');
    } else {
      this.toggleButton.innerHTML = '💡';
      this.toggleButton.setAttribute('aria-label', 'Activar modo blanco');
      this.toggleButton.setAttribute('aria-pressed', 'false');
    }
  }

  // ═══ GUARDAR/CARGAR ESTADO ═══
  saveState() {
    try {
      localStorage.setItem('whiteModeEnabled', this.isWhiteMode);
    } catch (e) {
      // LocalStorage no disponible
    }
  }

  loadSavedState() {
    try {
      const saved = localStorage.getItem('whiteModeEnabled');
      if (saved === 'true') {
        // Activar sin animaciones al cargar
        document.body.classList.add('white-mode');
        this.isWhiteMode = true;
        this.updateButton();
      }
    } catch (e) {
      // LocalStorage no disponible
    }
  }

  // ═══ CREAR EFECTO RIPPLE EN PUNTO DE CLICK ═══
  createRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, this.config.rippleDuration);
  }

  // ═══ CREAR EFECTO RIPPLE OSCURO ═══
  createDarkRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple click-ripple-dark';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, this.config.rippleDuration);
  }

  // ═══ CREAR EFECTO DE ONDA EXPANSIVA ═══
  createWaveEffect() {
    const wave = document.createElement('div');
    wave.className = 'wave-effect';
    wave.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wave);

    setTimeout(() => {
      wave.remove();
    }, this.config.waveDuration);
  }

  // ═══ ANIMAR ELEMENTOS SECUENCIALMENTE ═══
  animateElementsSequentially() {
    const elements = document.querySelectorAll('.card, .label-card, .rental-card, .popular-card, .news-item, .cta, h2');

    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.transform = 'scale(1.05)';
        setTimeout(() => {
          el.style.transform = '';
        }, 200);
      }, index * this.config.animationDelay);
    });
  }

  // ═══ SHAKE EFFECT EN ELEMENTOS ═══
  shakeElements() {
    const elements = document.querySelectorAll('.card, .label-card, .popular-card, .news-item');

    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.animation = 'shake-small 0.5s ease-in-out';
        setTimeout(() => {
          el.style.animation = '';
        }, 500);
      }, index * 30);
    });
  }

  // ═══ EFECTO DE PARTÍCULAS AL ACTIVAR ═══
  createParticles(x, y) {
    const particleCount = this.config.particleCount;
    const colors = ['#ffffff', '#007BFF', '#5db4ff', '#00d4ff'];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = 6 + Math.random() * 8;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        left: ${x}px;
        top: ${y}px;
        box-shadow: 0 0 10px ${color};
      `;
      particle.setAttribute('aria-hidden', 'true');

      document.body.appendChild(particle);

      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 5 + Math.random() * 10;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      let px = x;
      let py = y;
      let opacity = 1;
      let gravity = 0.3;
      let velocityY = vy;

      const animate = () => {
        px += vx;
        py += velocityY;
        velocityY += gravity; // Añadir gravedad
        opacity -= 0.015;

        particle.style.left = `${px}px`;
        particle.style.top = `${py}px`;
        particle.style.opacity = opacity;

        if (opacity > 0 && py < window.innerHeight + 100) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };

      requestAnimationFrame(animate);
    }
  }

  // ═══ DESTRUCTOR (para cleanup) ═══
  destroy() {
    this.removeEventListeners();
    if (this.overlay) this.overlay.remove();
    if (this.toggleButton) this.toggleButton.remove();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 INICIAR WHITE MODE CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

// Singleton pattern para evitar instancias duplicadas
if (!window.whiteModeController) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.whiteModeController = new WhiteModeController();
    });
  } else {
    window.whiteModeController = new WhiteModeController();
  }
}

// Añadir animación shake-small al documento si no existe
if (!document.querySelector('#shake-animation-styles')) {
  const style = document.createElement('style');
  style.id = 'shake-animation-styles';
  style.textContent = `
    @keyframes shake-small {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px) rotate(-1deg); }
      50% { transform: translateX(5px) rotate(1deg); }
      75% { transform: translateX(-5px) rotate(-1deg); }
    }
  `;
  document.head.appendChild(style);
}