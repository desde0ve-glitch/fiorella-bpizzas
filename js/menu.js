// ═══════════════════════════════════════════
//  menu.js — Menú, Carrito, Modal de Extras y WhatsApp
// ═══════════════════════════════════════════

// ── STATE ────────────────────────────────────────────────────────────────────
let currentBranch = null;
let cartItems     = [];   // [{ key, itemId, name, img, sizeLabel, basePrice, extras[], qty }]
let modalState    = null; // datos del producto abierto en modal
let selectedSizes = {};   // { itemId: sizeIndex }

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var branchId = sessionStorage.getItem('selectedBranch');
  currentBranch = BRANCHES.find(function(b){ return b.id === branchId; }) || BRANCHES[0];

  document.getElementById('headerBranchName').textContent = currentBranch.name;
  document.getElementById('cartBranchName').textContent   = currentBranch.name;

  renderCatNav();
  renderMenu();
  setupScrollSpy();

  document.getElementById('modalOverlay').addEventListener('click', function(e){
    if (e.target === e.currentTarget) closeModal();
  });
});

// ── CHANGE BRANCH ─────────────────────────────────────────────────────────────
function changeBranch() {
  window.location.href = 'index.html';
}

// ── CATEGORY NAV ─────────────────────────────────────────────────────────────
function renderCatNav() {
  var nav  = document.getElementById('catNav');
  var html = '<span class="cat-nav-title">Menú</span>';

  MENU.forEach(function(cat, i) {
    var active = i === 0 ? ' active' : '';
    html += '<button class="cat-btn' + active + '" id="navbtn-' + cat.id + '" onclick="scrollToCat(\'' + cat.id + '\')">'
          + '<span class="cat-ico">' + cat.icon + '</span>'
          + cat.name
          + '</button>';
  });

  nav.innerHTML = html;
}

// ── MENU RENDER ───────────────────────────────────────────────────────────────
function renderMenu() {
  var section = document.getElementById('menuSection');
  var out     = '';

  MENU.forEach(function(cat) {
    var isCombo = cat.id === 'combos';
    var isDrink = cat.id === 'bebidas';
    var gridCls = isDrink ? 'grid-3' : 'grid-2';
    var cards   = '';

    cat.items.forEach(function(item) {
      if (isCombo)            cards += renderComboCard(item);
      else if (isDrink)       cards += renderSmallCard(item);
      else                    cards += renderPizzaCard(item);
    });

    out += '<div class="category-section" id="cat-' + cat.id + '">'
         + '<div class="section-header">'
         +   '<div class="section-icon">' + cat.icon + '</div>'
         +   '<h2 class="section-title">' + cat.name + '</h2>'
         +   '<div class="section-line"></div>'
         + '</div>'
         + (cat.desc ? '<p class="section-desc">' + cat.desc + '</p>' : '')
         + '<div class="' + gridCls + '" id="grid-' + cat.id + '">'
         + cards
         + '</div></div>';
  });

  section.innerHTML = out;
}

// ─── PIZZA / SIZED CARD ───────────────────────────────────────────────────────
function renderPizzaCard(item) {
  var si      = selectedSizes[item.id] !== undefined ? selectedSizes[item.id] : 0;
  var size    = item.sizes[si];
  var cartKey = item.sizes.length > 1 ? item.id + '-' + si : item.id;
  var qty     = getQty(cartKey);
  var inCart  = qty > 0;

  // Image
  var imgHTML = '';
  if (item.img) {
    imgHTML = '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy"'
            + ' onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">';
  }
  var placeholder = '<div class="card-img-placeholder"' + (item.img ? ' style="display:none"' : '') + '>🍕</div>';

  // Size chips
  var sizeHTML = '';
  if (item.sizes.length > 1) {
    sizeHTML = '<div class="size-row">';
    item.sizes.forEach(function(s, i) {
      var sel = i === si ? ' selected' : '';
      sizeHTML += '<button class="size-chip' + sel + '" onclick="selectSizeOnly(\'' + item.id + '\',' + i + ')">'
                + s.label + ' — ' + formatPrice(s.price)
                + '</button>';
    });
    sizeHTML += '</div>';
  } else {
    sizeHTML = '<div class="size-row"><span class="size-chip selected">' + size.label + ' — ' + formatPrice(size.price) + '</span></div>';
  }

  // Controls
  var controls = '';
  if (inCart) {
    controls = '<div class="qty-controls">'
             + '<button class="qty-btn" onclick="changeQty(\'' + cartKey + '\',-1,\'' + item.id + '\')">−</button>'
             + '<span class="qty-num">' + qty + '</span>'
             + '<button class="qty-btn" onclick="changeQty(\'' + cartKey + '\',1,\'' + item.id + '\')">+</button>'
             + '</div>';
  } else {
    controls = '<button class="add-btn" onclick="openModal(\'' + item.id + '\',' + si + ')">+ Agregar</button>';
  }

  return '<div class="item-card' + (inCart ? ' in-cart' : '') + '" id="card-' + item.id + '">'
       + '<div class="card-img">' + imgHTML + placeholder + '</div>'
       + '<div class="card-body">'
       + '<div class="card-name">' + item.name + '</div>'
       + '<div class="card-desc">' + item.desc + '</div>'
       + sizeHTML
       + '<div class="card-footer">'
       + '<span class="card-price">' + formatPrice(size.price) + '</span>'
       + controls
       + '</div></div></div>';
}

// ─── COMBO CARD ───────────────────────────────────────────────────────────────
function renderComboCard(item) {
  var qty    = getQty(item.id);
  var inCart = qty > 0;

  var controls = '';
  if (inCart) {
    controls = '<div class="combo-qty-controls">'
             + '<button class="combo-qty-btn" onclick="changeQty(\'' + item.id + '\',-1,\'' + item.id + '\')">−</button>'
             + '<span class="combo-qty-num">' + qty + '</span>'
             + '<button class="combo-qty-btn" onclick="changeQty(\'' + item.id + '\',1,\'' + item.id + '\')">+</button>'
             + '</div>';
  } else {
    controls = '<button class="combo-add-btn" onclick="openModal(\'' + item.id + '\')">+ Agregar</button>';
  }

  return '<div class="combo-card' + (inCart ? ' in-cart' : '') + '" id="card-' + item.id + '">'
       + '<span class="combo-tag">Combo</span>'
       + '<div class="combo-name">' + item.name + '</div>'
       + '<div class="combo-contents">' + item.desc + '</div>'
       + '<div class="combo-footer">'
       + '<span class="combo-price">' + formatPrice(item.price) + '</span>'
       + controls
       + '</div></div>';
}

// ─── SMALL CARD (bebidas) ────────────────────────────────────────────────────
function renderSmallCard(item) {
  var qty    = getQty(item.id);
  var inCart = qty > 0;

  var imgHTML = '';
  if (item.img) {
    imgHTML = '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy"'
            + ' onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">';
  }
  var placeholder = '<div class="small-img-placeholder"' + (item.img ? ' style="display:none"' : '') + '>🥤</div>';

  var controls = '';
  if (inCart) {
    controls = '<div class="qty-controls">'
             + '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\',-1,\'' + item.id + '\')">−</button>'
             + '<span class="qty-num">' + qty + '</span>'
             + '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\',1,\'' + item.id + '\')">+</button>'
             + '</div>';
  } else {
    controls = '<button class="add-btn" style="font-size:0.74rem;padding:7px 11px" onclick="addDirect(\'' + item.id + '\')">+ Agregar</button>';
  }

  return '<div class="small-card' + (inCart ? ' in-cart' : '') + '" id="card-' + item.id + '">'
       + '<div class="small-img">' + imgHTML + placeholder + '</div>'
       + '<div class="small-name">' + item.name + '</div>'
       + '<div class="small-price">' + formatPrice(item.price) + '</div>'
       + '<div class="small-footer">' + controls + '</div>'
       + '</div>';
}

// ── SELECT SIZE (sin abrir modal) ─────────────────────────────────────────────
function selectSizeOnly(itemId, si) {
  selectedSizes[itemId] = si;
  refreshCard(itemId);
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function openModal(itemId, forceSizeIdx) {
  var item = findItem(itemId);
  if (!item) return;

  var si = forceSizeIdx !== undefined ? forceSizeIdx : (selectedSizes[itemId] || 0);

  modalState = {
    itemId: itemId,
    selectedSizeIdx: si,
    selectedExtras: [],
  };

  renderModal(item);
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  modalState = null;
}

function renderModal(item) {
  var isCombo   = item.type === 'combo';
  var si        = modalState.selectedSizeIdx;
  var size      = item.sizes ? item.sizes[si] : null;
  var basePrice = isCombo ? item.price : size.price;

  document.getElementById('modalProductName').textContent  = item.name;
  document.getElementById('modalProductPrice').textContent = formatPrice(basePrice);

  var body = document.getElementById('modalBody');
  var html = '';

  // Sizes (solo si hay más de uno)
  if (item.sizes && item.sizes.length > 1) {
    html += '<div class="modal-section"><div class="modal-section-title">Elige tu tamaño</div><div class="modal-sizes" id="modalSizes">';
    item.sizes.forEach(function(s, i) {
      var sel = i === si ? ' selected' : '';
      html += '<button class="modal-size-btn' + sel + '" onclick="modalSelectSize(' + i + ')">'
            + s.label
            + '<span class="size-price">' + formatPrice(s.price) + '</span>'
            + '</button>';
    });
    html += '</div></div>';
  }

  // Extras (si aplica)
  if (item.allowExtras) {
    html += '<div class="modal-section"><div class="modal-section-title">Ingredientes adicionales (opcional)</div><div class="modal-extras" id="modalExtras">';
    EXTRAS.forEach(function(ex) {
      html += '<button class="modal-extra-btn" id="mextra-' + ex.id + '" onclick="modalToggleExtra(\'' + ex.id + '\')">'
            + '<div class="modal-extra-check" id="mextra-check-' + ex.id + '"></div>'
            + '<span class="extra-name">' + ex.name + '</span>'
            + '<span class="extra-price">+' + formatPrice(ex.price) + '</span>'
            + '</button>';
    });
    html += '</div></div>';
  }

  body.innerHTML = html;
  updateModalTotal();
}

function modalSelectSize(si) {
  modalState.selectedSizeIdx = si;
  var item = findItem(modalState.itemId);
  document.querySelectorAll('.modal-size-btn').forEach(function(btn, i) {
    btn.classList.toggle('selected', i === si);
  });
  document.getElementById('modalProductPrice').textContent = formatPrice(item.sizes[si].price);
  updateModalTotal();
}

function modalToggleExtra(extraId) {
  var idx = modalState.selectedExtras.indexOf(extraId);
  if (idx > -1) {
    modalState.selectedExtras.splice(idx, 1);
  } else {
    modalState.selectedExtras.push(extraId);
  }
  var on    = modalState.selectedExtras.indexOf(extraId) > -1;
  var btn   = document.getElementById('mextra-' + extraId);
  var check = document.getElementById('mextra-check-' + extraId);
  btn.classList.toggle('selected', on);
  check.textContent = on ? '✓' : '';
  updateModalTotal();
}

function updateModalTotal() {
  var item  = findItem(modalState.itemId);
  var si    = modalState.selectedSizeIdx;
  var base  = item.type === 'combo' ? item.price : item.sizes[si].price;
  var extra = 0;
  modalState.selectedExtras.forEach(function(exId) {
    var ex = EXTRAS.find(function(e){ return e.id === exId; });
    if (ex) extra += ex.price;
  });
  document.getElementById('modalTotal').textContent = formatPrice(base + extra);
}

function modalConfirm() {
  var item    = findItem(modalState.itemId);
  var si      = modalState.selectedSizeIdx;
  var isCombo = item.type === 'combo';

  var sizeLabel  = item.sizes ? item.sizes[si].label : null;
  var basePrice  = isCombo ? item.price : item.sizes[si].price;
  var cartKey    = (item.sizes && item.sizes.length > 1) ? item.id + '-' + si : item.id;

  var selectedExtrasArr = modalState.selectedExtras.map(function(exId) {
    return EXTRAS.find(function(e){ return e.id === exId; });
  }).filter(Boolean);

  var extrasKey = modalState.selectedExtras.slice().sort().join(',');
  var fullKey   = cartKey + (extrasKey ? ':' + extrasKey : '');

  var existing = cartItems.find(function(c){ return c.fullKey === fullKey; });
  if (existing) {
    existing.qty++;
  } else {
    cartItems.push({
      key:      cartKey,
      fullKey:  fullKey,
      itemId:   item.id,
      name:     item.name,
      img:      item.img || null,
      sizeLabel: sizeLabel,
      basePrice: basePrice,
      extras:   selectedExtrasArr,
      qty:      1,
    });
  }

  if (item.sizes && item.sizes.length > 1) selectedSizes[item.id] = si;

  closeModal();
  refreshCard(item.id);
  updateCartBadge();
  updateSendBtn();
  showAddedFeedback(item.name);
}

// ── ADD DIRECT (bebidas sin modal) ────────────────────────────────────────────
function addDirect(itemId) {
  var item = findItem(itemId);
  if (!item) return;
  var existing = cartItems.find(function(c){ return c.key === itemId; });
  if (existing) {
    existing.qty++;
  } else {
    cartItems.push({ key: itemId, fullKey: itemId, itemId: itemId,
      name: item.name, img: item.img || null,
      sizeLabel: null, basePrice: item.price, extras: [], qty: 1 });
  }
  refreshCard(itemId);
  updateCartBadge();
  updateSendBtn();
}

// ── CHANGE QTY ────────────────────────────────────────────────────────────────
function changeQty(key, delta, itemId) {
  var entry = cartItems.find(function(c){ return c.key === key; });
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) cartItems = cartItems.filter(function(c){ return c.key !== key; });
  refreshCard(itemId);
  updateCartBadge();
  if (document.getElementById('cartPanel').classList.contains('open')) renderCartItems();
  updateSendBtn();
}

// ── REFRESH CARD ─────────────────────────────────────────────────────────────
function refreshCard(itemId) {
  var item = findItem(itemId);
  if (!item) return;
  var card = document.getElementById('card-' + itemId);
  if (!card) return;
  var cat  = findCategory(itemId);
  var html = '';
  if (cat.id === 'combos')        html = renderComboCard(item);
  else if (item.type === 'drink') html = renderSmallCard(item);
  else                            html = renderPizzaCard(item);
  card.outerHTML = html;
}

// ── CART BADGE ────────────────────────────────────────────────────────────────
function updateCartBadge() {
  var total = cartItems.reduce(function(s,c){ return s + c.qty; }, 0);
  var badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
}

// ── CART PANEL ────────────────────────────────────────────────────────────────
function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartItems() {
  var container = document.getElementById('cartItems');

  if (cartItems.length === 0) {
    container.innerHTML = '<div class="cart-empty"><div class="empty-icon">🍽️</div><p>Tu pedido está vacío.<br>¡Elige algo delicioso!</p></div>';
    document.getElementById('cartTotal').textContent = '$0.00';
    document.getElementById('cartSub').textContent   = '0 productos';
    return;
  }

  var total    = 0;
  var totalQty = 0;
  var html     = '';

  cartItems.forEach(function(entry) {
    var unitPrice = entry.basePrice + entry.extras.reduce(function(s,e){ return s + e.price; }, 0);
    var linePrice = unitPrice * entry.qty;
    total    += linePrice;
    totalQty += entry.qty;

    var metaParts = [];
    if (entry.sizeLabel)      metaParts.push(entry.sizeLabel);
    if (entry.extras.length)  metaParts.push('+ ' + entry.extras.map(function(e){ return e.name; }).join(', '));
    var metaText = metaParts.join(' · ');

    var imgHTML = entry.img
      ? '<img src="' + entry.img + '" alt="' + entry.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
      : '';
    var placeholder = '<div class="ci-img-placeholder"' + (entry.img ? ' style="display:none"' : '') + '>🍕</div>';

    var qtyStr = entry.qty > 1 ? ' (' + entry.qty + ' × ' + formatPrice(unitPrice) + ')' : '';

    html += '<div class="ci">'
          + '<div class="ci-img">' + imgHTML + placeholder + '</div>'
          + '<div class="ci-info">'
          + '<div class="ci-name">' + entry.name + '</div>'
          + (metaText ? '<div class="ci-meta">' + metaText + '</div>' : '')
          + '<div class="ci-price">' + formatPrice(linePrice) + qtyStr + '</div>'
          + '</div>'
          + '<div class="ci-ctrl">'
          + '<button class="qty-btn" onclick="cartChg(\'' + entry.fullKey + '\',-1)">−</button>'
          + '<span class="qty-num">' + entry.qty + '</span>'
          + '<button class="qty-btn" onclick="cartChg(\'' + entry.fullKey + '\',1)">+</button>'
          + '</div></div>';
  });

  container.innerHTML = html;
  document.getElementById('cartTotal').textContent = formatPrice(total);
  document.getElementById('cartSub').textContent   = totalQty + ' producto' + (totalQty !== 1 ? 's' : '');
}

function cartChg(fullKey, delta) {
  var entry = cartItems.find(function(c){ return c.fullKey === fullKey; });
  if (!entry) return;
  var itemId = entry.itemId;
  entry.qty += delta;
  if (entry.qty <= 0) cartItems = cartItems.filter(function(c){ return c.fullKey !== fullKey; });
  refreshCard(itemId);
  updateCartBadge();
  renderCartItems();
  updateSendBtn();
}

function updateSendBtn() {
  document.getElementById('waSendBtn').disabled = cartItems.length === 0;
}

// ── WHATSAPP ─────────────────────────────────────────────────────────────────
function sendWA() {
  if (!currentBranch || cartItems.length === 0) return;

  var name  = document.getElementById('custName').value.trim();
  var notes = document.getElementById('custNotes').value.trim();
  var total = 0;

  var lines = cartItems.map(function(entry) {
    var unitPrice = entry.basePrice + entry.extras.reduce(function(s,e){ return s + e.price; }, 0);
    var lineTotal = unitPrice * entry.qty;
    total += lineTotal;

    var parts = [entry.name];
    if (entry.sizeLabel)     parts.push('(' + entry.sizeLabel + ')');
    if (entry.extras.length) parts.push('+ ' + entry.extras.map(function(e){ return e.name; }).join(', '));
    parts.push('x' + entry.qty);
    parts.push('— ' + formatPrice(lineTotal));
    return '• ' + parts.join(' ');
  });

  var greeting = name
    ? 'Hola, soy *' + name + '*. Quisiera hacer el siguiente pedido:'
    : 'Hola, quisiera hacer el siguiente pedido:';

  var msg = '*FIORELLA B\'PIZZAS*\n'
          + 'Sucursal: *' + currentBranch.name + '*\n'
          + currentBranch.addr + '\n'
          + '─────────────────────────\n'
          + greeting + '\n\n'
          + lines.join('\n')
          + '\n─────────────────────────\n'
          + '*Total estimado: ' + formatPrice(total) + '*\n'
          + (notes ? 'Notas: ' + notes + '\n' : '')
          + '\nEl pago se realiza en sucursal. Gracias!';

  var phone   = currentBranch.phones[0];
  var encoded = encodeURIComponent(msg);
  window.open('https://wa.me/' + phone + '?text=' + encoded, '_blank');
}

// ── SCROLL SPY ────────────────────────────────────────────────────────────────
function scrollToCat(catId) {
  var el = document.getElementById('cat-' + catId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setActiveNav(catId);
}

function setActiveNav(catId) {
  document.querySelectorAll('.cat-btn').forEach(function(btn){ btn.classList.remove('active'); });
  var nb = document.getElementById('navbtn-' + catId);
  if (nb) nb.classList.add('active');
}

function setupScrollSpy() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var catId = entry.target.id.replace('cat-', '');
        setActiveNav(catId);
      }
    });
  }, { rootMargin: '-30% 0px -65% 0px' });

  MENU.forEach(function(cat) {
    var el = document.getElementById('cat-' + cat.id);
    if (el) observer.observe(el);
  });
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showAddedFeedback(name) {
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);'
      + 'background:var(--black);color:var(--cream);padding:10px 20px;'
      + 'border-radius:50px;font-size:0.82rem;font-weight:600;'
      + 'box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:500;'
      + 'opacity:0;transition:opacity 0.25s;white-space:nowrap;'
      + 'border:1px solid rgba(226,53,37,0.4);';
    document.body.appendChild(toast);
  }
  toast.textContent = name + ' agregado al pedido';
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function(){ toast.style.opacity = '0'; }, 2200);
}
