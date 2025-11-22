/**
 * RAGEVENTURA - Community Client
 * Maneja la página de comunidad
 */

const RVCommunity = {
  API_URL: '/api/users.php',
  currentPage: 1,
  totalPages: 1,
  currentFilter: 'all',
  currentSort: 'newest',
  searchTimeout: null,

  /**
   * Inicializar
   */
  async init() {
    await this.loadStats();
    await this.loadFeatured();
    await this.loadUsers();
    this.setupEventListeners();
  },

  /**
   * Cargar estadísticas de la comunidad
   */
  async loadStats() {
    try {
      const response = await fetch(`${this.API_URL}?action=stats`);
      const data = await response.json();

      if (data.success && data.stats) {
        document.getElementById('total-members').textContent = this.formatNumber(data.stats.total_members);
        document.getElementById('total-djs').textContent = this.formatNumber(data.stats.total_djs);
        document.getElementById('pro-members').textContent = this.formatNumber(data.stats.pro_members);
        document.getElementById('new-this-week').textContent = '+' + data.stats.new_this_week;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  },

  /**
   * Cargar usuarios destacados
   */
  async loadFeatured() {
    try {
      const response = await fetch(`${this.API_URL}?action=featured`);
      const data = await response.json();

      if (data.success) {
        this.renderFeaturedDJs(data.featured_djs || []);
        this.renderNewMembers(data.new_members || []);
      }
    } catch (error) {
      console.error('Error loading featured:', error);
    }
  },

  /**
   * Cargar lista de usuarios
   */
  async loadUsers(page = 1) {
    const loadingEl = document.getElementById('users-loading');
    const gridEl = document.getElementById('users-grid');
    const noResultsEl = document.getElementById('no-results');
    const paginationEl = document.getElementById('pagination');

    loadingEl?.removeAttribute('hidden');
    gridEl?.setAttribute('hidden', '');
    noResultsEl?.setAttribute('hidden', '');

    const params = new URLSearchParams({
      action: 'list',
      page: page,
      order: this.currentSort,
      limit: 20
    });

    if (this.currentFilter !== 'all') {
      params.append('role', this.currentFilter);
    }

    try {
      const response = await fetch(`${this.API_URL}?${params}`);
      const data = await response.json();

      loadingEl?.setAttribute('hidden', '');

      if (data.success && data.users.length > 0) {
        this.renderUsers(data.users);
        this.currentPage = data.pagination.page;
        this.totalPages = data.pagination.pages;
        this.updatePagination();
        gridEl?.removeAttribute('hidden');
        paginationEl?.removeAttribute('hidden');
      } else {
        noResultsEl?.removeAttribute('hidden');
        paginationEl?.setAttribute('hidden', '');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      loadingEl?.setAttribute('hidden', '');
      noResultsEl?.removeAttribute('hidden');
    }
  },

  /**
   * Buscar usuarios
   */
  async searchUsers(query) {
    if (query.length < 2) {
      this.loadUsers();
      return;
    }

    const loadingEl = document.getElementById('users-loading');
    const gridEl = document.getElementById('users-grid');
    const noResultsEl = document.getElementById('no-results');
    const paginationEl = document.getElementById('pagination');

    loadingEl?.removeAttribute('hidden');
    gridEl?.setAttribute('hidden', '');

    try {
      const response = await fetch(`${this.API_URL}?action=search&q=${encodeURIComponent(query)}`);
      const data = await response.json();

      loadingEl?.setAttribute('hidden', '');

      if (data.success && data.users.length > 0) {
        this.renderUsers(data.users);
        gridEl?.removeAttribute('hidden');
        paginationEl?.setAttribute('hidden', '');
        noResultsEl?.setAttribute('hidden', '');
      } else {
        noResultsEl?.removeAttribute('hidden');
      }
    } catch (error) {
      loadingEl?.setAttribute('hidden', '');
      noResultsEl?.removeAttribute('hidden');
    }
  },

  /**
   * Renderizar DJs destacados
   */
  renderFeaturedDJs(djs) {
    const container = document.getElementById('featured-djs');
    if (!container) return;

    if (djs.length === 0) {
      document.getElementById('featured-section')?.setAttribute('hidden', '');
      return;
    }

    container.innerHTML = djs.map(dj => `
      <div class="featured-card" data-tag="${dj.tag}">
        <img src="${dj.avatar_url || '/assets/default-avatar.png'}" alt="${dj.username}" class="featured-avatar">
        <div class="featured-info">
          <h4>
            ${dj.username}
            ${dj.is_verified ? '<span class="verified-badge" title="Verificado">✓</span>' : ''}
          </h4>
          <span class="tag">${dj.tag}</span>
          <p class="points">${dj.points} puntos</p>
        </div>
      </div>
    `).join('');

    // Click handlers
    container.querySelectorAll('.featured-card').forEach(card => {
      card.addEventListener('click', () => this.showUserModal(card.dataset.tag));
    });
  },

  /**
   * Renderizar nuevos miembros
   */
  renderNewMembers(members) {
    const container = document.getElementById('new-members');
    if (!container) return;

    container.innerHTML = members.map(m => `
      <div class="new-member-card" data-tag="${m.tag}">
        <img src="${m.avatar_url || '/assets/default-avatar.png'}" alt="${m.username}">
        <h5>${m.username}</h5>
        <span>${this.timeAgo(m.created_at)}</span>
      </div>
    `).join('');

    container.querySelectorAll('.new-member-card').forEach(card => {
      card.addEventListener('click', () => this.showUserModal(card.dataset.tag));
    });
  },

  /**
   * Renderizar lista de usuarios
   */
  renderUsers(users) {
    const container = document.getElementById('users-grid');
    if (!container) return;

    container.innerHTML = users.map(user => `
      <div class="user-card" data-tag="${user.tag}">
        <img src="${user.avatar_url || '/assets/default-avatar.png'}" alt="${user.username}" class="user-avatar">
        <h4>
          ${user.username}
          ${user.is_verified ? '<span class="verified-badge">✓</span>' : ''}
        </h4>
        <p class="user-tag">${user.tag}</p>
        <div class="user-badges">
          ${(user.badges || []).slice(0, 3).map(b => `
            <span class="badge-mini" style="background: ${b.color}" title="${b.name}">
              ${this.getIconEmoji(b.icon)}
            </span>
          `).join('')}
        </div>
        <p class="user-meta">
          ${user.city ? user.city + ' • ' : ''}${user.points} pts
        </p>
        ${user.role === 'dj' ? '<span class="user-role dj">DJ</span>' : ''}
        ${user.is_pro ? '<span class="user-role">PRO</span>' : ''}
      </div>
    `).join('');

    container.querySelectorAll('.user-card').forEach(card => {
      card.addEventListener('click', () => this.showUserModal(card.dataset.tag));
    });
  },

  /**
   * Actualizar paginación
   */
  updatePagination() {
    document.getElementById('current-page').textContent = this.currentPage;
    document.getElementById('total-pages').textContent = this.totalPages;

    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    prevBtn.disabled = this.currentPage <= 1;
    nextBtn.disabled = this.currentPage >= this.totalPages;
  },

  /**
   * Mostrar modal de usuario
   */
  async showUserModal(tag) {
    const modal = document.getElementById('user-modal');
    const body = document.getElementById('modal-body');

    if (!modal || !body) return;

    body.innerHTML = '<div class="users-loading"><div class="loader-spinner"></div></div>';
    modal.removeAttribute('hidden');

    try {
      const response = await fetch(`/api/profile.php?action=get&tag=${encodeURIComponent(tag)}`);
      const data = await response.json();

      if (data.success) {
        const u = data.user;
        const badges = data.badges || [];

        body.innerHTML = `
          <div class="modal-profile">
            <div class="modal-header">
              <img src="${u.avatar_url || '/assets/default-avatar.png'}" alt="${u.username}" class="modal-avatar">
              <div class="modal-info">
                <h2>
                  ${u.username}
                  ${u.is_verified ? '<span class="verified-badge">✓</span>' : ''}
                </h2>
                <span class="modal-tag">${u.tag}</span>
              </div>
            </div>

            ${u.bio ? `<p class="modal-bio">${u.bio}</p>` : ''}

            <div class="modal-stats">
              <div class="modal-stat">
                <span class="value">${u.points || 0}</span>
                <span class="label">Puntos</span>
              </div>
              <div class="modal-stat">
                <span class="value">${u.events_attended || 0}</span>
                <span class="label">Eventos</span>
              </div>
              <div class="modal-stat">
                <span class="value">${badges.length}</span>
                <span class="label">Badges</span>
              </div>
            </div>

            ${badges.length > 0 ? `
              <div class="modal-badges">
                ${badges.slice(0, 5).map(b => `
                  <span class="badge-pill" style="background: ${b.color}20; border-color: ${b.color}; color: ${b.color}">
                    ${this.getIconEmoji(b.icon)} ${b.name}
                  </span>
                `).join('')}
              </div>
            ` : ''}

            <div class="modal-details">
              ${u.city ? `<p><strong>Ciudad:</strong> ${u.city}</p>` : ''}
              ${u.favorite_genre ? `<p><strong>Género favorito:</strong> ${u.favorite_genre}</p>` : ''}
              <p><strong>Miembro desde:</strong> ${this.formatDate(u.created_at)}</p>
            </div>

            ${(u.social_instagram || u.social_soundcloud || u.social_spotify) ? `
              <div class="modal-socials">
                ${u.social_instagram ? `<a href="https://instagram.com/${u.social_instagram}" target="_blank">Instagram</a>` : ''}
                ${u.social_soundcloud ? `<a href="${u.social_soundcloud}" target="_blank">SoundCloud</a>` : ''}
                ${u.social_spotify ? `<a href="${u.social_spotify}" target="_blank">Spotify</a>` : ''}
              </div>
            ` : ''}
          </div>
        `;
      } else {
        body.innerHTML = '<p class="modal-error">Usuario no encontrado</p>';
      }
    } catch (error) {
      body.innerHTML = '<p class="modal-error">Error al cargar perfil</p>';
    }
  },

  /**
   * Cerrar modal
   */
  closeModal() {
    document.getElementById('user-modal')?.setAttribute('hidden', '');
  },

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('search-users');
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchUsers(e.target.value.trim());
      }, 300);
    });

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.loadUsers(1);
      });
    });

    // Ordenar
    document.getElementById('sort-users')?.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.loadUsers(1);
    });

    // Paginación
    document.getElementById('prev-page')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.loadUsers(this.currentPage - 1);
      }
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        this.loadUsers(this.currentPage + 1);
      }
    });

    // Modal
    document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
    document.querySelector('.modal-backdrop')?.addEventListener('click', () => this.closeModal());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  /**
   * Helpers
   */
  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
    return this.formatDate(dateStr);
  },

  getIconEmoji(icon) {
    const icons = {
      'user-plus': '👤',
      'calendar-check': '📅',
      'heart': '❤️',
      'award': '🏆',
      'crown': '👑',
      'headphones': '🎧',
      'music': '🎵',
      'share-2': '📤'
    };
    return icons[icon] || '⭐';
  }
};

// Estilos adicionales para el modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
  .modal-profile {
    text-align: center;
  }

  .modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .modal-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--accent);
  }

  .modal-info h2 {
    font-family: var(--font-heading);
    font-size: 24px;
    color: var(--fg);
    margin: 0;
  }

  .modal-tag {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--accent);
  }

  .modal-bio {
    color: var(--muted);
    font-size: 15px;
    line-height: 1.6;
    margin: 0 0 24px;
    padding: 16px;
    background: var(--glass);
    border-radius: 12px;
  }

  .modal-stats {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 24px;
  }

  .modal-stat {
    text-align: center;
  }

  .modal-stat .value {
    display: block;
    font-family: var(--font-heading);
    font-size: 28px;
    color: var(--accent);
  }

  .modal-stat .label {
    font-size: 12px;
    color: var(--muted);
    text-transform: uppercase;
  }

  .modal-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-bottom: 24px;
  }

  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid;
  }

  .modal-details {
    text-align: left;
    padding: 16px;
    background: var(--glass);
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .modal-details p {
    margin: 8px 0;
    font-size: 14px;
    color: var(--muted);
  }

  .modal-details strong {
    color: var(--fg);
  }

  .modal-socials {
    display: flex;
    justify-content: center;
    gap: 16px;
  }

  .modal-socials a {
    color: var(--accent);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }

  .modal-socials a:hover {
    text-decoration: underline;
  }

  .modal-error {
    text-align: center;
    color: var(--muted);
    padding: 32px;
  }
`;
document.head.appendChild(modalStyles);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  RVCommunity.init();
});
