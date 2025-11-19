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
// ✨ INTERACTIVE WHITE MODE - CLICK ANIMATIONS
// Sistema de animaciones interactivas al hacer click
// ═══════════════════════════════════════════════════════════════════════════════

class WhiteModeController {
  constructor() {
    this.isWhiteMode = false;
    this.overlay = null;
    this.toggleButton = null;
    this.init();
  }

  // ── INICIALIZACIÓN ──
  init() {
    this.createOverlay();
    this.createToggleButton();
    this.attachEventListeners();
  }

  // ═══ CREAR OVERLAY DE FLASH BLANCO ═══
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'white-flash-overlay';
    document.body.appendChild(this.overlay);
  }

  // ═══ CREAR BOTÓN TOGGLE ═══
  createToggleButton() {
    this.toggleButton = document.createElement('div');
    this.toggleButton.className = 'white-mode-toggle';
    this.toggleButton.innerHTML = '💡';
    this.toggleButton.setAttribute('aria-label', 'Toggle White Mode');
    this.toggleButton.setAttribute('role', 'button');
    this.toggleButton.setAttribute('tabindex', '0');
    document.body.appendChild(this.toggleButton);
  }

  // ═══ ADJUNTAR EVENT LISTENERS ═══
  attachEventListeners() {
    // Click en el botón toggle
    this.toggleButton.addEventListener('click', (e) => {
      this.toggleWhiteMode(e);
    });

    // Keyboard accessibility
    this.toggleButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleWhiteMode(e);
      }
    });

    // Doble click en cualquier parte para activar
    document.addEventListener('dblclick', (e) => {
      // No activar en inputs, textareas o elementos editables
      if (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable) {
        return;
      }
      this.toggleWhiteMode(e);
    });
  }

  // ═══ TOGGLE MODO BLANCO ═══
  toggleWhiteMode(event) {
    if (this.isWhiteMode) {
      this.deactivateWhiteMode(event);
    } else {
      this.activateWhiteMode(event);
    }
  }

  // ═══ ACTIVAR MODO BLANCO CON EFECTOS ═══
  activateWhiteMode(event) {
    // Crear efecto ripple desde el punto de click
    this.createRippleEffect(event.clientX, event.clientY);

    // Crear efecto de onda expansiva
    this.createWaveEffect();

    // Flash overlay
    this.overlay.classList.add('active');

    // Esperar un momento antes de aplicar el modo blanco
    setTimeout(() => {
      document.body.classList.add('white-mode');
      this.isWhiteMode = true;

      // Cambiar icono del botón
      this.toggleButton.innerHTML = '🌙';

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
    // Crear efecto ripple oscuro
    this.createDarkRippleEffect(event.clientX, event.clientY);

    // Transición suave de vuelta
    document.body.classList.remove('white-mode');
    this.isWhiteMode = false;

    // Cambiar icono del botón
    this.toggleButton.innerHTML = '💡';

    // Shake effect en algunos elementos
    this.shakeElements();
  }

  // ═══ CREAR EFECTO RIPPLE EN PUNTO DE CLICK ═══
  createRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  // ═══ CREAR EFECTO RIPPLE OSCURO ═══
  createDarkRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.background = 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  // ═══ CREAR EFECTO DE ONDA EXPANSIVA ═══
  createWaveEffect() {
    const wave = document.createElement('div');
    wave.className = 'wave-effect';
    document.body.appendChild(wave);

    setTimeout(() => {
      wave.remove();
    }, 1500);
  }

  // ═══ ANIMAR ELEMENTOS SECUENCIALMENTE ═══
  animateElementsSequentially() {
    const elements = document.querySelectorAll('.card, .label-card, .rental-card, h2, .cta');

    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.transform = 'scale(1.05)';
        setTimeout(() => {
          el.style.transform = '';
        }, 200);
      }, index * 50);
    });
  }

  // ═══ SHAKE EFFECT EN ELEMENTOS ═══
  shakeElements() {
    const elements = document.querySelectorAll('.card, .label-card');

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
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        left: ${x}px;
        top: ${y}px;
      `;

      document.body.appendChild(particle);

      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 5 + Math.random() * 5;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      let px = x;
      let py = y;
      let opacity = 1;

      const animate = () => {
        px += vx;
        py += vy;
        opacity -= 0.02;

        particle.style.left = `${px}px`;
        particle.style.top = `${py}px`;
        particle.style.opacity = opacity;

        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };

      requestAnimationFrame(animate);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 INICIAR WHITE MODE CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const whiteModeController = new WhiteModeController();

  // Exponer globalmente para acceso desde otros scripts
  window.whiteModeController = whiteModeController;

  console.log('✨ White Mode Controller initialized!');
  console.log('💡 Double-click anywhere or click the toggle button to activate');
});

// Añadir animación shake-small al documento
const style = document.createElement('style');
style.textContent = `
  @keyframes shake-small {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);