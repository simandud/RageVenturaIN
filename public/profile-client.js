/**
 * RAGEVENTURA - Profile Client
 * Maneja la página de perfil
 */

const RVProfile = {
  API_URL: '/api/profile.php',
  user: null,
  badges: [],

  /**
   * Inicializar
   */
  async init() {
    // Esperar a que auth-client cargue
    await this.waitForAuth();

    if (!RVAuth.isAuthenticated()) {
      this.showNotLogged();
      return;
    }

    this.user = RVAuth.getUser();
    await this.loadProfile();
    this.setupTabs();
    this.setupEditForm();
    this.setupPasswordForm();
    this.setupAvatarUpload();
  },

  /**
   * Esperar a que auth-client inicialice
   */
  waitForAuth() {
    return new Promise((resolve) => {
      const check = () => {
        if (typeof RVAuth !== 'undefined' && RVAuth.user !== undefined) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },

  /**
   * Mostrar vista de no logueado
   */
  showNotLogged() {
    document.getElementById('profile-loading')?.setAttribute('hidden', '');
    document.getElementById('profile-not-logged')?.removeAttribute('hidden');
  },

  /**
   * Cargar datos del perfil
   */
  async loadProfile() {
    try {
      const response = await fetch(`${this.API_URL}?action=get`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        this.user = data.user;
        this.badges = data.badges || [];
        this.renderProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }

    document.getElementById('profile-loading')?.setAttribute('hidden', '');
    document.getElementById('profile-section')?.removeAttribute('hidden');
  },

  /**
   * Renderizar datos del perfil
   */
  renderProfile() {
    const u = this.user;

    // Avatar
    const avatar = document.getElementById('profile-avatar');
    if (avatar) avatar.src = u.avatar_url || '/assets/default-avatar.png';

    // Info básica
    document.getElementById('profile-username').textContent = u.username;
    document.getElementById('profile-tag').textContent = u.tag;

    // Stats
    document.getElementById('stat-points').textContent = u.points || 0;
    document.getElementById('stat-events').textContent = u.events_attended || 0;
    document.getElementById('stat-badges').textContent = this.badges.length;

    // Info tab
    document.getElementById('profile-bio').textContent = u.bio || 'Sin biografía aún';
    document.getElementById('profile-email').textContent = u.email;
    document.getElementById('profile-city').textContent = u.city || '-';
    document.getElementById('profile-genre').textContent = u.favorite_genre || '-';
    document.getElementById('profile-since').textContent = this.formatDate(u.created_at);

    // Socials
    const socialsEl = document.getElementById('profile-socials');
    let socialsHtml = '';

    if (u.social_instagram) {
      socialsHtml += `<a href="https://instagram.com/${u.social_instagram}" target="_blank" class="social-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        @${u.social_instagram}
      </a>`;
    }

    if (u.social_soundcloud) {
      socialsHtml += `<a href="${u.social_soundcloud}" target="_blank" class="social-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.233-2.168-3.772-4.121-2.815zm-16.879-.027c-.302-.024-.526-.03-1 .122v5.689h1v-5.811z"/>
        </svg>
        SoundCloud
      </a>`;
    }

    if (u.social_spotify) {
      socialsHtml += `<a href="${u.social_spotify}" target="_blank" class="social-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        Spotify
      </a>`;
    }

    socialsEl.innerHTML = socialsHtml || '<p class="no-socials">No hay redes vinculadas</p>';

    // Badges en header
    this.renderHeaderBadges();

    // Edit form - precargar valores
    this.preloadEditForm();

    // Badges tab
    this.renderBadgesTab();
  },

  /**
   * Renderizar badges en el header del perfil
   */
  renderHeaderBadges() {
    const container = document.getElementById('profile-badges');
    if (!container) return;

    const badgesHtml = this.badges.slice(0, 4).map(b => `
      <span class="badge-icon" style="background: ${b.color}" title="${b.name}">
        ${this.getIconEmoji(b.icon)}
      </span>
    `).join('');

    container.innerHTML = badgesHtml;
  },

  /**
   * Renderizar tab de badges
   */
  renderBadgesTab() {
    const grid = document.getElementById('badges-grid');
    if (!grid) return;

    // Todos los badges posibles (obtenidos del servidor o definidos)
    const allBadges = [
      { name: 'Novato', description: 'Te registraste en RageVentura', icon: 'user-plus', color: '#5db4ff' },
      { name: 'Primer Evento', description: 'Asististe a tu primer evento', icon: 'calendar-check', color: '#00d4ff' },
      { name: 'Fiel', description: 'Asististe a 5 eventos', icon: 'heart', color: '#ff0066' },
      { name: 'Veterano', description: 'Asististe a 10 eventos', icon: 'award', color: '#ffd700' },
      { name: 'VIP', description: 'Eres miembro VIP', icon: 'crown', color: '#9b59b6' },
      { name: 'DJ Amateur', description: 'Completaste un curso de DJ', icon: 'headphones', color: '#e74c3c' },
      { name: 'Productor', description: 'Completaste un curso de producción', icon: 'music', color: '#2ecc71' },
      { name: 'Influencer', description: 'Referiste a 10 amigos', icon: 'share-2', color: '#f39c12' }
    ];

    const earnedNames = this.badges.map(b => b.name);

    grid.innerHTML = allBadges.map(badge => {
      const earned = earnedNames.includes(badge.name);
      const earnedBadge = this.badges.find(b => b.name === badge.name);

      return `
        <div class="badge-card ${earned ? '' : 'locked'}">
          <div class="badge-icon-large" style="background: ${badge.color}${earned ? '' : '40'}">
            ${this.getIconEmoji(badge.icon)}
          </div>
          <h4>${badge.name}</h4>
          <p>${badge.description}</p>
          ${earned && earnedBadge ? `<span class="earned-date">Obtenido: ${this.formatDate(earnedBadge.earned_at)}</span>` : '<span class="earned-date">Bloqueado</span>'}
        </div>
      `;
    }).join('');
  },

  /**
   * Precargar formulario de edición
   */
  preloadEditForm() {
    const u = this.user;
    document.getElementById('edit-username').value = u.username || '';
    document.getElementById('edit-city').value = u.city || '';
    document.getElementById('edit-bio').value = u.bio || '';
    document.getElementById('edit-genre').value = u.favorite_genre || '';
    document.getElementById('edit-instagram').value = u.social_instagram || '';
    document.getElementById('edit-soundcloud').value = u.social_soundcloud || '';
    document.getElementById('edit-spotify').value = u.social_spotify || '';

    // Actualizar contador de caracteres
    const bioCount = document.getElementById('bio-count');
    if (bioCount) bioCount.textContent = (u.bio || '').length;
  },

  /**
   * Configurar tabs
   */
  setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`tab-${target}`)?.classList.add('active');
      });
    });
  },

  /**
   * Configurar formulario de edición
   */
  setupEditForm() {
    const form = document.getElementById('edit-profile-form');
    const bioInput = document.getElementById('edit-bio');
    const bioCount = document.getElementById('bio-count');

    // Contador de caracteres
    bioInput?.addEventListener('input', () => {
      bioCount.textContent = bioInput.value.length;
    });

    // Submit
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleEditSubmit(form);
    });

    // Cancel
    document.getElementById('cancel-edit')?.addEventListener('click', () => {
      this.preloadEditForm();
      document.querySelector('.tab-btn[data-tab="info"]')?.click();
    });
  },

  /**
   * Manejar submit de edición
   */
  async handleEditSubmit(form) {
    const messageEl = document.getElementById('edit-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch(`${this.API_URL}?action=update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        this.user = result.user;
        this.renderProfile();
        messageEl.className = 'form-message success';
        messageEl.textContent = result.message;

        setTimeout(() => {
          document.querySelector('.tab-btn[data-tab="info"]')?.click();
        }, 1500);
      } else {
        messageEl.className = 'form-message error';
        messageEl.textContent = result.error;
      }

      messageEl.hidden = false;
    } catch (error) {
      messageEl.className = 'form-message error';
      messageEl.textContent = 'Error de conexión';
      messageEl.hidden = false;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar Cambios';
  },

  /**
   * Configurar formulario de contraseña
   */
  setupPasswordForm() {
    const form = document.getElementById('change-password-form');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newPass = document.getElementById('new-password').value;
      const confirmPass = document.getElementById('confirm-new-password').value;
      const messageEl = document.getElementById('password-message');

      if (newPass !== confirmPass) {
        messageEl.className = 'form-message error';
        messageEl.textContent = 'Las contraseñas no coinciden';
        messageEl.hidden = false;
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        const response = await fetch(`${this.API_URL}?action=change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_password: document.getElementById('current-password').value,
            new_password: newPass
          }),
          credentials: 'include'
        });

        const result = await response.json();

        messageEl.className = result.success ? 'form-message success' : 'form-message error';
        messageEl.textContent = result.success ? result.message : result.error;
        messageEl.hidden = false;

        if (result.success) {
          form.reset();
        }
      } catch (error) {
        messageEl.className = 'form-message error';
        messageEl.textContent = 'Error de conexión';
        messageEl.hidden = false;
      }

      submitBtn.disabled = false;
    });
  },

  /**
   * Configurar upload de avatar
   */
  setupAvatarUpload() {
    const btn = document.getElementById('avatar-edit-btn');
    const input = document.getElementById('avatar-input');

    btn?.addEventListener('click', () => input?.click());

    input?.addEventListener('change', async () => {
      if (!input.files[0]) return;

      const formData = new FormData();
      formData.append('avatar', input.files[0]);

      try {
        const response = await fetch(`${this.API_URL}?action=update-avatar`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
          document.getElementById('profile-avatar').src = result.avatar_url;
          // Actualizar también en el header
          const miniAvatar = document.querySelector('.user-mini-avatar');
          if (miniAvatar) miniAvatar.src = result.avatar_url;
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert('Error al subir imagen');
      }

      input.value = '';
    });
  },

  /**
   * Formatear fecha
   */
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Obtener emoji para icono
   */
  getIconEmoji(icon) {
    const icons = {
      'user-plus': '👤',
      'calendar-check': '📅',
      'heart': '❤️',
      'award': '🏆',
      'crown': '👑',
      'headphones': '🎧',
      'music': '🎵',
      'share-2': '📤',
      'trophy': '🏆'
    };
    return icons[icon] || '⭐';
  }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  RVProfile.init();
});
