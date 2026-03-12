// ─── RentMyThings – Shared Utilities ───────────────────────────────────────

// ── Auth Store ──────────────────────────────────────────────────────────────
const Auth = {
  TOKEN_KEY: 'rmt_token',
  USER_KEY:  'rmt_user',

  save(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  getToken() { return localStorage.getItem(this.TOKEN_KEY); },

  getUser() {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY)); }
    catch { return null; }
  },

  isLoggedIn() { return !!this.getToken(); },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/index.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/auth.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    return true;
  }
};

// ── API Client ───────────────────────────────────────────────────────────────
const API_BASE = '/api';

const Api = {
  async request(method, path, body = null, isFormData = false) {
    const headers = {};
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    const res = await fetch(API_BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },
  get:    (path)        => Api.request('GET',    path),
  post:   (path, body)  => Api.request('POST',   path, body),
  put:    (path, body)  => Api.request('PUT',    path, body),
  delete: (path)        => Api.request('DELETE', path),
  upload: (path, form)  => Api.request('POST',   path, form, true),
};

// ── Toast Notifications ──────────────────────────────────────────────────────
function toast(message, type = 'info', duration = 4000) {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
    return el;
  })();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span style="font-size:1rem">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
  }, duration);
}

// ── Render Stars ─────────────────────────────────────────────────────────────
function renderStars(rating, max = 5) {
  let html = '<div class="stars">';
  for (let i = 1; i <= max; i++) {
    html += `<svg width="14" height="14" viewBox="0 0 24 24" fill="${i <= rating ? 'var(--secondary)' : 'none'}" stroke="${i <= rating ? 'var(--secondary)' : 'var(--text-muted)'}" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;
  }
  html += '</div>';
  return html;
}

// ── Format Date ───────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysBetween(start, end) {
  const s = new Date(start), e = new Date(end);
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

// ── Category Data ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'cameras',    label: 'Cameras',      emoji: '📸', color: '#e74c3c' },
  { id: 'tools',      label: 'Power Tools',  emoji: '🔧', color: '#e67e22' },
  { id: 'camping',    label: 'Camping Gear', emoji: '⛺', color: '#27ae60' },
  { id: 'electronics',label: 'Electronics',  emoji: '🎮', color: '#3498db' },
  { id: 'sports',     label: 'Sports',       emoji: '🚴', color: '#9b59b6' },
  { id: 'music',      label: 'Music',        emoji: '🎸', color: '#1abc9c' },
  { id: 'vehicles',   label: 'Vehicles',     emoji: '🚗', color: '#f39c12' },
  { id: 'kitchen',    label: 'Kitchen',      emoji: '🍳', color: '#e91e63' },
];

function getCategoryLabel(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? cat.label : id;
}

// ── Mock Data Store (used until backend is connected) ─────────────────────────
const MockDB = {
  // Seed users
  _users: JSON.parse(localStorage.getItem('rmt_mock_users') || 'null') || [
    { _id: 'u1', name: 'Arjun Sharma', email: 'arjun@example.com', password: 'password', rating: 4.8, profile_photo: null, createdAt: '2025-01-10' },
    { _id: 'u2', name: 'Priya Nair',   email: 'priya@example.com', password: 'password', rating: 4.5, profile_photo: null, createdAt: '2025-02-05' },
    { _id: 'u3', name: 'Rohan Das',    email: 'rohan@example.com', password: 'password', rating: 4.2, profile_photo: null, createdAt: '2025-03-01' },
  ],

  // Seed items
  _items: JSON.parse(localStorage.getItem('rmt_mock_items') || 'null') || [
    { _id: 'i1', owner_id:'u1', title:'Sony A7III Camera', description:'Full-frame mirrorless camera with 28-70mm kit lens.',      category:'cameras',     price_per_day:800,  condition:'Excellent', location:'Bangalore', image_url:'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&q=80', available:true, createdAt:'2025-04-01' },
    { _id: 'i2', owner_id:'u2', title:'Bosch Drill Set',   description:'Professional cordless drill with full accessory kit.',    category:'tools',       price_per_day:200,  condition:'Good',      location:'Chennai',   image_url:'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80', available:true, createdAt:'2025-04-03' },
    { _id: 'i3', owner_id:'u1', title:'Camping Tent (4P)', description:'4-person dome tent, waterproof, easy setup.',             category:'camping',     price_per_day:350,  condition:'Good',      location:'Bangalore', image_url:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80', available:true, createdAt:'2025-04-05' },
    { _id: 'i4', owner_id:'u3', title:'DJI Mini 3 Drone',  description:'Foldable drone with 4K video and 30min flight time.',    category:'electronics', price_per_day:1200, condition:'Excellent', location:'Mumbai',    image_url:'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80', available:true, createdAt:'2025-04-06' },
    { _id: 'i5', owner_id:'u2', title:'Mountain Bike',     description:'21-speed MTB, suitable for trails and city riding.',      category:'sports',      price_per_day:250,  condition:'Good',      location:'Chennai',   image_url:'https://images.unsplash.com/photo-1558583055-d7ac00b1adca?w=600&q=80', available:true, createdAt:'2025-04-07' },
    { _id: 'i6', owner_id:'u3', title:'GoPro Hero 11',     description:'Action camera with waterproof housing and accessories.',  category:'cameras',     price_per_day:500,  condition:'Excellent', location:'Mumbai',    image_url:'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&q=80', available:true, createdAt:'2025-04-08' },
    { _id: 'i7', owner_id:'u1', title:'Gibson Acoustic Guitar','description':'Full-size acoustic guitar with carrying case.',      category:'music',       price_per_day:300,  condition:'Good',      location:'Bangalore', image_url:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80', available:true, createdAt:'2025-04-09' },
    { _id: 'i8', owner_id:'u2', title:'Air Compressor',    description:'100L professional air compressor, 10 bar max pressure.', category:'tools',       price_per_day:450,  condition:'Excellent', location:'Chennai',   image_url:'https://images.unsplash.com/photo-1504221507732-5246c045949b?w=600&q=80', available:true, createdAt:'2025-04-10' },
  ],

  _bookings: JSON.parse(localStorage.getItem('rmt_mock_bookings') || '[]'),
  _reviews:  JSON.parse(localStorage.getItem('rmt_mock_reviews')  || '[]'),

  persist() {
    localStorage.setItem('rmt_mock_users',    JSON.stringify(this._users));
    localStorage.setItem('rmt_mock_items',    JSON.stringify(this._items));
    localStorage.setItem('rmt_mock_bookings', JSON.stringify(this._bookings));
    localStorage.setItem('rmt_mock_reviews',  JSON.stringify(this._reviews));
  },

  genId() { return '_' + Math.random().toString(36).substr(2, 9); },

  // Users
  findUserByEmail(email) { return this._users.find(u => u.email === email); },
  findUserById(id)        { return this._users.find(u => u._id === id); },
  createUser(data) {
    const user = { _id: this.genId(), ...data, rating: 0, profile_photo: null, createdAt: new Date().toISOString() };
    this._users.push(user); this.persist(); return user;
  },
  updateUser(id, data) {
    const i = this._users.findIndex(u => u._id === id);
    if (i === -1) return null;
    this._users[i] = { ...this._users[i], ...data };
    this.persist(); return this._users[i];
  },

  // Items
  getItems(filters = {}) {
    let items = [...this._items];
    if (filters.category)  items = items.filter(i => i.category === filters.category);
    if (filters.location)  items = items.filter(i => i.location.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.keyword)   items = items.filter(i => i.title.toLowerCase().includes(filters.keyword.toLowerCase()) || i.description.toLowerCase().includes(filters.keyword.toLowerCase()));
    if (filters.owner_id)  items = items.filter(i => i.owner_id === filters.owner_id);
    return items.reverse();
  },
  getItemById(id) { return this._items.find(i => i._id === id); },
  createItem(data) {
    const item = { _id: this.genId(), ...data, available: true, createdAt: new Date().toISOString() };
    this._items.push(item); this.persist(); return item;
  },
  updateItem(id, data) {
    const i = this._items.findIndex(item => item._id === id);
    if (i === -1) return null;
    this._items[i] = { ...this._items[i], ...data };
    this.persist(); return this._items[i];
  },
  deleteItem(id) {
    const i = this._items.findIndex(item => item._id === id);
    if (i !== -1) { this._items.splice(i, 1); this.persist(); }
  },

  // Bookings
  createBooking(data) {
    const booking = { _id: this.genId(), ...data, booking_status: 'pending', createdAt: new Date().toISOString() };
    this._bookings.push(booking); this.persist(); return booking;
  },
  getBookingsForUser(userId) {
    return this._bookings.filter(b => b.renter_id === userId || this.getItemById(b.item_id)?.owner_id === userId);
  },
  getBookingsAsRenter(userId)  { return this._bookings.filter(b => b.renter_id === userId); },
  getBookingsAsOwner(userId)   { return this._bookings.filter(b => this.getItemById(b.item_id)?.owner_id === userId); },
  updateBookingStatus(id, status) {
    const i = this._bookings.findIndex(b => b._id === id);
    if (i === -1) return null;
    this._bookings[i].booking_status = status;
    this.persist(); return this._bookings[i];
  },
  isItemBooked(itemId, start, end) {
    const s = new Date(start), e = new Date(end);
    return this._bookings.some(b =>
      b.item_id === itemId && b.booking_status === 'approved' &&
      new Date(b.start_date) < e && new Date(b.end_date) > s
    );
  },

  // Reviews
  createReview(data) {
    const review = { _id: this.genId(), ...data, createdAt: new Date().toISOString() };
    this._reviews.push(review); this.persist();
    // Update average rating
    const userReviews = this._reviews.filter(r => r.reviewed_user_id === data.reviewed_user_id);
    const avg = userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length;
    this.updateUser(data.reviewed_user_id, { rating: Math.round(avg * 10) / 10 });
    return review;
  },
  getReviewsForUser(userId) { return this._reviews.filter(r => r.reviewed_user_id === userId).reverse(); },
  hasReviewed(reviewerId, bookingId) { return this._reviews.some(r => r.reviewer_id === reviewerId && r.booking_id === bookingId); },
};

// ── Navbar ────────────────────────────────────────────────────────────────────
function initNavbar() {
  const navbar   = document.querySelector('.navbar');
  const userPill = document.getElementById('nav-user-pill');
  const loginBtn = document.getElementById('nav-login-btn');
  const logoutBtn= document.getElementById('nav-logout-btn');
  const hamburger= document.getElementById('nav-hamburger');
  const user = Auth.getUser();

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Auth state UI
  if (user) {
    if (userPill) {
      userPill.classList.remove('hidden');
      const initial = document.getElementById('nav-avatar-initial');
      if (initial) initial.textContent = user.name?.charAt(0).toUpperCase() || '?';
      const nameEl = document.getElementById('nav-user-name');
      if (nameEl) nameEl.textContent = user.name?.split(' ')[0];
    }
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn?.classList.remove('hidden');
  } else {
    if (userPill) userPill.classList.add('hidden');
    if (loginBtn) loginBtn?.classList.remove('hidden');
    if (logoutBtn) logoutBtn?.classList.add('hidden');
  }

  // Logout
  logoutBtn?.addEventListener('click', () => Auth.logout());

  // Hamburger menu
  hamburger?.addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', e => {
    const menu = document.getElementById('mobile-menu');
    if (menu && !menu.contains(e.target) && !hamburger?.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
}

// ── Page loader ───────────────────────────────────────────────────────────────
function hideLoader() {
  const loader = document.querySelector('.page-loader');
  if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 500); }
}

// ── Item Card HTML ─────────────────────────────────────────────────────────────
function renderItemCard(item) {
  const owner = MockDB.findUserById(item.owner_id);
  const cat   = CATEGORIES.find(c => c.id === item.category);
  return `
    <div class="item-card" onclick="window.location.href='/item-detail.html?id=${item._id}'">
      <div class="item-card-img-wrap">
        <img class="item-card-img" src="${item.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'}" alt="${item.title}" loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'">
        <span class="item-card-badge">${cat ? cat.emoji + ' ' + cat.label : item.category}</span>
      </div>
      <div class="item-card-body">
        <div class="item-card-title">${item.title}</div>
        <div class="item-card-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${item.location}
        </div>
        <div class="item-card-footer">
          <div class="item-price">₹${item.price_per_day.toLocaleString()} <span>/day</span></div>
          <div style="display:flex;align-items:center;gap:6px">
            ${renderStars(Math.round(owner?.rating || 0))}
            <span class="rating-count">${owner?.rating || 'New'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
