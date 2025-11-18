/* ════════════════════════════════════════════════════════════════════════
   SCRIPTS FORM VALIDATION - CONTACT SECTION
   
   ✨ FEATURES:
   - Validación en tiempo real
   - Estados visuales mejorados
   - Mensajes de error personalizados
   - Prevención de spam
   - Accesibilidad
   
   📍 UBICACIÓN: Dentro de <script> en tu HTML
   O como archivo: form-validation.js
   ════════════════════════════════════════════════════════════════════════ */

// ═════════════════════════════════════════════════════════════════════════
// SECTION 1: INICIALIZACIÓN Y CONFIGURACIÓN
// ═════════════════════════════════════════════════════════════════════════

const FormValidator = {
  form: null,
  submitBtn: null,
  isSubmitting: false,
  debounceTimers: {},

  // Configuración de validaciones
  rules: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/,
      message: 'Solo letras, espacios y caracteres válidos'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email inválido'
    },
    phone: {
      required: false,
      minLength: 10,
      pattern: /^[\d\s+\-()]+$/,
      message: 'Teléfono inválido'
    },
    subject: {
      required: true,
      message: 'Selecciona un asunto'
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 5000,
      message: 'El mensaje debe tener entre 10 y 5000 caracteres'
    },
    privacy: {
      required: true,
      message: 'Debes aceptar la política de privacidad'
    }
  },

  // Mensajes personalizados
  messages: {
    required: 'Este campo es requerido',
    minLength: (min) => `Mínimo ${min} caracteres`,
    maxLength: (max) => `Máximo ${max} caracteres`,
    email: 'Email inválido',
    pattern: 'Formato inválido',
    checkbox: 'Debes aceptar los términos'
  },

  init() {
    this.form = document.querySelector('.contact-form');
    if (!this.form) return;

    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.attachEventListeners();
    this.setupFormHints();
  },

  // ──────────────────────────────────────────────────────────────────────
  // SECTION 2: EVENT LISTENERS
  // ──────────────────────────────────────────────────────────────────────

  attachEventListeners() {
    // Validación en tiempo real (con debounce)
    this.form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('focus', () => this.setFocusState(field));
      field.addEventListener('input', () => this.debounceValidate(field));
    });

    // Submit del formulario
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Tecla Enter en inputs (menos en textarea)
    this.form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((field) => {
      field.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.form.dispatchEvent(new Event('submit'));
        }
      });
    });
  },

  // ──────────────────────────────────────────────────────────────────────
  // SECTION 3: VALIDACIÓN
  // ──────────────────────────────────────────────────────────────────────

  validateField(field) {
    const fieldName = field.name;
    const fieldRules = this.rules[fieldName];
    const fieldGroup = field.closest('.form-group');

    if (!fieldRules) return true;

    let isValid = true;
    let errorMessage = '';

    // Validación requerida
    if (fieldRules.required && !field.value.trim()) {
      isValid = false;
      errorMessage = this.messages.required;
    }

    // Validación tipo checkbox
    if (field.type === 'checkbox' && fieldRules.required && !field.checked) {
      isValid = false;
      errorMessage = fieldRules.message || this.messages.checkbox;
    }

    // Validación minLength
    if (isValid && fieldRules.minLength && field.value.length < fieldRules.minLength) {
      isValid = false;
      errorMessage = this.messages.minLength(fieldRules.minLength);
    }

    // Validación maxLength
    if (isValid && fieldRules.maxLength && field.value.length > fieldRules.maxLength) {
      isValid = false;
      errorMessage = this.messages.maxLength(fieldRules.maxLength);
    }

    // Validación pattern
    if (isValid && fieldRules.pattern && field.value.trim() && !fieldRules.pattern.test(field.value)) {
      isValid = false;
      errorMessage = fieldRules.message || this.messages.pattern;
    }

    // Actualizar estado visual
    this.updateFieldState(fieldGroup, isValid, errorMessage);
    return isValid;
  },

  debounceValidate(field) {
    const fieldName = field.name;

    // Limpiar timeout anterior
    if (this.debounceTimers[fieldName]) {
      clearTimeout(this.debounceTimers[fieldName]);
    }

    // Nuevo debounce: validar después de 500ms sin escribir
    this.debounceTimers[fieldName] = setTimeout(() => {
      this.validateField(field);
    }, 500);
  },

  setFocusState(field) {
    const fieldGroup = field.closest('.form-group');
    fieldGroup.classList.add('focused');
    fieldGroup.classList.remove('error');
  },

  // ──────────────────────────────────────────────────────────────────────
  // SECTION 4: ESTADOS VISUALES
  // ──────────────────────────────────────────────────────────────────────

  updateFieldState(fieldGroup, isValid, errorMessage = '') {
    if (isValid) {
      fieldGroup.classList.remove('error');
      fieldGroup.classList.add('valid');

      // Limpiar mensajes de error
      const errorEl = fieldGroup.querySelector('.error-message');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    } else {
      fieldGroup.classList.add('error');
      fieldGroup.classList.remove('valid');

      // Mostrar mensaje de error
      let errorEl = fieldGroup.querySelector('.error-message');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.setAttribute('role', 'alert');
        fieldGroup.appendChild(errorEl);
      }

      errorEl.textContent = errorMessage;
      errorEl.style.display = 'block';
    }
  },

  // ──────────────────────────────────────────────────────────────────────
  // SECTION 5: SUBMIT FORM
  // ──────────────────────────────────────────────────────────────────────

  handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    // Validar todos los campos
    let isFormValid = true;
    this.form.querySelectorAll('input, textarea, select').forEach((field) => {
      if (!this.validateField(field)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showFormError('Por favor, completa todos los campos correctamente');
      return;
    }

    this.submitForm();
  },

  async submitForm() {
    this.isSubmitting = true;
    this.submitBtn.disabled = true;
    this.submitBtn.classList.add('loading');

    try {
      // Recolectar datos del formulario
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);

      // Simular envío (reemplaza con tu API real)
      const response = await this.sendFormData(data);

      if (response.ok || response.status === 200) {
        this.showFormSuccess('¡Mensaje enviado exitosamente!');
        this.form.reset();
        this.clearFormState();
      } else {
        this.showFormError('Error al enviar el mensaje. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showFormError('Error de conexión. Intenta más tarde.');
    } finally {
      this.isSubmitting = false;
      this.submitBtn.disabled = false;
      this.submitBtn.classList.remove('loading');
    }
  },

  async sendFormData(data) {
    // Reemplaza esto con tu endpoint real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ok: true, status: 200 });
      }, 1500);
    });

    // Ejemplo con fetch real:
    // return fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
  },

  // ──────────────────────────────────────────────────────────────────────
  // SECTION 6: MENSAJES
  // ──────────────────────────────────────────────────────────────────────

  showFormError(message) {
    let errorContainer = this.form.querySelector('.form-error');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'form-error';
      this.form.prepend(errorContainer);
    }

    errorContainer.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    errorContainer.style.display = 'flex';
  },

  showFormSuccess(message) {
    let successContainer = this.form.querySelector('.form-success');
    if (!successContainer) {
      successContainer = document.createElement('div');
      successContainer.className = 'form-success';
      this.form.prepend(successContainer);
    }

    successContainer.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;
    successContainer.style.display = 'flex';

    setTimeout(() => {
      successContainer.style.display = 'none';
    }, 4000);
  },

  clearFormState() {
    this.form.querySelectorAll('.form-group').forEach((group) => {
      group.classList.remove('error', 'valid', 'focused');
    });
  },

  // ──────────────────────────────────────────────────────────────────────
  // SECTION 7: HINTS Y AYUDAS
  // ──────────────────────────────────────────────────────────────────────

  setupFormHints() {
    const messageField = this.form.querySelector('textarea[name="message"]');
    if (!messageField) return;

    // Mostrar contador de caracteres
    const hint = document.createElement('div');
    hint.className = 'form-char-counter';
    hint.textContent = '0 / 5000';
    messageField.after(hint);

    messageField.addEventListener('input', () => {
      const count = messageField.value.length;
      hint.textContent = `${count} / 5000`;

      if (count > 4500) {
        hint.style.color = '#e74c3c';
      } else if (count > 3500) {
        hint.style.color = '#f39c12';
      } else {
        hint.style.color = '#95a5a6';
      }
    });
  }
};

// ════════════════════════════════════════════════════════════════════════
// SECCIÓN INIT: Inicializar cuando DOM esté listo
// ════════════════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    FormValidator.init();
  });
} else {
  FormValidator.init();
}