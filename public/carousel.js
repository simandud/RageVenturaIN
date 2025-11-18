/* ========================================
   CAROUSEL AUTOMÁTICO - VERSIÓN ADAPTADA
   ======================================== */

class ImageCarousel {
  constructor(containerSelector = '#label', slidesSelector = '.carousel-slide') {
    this.container = document.querySelector(containerSelector);
    this.slides = document.querySelectorAll(slidesSelector);
    
    if (!this.container || this.slides.length === 0) {
      console.error('Carousel: Contenedor o slides no encontrados');
      return;
    }

    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 segundos entre cambios

    this.initCarousel();
    this.attachEventListeners();
    this.startAutoPlay();
    
    console.log(`✅ Carousel iniciado con ${this.totalSlides} slides`);
  }

  initCarousel() {
    // Buscar o crear contenedor de indicadores
    let indicatorsContainer = this.container.querySelector('#indicators');
    
    if (!indicatorsContainer) {
      indicatorsContainer = document.createElement('div');
      indicatorsContainer.id = 'indicators';
      indicatorsContainer.className = 'carousel-indicators';
      this.container.appendChild(indicatorsContainer);
    }
    
    // Crear indicadores dinámicamente
    indicatorsContainer.innerHTML = ''; // Limpiar primero
    
    for (let i = 0; i < this.totalSlides; i++) {
      const indicator = document.createElement('div');
      indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
      indicator.dataset.slide = i;
      indicator.addEventListener('click', () => this.goToSlide(i));
      indicatorsContainer.appendChild(indicator);
    }

    // Crear contador si no existe
    let counter = this.container.querySelector('.carousel-counter');
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'carousel-counter';
      counter.innerHTML = `
        <span class="carousel-current" id="currentSlide">01</span>
        <span class="carousel-total">/ ${String(this.totalSlides).padStart(2, '0')}</span>
      `;
      this.container.appendChild(counter);
    }

    // Crear botones si no existen
    let navContainer = this.container.querySelector('.carousel-nav');
    if (!navContainer) {
      navContainer = document.createElement('div');
      navContainer.className = 'carousel-nav';
      navContainer.innerHTML = `
        <button id="prevBtn" aria-label="Slide anterior">❮</button>
        <button id="nextBtn" aria-label="Siguiente slide">❯</button>
      `;
      this.container.appendChild(navContainer);
    }

    this.updateSlide();
  }

  attachEventListeners() {
    // Botones de navegación
    const prevBtn = this.container.querySelector('#prevBtn');
    const nextBtn = this.container.querySelector('#nextBtn');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

    // Pausar autoplay al interactuar
    this.container.addEventListener('mouseenter', () => {
      this.stopAutoPlay();
    });

    this.container.addEventListener('mouseleave', () => {
      this.startAutoPlay();
    });

    // También para touch
    this.container.addEventListener('touchstart', () => {
      this.stopAutoPlay();
    });

    this.container.addEventListener('touchend', () => {
      this.startAutoPlay();
    });

    // Navegación con teclado (global, pero solo si carousel está visible)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlide();
    this.resetAutoPlay();
    console.log(`→ Slide ${this.currentSlide + 1}/${this.totalSlides}`);
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlide();
    this.resetAutoPlay();
    console.log(`← Slide ${this.currentSlide + 1}/${this.totalSlides}`);
  }

  goToSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;
    this.currentSlide = index;
    this.updateSlide();
    this.resetAutoPlay();
    console.log(`⊙ Ir al slide ${this.currentSlide + 1}/${this.totalSlides}`);
  }

  updateSlide() {
    // Actualizar slides
    this.slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentSlide);
    });

    // Actualizar indicadores
    const indicators = this.container.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });

    // Actualizar contador
    const currentElement = this.container.querySelector('#currentSlide');
    if (currentElement) {
      currentElement.textContent = String(this.currentSlide + 1).padStart(2, '0');
    }
  }

  startAutoPlay() {
    if (this.autoPlayInterval) return; // Evitar duplicados
    
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  // Método para cambiar velocidad
  setAutoPlaySpeed(milliseconds) {
    this.autoPlayDelay = milliseconds;
    this.resetAutoPlay();
  }

  // Destructor para limpiar
  destroy() {
    this.stopAutoPlay();
    console.log('✗ Carousel destruido');
  }
}

// Inicializar carousel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Intentar encontrar el carousel en tu estructura
  // Cambia '#label' si tu ID es diferente
  const carouselContainer = document.querySelector('#label');
  
  if (carouselContainer) {
    window.carousel = new ImageCarousel('#label', '.carousel-slide');
  } else {
    console.warn('⚠️ No se encontró elemento con id="label"');
  }
});

// Para debugging - descomenta si necesitas
window.debugCarousel = () => {
  if (window.carousel) {
    console.log('=== CAROUSEL DEBUG ===');
    console.log('Current slide:', window.carousel.currentSlide);
    console.log('Total slides:', window.carousel.totalSlides);
    console.log('Container:', window.carousel.container);
    console.log('Slides:', window.carousel.slides);
  }
};

/* ========================================
   CARRUSEL BANNER - AUTOPLAY EN LOOP
   ======================================== */

class CarouselBanner {
  constructor(selector = '.carousel-banner', autoPlayDelay = 5000) {
    this.container = document.querySelector(selector);
    if (!this.container) {
      console.error('❌ Carrusel: Contenedor no encontrado');
      return;
    }

    this.items = this.container.querySelectorAll('.carousel-banner-item');
    this.dots = this.container.querySelectorAll('.dot');
    this.currentIndex = 0;
    this.autoPlayDelay = autoPlayDelay;
    this.autoPlayInterval = null;

    if (this.items.length === 0) {
      console.error('❌ Carrusel: No hay items');
      return;
    }

    this.init();
    console.log(`✅ Carrusel iniciado con ${this.items.length} imágenes`);
  }

  init() {
    // Click en dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Hover pausa
    this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.container.addEventListener('mouseleave', () => this.startAutoPlay());

    // Touch pausa
    this.container.addEventListener('touchstart', () => this.stopAutoPlay());
    this.container.addEventListener('touchend', () => this.startAutoPlay());

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });

    // Iniciar autoplay
    this.startAutoPlay();
  }

  goToSlide(index) {
    // Remover active de todos
    this.items.forEach(item => item.classList.remove('active'));
    this.dots.forEach(dot => dot.classList.remove('active'));

    // Agregar active al nuevo
    this.currentIndex = index;
    this.items[this.currentIndex].classList.add('active');
    this.dots[this.currentIndex].classList.add('active');

    console.log(`→ Imagen ${this.currentIndex + 1}/${this.items.length}`);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.goToSlide(this.currentIndex);
    this.resetAutoPlay();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.goToSlide(this.currentIndex);
    this.resetAutoPlay();
  }

  startAutoPlay() {
    if (this.autoPlayInterval) return;

    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  setAutoPlayDelay(ms) {
    this.autoPlayDelay = ms;
    this.resetAutoPlay();
  }
}

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  window.carouselBanner = new CarouselBanner('.carousel-banner', 5000); // 5 segundos
});

// Debug (descomenta si necesitas)
window.debugCarouselBanner = () => {
  if (window.carouselBanner) {
    console.log({
      currentIndex: window.carouselBanner.currentIndex,
      totalItems: window.carouselBanner.items.length,
      autoPlayDelay: window.carouselBanner.autoPlayDelay,
      isPlaying: !!window.carouselBanner.autoPlayInterval
    });
  }
};