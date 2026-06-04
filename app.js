/* ==========================================================================
   SHAHI SERVE - Premium Shopify Storefront Landing Page Scripts
   ========================================================================== */

// 1. PRODUCT CATALOG DATA
const PRODUCTS = [
  {
    id: 1,
    title: "Royal Mutton Rogan Josh",
    price: 349,
    comparePrice: 429,
    category: "curries",
    categoryLabel: "Heat & Eat Curries",
    image: "assets/images/curry_product.png",
    specs: ["Serves 2", "100% Ghee", "Spice: Med"],
    desc: "Slow-cooked mutton in rich traditional Kashmiri spices, real ghee, and bone-marrow gravy. Authentic 200-year-old recipe.",
    badge: "Bestseller"
  },
  {
    id: 2,
    title: "Awadhi Seekh Kebabs",
    price: 299,
    comparePrice: 349,
    category: "kebabs",
    categoryLabel: "Ready-to-Cook Kebabs",
    image: "assets/images/kebab_product.png",
    specs: ["6 Pieces", "Ready to Grill", "Spice: High"],
    desc: "Minced mutton infused with rose petals, mint, and secret royal spice blends. Ready to grill or pan-fry.",
    badge: "Trending"
  },
  {
    id: 3,
    title: "Shahi Nalli Nihari",
    price: 399,
    comparePrice: 499,
    category: "delicacies",
    categoryLabel: "Heritage Delicacies",
    image: "assets/images/delicacy_product.png",
    specs: ["Serves 2-3", "Signature Cook", "Spice: Med"],
    desc: "Slow-cooked shank meat in a velvet spiced broth. A Mughal imperial breakfast dish brought to modern tables.",
    badge: "Signature"
  },
  {
    id: 4,
    title: "Lucknowi Murgh Korma",
    price: 329,
    comparePrice: 399,
    category: "curries",
    categoryLabel: "Heat & Eat Curries",
    image: "assets/images/curry_product.png",
    specs: ["Serves 2", "Cashew Gravy", "Spice: Mild-Med"],
    desc: "Tender chicken cooked in sweet caramelised onions, real ghee, and whole spices infused with kewra water.",
    badge: null
  },
  {
    id: 5,
    title: "Mughlai Galouti Kebabs",
    price: 349,
    comparePrice: 399,
    category: "kebabs",
    categoryLabel: "Ready-to-Cook Kebabs",
    image: "assets/images/kebab_product.png",
    specs: ["4 Pieces", "Melt-in-Mouth", "Spice: Med"],
    desc: "Fragrant mutton patties that melt in the mouth, prepared according to authentic Nawabi recipe archives.",
    badge: "Popular"
  },
  {
    id: 6,
    title: "Deccani Mutton Biryani",
    price: 379,
    comparePrice: 449,
    category: "delicacies",
    categoryLabel: "Heritage Delicacies",
    image: "assets/images/delicacy_product.png",
    specs: ["Serves 2", "Dum-cooked", "Spice: High"],
    desc: "Fragrant Basmati rice cooked in layer with tender mutton chunks, whole spices, and rich ghee.",
    badge: "Limited"
  }
];

// 2. SHOPPING CART STATE
let cart = [];

// Initialize LocalStorage Cart
function initCart() {
  const savedCart = localStorage.getItem('shahi_serve_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch (e) {
      cart = [];
    }
  }
}

function saveCart() {
  localStorage.setItem('shahi_serve_cart', JSON.stringify(cart));
}

// 3. UI CONTROLLER DEFINITIONS
document.addEventListener("DOMContentLoaded", () => {
  initCart();
  renderProducts("all");
  setupNavigation();
  setupProductTabs();
  setupCartDrawer();
  setupFAQAccordion();
  setupTestimonialsSlider();
  setupNewsletterValidation();
  setupScrollAnimations();
});

// Setup Mobile Menu Toggle & Header Scroll
function setupNavigation() {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const header = document.querySelector("header");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      const isExpanded = navMenu.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", isExpanded);
      
      // Update menu icon between bars and cross
      if (isExpanded) {
        menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      } else {
        menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`;
      }
    });

    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`;
      });
    });
  }

  // Header background fade on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Setup Product tab filters
function setupProductTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-category");
      renderProducts(category);
    });
  });
}

// Render Products to Grid
function renderProducts(categoryFilter = "all") {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const filtered = categoryFilter === "all" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === categoryFilter);

  grid.innerHTML = filtered.map(p => `
    <div class="product-card animate-on-scroll">
      <div class="product-image-container">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <img src="${p.image}" alt="${p.title}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-category">${p.categoryLabel}</span>
          <div class="product-rating">
            <svg viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span>4.9</span>
          </div>
        </div>
        <h3 class="product-title">${p.title}</h3>
        <p class="product-description">${p.desc}</p>
        <div class="product-specs">
          ${p.specs.map(spec => `
            <span class="spec-tag">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              ${spec}
            </span>
          `).join('')}
        </div>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-current">₹${p.price}</span>
            <span class="price-compare">₹${p.comparePrice}</span>
          </div>
          <button class="product-add-btn" onclick="addToCart(${p.id})" aria-label="Add ${p.title} to cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Re-observe newly rendered cards for animations
  setupScrollAnimations();
}

// Setup Cart Drawer Actions
function setupCartDrawer() {
  const cartBtn = document.getElementById("cart-btn");
  const cartClose = document.getElementById("cart-close");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartDrawer = document.getElementById("cart-drawer");

  if (cartBtn && cartClose && cartOverlay && cartDrawer) {
    const openCart = () => {
      cartOverlay.classList.add("active");
      cartDrawer.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scroll
    };

    const closeCart = () => {
      cartOverlay.classList.remove("active");
      cartDrawer.classList.remove("active");
      document.body.style.overflow = ""; // Re-enable background scroll
    };

    cartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);
  }
}

// Add Item to Cart
window.addToCart = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  
  // Auto-open Cart Drawer to showcase immediate Shopify addition behavior
  const cartOverlay = document.getElementById("cart-overlay");
  const cartDrawer = document.getElementById("cart-drawer");
  if (cartOverlay && cartDrawer) {
    cartOverlay.classList.add("active");
    cartDrawer.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

// Change Cart Item Quantity
window.updateCartQuantity = function(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart();
  updateCartUI();
};

// Remove Cart Item
window.removeCartItem = function(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
};

// Update Cart Badge & Drawer UI
function updateCartUI() {
  const badge = document.getElementById("cart-badge-count");
  const container = document.getElementById("cart-items-list");
  const subtotalVal = document.getElementById("cart-subtotal-val");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update badge count
  if (badge) {
    badge.innerText = totalQuantity;
    badge.style.display = totalQuantity > 0 ? "flex" : "none";
  }

  // Update checkout button state
  if (checkoutBtn) {
    checkoutBtn.disabled = totalQuantity === 0;
  }

  // Update subtotal
  if (subtotalVal) {
    subtotalVal.innerText = `₹${totalCost}`;
  }

  // Update item list
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
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
        <div class="cart-item-variant">${item.categoryLabel}</div>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeCartItem(${item.id})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Checkout Click Simulation
window.handleCheckout = function() {
  if (cart.length === 0) return;
  alert("Redirecting to Shopify Secure Checkout...\nTotal Order Value: ₹" + cart.reduce((sum, i) => sum + (i.price * i.quantity), 0));
  // Clear cart simulation
  cart = [];
  saveCart();
  updateCartUI();
  
  // Close drawer
  const cartOverlay = document.getElementById("cart-overlay");
  const cartDrawer = document.getElementById("cart-drawer");
  if (cartOverlay && cartDrawer) {
    cartOverlay.classList.remove("active");
    cartDrawer.classList.remove("active");
    document.body.style.overflow = "";
  }
};

// FAQ Accordion
function setupFAQAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question");
  
  faqQuestions.forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains("active");
      
      // Close other accordions
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

// Testimonials Slider
function setupTestimonialsSlider() {
  const slides = document.querySelectorAll(".testimonial-slide");
  const dotsContainer = document.getElementById("carousel-dots");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  
  if (slides.length === 0) return;
  
  let currentIndex = 0;
  let autoPlayTimer = null;

  // Create dot paginators dynamically
  if (dotsContainer) {
    dotsContainer.innerHTML = Array.from({ length: slides.length }).map((_, i) => `
      <span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
    `).join('');
    
    // Add dot click handlers
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
    
    // Slide container movement
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

// Scroll Triggered Animations using Intersection Observer
function setupScrollAnimations() {
  const elements = document.querySelectorAll(".animate-on-scroll");
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("appear");
          // Optionally stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    elements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    elements.forEach(el => el.classList.add("appear"));
  }
}

// Newsletter Signup Validation
function setupNewsletterValidation() {
  const form = document.getElementById("newsletter-form");
  const msg = document.getElementById("newsletter-msg");

  if (form && msg) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector(".newsletter-input");
      const email = input.value.trim();

      if (!validateEmail(email)) {
        msg.textContent = "Please enter a valid email address.";
        msg.style.color = "#FF4D4D";
        msg.style.opacity = "1";
        return;
      }

      // Success Animation
      input.value = "";
      msg.textContent = "Welcome to the Royal Table. Check your inbox for exclusive recipes!";
      msg.style.color = "var(--accent-gold-light)";
      msg.style.opacity = "1";
      
      // Reset msg after 5s
      setTimeout(() => {
        msg.style.opacity = "0";
      }, 5000);
    });
  }
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
