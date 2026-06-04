/* ==========================================================================
   SHAHI SERVE - Premium Shopify Storefront Liquid Theme Scripts
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupFAQAccordion();
  setupTestimonialsSlider();
  setupNewsletterValidation();
  setupScrollAnimations();
  setupCartDrawer();
  setupProductTabs();
  
  // Fetch initial cart status from Shopify
  refreshCartUI();
});

// 1. MOBILE NAVIGATION & HEADER SCROLL
function setupNavigation() {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const header = document.querySelector("header");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      const isExpanded = navMenu.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", isExpanded);
      
      if (isExpanded) {
        menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      } else {
        menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`;
      }
    });

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`;
      });
    });
  }

  // Sticky header background
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }
}

// 1.2 DYNAMIC PRODUCT CATEGORY TABS
function setupProductTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-target");
      if (!targetId) return;

      const section = btn.closest("section");
      if (!section) return;
      
      section.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      section.querySelectorAll(".products-grid.tab-content").forEach(grid => {
        grid.classList.add("hidden-tab");
        grid.classList.remove("active");
      });

      const targetGrid = document.getElementById(targetId);
      if (targetGrid) {
        targetGrid.classList.remove("hidden-tab");
        targetGrid.classList.add("active");
      }
    });
  });
}


// 2. SHOPIFY AJAX CART DRAWER CONTROLLER
function setupCartDrawer() {
  const cartBtn = document.getElementById("cart-btn");
  const cartClose = document.getElementById("cart-close");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartDrawer = document.getElementById("cart-drawer");

  if (cartBtn && cartClose && cartOverlay && cartDrawer) {
    const openCart = (e) => {
      if (e) e.preventDefault();
      cartOverlay.classList.add("active");
      cartDrawer.classList.add("active");
      document.body.style.overflow = "hidden";
      refreshCartUI();
    };

    const closeCart = () => {
      cartOverlay.classList.remove("active");
      cartDrawer.classList.remove("active");
      document.body.style.overflow = "";
    };

    cartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    // Expose drawer openers globally so adding to cart can trigger it
    window.openCartDrawer = openCart;
    window.closeCartDrawer = closeCart;
  }
}

// Shopify AJAX Cart - Add item
window.addToCartAJAX = async function(variantId, buttonEl) {
  if (!variantId) return;

  const originalContent = buttonEl ? buttonEl.innerHTML : null;
  if (buttonEl) {
    buttonEl.disabled = true;
    buttonEl.innerHTML = `<svg class="spinner" width="20" height="20" viewBox="0 0 50 50" style="animation: rotate 2s linear infinite;"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; stroke: var(--bg-darker); animation: dash 1.5s ease-in-out infinite;"></circle></svg>`;
  }

  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: 1
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add product to cart');
    }

    // Refresh cart display
    await refreshCartUI();

    // Auto open cart drawer
    if (window.openCartDrawer) {
      window.openCartDrawer();
    }
  } catch (error) {
    console.error('Cart API error:', error);
    alert('Could not add item to bag. Please try again.');
  } finally {
    if (buttonEl && originalContent) {
      buttonEl.disabled = false;
      buttonEl.innerHTML = originalContent;
    }
  }
};

// Shopify AJAX Cart - Change item quantity
window.updateCartQuantityAJAX = async function(lineKey, quantity) {
  try {
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        id: lineKey,
        quantity: quantity
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update cart quantity');
    }

    refreshCartUI();
  } catch (error) {
    console.error('Cart quantity update error:', error);
  }
};

// Refresh Shopify Cart UI
async function refreshCartUI() {
  const badge = document.getElementById("cart-badge-count");
  const container = document.getElementById("cart-items-list");
  const subtotalVal = document.getElementById("cart-subtotal-val");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  try {
    const res = await fetch('/cart.js');
    if (!res.ok) throw new Error('Could not fetch cart status');
    
    const cart = await res.json();
    
    // Update badge count
    if (badge) {
      badge.innerText = cart.item_count;
      badge.style.display = cart.item_count > 0 ? "flex" : "none";
    }

    // Update checkout button state
    if (checkoutBtn) {
      checkoutBtn.disabled = cart.item_count === 0;
    }

    // Update subtotal
    if (subtotalVal) {
      // Format currency: Shopify returns value in cents (e.g. 34900 for ₹349.00)
      const formattedPrice = formatCurrency(cart.total_price);
      subtotalVal.innerText = formattedPrice;
    }

    // Render list
    if (!container) return;

    if (cart.item_count === 0) {
      container.innerHTML = `
        <div class="cart-empty-message">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p>Your bag is empty.</p>
          <p style="font-size: 0.85rem; margin-top: 8px; color: var(--accent-gold-light);">Add some heritage dishes to get started.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = cart.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.image || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_1024x1024.png'}" alt="${item.title}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.product_title}</h4>
          <div class="cart-item-variant">${item.variant_title || ''}</div>
          <div class="cart-item-price">${formatCurrency(item.final_line_price)}</div>
          <div class="cart-item-actions">
            <div class="quantity-selector">
              <button class="qty-btn" onclick="updateCartQuantityAJAX('${item.key}', ${item.quantity - 1})">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQuantityAJAX('${item.key}', ${item.quantity + 1})">+</button>
            </div>
            <button class="cart-item-remove" onclick="updateCartQuantityAJAX('${item.key}', 0)">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.warn('Shopify Cart endpoint failed (usually static or offline theme development). Falling back to mock session storage.', error);
    refreshMockCartUI();
  }
}

// Fallback session storage cart for offline previews / theme testing
function getMockCart() {
  try {
    const m = sessionStorage.getItem('shahi_serve_mock_cart');
    return m ? JSON.parse(m) : [];
  } catch (e) {
    return [];
  }
}

function saveMockCart(cart) {
  sessionStorage.setItem('shahi_serve_mock_cart', JSON.stringify(cart));
}

function refreshMockCartUI() {
  const badge = document.getElementById("cart-badge-count");
  const container = document.getElementById("cart-items-list");
  const subtotalVal = document.getElementById("cart-subtotal-val");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  const cart = getMockCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (badge) {
    badge.innerText = totalQuantity;
    badge.style.display = totalQuantity > 0 ? "flex" : "none";
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = totalQuantity === 0;
  }

  if (subtotalVal) {
    subtotalVal.innerText = `₹${totalCost}`;
  }

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p>Your bag is empty.</p>
        <p style="font-size: 0.85rem; margin-top: 8px; color: var(--accent-gold-light);">Add some heritage dishes to get started.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.title}</h4>
        <div class="cart-item-variant">Mock Product</div>
        <div class="cart-item-price">₹${item.price * item.quantity}</div>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button class="qty-btn" onclick="updateMockQty('${item.id}', -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateMockQty('${item.id}', 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="updateMockQty('${item.id}', -${item.quantity})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.addToMockCart = function(productObj) {
  let cart = getMockCart();
  const existing = cart.find(i => i.id === productObj.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...productObj, quantity: 1 });
  }
  saveMockCart(cart);
  refreshMockCartUI();
  if (window.openCartDrawer) window.openCartDrawer();
};

window.updateMockQty = function(id, delta) {
  let cart = getMockCart();
  const item = cart.find(i => i.id == id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id != id);
    }
  }
  saveMockCart(cart);
  refreshMockCartUI();
};

// Checkout button handler
window.handleCheckout = function() {
  // If Shopify checkout is available, submit to checkout form
  const form = document.createElement('form');
  form.action = '/checkout';
  form.method = 'POST';
  document.body.appendChild(form);
  form.submit();
};

function formatCurrency(cents) {
  // Simple INR formatting helper
  return '₹' + (cents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 3. FAQ ACCORDION
function setupFAQAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question");
  
  faqQuestions.forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains("active");
      
      document.querySelectorAll(".faq-item").forEach(i => {
        i.classList.remove("active");
        const answer = i.querySelector(".faq-answer");
        if (answer) answer.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add("active");
        const answer = item.querySelector(".faq-answer");
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      }
    });
  });
}

// 4. TESTIMONIALS SLIDER
function setupTestimonialsSlider() {
  const slides = document.querySelectorAll(".testimonial-slide");
  const dotsContainer = document.getElementById("carousel-dots");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  
  if (slides.length === 0) return;
  
  let currentIndex = 0;
  let autoPlayTimer = null;

  if (dotsContainer) {
    dotsContainer.innerHTML = Array.from({ length: slides.length }).map((_, i) => `
      <span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
    `).join('');
    
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const index = parseInt(dot.getAttribute("data-index"));
        goToSlide(index);
      });
    });
  }

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove("active"));
    const dots = dotsContainer ? dotsContainer.querySelectorAll(".dot") : [];
    dots.forEach(d => d.classList.remove("active"));
    
    currentIndex = (index + slides.length) % slides.length;
    
    slides[currentIndex].classList.add("active");
    if (dots[currentIndex]) {
      dots[currentIndex].classList.add("active");
    }
    
    const track = document.getElementById("testimonial-track");
    if (track) {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    resetAutoPlay();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
  }

  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 6000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  startAutoPlay();
}

// 5. SCROLL TRIGGER ANIMATIONS (INTERSECTION OBSERVER)
function setupScrollAnimations() {
  const elements = document.querySelectorAll(".animate-on-scroll");
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("appear");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add("appear"));
  }
}

// 6. NEWSLETTER REGISTRATION LOGIC
function setupNewsletterValidation() {
  const form = document.getElementById("newsletter-form");
  const msg = document.getElementById("newsletter-msg");

  if (form && msg) {
    form.addEventListener("submit", (e) => {
      // If it's a standard Shopify contact form submission, let it proceed.
      // But we will intercept and validate the email input first.
      const input = form.querySelector(".newsletter-input");
      const email = input ? input.value.trim() : "";

      if (!validateEmail(email)) {
        e.preventDefault();
        msg.textContent = "Please enter a valid email address.";
        msg.style.color = "#FF4D4D";
        msg.style.opacity = "1";
        return;
      }
      
      // Let standard form proceed or do alert for presentation if it is just a demo
      if (form.getAttribute('action') === '#' || !form.getAttribute('action')) {
        e.preventDefault();
        input.value = "";
        msg.textContent = "Welcome to the Royal Table. Check your inbox for exclusive recipes!";
        msg.style.color = "var(--accent-gold-light)";
        msg.style.opacity = "1";
        setTimeout(() => {
          msg.style.opacity = "0";
        }, 5000);
      }
    });
  }
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/* Spinner Rotate Keyframes Animation styles are also injected via theme.css */
