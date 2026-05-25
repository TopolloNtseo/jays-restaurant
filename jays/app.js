/* ===== JAYS RESTAURANT — SHARED JS ===== */

// ——— CART STATE ———
let cart = JSON.parse(localStorage.getItem('jays_cart') || '[]');
let deliveryType = 'delivery';

function saveCart() { localStorage.setItem('jays_cart', JSON.stringify(cart)); }

// ——— ADD TO CART ———
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`${name} added to order!`);
}

// ——— RENDER CART ———
function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Update count badges
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
  const countBadge = document.getElementById('cartCountBadge');
  if (countBadge) countBadge.textContent = `${count} item${count !== 1 ? 's' : ''}`;

  // Float cart button
  const floatCart = document.getElementById('floatCart');
  if (floatCart) {
    floatCart.style.display = count > 0 ? 'flex' : 'none';
    const fc = document.getElementById('floatCartCount');
    if (fc) fc.textContent = count;
  }

  const cartItemsEl = document.getElementById('cartItems');
  const cartSummaryEl = document.getElementById('cartSummary');
  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-bag"></i>
        <p>Your order is empty</p>
        <span>Add items from the menu</span>
      </div>`;
    if (cartSummaryEl) cartSummaryEl.style.display = 'none';
    return;
  }

  cartItemsEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="ci-name">${item.name}</div>
      <div class="ci-controls">
        <button class="ci-btn" onclick="changeQty(${idx},-1)"><i class="fas fa-minus"></i></button>
        <span class="ci-qty">${item.qty}</span>
        <button class="ci-btn" onclick="changeQty(${idx},1)"><i class="fas fa-plus"></i></button>
      </div>
      <div class="ci-price">LSL ${(item.price * item.qty).toFixed(0)}</div>
    </div>`).join('');

  if (cartSummaryEl) {
    cartSummaryEl.style.display = 'block';
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `LSL ${total.toFixed(0)}`;

    // Wednesday free delivery
    const today = new Date().getDay();
    const wedNote = document.getElementById('wedNote');
    if (wedNote) wedNote.style.display = (today === 3 && total >= 70) ? 'flex' : 'none';
  }

  // Update WhatsApp link
  buildWALink();
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function setDelivery(type) {
  deliveryType = type;
  document.getElementById('togDelivery').classList.toggle('active', type === 'delivery');
  document.getElementById('togPickup').classList.toggle('active', type === 'pickup');
  const addrField = document.getElementById('addrField');
  if (addrField) addrField.style.display = type === 'pickup' ? 'none' : 'block';
  buildWALink();
}

function buildWALink() {
  const waBtn = document.getElementById('waOrderBtn');
  if (!waBtn) return;
  if (cart.length === 0) { waBtn.href = '#'; return; }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemsList = cart.map(i => `• ${i.name} x${i.qty} = LSL ${(i.price * i.qty).toFixed(0)}`).join('\n');
  const msg = `Hi Jay's Restaurant! I'd like to place an order:\n\n${itemsList}\n\nTotal: LSL ${total.toFixed(0)}\nOrder type: ${deliveryType === 'delivery' ? 'Delivery' : 'In-store Pickup'}`;
  waBtn.href = `https://wa.me/26658141890?text=${encodeURIComponent(msg)}`;
}

function placeOrder() {
  if (cart.length === 0) { showToast('Please add items first!'); return; }
  const name = document.getElementById('custName')?.value.trim();
  const phone = document.getElementById('custPhone')?.value.trim();
  if (!name || !phone) { showToast('Please enter your name & phone!'); return; }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const address = document.getElementById('custAddress')?.value.trim();
  const notes = document.getElementById('custNotes')?.value.trim();
  const itemsList = cart.map(i => `• ${i.name} x${i.qty} = LSL ${(i.price * i.qty).toFixed(0)}`).join('%0A');
  const type = deliveryType === 'delivery' ? 'Delivery' : 'In-store Pickup';
  const addrLine = address ? `%0AAddress: ${encodeURIComponent(address)}` : '';
  const notesLine = notes ? `%0ANotes: ${encodeURIComponent(notes)}` : '';

  const msg = `Hi! New order from Jay's Restaurant website:%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AType: ${type}${addrLine}${notesLine}%0A%0A${itemsList}%0A%0ATotal: LSL ${total.toFixed(0)}`;
  window.open(`https://wa.me/26658141890?text=${msg}`, '_blank');

  showToast('Order sent via WhatsApp!');
  cart = [];
  saveCart();
  renderCart();
}

function toggleCart() {
  const panel = document.getElementById('cartPanel');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ——— RESERVATION ———
function submitReservation(e) {
  e.preventDefault();
  showToast('Reservation confirmed! We\'ll contact you shortly.');
  setTimeout(() => e.target.reset(), 500);
}

// ——— TOAST ———
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ——— NAVBAR / SCROLL ———
window.addEventListener('scroll', () => {
  const scrollTop = document.getElementById('scrollTop');
  if (scrollTop) scrollTop.classList.toggle('visible', window.scrollY > 400);
});

document.getElementById('scrollTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ——— HAMBURGER ———
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = navLinks.classList.contains('open') ? 'rotate(45deg) translate(5px,5px)' : '';
    spans[1].style.opacity = navLinks.classList.contains('open') ? '0' : '';
    spans[2].style.transform = navLinks.classList.contains('open') ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { navLinks.classList.remove('open'); });
  });
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// ——— INIT ———
document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  // Animate on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.meal-card, .drink-card, .order-card, .why-card, .res-info-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // Lazy load images
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img').forEach(img => img.loading = 'lazy');
  }
});
