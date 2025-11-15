/**
 * Efecto Glitch para Títulos
 * Busca todos los elementos con el atributo 'data-glitch'
 * y les aplica un efecto de "scramble" al pasar el mouse.
 */
document.addEventListener('DOMContentLoaded', () => {
  const glitchElements = document.querySelectorAll('[data-glitch]');
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\%$#@*?';

  glitchElements.forEach(el => {
    const originalText = el.textContent;
    let intervalId = null;

    el.addEventListener('mouseenter', () => {
      let iteration = 0;
      
      // Limpia cualquier intervalo anterior por si acaso
      if (intervalId) clearInterval(intervalId);

      intervalId = setInterval(() => {
        el.textContent = originalText
          .split('')
          .map((letter, index) => {
            // Si el índice es menor que la iteración, muestra la letra original
            if (index < iteration) {
              return originalText[index];
            }
            // Si no, muestra un caracter aleatorio
            return charset[Math.floor(Math.random() * charset.length)];
          })
          .join('');

        // Cuando la iteración supera la longitud del texto, detiene el efecto
        if (iteration >= originalText.length) {
          clearInterval(intervalId);
          el.textContent = originalText; // Asegura que el texto final es el original
        }

        // Incrementa la iteración. 
        // El '1 / 3' hace que el efecto sea más rápido y "glitchy"
        iteration += originalText.length / 15; 
      }, 40); // Velocidad del refresco del glitch
    });

    // Opcional: reiniciar al salir (a veces se prefiere que no)
    el.addEventListener('mouseleave', () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      el.textContent = originalText; // Restaura inmediatamente al salir
    });
  });
});