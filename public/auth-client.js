/**
 * RAGEVENTURA - Auth Client
 * Maneja autenticación en el frontend
 */

const RVAuth = {
  API_URL: '/api/auth.php',
  user: null,

  /**
   * Inicializar - verificar sesión al cargar
   */
  async init() {
    await this.checkSession();
    this.updateUI();
    this.setupEventListeners();
  },

  /**
   * Verificar sesión activa
   */
  async checkSession() {
    try {
      const response = await fetch(`${this.API_URL}?action=check`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.authenticated && data.user) {
        this.user = data.user;
        this.user.badges = data.badges || [];
        return true;
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
    this.user = null;
    return false;
  },

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.API_URL}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        this.user = data.user;
        return { success: true, user: data.user, message: data.message };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Error de conexión. Inténtalo de nuevo.' };
    }
  },

  /**
   * Iniciar sesión
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.API_URL}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        this.user = data.user;
        return { success: true, user: data.user, message: data.message };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error de conexión. Inténtalo de nuevo.' };
    }
  },

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await fetch(`${this.API_URL}?action=logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.user = null;
    window.location.href = '/index.html';
  },

  /**
   * Actualizar UI según estado de sesión
   */
  updateUI() {
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) return;

    if (this.user) {
      userMenu.innerHTML = `
        <div class="user-dropdown">
          <button class="user-dropdown-btn" id="user-dropdown-btn">
            <img src="${this.user.avatar_url || '/assets/default-avatar.png'}" alt="Avatar" class="user-mini-avatar">
            <span class="user-mini-name">${this.user.username}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="user-dropdown-menu" id="user-dropdown-menu">
            <a href="/perfil.html">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Mi Perfil
            </a>
            <a href="/comunidad.html">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Comunidad
            </a>
            <div class="dropdown-divider"></div>
            <button id="logout-btn" class="logout-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      `;

      // Dropdown toggle
      const dropdownBtn = document.getElementById('user-dropdown-btn');
      const dropdownMenu = document.getElementById('user-dropdown-menu');

      dropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        dropdownMenu?.classList.remove('show');
      });

      // Logout button
      document.getElementById('logout-btn')?.addEventListener('click', () => {
        this.logout();
      });

    } else {
      userMenu.innerHTML = `
        <a href="/login.html" class="ghost">Iniciar Sesión</a>
      `;
    }
  },

  /**
   * Configurar event listeners para formularios
   */
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin(loginForm);
      });
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRegister(registerForm);
      });

      // Password strength
      const passwordInput = registerForm.querySelector('#password');
      passwordInput?.addEventListener('input', (e) => {
        this.updatePasswordStrength(e.target.value);
      });
    }

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        btn.classList.toggle('showing', type === 'text');
      });
    });
  },

  /**
   * Manejar submit del login
   */
  async handleLogin(form) {
    const submitBtn = form.querySelector('.auth-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const messageEl = document.getElementById('form-message');

    // Loading state
    submitBtn.disabled = true;
    btnText.hidden = true;
    btnLoader.hidden = false;
    messageEl.hidden = true;

    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    const result = await this.login(email, password);

    // Reset loading
    submitBtn.disabled = false;
    btnText.hidden = false;
    btnLoader.hidden = true;

    if (result.success) {
      messageEl.className = 'form-message success';
      messageEl.textContent = result.message || '¡Bienvenido!';
      messageEl.hidden = false;

      // Redirect after success
      setTimeout(() => {
        window.location.href = '/perfil.html';
      }, 1000);
    } else {
      messageEl.className = 'form-message error';
      messageEl.textContent = result.error;
      messageEl.hidden = false;
    }
  },

  /**
   * Manejar submit del registro
   */
  async handleRegister(form) {
    const submitBtn = form.querySelector('.auth-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const messageEl = document.getElementById('form-message');

    // Validate passwords match
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirm-password').value;

    if (password !== confirmPassword) {
      messageEl.className = 'form-message error';
      messageEl.textContent = 'Las contraseñas no coinciden';
      messageEl.hidden = false;
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    btnText.hidden = true;
    btnLoader.hidden = false;
    messageEl.hidden = true;

    const userData = {
      username: form.querySelector('#username').value,
      email: form.querySelector('#email').value,
      password: password,
      phone: form.querySelector('#phone')?.value || ''
    };

    const result = await this.register(userData);

    // Reset loading
    submitBtn.disabled = false;
    btnText.hidden = false;
    btnLoader.hidden = true;

    if (result.success) {
      messageEl.className = 'form-message success';
      messageEl.textContent = result.message || '¡Cuenta creada!';
      messageEl.hidden = false;

      // Redirect after success
      setTimeout(() => {
        window.location.href = '/perfil.html';
      }, 1500);
    } else {
      messageEl.className = 'form-message error';
      messageEl.textContent = result.error;
      messageEl.hidden = false;
    }
  },

  /**
   * Actualizar indicador de fortaleza de contraseña
   */
  updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    if (!strengthBar || !strengthText) return;

    let strength = 0;
    let text = '';
    let color = '';

    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    if (strength < 30) {
      text = 'Débil';
      color = '#e74c3c';
    } else if (strength < 60) {
      text = 'Regular';
      color = '#f39c12';
    } else if (strength < 80) {
      text = 'Buena';
      color = '#3498db';
    } else {
      text = 'Fuerte';
      color = '#2ecc71';
    }

    strengthBar.style.setProperty('--strength', `${Math.min(strength, 100)}%`);
    strengthBar.style.setProperty('--strength-color', color);
    strengthText.textContent = text;
    strengthText.style.color = color;
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return this.user !== null;
  },

  /**
   * Obtener usuario actual
   */
  getUser() {
    return this.user;
  }
};

// Estilos adicionales para el dropdown
const dropdownStyles = document.createElement('style');
dropdownStyles.textContent = `
  .user-dropdown {
    position: relative;
  }

  .user-dropdown-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--glass);
    border: 1px solid var(--stroke);
    border-radius: 30px;
    padding: 6px 12px 6px 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--fg);
  }

  .user-dropdown-btn:hover {
    border-color: var(--accent);
  }

  .user-mini-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-mini-name {
    font-size: 13px;
    font-weight: 600;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 200px;
    background: var(--glass-strong);
    border: 1px solid var(--stroke);
    border-radius: 12px;
    padding: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease;
    z-index: 1000;
  }

  .user-dropdown-menu.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .user-dropdown-menu a,
  .user-dropdown-menu button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    background: none;
    border: none;
    border-radius: 8px;
    color: var(--fg);
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .user-dropdown-menu a:hover,
  .user-dropdown-menu button:hover {
    background: rgba(0, 123, 255, 0.15);
    color: var(--accent);
  }

  .dropdown-divider {
    height: 1px;
    background: var(--stroke);
    margin: 8px 0;
  }

  .logout-link {
    color: #e74c3c !important;
  }

  .logout-link:hover {
    background: rgba(231, 76, 60, 0.15) !important;
  }

  @media (max-width: 768px) {
    .user-mini-name {
      display: none;
    }
  }
`;
document.head.appendChild(dropdownStyles);

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  RVAuth.init();
});

// Exportar para uso global
window.RVAuth = RVAuth;
