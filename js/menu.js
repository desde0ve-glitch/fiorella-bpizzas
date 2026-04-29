// ═══════════════════════════════════════════
//  menu.js — Fiorella B'Pizzas
// ═══════════════════════════════════════════

var currentBranch = null;
var cartItems     = [];
var modalState    = null;
var selectedSizes = {};
var currentCat    = 'combos';

// Variables del mapa — declaradas UNA sola vez
var userLocation  = null;
var mapInstance   = null;
var mapMarker     = null;
var mapInstance2  = null;
var mapMarker2    = null;
var userLocation2 = null;

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  loadMenuFromSupabase().then(function(data) {
    window.BRANCHES = data.BRANCHES;
    window.MENU     = data.MENU;
    window.EXTRAS   = data.EXTRAS;

    var branchId = sessionStorage.getItem('selectedBranch');
    currentBranch = null;
    for (var i = 0; i < BRANCHES.length; i++) {
      if (BRANCHES[i].id === branchId) { currentBranch = BRANCHES[i]; break; }
    }
    if (!currentBranch) currentBranch = BRANCHES[0];

    document.getElementById('cartBranchName').textContent = currentBranch.name;

    renderCatNav();

    if (window.innerWidth <= 700) {
      renderAllCategories();
    } else {
      showCategory('combos');
    }

    document.getElementById('modalOverlay').addEventListener('click', function(e){
      if (e.target === e.currentTarget) closeModal();
    });

    var mapOverlay = document.getElementById('mapModalOverlay');
    if (mapOverlay) {
      mapOverlay.addEventListener('click', function(e) {
        if (e.target === this) closeMapModal();
      });
    }

  }).catch(function(err) {
    console.error('Error cargando menú:', err);
  });
});

// ── HELPERS ──────────────────────────────────────────────────────────────────
function formatPrice(n) {
  return '$' + (n % 1 === 0 ? n : n.toFixed(2));
}
function findItem(itemId) {
  for (var i = 0; i < MENU.length; i++) {
    for (var j = 0; j < MENU[i].items.length; j++) {
      if (MENU[i].items[j].id === itemId) return MENU[i].items[j];
    }
  }
  return null;
}
function findCategory(itemId) {
  for (var i = 0; i < MENU.length; i++) {
    for (var j = 0; j < MENU[i].items.length; j++) {
      if (MENU[i].items[j].id === itemId) return MENU[i];
    }
  }
  return null;
}
function getCartQty(key) {
  for (var i = 0; i < cartItems.length; i++) {
    if (cartItems[i].key === key) return cartItems[i].qty;
  }
  return 0;
}

// ── CATEGORY NAV ─────────────────────────────────────────────────────────────
function renderCatNav() {
  var nav = document.getElementById('catNav');
  var icons = {
    combos:  '<img class="cat-icon" src="images/icono-combos.png" alt="">',
    pizzas:  '<img class="cat-icon" src="images/icono-pizzas.png" alt="">',
    otros:   '<img class="cat-icon" src="images/icono-calzones.png" alt="">',
    bebidas: '<img class="cat-icon" src="images/icono-bebidas.png" alt="">',
  };
  var html = '';
  for (var i = 0; i < MENU.length; i++) {
    var cat = MENU[i];
    html += '<button class="cat-btn" id="navbtn-' + cat.id + '" onclick="showCategory(\'' + cat.id + '\')">'
          + (icons[cat.id] || '<span class="cat-icon">·</span>')
          + cat.name
          + '</button>';
  }
  html += '<button class="cat-btn" id="navbtn-ordenes" onclick="showCategory(\'ordenes\')">'
        + '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>'
        + 'Mi pedido'
        + '</button>';
  nav.innerHTML = html;
}

// ── SHOW CATEGORY ─────────────────────────────────────────────────────────────
function showCategory(catId) {
  currentCat = catId;

  var btns = document.querySelectorAll('.cat-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  var nb = document.getElementById('navbtn-' + catId);
  if (nb) nb.classList.add('active');

  // En móvil hacer scroll a la sección
  if (window.innerWidth <= 700 && catId !== 'ordenes') {
    var target = document.getElementById('grid-' + catId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    renderAllCategories();
    setTimeout(function() {
      var t = document.getElementById('grid-' + catId);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return;
  }

  // Mi pedido
  if (catId === 'ordenes') {
    var hero = document.getElementById('heroBanner');
    hero.classList.add('hidden');
    var area = document.getElementById('productsArea');
    area.innerHTML = renderCartPanel();
    updateCartInline();
    return;
  }

  // Hero banner solo en combos
  var hero = document.getElementById('heroBanner');
  if (catId === 'combos') hero.classList.remove('hidden');
  else hero.classList.add('hidden');

  var area = document.getElementById('productsArea');
  var cat = null;
  for (var j = 0; j < MENU.length; j++) {
    if (MENU[j].id === catId) { cat = MENU[j]; break; }
  }
  if (!cat) { area.innerHTML = ''; return; }

  var html = '';
  if (catId === 'combos') {
    html = '<div class="combos-grid" id="grid-' + catId + '">';
    for (var k = 0; k < cat.items.length; k++) html += renderComboCard(cat.items[k]);
    html += '</div>';
  } else if (catId === 'bebidas') {
    html = '<div class="drinks-grid" id="grid-' + catId + '">';
    for (var k = 0; k < cat.items.length; k++) html += renderDrinkCard(cat.items[k]);
    html += '</div>';
  } else {
    html = '<div class="pizza-grid" id="grid-' + catId + '">';
    for (var k = 0; k < cat.items.length; k++) html += renderPizzaCard(cat.items[k]);
    html += '</div>';
  }
  area.innerHTML = html;
}

// ── RENDER ALL CATEGORIES (móvil) ────────────────────────────────────────────
function renderAllCategories() {
  var hero = document.getElementById('heroBanner');
  hero.classList.remove('hidden');
  var area = document.getElementById('productsArea');
  var html = '';
  for (var i = 0; i < MENU.length; i++) {
    var cat = MENU[i];
    html += '<div class="cat-section">'
          + '<h3 class="cat-section-title">' + cat.name + '</h3>';
    if (cat.id === 'combos') {
      html += '<div class="combos-grid" id="grid-combos">';
      for (var k = 0; k < cat.items.length; k++) html += renderComboCard(cat.items[k]);
      html += '</div>';
    } else if (cat.id === 'bebidas') {
      html += '<div class="drinks-grid" id="grid-bebidas">';
      for (var k = 0; k < cat.items.length; k++) html += renderDrinkCard(cat.items[k]);
      html += '</div>';
    } else {
      html += '<div class="pizza-grid" id="grid-' + cat.id + '">';
      for (var k = 0; k < cat.items.length; k++) html += renderPizzaCard(cat.items[k]);
      html += '</div>';
    }
    html += '</div>';
  }
  area.innerHTML = html;
  setTimeout(initScrollSpy, 200);

  // Activar primer botón
  var btns = document.querySelectorAll('.cat-btn');
  for (var b = 0; b < btns.length; b++) btns[b].classList.remove('active');
  var nb = document.getElementById('navbtn-combos');
  if (nb) nb.classList.add('active');
}

// ── SCROLL SPY ────────────────────────────────────────────────────────────────
function initScrollSpy() {
  var grids = document.querySelectorAll('[id^="grid-"]');
  if (!grids.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var catId = entry.target.id.replace('grid-', '');
        var btns = document.querySelectorAll('.cat-btn');
        for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
        var nb = document.getElementById('navbtn-' + catId);
        if (nb) nb.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  grids.forEach(function(grid) { observer.observe(grid); });
}

// ── COMBO CARD ────────────────────────────────────────────────────────────────
function renderComboCard(item) {
  var qty    = getCartQty(item.id);
  var inCart = qty > 0;
  var imgHTML = item.img
    ? '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
    : '';
  var controls = inCart
    ? '<div class="combo-qty-controls">'
      + '<button class="combo-qty-btn" onclick="changeQty(\'' + item.id + '\',-1,\'' + item.id + '\')">−</button>'
      + '<span class="combo-qty-num">' + qty + '</span>'
      + '<button class="combo-qty-btn" onclick="changeQty(\'' + item.id + '\',1,\'' + item.id + '\')">+</button>'
      + '</div>'
    : '<button class="combo-add-btn" onclick="openModal(\'' + item.id + '\')">'
      + 'Añadir <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
      + '</button>';

  return '<div class="combo-card" id="card-' + item.id + '">'
       + '<div class="combo-card-img">'
       + imgHTML
       + '<div class="combo-card-img-placeholder"' + (item.img ? ' style="display:none"' : '') + '>🍕</div>'
       + '</div>'
       + '<div class="combo-card-body">'
       + '<div class="combo-card-name">' + item.name + '</div>'
       + '<div class="combo-card-desc">' + item.desc + '</div>'
       + '<div class="combo-card-footer">'
       + '<div class="combo-price-box">' + formatPrice(item.price) + '</div>'
       + controls
       + '</div></div></div>';
}

// ── PIZZA CARD ────────────────────────────────────────────────────────────────
function renderPizzaCard(item) {
  var si      = selectedSizes[item.id] !== undefined ? selectedSizes[item.id] : 0;
  var size    = item.sizes[si];
  var cartKey = item.sizes.length > 1 ? item.id + '-' + si : item.id;
  var qty     = getCartQty(cartKey);
  var inCart  = qty > 0;

  var imgHTML = item.img
    ? '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.style.display=\'none\'">'
    : '';

  var sizeClass = (item.sizes && item.sizes.length > 1) ? 'size-chips multiple' : 'size-chips';
  var sizeHTML = '';
  if (item.sizes.length > 1) {
    for (var i = 0; i < item.sizes.length; i++) {
      var cls = i === si ? 'size-chip' : 'size-chip inactive';
      sizeHTML += '<button class="' + cls + '" onclick="selectSizeOnly(\'' + item.id + '\',' + i + ')">'
               + item.sizes[i].label + '</button>';
    }
  } else {
    sizeHTML = '<span class="size-chip">' + size.label + '</span>';
  }

  var controls = inCart
    ? '<div class="pizza-qty-controls">'
      + '<button class="pizza-qty-btn" onclick="changeQty(\'' + cartKey + '\',-1,\'' + item.id + '\')">−</button>'
      + '<span class="pizza-qty-num">' + qty + '</span>'
      + '<button class="pizza-qty-btn" onclick="changeQty(\'' + cartKey + '\',1,\'' + item.id + '\')">+</button>'
      + '</div>'
    : '<button class="pizza-add-btn" onclick="openModal(\'' + item.id + '\',' + si + ')">'
      + 'Añadir <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
      + '</button>';

  return '<div class="pizza-card" id="card-' + item.id + '">'
       + '<div class="pizza-card-img"><div class="pizza-card-img-bg"></div>' + imgHTML + '</div>'
       + '<div class="pizza-card-body">'
       + '<div class="pizza-card-name">' + item.name + '</div>'
       + '<div class="pizza-card-desc">' + item.desc + '</div>'
       + '<div class="' + sizeClass + '">' + sizeHTML + '</div>'
       + '<div class="pizza-card-footer">'
       + '<div class="pizza-price-box">' + formatPrice(size.price) + '</div>'
       + controls
       + '</div></div></div>';
}

// ── DRINK CARD ────────────────────────────────────────────────────────────────
function renderDrinkCard(item) {
  var qty    = getCartQty(item.id);
  var inCart = qty > 0;
  var imgHTML = item.img
    ? '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.style.display=\'none\'">'
    : '<span style="font-size:2rem">🥤</span>';

  var controls = inCart
    ? '<div class="drink-qty-controls">'
      + '<button class="drink-qty-btn" onclick="changeQty(\'' + item.id + '\',-1,\'' + item.id + '\')">−</button>'
      + '<span class="drink-qty-num">' + qty + '</span>'
      + '<button class="drink-qty-btn" onclick="changeQty(\'' + item.id + '\',1,\'' + item.id + '\')">+</button>'
      + '</div>'
    : '<button class="drink-add-btn" onclick="addDirect(\'' + item.id + '\')">'
      + 'Añadir <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
      + '</button>';

  return '<div class="drink-card" id="card-' + item.id + '">'
       + '<div class="drink-card-img">' + imgHTML + '</div>'
       + '<div class="drink-card-name">' + item.name + '</div>'
       + '<div class="drink-card-footer">'
       + '<div class="drink-price-box">' + formatPrice(item.price) + '</div>'
       + controls
       + '</div></div>';
}

// ── SELECT SIZE ───────────────────────────────────────────────────────────────
function selectSizeOnly(itemId, si) {
  selectedSizes[itemId] = si;
  refreshCard(itemId);
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function openModal(itemId, forceSizeIdx) {
  var item = findItem(itemId);
  if (!item) return;
  var si = forceSizeIdx !== undefined ? forceSizeIdx : (selectedSizes[itemId] || 0);
  modalState = { itemId: itemId, selectedSizeIdx: si, selectedExtras: {} };
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
  var basePrice = isCombo ? item.price : item.sizes[si].price;

  document.getElementById('modalProductName').textContent  = item.name;
  document.getElementById('modalProductPrice').textContent = formatPrice(basePrice);

  var html = '';

  if (item.sizes && item.sizes.length > 1) {
    html += '<div class="modal-section"><div class="modal-section-title">Elige tu tamaño</div><div class="modal-sizes">';
    for (var i = 0; i < item.sizes.length; i++) {
      var sel = i === si ? ' selected' : '';
      html += '<button class="modal-size-btn' + sel + '" onclick="modalSelectSize(' + i + ')">'
            + item.sizes[i].label
            + '<span class="size-price">' + formatPrice(item.sizes[i].price) + '</span>'
            + '</button>';
    }
    html += '</div></div>';
  }

  if (item.allowExtras) {
    var freeCount = item.freeExtras || 0;
    if (freeCount > 0) {
      var freeList = [], paidList = [];
      for (var j = 0; j < EXTRAS.length; j++) {
        if (EXTRAS[j].price <= 1.0) freeList.push(EXTRAS[j]);
        else paidList.push(EXTRAS[j]);
      }
      html += '<div class="modal-section">';
      html += '<div class="modal-section-title">Incluido en el combo</div>';
      html += '<div class="modal-free-note" id="modalFreeNote">Puedes elegir hasta <strong>' + freeCount + '</strong> ingrediente' + (freeCount > 1 ? 's' : '') + ' gratis</div>';
      html += '<div class="modal-extras">';
      for (var f = 0; f < freeList.length; f++) {
        html += buildExtraRow(freeList[f], 'Gratis', true);
      }
      html += '</div></div>';
      if (paidList.length > 0) {
        html += '<div class="modal-section"><div class="modal-section-title">Con costo adicional</div><div class="modal-extras">';
        for (var p = 0; p < paidList.length; p++) {
          html += buildExtraRow(paidList[p], '+' + formatPrice(paidList[p].price), false);
        }
        html += '</div></div>';
      }
    } else {
      html += '<div class="modal-section"><div class="modal-section-title">Ingredientes adicionales</div><div class="modal-extras">';
      for (var k = 0; k < EXTRAS.length; k++) {
        html += buildExtraRow(EXTRAS[k], '+' + formatPrice(EXTRAS[k].price), false);
      }
      html += '</div></div>';
    }
  }

  document.getElementById('modalBody').innerHTML = html;
  updateModalTotal();
}

function buildExtraRow(ex, priceLabel, isFree) {
  var priceClass = isFree ? 'extra-price extra-free-tag' : 'extra-price';
  return '<div class="modal-extra-row" id="mextra-' + ex.id + '">'
       + '<button class="modal-extra-btn" onclick="modalToggleExtra(\'' + ex.id + '\')">'
       + '<span class="extra-name">' + ex.name + '</span>'
       + '<span class="' + priceClass + '" id="mextra-price-' + ex.id + '">' + priceLabel + '</span>'
       + '</button>'
       + '<div class="mextra-qty-controls" id="mextra-qty-' + ex.id + '" style="display:none">'
       + '<button class="mextra-minus" onclick="extraMinus(\'' + ex.id + '\')">−</button>'
       + '<span class="mextra-num" id="mextra-check-' + ex.id + '">0</span>'
       + '<button class="mextra-plus" onclick="modalToggleExtra(\'' + ex.id + '\')">+</button>'
       + '</div></div>';
}

function modalSelectSize(si) {
  modalState.selectedSizeIdx = si;
  var item = findItem(modalState.itemId);
  var btns = document.querySelectorAll('.modal-size-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('selected', i === si);
  document.getElementById('modalProductPrice').textContent = formatPrice(item.sizes[si].price);
  updateModalTotal();
}

function modalToggleExtra(extraId) {
  if (!modalState.selectedExtras) modalState.selectedExtras = {};
  var current = modalState.selectedExtras[extraId] || 0;
  var ex = null;
  for (var j = 0; j < EXTRAS.length; j++) {
    if (EXTRAS[j].id === extraId) { ex = EXTRAS[j]; break; }
  }
  if (!ex) return;
  if (current === 0) {
    modalState.selectedExtras[extraId] = 1;
    var numEl = document.getElementById('mextra-check-' + extraId);
    var qtyEl = document.getElementById('mextra-qty-' + extraId);
    var rowEl = document.getElementById('mextra-' + extraId);
    if (numEl) numEl.textContent = '1';
    if (qtyEl) qtyEl.style.display = 'flex';
    if (rowEl) rowEl.classList.add('selected');
  } else {
    modalState.selectedExtras[extraId] = current + 1;
    var numEl2 = document.getElementById('mextra-check-' + extraId);
    if (numEl2) numEl2.textContent = current + 1;
  }
  updateModalTotal();
}

function extraMinus(extraId) {
  var current = (modalState.selectedExtras && modalState.selectedExtras[extraId]) || 0;
  if (current <= 0) return;
  modalState.selectedExtras[extraId] = current - 1;
  var numEl = document.getElementById('mextra-check-' + extraId);
  var qtyEl = document.getElementById('mextra-qty-' + extraId);
  var rowEl = document.getElementById('mextra-' + extraId);
  if (current - 1 === 0) {
    if (numEl) numEl.textContent = '0';
    if (qtyEl) qtyEl.style.display = 'none';
    if (rowEl) rowEl.classList.remove('selected');
  } else {
    if (numEl) numEl.textContent = current - 1;
  }
  updateModalTotal();
}

function updateModalTotal() {
  var item      = findItem(modalState.itemId);
  var si        = modalState.selectedSizeIdx;
  var base      = item.type === 'combo' ? item.price : item.sizes[si].price;
  var freeCount = item.freeExtras || 0;
  var extra     = 0;
  var freeUsed  = 0;

  for (var j = 0; j < EXTRAS.length; j++) {
    var ex  = EXTRAS[j];
    var qty = (modalState.selectedExtras && modalState.selectedExtras[ex.id]) || 0;
    if (qty === 0) continue;
    for (var u = 0; u < qty; u++) {
      if (freeCount > 0 && ex.price <= 1.0 && freeUsed < freeCount) { freeUsed++; }
      else { extra += ex.price; }
    }
  }

  for (var f = 0; f < EXTRAS.length; f++) {
    var ef = EXTRAS[f];
    var tag = document.getElementById('mextra-' + ef.id);
    if (!tag) continue;
    var priceSpan = tag.querySelector('.extra-price');
    if (!priceSpan) continue;
    if (freeCount > 0 && ef.price <= 1.0) {
      if (freeUsed < freeCount) {
        priceSpan.textContent = 'Gratis';
        priceSpan.className   = 'extra-price extra-free-tag';
      } else {
        priceSpan.textContent = '+' + formatPrice(ef.price);
        priceSpan.className   = 'extra-price';
      }
    }
  }

  var note = document.getElementById('modalFreeNote');
  if (note && freeCount > 0) {
    var remaining = freeCount - freeUsed;
    if (remaining > 0) {
      note.innerHTML = 'Puedes elegir <strong>' + remaining + '</strong> ingrediente' + (remaining > 1 ? 's' : '') + ' gratis más';
      note.style.cssText = '';
    } else {
      note.innerHTML = 'Ya elegiste tu' + (freeCount > 1 ? 's ' + freeCount : '') + ' ingrediente' + (freeCount > 1 ? 's' : '') + ' gratis. Los siguientes tienen costo.';
      note.style.background  = 'rgba(255,48,43,0.06)';
      note.style.borderColor = 'var(--red-btn)';
      note.style.color       = 'var(--muted)';
    }
  }

  document.getElementById('modalTotal').textContent = formatPrice(base + extra);
}

function modalConfirm() {
  var item      = findItem(modalState.itemId);
  var si        = modalState.selectedSizeIdx;
  var isCombo   = item.type === 'combo';
  var sizeLabel = item.sizes ? item.sizes[si].label : null;
  var basePrice = isCombo ? item.price : item.sizes[si].price;
  var cartKey   = (item.sizes && item.sizes.length > 1) ? item.id + '-' + si : item.id;
  var freeCount = item.freeExtras || 0;
  var freeUsed  = 0;
  var selectedExtrasArr = [];

  for (var j = 0; j < EXTRAS.length; j++) {
    var ex  = EXTRAS[j];
    var qty = (modalState.selectedExtras && modalState.selectedExtras[ex.id]) || 0;
    if (qty === 0) continue;
    for (var u = 0; u < qty; u++) {
      var exCopy = { id: ex.id, name: ex.name, price: ex.price };
      if (freeCount > 0 && ex.price <= 1.0 && freeUsed < freeCount) {
        exCopy.price = 0; exCopy.name = ex.name + ' (incl.)'; freeUsed++;
      }
      selectedExtrasArr.push(exCopy);
    }
  }

  var extrasKey = JSON.stringify(modalState.selectedExtras || {});
  var fullKey   = cartKey + ':' + extrasKey;
  var existing  = null;
  for (var k = 0; k < cartItems.length; k++) {
    if (cartItems[k].fullKey === fullKey) { existing = cartItems[k]; break; }
  }

  if (existing) { existing.qty++; }
  else {
    cartItems.push({ key: cartKey, fullKey: fullKey, itemId: item.id,
      name: item.name, img: item.img || null, sizeLabel: sizeLabel,
      basePrice: basePrice, extras: selectedExtrasArr, qty: 1 });
  }

  if (item.sizes && item.sizes.length > 1) selectedSizes[item.id] = si;

  closeModal();
  refreshCard(item.id);
  updateCartBadge();
  updateSendBtn();
  showAddedFeedback(item.name);
}

// ── ADD DIRECT ────────────────────────────────────────────────────────────────
function addDirect(itemId) {
  var item = findItem(itemId);
  if (!item) return;
  var existing = null;
  for (var i = 0; i < cartItems.length; i++) {
    if (cartItems[i].key === itemId) { existing = cartItems[i]; break; }
  }
  if (existing) { existing.qty++; }
  else {
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
  for (var i = 0; i < cartItems.length; i++) {
    if (cartItems[i].key === key) {
      cartItems[i].qty += delta;
      if (cartItems[i].qty <= 0) cartItems.splice(i, 1);
      break;
    }
  }
  refreshCard(itemId);
  updateCartBadge();
  if (document.getElementById('cartPanel').classList.contains('open')) renderCartItems();
  updateSendBtn();
}

// ── REFRESH CARD ──────────────────────────────────────────────────────────────
function refreshCard(itemId) {
  var item = findItem(itemId);
  if (!item) return;
  var card = document.getElementById('card-' + itemId);
  if (!card) return;
  var cat = findCategory(itemId);
  var html = '';
  if (cat.id === 'combos')       html = renderComboCard(item);
  else if (cat.id === 'bebidas') html = renderDrinkCard(item);
  else                           html = renderPizzaCard(item);
  card.outerHTML = html;
}

// ── CART BADGE ────────────────────────────────────────────────────────────────
function updateCartBadge() {
  var total = 0;
  for (var i = 0; i < cartItems.length; i++) total += cartItems[i].qty;
  var badge    = document.getElementById('cartBadge');
  var fabBadge = document.getElementById('cartFabBadge');
  if (badge)    badge.textContent    = total;
  if (fabBadge) fabBadge.textContent = total;
}

// ── CART PANEL ────────────────────────────────────────────────────────────────
function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
  setupCartFocusScroll();
  initDragHandle();
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
  var total = 0, totalQty = 0, html = '';
  for (var i = 0; i < cartItems.length; i++) {
    var entry    = cartItems[i];
    var extraSum = 0;
    for (var j = 0; j < entry.extras.length; j++) extraSum += entry.extras[j].price;
    var unitPrice = entry.basePrice + extraSum;
    var linePrice = unitPrice * entry.qty;
    total    += linePrice;
    totalQty += entry.qty;
    var metaParts = [];
    if (entry.sizeLabel) metaParts.push(entry.sizeLabel);
    if (entry.extras.length) {
      var extraNames = [];
      for (var k = 0; k < entry.extras.length; k++) extraNames.push(entry.extras[k].name);
      metaParts.push('+ ' + extraNames.join(', '));
    }
    var metaText = metaParts.join(' · ');
    var qtyStr   = entry.qty > 1 ? ' (' + entry.qty + ' x ' + formatPrice(unitPrice) + ')' : '';
    var imgHTML  = entry.img ? '<img src="' + entry.img + '" alt="' + entry.name + '" onerror="this.style.display=\'none\'">' : '';
    var ph       = '<div class="ci-img-placeholder"' + (entry.img ? ' style="display:none"' : '') + '>🍕</div>';
    html += '<div class="ci">'
          + '<div class="ci-img">' + imgHTML + ph + '</div>'
          + '<div class="ci-info">'
          + '<div class="ci-name">' + entry.name + '</div>'
          + (metaText ? '<div class="ci-meta">' + metaText + '</div>' : '')
          + '<div class="ci-price">' + formatPrice(linePrice) + qtyStr + '</div>'
          + '</div>'
          + '<div class="ci-ctrl">'
          + '<button class="pizza-qty-btn" onclick="cartChg(\'' + entry.fullKey + '\',-1)">−</button>'
          + '<span class="pizza-qty-num">' + entry.qty + '</span>'
          + '<button class="pizza-qty-btn" onclick="cartChg(\'' + entry.fullKey + '\',1)">+</button>'
          + '</div></div>';
  }
  container.innerHTML = html;
  document.getElementById('cartTotal').textContent = formatPrice(total);
  document.getElementById('cartSub').textContent   = totalQty + ' producto' + (totalQty !== 1 ? 's' : '');
}

function cartChg(fullKey, delta) {
  var itemId = null;
  for (var i = 0; i < cartItems.length; i++) {
    if (cartItems[i].fullKey === fullKey) {
      itemId = cartItems[i].itemId;
      cartItems[i].qty += delta;
      if (cartItems[i].qty <= 0) cartItems.splice(i, 1);
      break;
    }
  }
  if (itemId) refreshCard(itemId);
  updateCartBadge();
  renderCartItems();
  updateSendBtn();
}

function updateSendBtn() {
  document.getElementById('waSendBtn').disabled = cartItems.length === 0;
}

// ── ORDER TYPE ────────────────────────────────────────────────────────────────
function selectOrderType(type) {
  var btnPickup     = document.getElementById('btnPickup');
  var btnDelivery   = document.getElementById('btnDelivery');
  var locationField = document.getElementById('locationField');
  if (type === 'pickup') {
    btnPickup.classList.add('active');
    btnDelivery.classList.remove('active');
    if (locationField) locationField.style.display = 'none';
  } else {
    btnDelivery.classList.add('active');
    btnPickup.classList.remove('active');
    if (locationField) locationField.style.display = 'block';
    setTimeout(function() {
      loadMap();
      if (mapInstance) google.maps.event.trigger(mapInstance, 'resize');
    }, 100);
  }
}

function selectOrderType2(type) {
  var btnPickup2     = document.getElementById('btnPickup2');
  var btnDelivery2   = document.getElementById('btnDelivery2');
  var locationField2 = document.getElementById('locationField2');
  if (type === 'pickup') {
    btnPickup2.classList.add('active');
    btnDelivery2.classList.remove('active');
    if (locationField2) locationField2.style.display = 'none';
  } else {
    btnDelivery2.classList.add('active');
    btnPickup2.classList.remove('active');
    if (locationField2) locationField2.style.display = 'block';
    setTimeout(function() { loadMap2(); }, 100);
  }
}

function getOrderType() {
  var btnDelivery = document.getElementById('btnDelivery');
  return btnDelivery && btnDelivery.classList.contains('active') ? 'delivery' : 'pickup';
}

// ── GOOGLE MAPS ───────────────────────────────────────────────────────────────
function initMap() {}

function openMapModal() {
  document.getElementById('mapModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(function() {
    loadMap();
    if (mapInstance) google.maps.event.trigger(mapInstance, 'resize');
  }, 100);
}

function closeMapModal() {
  document.getElementById('mapModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmMapLocation() {
  if (userLocation) {
    document.getElementById('locationStatus').textContent = '📍 Ubicación confirmada';
    document.getElementById('openMapBtn').textContent = '✅ Ubicación seleccionada — cambiar';
    document.getElementById('openMapBtn').style.borderColor = 'var(--green)';
    document.getElementById('openMapBtn').style.color = 'var(--green)';
  }
  closeMapModal();
}

function loadMap() {
  if (mapInstance) return;
  var defaultPos = { lat: 10.2442, lng: -67.5947 };
  mapInstance = new google.maps.Map(document.getElementById('map'), {
    center: defaultPos, zoom: 14,
    disableDefaultUI: true, zoomControl: true,
  });
  mapMarker = new google.maps.Marker({
    position: defaultPos, map: mapInstance, draggable: true, title: 'Tu ubicación',
  });
  userLocation = defaultPos;

  var input = document.getElementById('mapSearch');
  if (input) {
    var autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 've' },
      fields: ['geometry', 'name'],
    });
    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) return;
      mapInstance.setCenter(place.geometry.location);
      mapInstance.setZoom(16);
      mapMarker.setPosition(place.geometry.location);
      userLocation = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    });
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var realPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      mapInstance.setCenter(realPos);
      mapMarker.setPosition(realPos);
      userLocation = realPos;
    });
  }

  mapMarker.addListener('dragend', function() {
    var pos = mapMarker.getPosition();
    userLocation = { lat: pos.lat(), lng: pos.lng() };
  });
}

function loadMap2() {
  if (mapInstance2) return;
  var defaultPos = { lat: 10.2442, lng: -67.5947 };
  mapInstance2 = new google.maps.Map(document.getElementById('map2'), {
    center: defaultPos, zoom: 14,
    disableDefaultUI: true, zoomControl: true,
  });
  mapMarker2 = new google.maps.Marker({
    position: defaultPos, map: mapInstance2, draggable: true,
  });
  userLocation2 = defaultPos;

  var input2 = document.getElementById('mapSearch2');
  if (input2) {
    var autocomplete2 = new google.maps.places.Autocomplete(input2, {
      componentRestrictions: { country: 've' },
      fields: ['geometry', 'name'],
    });
    autocomplete2.addListener('place_changed', function() {
      var place = autocomplete2.getPlace();
      if (!place.geometry) return;
      mapInstance2.setCenter(place.geometry.location);
      mapInstance2.setZoom(16);
      mapMarker2.setPosition(place.geometry.location);
      userLocation2 = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    });
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var realPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      mapInstance2.setCenter(realPos);
      mapMarker2.setPosition(realPos);
      userLocation2 = realPos;
    });
  }

  mapMarker2.addListener('dragend', function() {
    var pos = mapMarker2.getPosition();
    userLocation2 = { lat: pos.lat(), lng: pos.lng() };
  });
}

// ── CART PANEL INLINE (Mi pedido) ─────────────────────────────────────────────
function renderCartPanel() {
  return '<div class="cart-inline">'
       + '<div class="cart-inline-head">'
       + '<h2>Tu pedido</h2>'
       + '<div class="cart-branch-inline">'
       + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>'
       + (currentBranch ? currentBranch.name : '—')
       + '</div></div>'
       + '<div class="cart-inline-items" id="cartInlineItems"></div>'
       + '<div class="cart-inline-foot">'
       + '<div class="total-block">'
       + '<div class="total-row"><span class="total-label">Total estimado</span><span class="total-amount" id="cartInlineTotal">$0.00</span></div>'
       + '<div class="total-sub" id="cartInlineSub">0 productos</div>'
       + '</div>'
       + '<div class="field"><label>Tipo de pedido</label>'
       + '<div class="order-type-selector">'
       + '<button class="order-type-btn active" id="btnPickup2" onclick="selectOrderType2(\'pickup\')">🏪 Pick-up</button>'
       + '<button class="order-type-btn" id="btnDelivery2" onclick="selectOrderType2(\'delivery\')">🛵 Delivery</button>'
       + '</div></div>'
       + '<div class="field" id="locationField2" style="display:none">'
       + '<input type="text" id="mapSearch2" placeholder="🔍 Busca tu dirección...">'
       + '<div id="map2" style="width:100%;height:160px;border-radius:12px;margin-bottom:8px;"></div>'
       + '</div>'
       + '<div class="field"><label for="custName2">Nombre completo</label>'
       + '<input type="text" id="custName2" placeholder="Ej: Carlos Pérez"></div>'
       + '<div class="field"><label for="custId2">Cédula de identidad</label>'
       + '<input type="text" id="custId2" placeholder="Ej: V-12.345.678"></div>'
       + '<div class="field"><label for="custNotes2">Notas adicionales (opcional)</label>'
       + '<textarea id="custNotes2" rows="2" placeholder="Ej: Sin cebolla..."></textarea></div>'
       + '<button class="wa-btn" id="waSendBtn2" onclick="sendWA2()" disabled>'
       + '<svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'
       + 'Enviar pedido por WhatsApp'
       + '</button>'
       + '<p class="disclaimer">El precio del delivery no está incluido. La sucursal confirmará el total final.</p>'
       + '</div></div>';
}

function updateCartInline() {
  var itemsEl = document.getElementById('cartInlineItems');
  var totalEl = document.getElementById('cartInlineTotal');
  var subEl   = document.getElementById('cartInlineSub');
  var sendBtn = document.getElementById('waSendBtn2');
  if (!itemsEl) return;

  if (cartItems.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty"><div class="empty-icon">🍽️</div><p>Tu pedido está vacío.<br>¡Elige algo delicioso!</p></div>';
    if (totalEl) totalEl.textContent = '$0.00';
    if (subEl)   subEl.textContent   = '0 productos';
    if (sendBtn) sendBtn.disabled    = true;
    return;
  }

  var total = 0, totalQty = 0, html = '';
  for (var i = 0; i < cartItems.length; i++) {
    var entry    = cartItems[i];
    var extraSum = 0;
    for (var j = 0; j < entry.extras.length; j++) extraSum += entry.extras[j].price;
    var unitPrice = entry.basePrice + extraSum;
    var linePrice = unitPrice * entry.qty;
    total    += linePrice;
    totalQty += entry.qty;
    var metaParts = [];
    if (entry.sizeLabel) metaParts.push(entry.sizeLabel);
    if (entry.extras.length) {
      var extraNames = [];
      for (var k = 0; k < entry.extras.length; k++) extraNames.push(entry.extras[k].name);
      metaParts.push('+ ' + extraNames.join(', '));
    }
    var metaText = metaParts.join(' · ');
    var qtyStr   = entry.qty > 1 ? ' (' + entry.qty + ' x ' + formatPrice(unitPrice) + ')' : '';
    var imgHTML  = entry.img ? '<img src="' + entry.img + '" alt="' + entry.name + '" onerror="this.style.display=\'none\'">' : '';
    var ph       = '<div class="ci-img-placeholder"' + (entry.img ? ' style="display:none"' : '') + '>🍕</div>';
    html += '<div class="ci">'
          + '<div class="ci-img">' + imgHTML + ph + '</div>'
          + '<div class="ci-info">'
          + '<div class="ci-name">' + entry.name + '</div>'
          + (metaText ? '<div class="ci-meta">' + metaText + '</div>' : '')
          + '<div class="ci-price">' + formatPrice(linePrice) + qtyStr + '</div>'
          + '</div>'
          + '<div class="ci-ctrl">'
          + '<button class="pizza-qty-btn" onclick="cartChg(\'' + entry.fullKey + '\',-1);updateCartInline()">−</button>'
          + '<span class="pizza-qty-num">' + entry.qty + '</span>'
          + '<button class="pizza-qty-btn" onclick="cartChg(\'' + entry.fullKey + '\',1);updateCartInline()">+</button>'
          + '</div></div>';
  }
  itemsEl.innerHTML = html;
  if (totalEl) totalEl.textContent = formatPrice(total);
  if (subEl)   subEl.textContent   = totalQty + ' producto' + (totalQty !== 1 ? 's' : '');
  if (sendBtn) sendBtn.disabled    = false;
}

// ── WHATSAPP ──────────────────────────────────────────────────────────────────
function sendWA() {
  if (!currentBranch || cartItems.length === 0) return;
  var name   = document.getElementById('custName').value.trim();
  var custId = document.getElementById('custId').value.trim();
  var notes  = document.getElementById('custNotes').value.trim();
  var total  = 0;
  var lines  = [];

  for (var i = 0; i < cartItems.length; i++) {
    var entry    = cartItems[i];
    var extraSum = 0;
    for (var j = 0; j < entry.extras.length; j++) extraSum += entry.extras[j].price;
    var unitPrice = entry.basePrice + extraSum;
    var lineTotal = unitPrice * entry.qty;
    total += lineTotal;
    var parts = [entry.name];
    if (entry.sizeLabel) parts.push('(' + entry.sizeLabel + ')');
    if (entry.extras.length) {
      var names = [];
      for (var k = 0; k < entry.extras.length; k++) names.push(entry.extras[k].name);
      parts.push('+ ' + names.join(', '));
    }
    parts.push('x' + entry.qty + ' — ' + formatPrice(lineTotal));
    lines.push('• ' + parts.join(' '));
  }

  var orderType     = getOrderType();
  var orderTypeText = orderType === 'delivery' ? 'Delivery' : 'Pick-up (retiro en sucursal)';
  var locationText  = '';
  if (orderType === 'delivery' && userLocation) {
    locationText = '\n📍 Ubicación de entrega: https://maps.google.com/?q=' + userLocation.lat + ',' + userLocation.lng;
  }
  var idText   = custId ? ' — C.I: *' + custId + '*' : '';
  var greeting = name
    ? 'Hola, soy *' + name + '*' + idText + '. Quisiera hacer el siguiente pedido:'
    : 'Hola, quisiera hacer el siguiente pedido:';

  var msg = '*FIORELLA B\'PIZZAS*\n'
          + 'Sucursal: *' + currentBranch.name + '*\n'
          + currentBranch.addr + '\n'
          + '─────────────────────────\n'
          + greeting + '\n\n'
          + lines.join('\n')
          + '\n─────────────────────────\n'
          + '*Total estimado: ' + formatPrice(total) + '*\n'
          + 'Tipo de pedido: *' + orderTypeText + '*\n'
          + locationText
          + (notes ? '\nNotas: ' + notes : '')
          + '\n\n¡Muchas gracias!';

  window.open('https://wa.me/' + currentBranch.phones[0] + '?text=' + encodeURIComponent(msg), '_blank');
}

function sendWA2() {
  var name   = (document.getElementById('custName2')  || {value:''}).value.trim();
  var custId = (document.getElementById('custId2')    || {value:''}).value.trim();
  var notes  = (document.getElementById('custNotes2') || {value:''}).value.trim();

  if (!currentBranch || cartItems.length === 0) return;
  var total = 0, lines = [];
  for (var i = 0; i < cartItems.length; i++) {
    var entry    = cartItems[i];
    var extraSum = 0;
    for (var j = 0; j < entry.extras.length; j++) extraSum += entry.extras[j].price;
    var unitPrice = entry.basePrice + extraSum;
    var lineTotal = unitPrice * entry.qty;
    total += lineTotal;
    var parts = [entry.name];
    if (entry.sizeLabel) parts.push('(' + entry.sizeLabel + ')');
    if (entry.extras.length) {
      var names = [];
      for (var k = 0; k < entry.extras.length; k++) names.push(entry.extras[k].name);
      parts.push('+ ' + names.join(', '));
    }
    parts.push('x' + entry.qty + ' — ' + formatPrice(lineTotal));
    lines.push('• ' + parts.join(' '));
  }

  var btnDelivery2  = document.getElementById('btnDelivery2');
  var orderType     = btnDelivery2 && btnDelivery2.classList.contains('active') ? 'delivery' : 'pickup';
  var orderTypeText = orderType === 'delivery' ? 'Delivery' : 'Pick-up (retiro en sucursal)';
  var locationText  = '';
  if (orderType === 'delivery' && userLocation2) {
    locationText = '\n📍 Ubicación de entrega: https://maps.google.com/?q=' + userLocation2.lat + ',' + userLocation2.lng;
  }
  var idText   = custId ? ' — C.I: *' + custId + '*' : '';
  var greeting = name
    ? 'Hola, soy *' + name + '*' + idText + '. Quisiera hacer el siguiente pedido:'
    : 'Hola, quisiera hacer el siguiente pedido:';

  var msg = '*FIORELLA B\'PIZZAS*\n'
          + 'Sucursal: *' + currentBranch.name + '*\n'
          + currentBranch.addr + '\n'
          + '─────────────────────────\n'
          + greeting + '\n\n'
          + lines.join('\n')
          + '\n─────────────────────────\n'
          + '*Total estimado: ' + formatPrice(total) + '*\n'
          + 'Tipo de pedido: *' + orderTypeText + '*\n'
          + locationText
          + (notes ? '\nNotas: ' + notes : '')
          + '\n\n¡Muchas gracias!';

  window.open('https://wa.me/' + currentBranch.phones[0] + '?text=' + encodeURIComponent(msg), '_blank');
}

// ── CHANGE BRANCH ─────────────────────────────────────────────────────────────
function changeBranch() { window.location.href = 'index.html'; }

// ── SCROLL FOCUS ─────────────────────────────────────────────────────────────
function setupCartFocusScroll() {
  var fields = document.querySelectorAll('.cart-foot input, .cart-foot textarea');
  for (var i = 0; i < fields.length; i++) {
    fields[i].addEventListener('focus', function() {
      var self = this;
      setTimeout(function() { self.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 350);
    });
  }
}

// ── DRAG HANDLE ───────────────────────────────────────────────────────────────
function initDragHandle() {
  var panel  = document.getElementById('cartPanel');
  var handle = document.getElementById('cartDragHandle');
  if (!handle || window.innerWidth > 700 || handle._initialized) return;
  handle._initialized = true;

  var startY = 0, startH = 0, dragging = false;
  handle.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY; startH = panel.offsetHeight;
    dragging = true; panel.style.transition = 'none';
  }, { passive: true });
  document.addEventListener('touchmove', function(e) {
    if (!dragging) return;
    var delta = startY - e.touches[0].clientY;
    var newH  = Math.min(Math.max(startH + delta, 160), window.innerHeight * 0.95);
    panel.style.height = newH + 'px';
  }, { passive: true });
  document.addEventListener('touchend', function() {
    if (!dragging) return;
    dragging = false; panel.style.transition = '';
    if (panel.offsetHeight < 160) closeCart();
  });
}

// ── MOBILE NAV ────────────────────────────────────────────────────────────────
function toggleMobileNav() {
  var nav = document.getElementById('mobileNav');
  if (!nav) return;
  if (nav.classList.contains('open')) {
    nav.classList.remove('open');
    return;
  }
  var html = '';
  for (var i = 0; i < MENU.length; i++) {
    var cat = MENU[i];
    html += '<button class="cat-btn" onclick="showCategory(\'' + cat.id + '\');toggleMobileNav()">'
          + cat.name + '</button>';
  }
  html += '<button class="cat-btn" onclick="showCategory(\'ordenes\');toggleMobileNav()">Mi pedido</button>';
  nav.innerHTML = html;
  nav.classList.add('open');
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showAddedFeedback(name) {
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);'
      + 'background:var(--bg);color:white;padding:10px 20px;'
      + 'border-radius:50px;font-size:0.82rem;font-weight:600;font-family:var(--font);'
      + 'box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:600;'
      + 'opacity:0;transition:opacity 0.25s;white-space:nowrap;'
      + 'border:1px solid rgba(255,192,29,0.4);';
    document.body.appendChild(toast);
  }
  toast.textContent = name + ' agregado al pedido ✓';
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function(){ toast.style.opacity = '0'; }, 2200);
}