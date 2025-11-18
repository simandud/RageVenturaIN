// ═══════════════════════════════════════════════════════════════════
// RAGE VENTURE - Shopping Cart System
// Complete e-commerce cart functionality with localStorage persistence
// ═══════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══ CART STATE ═══
  class ShoppingCart {
    constructor() {
      this.items = this.loadCart();
      this.listeners = [];
      this.init();
    }

    init() {
      // Initialize cart UI on page load
      this.updateCartUI();
      this.attachEventListeners();
    }

    // ═══ CART OPERATIONS ═══

    addItem(product) {
      const existingItem = this.items.find(item => item.id === product.id && item.size === product.size);

      if (existingItem) {
        existingItem.quantity += product.quantity || 1;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size: product.size || null,
          category: product.category,
          quantity: product.quantity || 1
        });
      }

      this.saveCart();
      this.notifyListeners();
      this.showNotification(`${product.name} añadido al carrito`);
      this.updateCartUI();
    }

    removeItem(itemId, size = null) {
      this.items = this.items.filter(item => {
        if (size) {
          return !(item.id === itemId && item.size === size);
        }
        return item.id !== itemId;
      });

      this.saveCart();
      this.notifyListeners();
      this.updateCartUI();
    }

    updateQuantity(itemId, quantity, size = null) {
      const item = this.items.find(i => {
        if (size) {
          return i.id === itemId && i.size === size;
        }
        return i.id === itemId;
      });

      if (item) {
        item.quantity = Math.max(1, quantity);
        this.saveCart();
        this.notifyListeners();
        this.updateCartUI();
      }
    }

    clearCart() {
      this.items = [];
      this.saveCart();
      this.notifyListeners();
      this.updateCartUI();
    }

    // ═══ CART CALCULATIONS ═══

    getTotal() {
      return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
      return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    getSubtotal() {
      return this.getTotal();
    }

    getShipping() {
      const total = this.getTotal();
      if (total === 0) return 0;
      if (total > 100) return 0; // Free shipping over $100
      return 5.00; // Flat rate shipping
    }

    getTax() {
      return this.getSubtotal() * 0.12; // 12% IVA Ecuador
    }

    getGrandTotal() {
      return this.getSubtotal() + this.getShipping() + this.getTax();
    }

    // ═══ PERSISTENCE ═══

    saveCart() {
      try {
        localStorage.setItem('rageventure_cart', JSON.stringify(this.items));
      } catch (e) {
        console.error('Error saving cart:', e);
      }
    }

    loadCart() {
      try {
        const saved = localStorage.getItem('rageventure_cart');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error('Error loading cart:', e);
        return [];
      }
    }

    // ═══ EVENT SYSTEM ═══

    onChange(callback) {
      this.listeners.push(callback);
    }

    notifyListeners() {
      this.listeners.forEach(callback => callback(this.items));
    }

    // ═══ UI UPDATES ═══

    updateCartUI() {
      // Update cart count badge
      const cartBadges = document.querySelectorAll('.cart-count');
      const count = this.getItemCount();

      cartBadges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      });

      // Update cart sidebar if open
      if (document.querySelector('.cart-sidebar.active')) {
        this.renderCartSidebar();
      }
    }

    renderCartSidebar() {
      const cartItemsContainer = document.querySelector('.cart-items');
      const cartEmpty = document.querySelector('.cart-empty');
      const cartFooter = document.querySelector('.cart-footer');

      if (!cartItemsContainer) return;

      if (this.items.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'none';
        cartItemsContainer.innerHTML = '';
        return;
      }

      if (cartEmpty) cartEmpty.style.display = 'none';
      if (cartFooter) cartFooter.style.display = 'block';

      cartItemsContainer.innerHTML = this.items.map(item => `
        <div class="cart-item" data-item-id="${item.id}" data-item-size="${item.size || ''}">
          <div class="cart-item-image" style="${item.image}"></div>
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            ${item.size ? `<span class="cart-item-size">Talla: ${item.size}</span>` : ''}
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          </div>
          <div class="cart-item-controls">
            <div class="quantity-controls">
              <button class="qty-btn qty-minus" aria-label="Disminuir cantidad">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn qty-plus" aria-label="Aumentar cantidad">+</button>
            </div>
            <button class="cart-item-remove" aria-label="Eliminar producto">
              <span>×</span>
            </button>
          </div>
        </div>
      `).join('');

      // Update totals
      document.querySelector('.cart-subtotal-value').textContent = `$${this.getSubtotal().toFixed(2)}`;
      document.querySelector('.cart-shipping-value').textContent = this.getShipping() === 0 ? 'GRATIS' : `$${this.getShipping().toFixed(2)}`;
      document.querySelector('.cart-tax-value').textContent = `$${this.getTax().toFixed(2)}`;
      document.querySelector('.cart-total-value').textContent = `$${this.getGrandTotal().toFixed(2)}`;

      // Attach event listeners to cart items
      this.attachCartItemListeners();
    }

    attachCartItemListeners() {
      // Remove item buttons
      document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cartItem = e.target.closest('.cart-item');
          const itemId = cartItem.dataset.itemId;
          const itemSize = cartItem.dataset.itemSize || null;
          this.removeItem(itemId, itemSize);
        });
      });

      // Quantity controls
      document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cartItem = e.target.closest('.cart-item');
          const itemId = cartItem.dataset.itemId;
          const itemSize = cartItem.dataset.itemSize || null;
          const item = this.items.find(i => i.id === itemId && (itemSize ? i.size === itemSize : true));
          if (item && item.quantity > 1) {
            this.updateQuantity(itemId, item.quantity - 1, itemSize);
          }
        });
      });

      document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cartItem = e.target.closest('.cart-item');
          const itemId = cartItem.dataset.itemId;
          const itemSize = cartItem.dataset.itemSize || null;
          const item = this.items.find(i => i.id === itemId && (itemSize ? i.size === itemSize : true));
          if (item) {
            this.updateQuantity(itemId, item.quantity + 1, itemSize);
          }
        });
      });
    }

    attachEventListeners() {
      // Cart toggle buttons
      document.querySelectorAll('.cart-toggle, .cart-open-btn').forEach(btn => {
        btn.addEventListener('click', () => this.toggleCart());
      });

      // Close cart buttons
      document.querySelectorAll('.cart-close-btn').forEach(btn => {
        btn.addEventListener('click', () => this.closeCart());
      });

      // Checkout button
      document.querySelectorAll('.checkout-btn').forEach(btn => {
        btn.addEventListener('click', () => this.goToCheckout());
      });

      // Close cart when clicking overlay
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-overlay')) {
          this.closeCart();
        }
      });
    }

    toggleCart() {
      const cartSidebar = document.querySelector('.cart-sidebar');
      const overlay = document.querySelector('.cart-overlay');

      if (cartSidebar) {
        const isActive = cartSidebar.classList.contains('active');

        if (isActive) {
          this.closeCart();
        } else {
          this.openCart();
        }
      }
    }

    openCart() {
      const cartSidebar = document.querySelector('.cart-sidebar');
      const overlay = document.querySelector('.cart-overlay');

      if (cartSidebar) {
        cartSidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        this.renderCartSidebar();
        document.body.style.overflow = 'hidden';
      }
    }

    closeCart() {
      const cartSidebar = document.querySelector('.cart-sidebar');
      const overlay = document.querySelector('.cart-overlay');

      if (cartSidebar) {
        cartSidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    goToCheckout() {
      if (this.items.length === 0) {
        this.showNotification('Tu carrito está vacío', 'error');
        return;
      }
      window.location.href = 'checkout.html';
    }

    // ═══ NOTIFICATIONS ═══

    showNotification(message, type = 'success') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `cart-notification ${type}`;
      notification.textContent = message;

      document.body.appendChild(notification);

      // Trigger animation
      setTimeout(() => notification.classList.add('show'), 10);

      // Remove after 3 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  }

  // ═══ PRODUCT MANAGEMENT ═══

  class ProductManager {
    constructor(cart) {
      this.cart = cart;
      this.currentProduct = null;
      this.attachProductListeners();
    }

    attachProductListeners() {
      // Add to cart buttons
      document.querySelectorAll('.product-card .ghost:not(.ghost-secondary)').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const card = e.target.closest('.product-card');

          // Check if product requires size selection
          const btnText = e.target.textContent.trim().toLowerCase();
          if (btnText === 'tallas') {
            this.showSizeSelector(card);
          } else {
            this.addProductToCart(card);
          }
        });
      });

      // Product info buttons
      document.querySelectorAll('.product-card .ghost-secondary').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const card = e.target.closest('.product-card');
          this.showProductDetails(card);
        });
      });
    }

    addProductToCart(card, size = null) {
      const product = this.extractProductData(card);
      if (size) product.size = size;

      this.cart.addItem(product);
    }

    extractProductData(card) {
      const h4 = card.querySelector('h4');
      const priceEl = card.querySelector('.product-price');
      const imageEl = card.querySelector('.product-image');
      const categoryEl = card.querySelector('.vinyl-badge, .merch-badge, .tech-badge');

      // Generate unique ID from product name
      const name = h4 ? h4.textContent.trim() : 'Product';
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const price = priceEl ? parseFloat(priceEl.textContent.replace('$', '')) : 0;
      const image = imageEl ? imageEl.getAttribute('style') : '';
      const category = categoryEl ? categoryEl.textContent.trim() : 'General';

      return { id, name, price, image, category };
    }

    showSizeSelector(card) {
      const product = this.extractProductData(card);

      // Create size selector modal
      const modal = document.createElement('div');
      modal.className = 'size-modal';
      modal.innerHTML = `
        <div class="size-modal-overlay"></div>
        <div class="size-modal-content">
          <button class="size-modal-close" aria-label="Cerrar">×</button>
          <h3>Selecciona tu talla</h3>
          <p class="size-product-name">${product.name}</p>
          <div class="size-options">
            <button class="size-option" data-size="XS">XS</button>
            <button class="size-option" data-size="S">S</button>
            <button class="size-option" data-size="M">M</button>
            <button class="size-option" data-size="L">L</button>
            <button class="size-option" data-size="XL">XL</button>
            <button class="size-option" data-size="XXL">XXL</button>
          </div>
          <button class="size-confirm-btn cta" disabled>Añadir al Carrito</button>
        </div>
      `;

      document.body.appendChild(modal);
      setTimeout(() => modal.classList.add('active'), 10);

      let selectedSize = null;

      // Size selection
      modal.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSize = btn.dataset.size;
          modal.querySelector('.size-confirm-btn').disabled = false;
        });
      });

      // Confirm button
      modal.querySelector('.size-confirm-btn').addEventListener('click', () => {
        if (selectedSize) {
          this.addProductToCart(card, selectedSize);
          this.closeSizeModal(modal);
        }
      });

      // Close button
      modal.querySelector('.size-modal-close').addEventListener('click', () => {
        this.closeSizeModal(modal);
      });

      // Close on overlay click
      modal.querySelector('.size-modal-overlay').addEventListener('click', () => {
        this.closeSizeModal(modal);
      });
    }

    closeSizeModal(modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }

    showProductDetails(card) {
      const product = this.extractProductData(card);
      const desc = card.querySelector('.product-desc');
      const specs = card.querySelectorAll('.product-specs span');

      const modal = document.createElement('div');
      modal.className = 'product-modal';
      modal.innerHTML = `
        <div class="product-modal-overlay"></div>
        <div class="product-modal-content">
          <button class="product-modal-close" aria-label="Cerrar">×</button>
          <div class="product-modal-image" style="${product.image}">
            <span class="product-category-badge">${product.category}</span>
          </div>
          <div class="product-modal-info">
            <h2>${product.name}</h2>
            <p class="product-modal-desc">${desc ? desc.textContent : ''}</p>
            <div class="product-modal-specs">
              <h4>Especificaciones</h4>
              <ul>
                ${Array.from(specs).map(spec => `<li>${spec.textContent}</li>`).join('')}
              </ul>
            </div>
            <div class="product-modal-price">$${product.price.toFixed(2)}</div>
            <button class="product-modal-add cta">Añadir al Carrito</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      setTimeout(() => modal.classList.add('active'), 10);

      // Add to cart from modal
      modal.querySelector('.product-modal-add').addEventListener('click', () => {
        this.addProductToCart(card);
        this.closeProductModal(modal);
      });

      // Close button
      modal.querySelector('.product-modal-close').addEventListener('click', () => {
        this.closeProductModal(modal);
      });

      // Close on overlay click
      modal.querySelector('.product-modal-overlay').addEventListener('click', () => {
        this.closeProductModal(modal);
      });
    }

    closeProductModal(modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  }

  // ═══ INITIALIZE ═══

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Create global cart instance
    window.RageVentureCart = new ShoppingCart();

    // Initialize product manager if we're on the shop page
    if (document.querySelector('.product-card')) {
      window.RageVentureProducts = new ProductManager(window.RageVentureCart);
    }
  }

})();