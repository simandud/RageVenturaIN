// ═══════════════════════════════════════════════════════════════════
// RAGE VENTURE - Polyfills for Browser Compatibility
// Ensures compatibility with older browsers
// ═══════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══ INTERSECTION OBSERVER POLYFILL ═══
  // For IE11 and older browsers
  if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver not supported, loading polyfill...');

    // Load polyfill from CDN
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    script.async = true;
    document.head.appendChild(script);
  }

  // ═══ SMOOTHSCROLL POLYFILL ═══
  // For smooth scrolling in Safari and older browsers
  if (!('scrollBehavior' in document.documentElement.style)) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
    script.async = true;
    script.onload = function() {
      if (window.smoothScroll) {
        window.smoothScroll.polyfill();
      }
    };
    document.head.appendChild(script);
  }

  // ═══ CSS CUSTOM PROPERTIES FALLBACK ═══
  // For IE11 - Add basic color fallbacks
  if (!window.CSS || !window.CSS.supports || !window.CSS.supports('(--a: 0)')) {
    console.warn('CSS Custom Properties not supported');

    // Add fallback stylesheet
    const style = document.createElement('style');
    style.textContent = `
      .card { background: rgba(15, 18, 42, 0.95); color: #f5f6ff; }
      .cta { background: #007BFF; color: #030109; }
      .accent-text { color: #5db4ff; }
    `;
    document.head.appendChild(style);
  }

  // ═══ WEBGL SUPPORT DETECTION ═══
  // Fallback for browsers without WebGL
  function checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch(e) {
      return false;
    }
  }

  if (!checkWebGLSupport()) {
    console.warn('WebGL not supported, 3D scene will be disabled');
    document.body.classList.add('no-webgl');

    // Hide 3D canvas
    const bgCanvas = document.querySelector('#bg');
    if (bgCanvas) {
      bgCanvas.style.display = 'none';
    }

    // Add static background
    document.body.style.background = `
      radial-gradient(circle at 15% 15%, rgba(0, 123, 255, 0.28), transparent 55%),
      radial-gradient(circle at 85% 10%, rgba(93, 180, 255, 0.24), transparent 50%),
      radial-gradient(circle at 40% 90%, rgba(93, 180, 255, 0.22), transparent 55%),
      #030109
    `;
  }

  // ═══ OBJECT-FIT POLYFILL ═══
  // For IE11 image sizing
  if (!('objectFit' in document.documentElement.style)) {
    const images = document.querySelectorAll('img[style*="object-fit"]');
    images.forEach(img => {
      const parent = img.parentElement;
      parent.style.overflow = 'hidden';
      img.style.position = 'absolute';
      img.style.top = '50%';
      img.style.left = '50%';
      img.style.transform = 'translate(-50%, -50%)';
      img.style.width = 'auto';
      img.style.height = '100%';
    });
  }

  console.log('✓ Polyfills loaded successfully');
})();
