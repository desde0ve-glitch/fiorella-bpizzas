// ═══════════════════════════════════════════
//  menu.js — Menú, Carrito, Modal de Extras y WhatsApp
// ═══════════════════════════════════════════

// ── STATE ───────────────────────────────────────────────────────────────────
let currentBranch = null;
let cartItems = [];         // [{ key, itemId, name, img, sizeLabel, basePrice, extras[], qty }]
let modalState = null;      // datos del producto abierto en modal
let selectedSizes = {};     // { itemId: sizeIndex }

// ── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Load branch from sessionStorage
  const branchId = sessionStorage.getItem("selectedBranch");
  currentBranch = BRANCHES.find(b => b.id === branchId) || BRANCHES[0];

  // Show branch name in header and cart
  document.getElementById("headerBranchName").textContent = currentBranch.name;
  document.getElementById("cartBranchName").textContent = currentBranch.name;

  renderCatNav();
  renderMenu();
  setupScrollSpy();
});

// ── CHANGE BRANCH ───────────────────────────────────────────────────────────
function changeBranch() {
  window.location.href = "index.html";
}

// ── CATEGORY NAV ───────────────────────────────────────────────────────────
function renderCatNav() {
  const nav = document.getElementById("catNav");
  nav.innerHTML =
    '<span class="cat-nav-title">Menú</span>' +
    MENU.map((cat, i) => `
      <button
        class="cat-btn ${i === 0 ? "active" : ""}"
        id="navbtn-${cat.id}"
        onclick="scrollToCat('${cat.id}')"
      >
        <span class="cat-ico">${cat.icon}</span>
        ${cat.name}
      </button>
    `).join("");
}

// ── MENU RENDER ─────────────────────────────────────────────────────────────
function renderMenu() {
  const section = document.getElementById("menuSection");

  section.innerHTML = MENU.map(cat => {
    const isCombo  = cat.id === "combos";
    const isDrink  = cat.id === "bebidas";
    const gridCls  = isDrink ? "grid-3" : "grid-2";

    const cards = cat.items.map(item => {
      if (isCombo)   return renderComboCard(item);
      if (isDrink)   return renderSmallCard(item);
      return renderPizzaCard(item);
    }).join("");

    return `
      <div class="category-section" id="cat-${cat.id}">
        <div class="section-header">
          <div class="section-icon" aria-hidden="true">${cat.icon}</div>
          <h2 class="section-title">${cat.name}</h2>
          <div class="section-line"></div>
        </div>
        ${cat.desc ? `<p class="section-desc">${cat.desc}</p>` : ""}
        <div class="${gridCls}" id="grid-${cat.id}">
          ${cards}
        </div>
      </div>
    `;
  }).join("");
}

// ─── PIZZA / SIZED CARD ───────────────────────────────────────────────────
function renderPizzaCard(item) {
  const si      = selectedSizes[item.id] ?? 0;
  const size    = item.sizes[si];
  const cartKey = item.sizes.length > 1 ? `${item.id}-${si}` : item.id;
  const qty     = getQty(cartKey);
  const inCart  = qty > 0;

  const imgHTML = item.img
    ? `<img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : "";
  const placeholderHTML = `<div class="card-img-placeholder" ${item.img ? 'style="display:none"' : ""}>🍕</div>`;

  const sizeChips = item.sizes.length > 1
    ? `<div class="size-row">
        ${item.sizes.map((s, i) => `
          <button
            class="size-chip ${i === si ? "selected" : ""}"
            onclick="selectSizeOnly('${item.id}', ${i})"
          >${s.label} — ${formatPrice(s.price)}</button>
        `).join("")}
      </div>`
    : `<div class="size-row"><span class="size-chip selected">${size.label} — ${formatPrice(size.price)}</span></div>`;

  const controls = inCart
    ? `<div class="qty-controls">
        <button class="qty-btn" onclick="changeQty('${cartKey}', -1, '${item.id}')" aria-label="Quitar uno">−</button>
        <span class="qty-num" aria-live="polite">${qty}</span>
        <button class="qty-btn" onclick="changeQty('${cartKey}', 1, '${item.id}')" aria-label="Agregar uno">+</button>
      </div>`
    : `<button class="add-btn" onclick="openModal('${item.id}', ${si})">+ Agregar</button>`;

  return `
    <div class="item-card ${inCart ? "in-cart" : ""}" id="card-${item.id}" data-item="${item.id}">
      <div class="card-img">
        ${imgHTML}${placeholderHTML}
      </div>
      <div class="card-body">
        <div class="card-name">${item.name}</div>
        <div class="card-desc">${item.desc}</div>
        ${sizeChips}
        <div class="card-footer">
          <span class="card-price">${formatPrice(size.price)}</span>
          ${controls}
        </div>
      </div>
    </div>
  `;
}

// ─── COMBO CARD ──────────────────────────────────────────────────────────
function renderComboCard(item) {
  const qty    = getQty(item.id);
  const inCart = qty > 0;

  const controls = inCart
    ? `<div class="combo-qty-controls">
        <button class="combo-qty-btn" onclick="changeQty('${item.id}', -1, '${item.id}')" aria-label="Quitar uno">−</button>
        <span class="combo-qty-num" aria-live="polite">${qty}</span>
        <button class="combo-qty-btn" onclick="changeQty('${item.id}', 1, '${item.id}')" aria-label="Agregar uno">+</button>
      </div>`
    : `<button class="combo-add-btn" onclick="openModal('${item.id}')">+ Agregar</button>`;

  return `
    <div class="combo-card ${inCart ? "in-cart" : ""}" id="card-${item.id}" data-item="${item.id}">
      <span class="combo-tag">Combo</span>
      <div class="combo-name">${item.name}</div>
      <div class="combo-contents">${item.desc}</div>
      <div class="combo-footer">
        <span class="combo-price">${formatPrice(item.price)}</span>
        ${controls}
      </div>
    </div>
  `;
}

// ─── SMALL CARD (drinks) ─────────────────────────────────────────────────
function renderSmallCard(item) {
  const qty    = getQty(item.id);
  const inCart = qty > 0;

  const imgHTML = item.img
    ? `<img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : "";
  const placeholderHTML = `<div class="small-img-placeholder" ${item.img ? 'style="display:none"' : ""}>🥤</div>`;

  const controls = inCart
    ? `<div class="qty-controls">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1, '${item.id}')" aria-label="Quitar uno">−</button>
        <span class="qty-num" aria-live="polite">${qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1, '${item.id}')" aria-label="Agregar uno">+</button>
      </div>`
    : `<button class="add-btn" style="font-size:0.74rem;padding:7px 11px" onclick="addDirect('${item.id}')">+ Agregar</button>`;

  return `
    <div class="small-card ${inCart ? "in-cart" : ""}" id="card-${item.id}" data-item="${item.id}">
      <div class="small-img">
        ${imgHTML}${placeholderHTML}
      </div>
      <div class="small-name">${item.name}</div>
      <div class="small-price">${formatPrice(item.price)}</div>
      <div class="small-footer">${controls}</div>
    </div>
  `;
}

// ── SELECT SIZE (without opening modal) ────────────────────────────────────
function selectSizeOnly(itemId, si) {
  selectedSizes[itemId] = si;
  refreshCard(itemId);
}

// ── MODAL ───────────────────────────────────────────────────────────────────
function openModal(itemId, forceSizeIdx) {
  const item = findItem(itemId);
  if (!item) return;

  const si = forceSizeIdx !== undefined ? forceSizeIdx : (selectedSizes[itemId] ?? 0);

  modalState = {
    itemId,
    selectedSizeIdx: si,
    selectedExtras: new Set(),
  };

  renderModal(item);
  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
  modalState = null;
}

function renderModal(item) {
  const isCombo = item.type === "combo";
  const si      = modalState.selectedSizeIdx;
  const size    = item.sizes ? item.sizes[si] : null;
  const basePrice = isCombo ? item.price : size.price;

  // Header
  document.getElementById("modalProductName").textContent = item.name;
  document.getElementById("modalProductPrice").textContent = formatPrice(basePrice);

  // Body
  const body = document.getElementById("modalBody");
  let html = "";

  // Sizes (only if multiple)
  if (item.sizes && item.sizes.length > 1) {
    html += `
      <div class="modal-section">
        <div class="modal-section-title">Elige tu tamaño</div>
        <div class="modal-sizes" id="modalSizes">
          ${item.sizes.map((s, i) => `
            <button
              class="modal-size-btn ${i === si ? "selected" : ""}"
              onclick="modalSelectSize(${i})"
            >
              ${s.label}
              <span class="size-price">${formatPrice(s.price)}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  // Extras (only if item.allowExtras)
  if (item.allowExtras) {
    html += `
      <div class="modal-section">
        <div class="modal-section-title">Ingredientes adicionales (opcional)</div>
        <div class="modal-extras" id="modalExtras">
          ${EXTRAS.map(ex => `
            <button
              class="modal-extra-btn"
              id="mextra-${ex.id}"
              onclick="modalToggleExtra('${ex.id}')"
            >
              <div class="modal-extra-check" id="mextra-check-${ex.id}"></div>
              <span class="extra-name">${ex.name}</span>
              <span class="extra-price">+${formatPrice(ex.price)}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  body.innerHTML = html;
  updateModalTotal();
}

function modalSelectSize(si) {
  modalState.selectedSizeIdx = si;
  const item = findItem(modalState.itemId);
  // Update chips
  document.querySelectorAll(".modal-size-btn").forEach((btn, i) => {
    btn.classList.toggle("selected", i === si);
  });
  document.getElementById("modalProductPrice").textContent =
    formatPrice(item.sizes[si].price);
  updateModalTotal();
}

function modalToggleExtra(extraId) {
  const { selectedExtras } = modalState;
  if (selectedExtras.has(extraId)) {
    selectedExtras.delete(extraId);
  } else {
    selectedExtras.add(extraId);
  }
  const btn   = document.getElementById(`mextra-${extraId}`);
  const check = document.getElementById(`mextra-check-${extraId}`);
  const on    = selectedExtras.has(extraId);
  btn.classList.toggle("selected", on);
  check.textContent = on ? "✓" : "";
  updateModalTotal();
}

function updateModalTotal() {
  const item = findItem(modalState.itemId);
  const si   = modalState.selectedSizeIdx;
  const base = item.type === "combo" ? item.price : item.sizes[si].price;
  const extrasTotal = [...modalState.selectedExtras].reduce((sum, exId) => {
    const ex = EXTRAS.find(e => e.id === exId);
    return sum + (ex ? ex.price : 0);
  }, 0);
  document.getElementById("modalTotal").textContent = formatPrice(base + extrasTotal);
}

function modalConfirm() {
  const item   = findItem(modalState.itemId);
  const si     = modalState.selectedSizeIdx;
  const isCombo = item.type === "combo";

  const sizeLabel = item.sizes ? item.sizes[si].label : null;
  const basePrice = isCombo ? item.price : item.sizes[si].price;
  const cartKey   = item.sizes && item.sizes.length > 1
    ? `${item.id}-${si}`
    : item.id;

  const selectedExtrasArr = [...modalState.selectedExtras].map(exId =>
    EXTRAS.find(e => e.id === exId)
  ).filter(Boolean);

  const extrasPrice = selectedExtrasArr.reduce((s, e) => s + e.price, 0);

  // Check if same product+size already in cart (without extras — treat as new line if extras differ)
  // For simplicity: always add as new line if extras differ, otherwise increment
  const existing = cartItems.find(c =>
    c.key === cartKey &&
    arraysEqual([...c.extras.map(e => e.id)].sort(), [...modalState.selectedExtras].sort())
  );

  if (existing) {
    existing.qty++;
  } else {
    cartItems.push({
      key: cartKey,
      itemId: item.id,
      name: item.name,
      img: item.img || null,
      sizeLabel,
      basePrice,
      extras: selectedExtrasArr,
      qty: 1,
    });
  }

  // Update selected size state
  if (item.sizes && item.sizes.length > 1) {
    selectedSizes[item.id] = si;
  }

  closeModal();
  refreshCard(item.id);
  updateCartBadge();
  updateSendBtn();

  // Brief feedback
  showAddedFeedback(item.name);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// ── ADD DIRECT (drinks — no modal) ─────────────────────────────────────────
function addDirect(itemId) {
  const item = findItem(itemId);
  if (!item) return;
  const existing = cartItems.find(c => c.key === itemId);
  if (existing) {
    existing.qty++;
  } else {
    cartItems.push({
      key: itemId, itemId,
      name: item.name, img: item.img || null,
      sizeLabel: null, basePrice: item.price, extras: [], qty: 1,
    });
  }
  refreshCard(itemId);
  updateCartBadge();
  updateSendBtn();
}

// ── CHANGE QTY ──────────────────────────────────────────────────────────────
function changeQty(key, delta, itemId) {
  const entry = cartItems.find(c => c.key === key);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) {
    cartItems = cartItems.filter(c => c.key !== key);
  }
  refreshCard(itemId);
  updateCartBadge();
  if (document.getElementById("cartPanel").classList.contains("open")) {
    renderCartItems();
  }
  updateSendBtn();
}

// ── REFRESH A SINGLE CARD ───────────────────────────────────────────────────
function refreshCard(itemId) {
  const item = findItem(itemId);
  if (!item) return;
  const card = document.getElementById(`card-${itemId}`);
  if (!card) return;

  const cat = findCategory(itemId);
  let newHTML;
  if (cat.id === "combos")        newHTML = renderComboCard(item);
  else if (item.type === "drink") newHTML = renderSmallCard(item);
  else                            newHTML = renderPizzaCard(item);

  card.outerHTML = newHTML;
}

// ── CART BADGE ──────────────────────────────────────────────────────────────
function updateCartBadge() {
  const total = cartItems.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById("cartBadge");
  badge.textContent = total;
  badge.classList.remove("pop");
  void badge.offsetWidth;
  badge.classList.add("pop");
}

// ── CART PANEL ──────────────────────────────────────────────────────────────
function openCart() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
  renderCartItems();
}

function closeCart() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function renderCartItems() {
  const container = document.getElementById("cartItems");

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🍽️</div>
        <p>Tu pedido está vacío.<br>¡Elige algo delicioso!</p>
      </div>`;
    document.getElementById("cartTotal").textContent = "$0.00";
    document.getElementById("cartSub").textContent = "0 productos";
    return;
  }

  let total = 0, totalQty = 0, html = "";

  cartItems.forEach(entry => {
    const linePrice = (entry.basePrice + entry.extras.reduce((s, e) => s + e.price, 0)) * entry.qty;
    total    += linePrice;
    totalQty += entry.qty;

    const metaParts = [];
    if (entry.sizeLabel) metaParts.push(entry.sizeLabel);
    if (entry.extras.length > 0) metaParts.push("+ " + entry.extras.map(e => e.name).join(", "));
    const metaText = metaParts.join(" · ");

    const imgHTML = entry.img
      ? `<img src="${entry.img}" alt="${entry.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : "";
    const placeholderHTML = `<div class="ci-img-placeholder" ${entry.img ? 'style="display:none"' : ""}>🍕</div>`;

    html += `
      <div class="ci">
        <div class="ci-img">${imgHTML}${placeholderHTML}</div>
        <div class="ci-info">
          <div class="ci-name">${entry.name}</div>
          ${metaText ? `<div class="ci-meta">${metaText}</div>` : ""}
          <div class="ci-price">${formatPrice(linePrice)}${entry.qty > 1 ? ` (${entry.qty} × ${formatPrice(entry.basePrice + entry.extras.reduce((s,e) => s+e.price, 0))})` : ""}</div>
        </div>
        <div class="ci-ctrl">
          <button class="qty-btn" onclick="cartChg('${entry.key}', -1)" aria-label="Quitar">−</button>
          <span class="qty-num">${entry.qty}</span>
          <button class="qty-btn" onclick="cartChg('${entry.key}', 1)" aria-label="Agregar">+</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  document.getElementById("cartTotal").textContent = formatPrice(total);
  document.getElementById("cartSub").textContent =
    `${totalQty} producto${totalQty !== 1 ? "s" : ""}`;
}

function cartChg(key, delta) {
  const entry = cartItems.find(c => c.key === key);
  if (!entry) return;
  const itemId = entry.itemId;
  entry.qty += delta;
  if (entry.qty <= 0) cartItems = cartItems.filter(c => c.key !== key);
  refreshCard(itemId);
  updateCartBadge();
  renderCartItems();
  updateSendBtn();
}

function updateSendBtn() {
  document.getElementById("waSendBtn").disabled = cartItems.length === 0;
}

// ── WHATSAPP MESSAGE ─────────────────────────────────────────────────────────
function sendWA() {
  if (!currentBranch || cartItems.length === 0) return;

  const name  = document.getElementById("custName").value.trim();
  const notes = document.getElementById("custNotes").value.trim();

  let total = 0;
  const lines = cartItems.map(entry => {
    const unitPrice = entry.basePrice + entry.extras.reduce((s, e) => s + e.price, 0);
    const lineTotal = unitPrice * entry.qty;
    total += lineTotal;

    const parts = [entry.name];
    if (entry.sizeLabel)     parts.push(`(${entry.sizeLabel})`);
    if (entry.extras.length) parts.push(`+ ${entry.extras.map(e => e.name).join(", ")}`);
    parts.push(`x${entry.qty}`);
    parts.push(`— ${formatPrice(lineTotal)}`);
    return "• " + parts.join(" ");
  });

  const greeting = name
    ? `Hola, soy *${name}*. Quisiera hacer el siguiente pedido:`
    : `Hola, quisiera hacer el siguiente pedido:`;

  let msg = `*FIORELLA B'PIZZAS*\n`;
  msg    += `Sucursal: *${currentBranch.name}*\n`;
  msg    += `${currentBranch.addr}\n`;
  msg    += `─────────────────────────\n`;
  msg    += `${greeting}\n\n`;
  msg    += lines.join("\n");
  msg    += `\n─────────────────────────\n`;
  msg    += `*Total estimado: ${formatPrice(total)}*\n`;
  if (notes) msg += `Notas: ${notes}\n`;
  msg    += `\nEl pago se realiza en sucursal. Gracias!`;

  const phone   = currentBranch.phones[0];
  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
}

// ── SCROLL SPY ───────────────────────────────────────────────────────────────
function scrollToCat(catId) {
  const el = document.getElementById(`cat-${catId}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  setActiveNav(catId);
}

function setActiveNav(catId) {
  document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`navbtn-${catId}`)?.classList.add("active");
}

function setupScrollSpy() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const catId = entry.target.id.replace("cat-", "");
        setActiveNav(catId);
      }
    });
  }, { rootMargin: "-30% 0px -65% 0px" });

  MENU.forEach(cat => {
    const el = document.getElementById(`cat-${cat.id}`);
    if (el) observer.observe(el);
  });
}

// ── FEEDBACK TOAST ───────────────────────────────────────────────────────────
function showAddedFeedback(name) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:var(--black); color:var(--cream); padding:10px 20px;
      border-radius:50px; font-size:0.82rem; font-weight:600;
      box-shadow:0 4px 20px rgba(0,0,0,0.3); z-index:500;
      opacity:0; transition:opacity 0.25s; white-space:nowrap;
      border:1px solid rgba(226,53,37,0.4);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = `${name} agregado al pedido`;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2200);
}

// ── CLOSE MODAL ON OVERLAY CLICK ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
  });
});
