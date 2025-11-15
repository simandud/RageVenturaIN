// 🌌 THREE.js - Tu modelo 3D personalizado con estrellas
// Wrapped in IIFE to avoid global namespace pollution
(function() {
  'use strict';

  // Utility: Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Check WebGL support
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

  // Exit early if WebGL not supported
  if (!checkWebGLSupport()) {
    console.warn('WebGL not supported, 3D scene disabled');
    document.body.classList.add('no-webgl');
    return;
  }

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 30);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// ✨ ESTRELLAS FINAS Y REALISTAS
const createStars = (count, size, range) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * range;
    positions[i3 + 1] = (Math.random() - 0.5) * range;
    positions[i3 + 2] = (Math.random() - 0.5) * range;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({ 
    size: size,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  
  return new THREE.Points(geometry, material);
};

const stars1 = createStars(3000, 0.15, 300);
const stars2 = createStars(1500, 0.25, 200);
scene.add(stars1, stars2);

// 🎯 TU MODELO 3D
let myModel = null;

// ============================================
// 📦 CARGA DE TU MODELO GLB
// ============================================
const loader = new THREE.GLTFLoader();

// 👇 AQUÍ está tu archivo - CAMBIA LA RUTA si es diferente
loader.load(
  'assets/synthesizer.glb', // 👈 Tu archivo GLB
  (gltf) => {
    myModel = gltf.scene;
    
    // 🎨 Ajusta el tamaño del modelo
    myModel.scale.set(7, 7, 7); // 👈 CAMBIA estos números si es muy grande/pequeño
    
    // Posición inicial
    myModel.position.set(0, 0, 0);
    
    // Añadir al escenario
    scene.add(myModel);

    // Si el modelo tiene animaciones, puedes activarlas aquí
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(myModel);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
      // Guarda el mixer para actualizarlo en el loop
      myModel.userData.mixer = mixer;
    }
  },
  (progress) => {
    // Progress tracking (removed console.log for production)
  },
  (error) => {
    console.error('Error loading 3D model:', error);
    // Show fallback UI
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.classList.add('no-3d-fallback');
    }
  }
);

// 💡 ILUMINACIÓN PROFESIONAL para que tu modelo se vea increíble
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Luz principal (key light)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(10, 10, 10);
scene.add(keyLight);

// Luz de relleno (fill light)
const fillLight = new THREE.DirectionalLight(0x6666ff, 0.6);
fillLight.position.set(-10, 0, -10);
scene.add(fillLight);

// Luz de contorno (rim light) - para darle profundidad
const rimLight = new THREE.PointLight(0xff0066, 1.5, 100);
rimLight.position.set(0, 10, -10);
scene.add(rimLight);

// 📜 SCROLL - Tu modelo gira cuando haces scroll
const scrollContainer = document.querySelector('#content');
let scrollY = 0;

function onScroll() {
  scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
  
  if (myModel) {
    // 🔄 ROTACIÓN CON SCROLL - más scroll = más rotación
    myModel.rotation.y = scrollY * 0.003; // 👈 Velocidad horizontal
    myModel.rotation.x = scrollY * 0.0008; // 👈 Velocidad vertical
    
    // 💫 Opcional: hacer que el modelo suba/baje con scroll
    // myModel.position.y = -(scrollY * 0.005);
    
    // 🌈 Cambiar color de luz con scroll
    const hue = (scrollY * 0.1) % 360;
    rimLight.color.setHSL(hue / 360, 1, 0.5);
  }
  
  // Cámara se acerca con scroll
  camera.position.z = 30 - (scrollY * 0.008);
}

// Use passive listener for better scroll performance
if (scrollContainer) {
  scrollContainer.addEventListener('scroll', onScroll, { passive: true });
} else {
  document.addEventListener('scroll', onScroll, { passive: true });
}

// 🖱️ PARALLAX CON MOUSE - el modelo sigue tu cursor
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

function parallax() {
  // Cámara sigue el mouse
  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
  camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);
  
  // El modelo también se inclina siguiendo el mouse
  if (myModel) {
    myModel.rotation.x += (mouse.y * 0.2 - myModel.rotation.x) * 0.02;
    myModel.rotation.y += (mouse.x * 0.2 - myModel.rotation.y) * 0.02;
  }
}

// 🔄 LOOP DE ANIMACIÓN
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  
  // Rotación automática suave del modelo
  if (myModel) {
    myModel.rotation.y += 0.002; // 👈 Rotación constante
    
    // Si tiene animaciones internas, actualizarlas
    if (myModel.userData.mixer) {
      myModel.userData.mixer.update(delta);
    }
  }
  
  // Rotación de estrellas
  stars1.rotation.y += 0.0002;
  stars2.rotation.y += 0.0005;
  
  parallax();
  renderer.render(scene, camera);
}
animate();

// 🔄 RESPONSIVE - Debounced for better performance
const handleResize = debounce(() => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}, 150);

window.addEventListener('resize', handleResize, { passive: true });

// ---------- UX helpers ----------
document.querySelectorAll('[data-go]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href') || a.getAttribute('data-go');
    const targetElement = document.querySelector(id);
    if (targetElement) {
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

const hscroll = document.getElementById('vinylScroll');
if (hscroll) {
  hscroll.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      hscroll.scrollLeft += e.deltaY * 0.9;
    }
  }, { passive: false });
}

function attachTilt(el) {
  const r = 10;
  el.addEventListener('pointermove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${(-y)*r}deg) rotateY(${x*r}deg) translateY(-2px)`;
  });
  el.addEventListener('pointerleave', () => {
    el.style.transform = '';
  });
}
document.querySelectorAll('.tilt').forEach(attachTilt);

const fxBtn = document.getElementById('toggleFx');
let fxOn = true;
if(fxBtn) {
  fxBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fxOn = !fxOn;
    document.body.classList.toggle('nofx', !fxOn);
    fxBtn.textContent = `FX: ${fxOn ? 'ON' : 'OFF'}`;
    stars1.visible = fxOn;
    stars2.visible = fxOn;
  });
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('nofx');
  stars1.visible = false;
  stars2.visible = false;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const hue = entry.target.dataset.hue || 330;
    }
  });
}, {
    threshold: 0.6,
    root: scrollContainer
});

document.querySelectorAll('.card.tilt, .label-card.tilt, .rental-card.tilt, .vcard.tilt').forEach(el => observer.observe(el));

// Close IIFE
})();
