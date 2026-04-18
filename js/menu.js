// ═══════════════════════════════════════════
//  menu.js — Menú, Carrito, Modal de Extras y WhatsApp
// ═══════════════════════════════════════════

// ── STATE ────────────────────────────────────────────────────────────────────
var currentBranch = null;
var cartItems     = [];
var modalState    = null;
var selectedSizes = {};

// ── HELPERS (deben ir primero) ────────────────────────────────────────────────
function getQty(key) {
  var entry = cartItems.find(function(c){ return c.key === key; });
  return entry ? entry.qty : 0;
}

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

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var branchId = sessionStorage.getItem('selectedBranch');
  currentBranch = null;
  for (var i = 0; i < BRANCHES.length; i++) {
    if (BRANCHES[i].id === branchId) { currentBranch = BRANCHES[i]; break; }
  }
  if (!currentBranch) currentBranch = BRANCHES[0];

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
  var html = '<span class="cat-nav-title">Menu</span>';
  for (var i = 0; i < MENU.length; i++) {
    var cat    = MENU[i];
    var active = i === 0 ? ' active' : '';
    html += '<button class="cat-btn' + active + '" id="navbtn-' + cat.id + '" onclick="scrollToCat(\'' + cat.id + '\')">'
          + '<span class="cat-ico">' + cat.icon + '</span>'
          + cat.name + '</button>';
  }
  nav.innerHTML = html;
}

// ── MENU RENDER ───────────────────────────────────────────────────────────────
function renderMenu() {
  var section = document.getElementById('menuSection');
  var out = '';
  for (var i = 0; i < MENU.length; i++) {
    var cat     = MENU[i];
    var isCombo = cat.id === 'combos';
    var isDrink = cat.id === 'bebidas';
    var gridCls = isDrink ? 'grid-3' : 'grid-2';
    var cards   = '';
    for (var j = 0; j < cat.items.length; j++) {
      var item = cat.items[j];
      if (isCombo)            cards += renderComboCard(item);
      else if (isDrink)       cards += renderSmallCard(item);
      else                    cards += renderPizzaCard(item);
    }
    out += '<div class="category-section" id="cat-' + cat.id + '">'
         + '<div class="section-header">'
         + '<div class="section-icon">' + cat.icon + '</div>'
         + '<h2 class="section-title">' + cat.name + '</h2>'
         + '<div class="section-line"></div>'
         + '</div>'
         + (cat.desc ? '<p class="section-desc">' + cat.desc + '</p>' : '')
         + '<div class="' + gridCls + '" id="grid-' + cat.id + '">' + cards + '</div>'
         + '</div>';
  }
  section.innerHTML = out;
}

// ─── PIZZA CARD ───────────────────────────────────────────────────────────────
function renderPizzaCard(item) {
  var si      = selectedSizes[item.id] !== undefined ? selectedSizes[item.id] : 0;
  var size    = item.sizes[si];
  var cartKey = item.sizes.length > 1 ? item.id + '-' + si : item.id;
  var qty     = getQty(cartKey);
  var inCart  = qty > 0;

  var imgHTML     = item.img ? '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' : '';
  var placeholder = '<div class="card-img-placeholder"' + (item.img ? ' style="display:none"' : '') + '>🍕</div>';

  var sizeHTML = '<div class="size-row">';
  if (item.sizes.length > 1) {
    for (var i = 0; i < item.sizes.length; i++) {
      var sel = i === si ? ' selected' : '';
      sizeHTML += '<button class="size-chip' + sel + '" onclick="selectSizeOnly(\'' + item.id + '\',' + i + ')">'
                + item.sizes[i].label + ' — ' + formatPrice(item.sizes[i].price) + '</button>';
    }
  } else {
    sizeHTML += '<span class="size-chip selected">' + size.label + ' — ' + formatPrice(size.price) + '</span>';
  }
  sizeHTML += '</div>';

  var controls = inCart
    ? '<div class="qty-controls">'
      + '<button class="qty-btn" onclick="changeQty(\'' + cartKey + '\',-1,\'' + item.id + '\')">−</button>'
      + '<span class="qty-num">' + qty + '</span>'
      + '<button class="qty-btn" onclick="changeQty(\'' + cartKey + '\',1,\'' + item.id + '\')">+</button>'
      + '</div>'
    : '<button class="add-btn" onclick="openModal(\'' + item.id + '\',' + si + ')">+ Agregar</button>';

  return '<div class="item-card' + (inCart ? ' in-cart' : '') + '" id="card-' + item.id + '">'
       + '<div class="card-img">' + imgHTML + placeholder + '</div>'
       + '<div class="card-body">'
       + '<div class="card-name">' + item.name + '</div>'
       + '<div class="card-desc">' + item.desc + '</div>'
       + sizeHTML
       + '<div class="card-footer"><span class="card-price">' + formatPrice(size.price) + '</span>' + controls + '</div>'
       + '</div></div>';
}

// ─── COMBO CARD ───────────────────────────────────────────────────────────────
function renderComboCard(item) {
  var qty    = getQty(item.id);
  var inCart = qty > 0;
  var controls = inCart
    ? '<div class="combo-qty-controls">'
      + '<button class="combo-qty-btn" onclick="changeQty(\'' + item.id + '\',-1,\'' + item.id + '\')">−</button>'
      + '<span class="combo-qty-num">' + qty + '</span>'
      + '<button class="combo-qty-btn" onclick="changeQty(\'' + item.id + '\',1,\'' + item.id + '\')">+</button>'
      + '</div>'
    : '<button class="combo-add-btn" onclick="openModal(\'' + item.id + '\')">+ Agregar</button>';

  return '<div class="combo-card' + (inCart ? ' in-cart' : '') + '" id="card-' + item.id + '">'
       + '<span class="combo-tag">Combo</span>'
       + '<div class="combo-name">' + item.name + '</div>'
       + '<div class="combo-contents">' + item.desc + '</div>'
       + '<div class="combo-footer"><span class="combo-price">' + formatPrice(item.price) + '</span>' + controls + '</div>'
       + '</div>';
}

// ─── SMALL CARD (bebidas) ────────────────────────────────────────────────────
function renderSmallCard(item) {
  var qty     = getQty(item.id);
  var inCart  = qty > 0;
  var imgHTML = item.img ? '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' : '';
  var placeholder = '<div class="small-img-placeholder"' + (item.img ? ' style="display:none"' : '') + '>🥤</div>';
  var controls = inCart
    ? '<div class="qty-controls">'
      + '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\',-1,\'' + item.id + '\')">−</button>'
      + '<span class="qty-num">' + qty + '</span>'
      + '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\',1,\'' + item.id + '\')">+</button>'
      + '</div>'
    : '<button class="add-btn" style="font-size:0.74rem;padding:7px 11px" onclick="addDirect(\'' + item.id + '\')">+ Agregar</button>';

  return '<div class="small-card' + (inCart ? ' in-cart' : '') + '" id="card-' + item.id + '">'
       + '<div class="small-img">' + imgHTML + placeholder + '</div>'
       + '<div class="small-name">' + item.name + '</div>'
       + '<div class="small-price">' + formatPrice(item.price) + '</div>'
       + '<div class="small-footer">' + controls + '</div>'
       + '</div>';
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
  var freeLeft  = item.freeExtras || 0;
 
  modalState.freeExtras = freeLeft;
 
  document.getElementById('modalProductName').textContent  = item.name;
  document.getElementById('modalProductPrice').textContent = formatPrice(basePrice);
 
  var html = '';
 
  // Selector de tamaño
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
      var freeList = [];
      var paidList = [];
      for (var j = 0; j < EXTRAS.length; j++) {
        if (EXTRAS[j].price <= 1.0) freeList.push(EXTRAS[j]);
        else                        paidList.push(EXTRAS[j]);
      }

      html += '<div class="modal-section">';
      html += '<div class="modal-section-title">Incluido en el combo</div>';
      html += '<div class="modal-free-note" id="modalFreeNote">'
            + 'Puedes elegir hasta <strong>' + freeCount + '</strong> ingrediente' + (freeCount > 1 ? 's' : '') + ' gratis'
            + '</div>';
      html += '<div class="modal-extras">';
      for (var f = 0; f < freeList.length; f++) {
        var ex = freeList[f];
        html += '<div class="modal-extra-row" id="mextra-' + ex.id + '">'
              + '<button class="modal-extra-btn" onclick="modalToggleExtra(\'' + ex.id + '\')">'
              + '<span class="extra-name">' + ex.name + '</span>'
              + '<span class="extra-price extra-free-tag" id="mextra-price-' + ex.id + '">Gratis</span>'
              + '</button>'
              + '<div class="mextra-qty-controls" id="mextra-qty-' + ex.id + '" style="display:none">'
              + '<button class="mextra-minus" onclick="extraMinus(\'' + ex.id + '\')">−</button>'
              + '<span class="mextra-num" id="mextra-check-' + ex.id + '">0</span>'
              + '<button class="mextra-plus" onclick="modalToggleExtra(\'' + ex.id + '\')">+</button>'
              + '</div></div>';
      }
      html += '</div></div>';

      if (paidList.length > 0) {
        html += '<div class="modal-section">';
        html += '<div class="modal-section-title">Con costo adicional</div>';
        html += '<div class="modal-extras">';
        for (var p = 0; p < paidList.length; p++) {
          var ep = paidList[p];
          html += '<div class="modal-extra-row" id="mextra-' + ep.id + '">'
                + '<button class="modal-extra-btn" onclick="modalToggleExtra(\'' + ep.id + '\')">'
                + '<span class="extra-name">' + ep.name + '</span>'
                + '<span class="extra-price" id="mextra-price-' + ep.id + '">+' + formatPrice(ep.price) + '</span>'
                + '</button>'
                + '<div class="mextra-qty-controls" id="mextra-qty-' + ep.id + '" style="display:none">'
                + '<button class="mextra-minus" onclick="extraMinus(\'' + ep.id + '\')">−</button>'
                + '<span class="mextra-num" id="mextra-check-' + ep.id + '">0</span>'
                + '<button class="mextra-plus" onclick="modalToggleExtra(\'' + ep.id + '\')">+</button>'
                + '</div></div>';
        }
        html += '</div></div>';
      }

    } else {
      html += '<div class="modal-section"><div class="modal-section-title">Ingredientes adicionales (opcional)</div><div class="modal-extras">';
      for (var k = 0; k < EXTRAS.length; k++) {
        var ek = EXTRAS[k];
        html += '<div class="modal-extra-row" id="mextra-' + ek.id + '">'
              + '<button class="modal-extra-btn" onclick="modalToggleExtra(\'' + ek.id + '\')">'
              + '<span class="extra-name">' + ek.name + '</span>'
              + '<span class="extra-price" id="mextra-price-' + ek.id + '">+' + formatPrice(ek.price) + '</span>'
              + '</button>'
              + '<div class="mextra-qty-controls" id="mextra-qty-' + ek.id + '" style="display:none">'
              + '<button class="mextra-minus" onclick="extraMinus(\'' + ek.id + '\')">−</button>'
              + '<span class="mextra-num" id="mextra-check-' + ek.id + '">0</span>'
              + '<button class="mextra-plus" onclick="modalToggleExtra(\'' + ek.id + '\')">+</button>'
              + '</div></div>';
      }
      html += '</div></div>';
    }
  }

  document.getElementById('modalBody').innerHTML = html;
  updateModalTotal();
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
  var item     = findItem(modalState.itemId);
  var freeCount = item.freeExtras || 0;

  // Calcular cuántos de $1 hay seleccionados actualmente
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
    // Ya tiene al menos 1 — si es extra de $1 en combo con gratis, permitir agregar más
    if (freeCount > 0 && ex.price <= 1.0) {
      modalState.selectedExtras[extraId] = current + 1;
      document.getElementById('mextra-check-' + extraId).textContent = current + 1;
    } else {
    // Siempre sumar — cualquier extra puede agregarse múltiples veces
    modalState.selectedExtras[extraId] = current + 1;
    document.getElementById('mextra-check-' + extraId).textContent = current + 1;
  }
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

  // Calcular total contando cantidades
  for (var j = 0; j < EXTRAS.length; j++) {
    var ex  = EXTRAS[j];
    var qty = (modalState.selectedExtras && modalState.selectedExtras[ex.id]) || 0;
    if (qty === 0) continue;

    for (var u = 0; u < qty; u++) {
      if (freeCount > 0 && ex.price <= 1.0 && freeUsed < freeCount) {
        freeUsed++;
        // gratis, no suma
      } else {
        extra += ex.price;
      }
    }
  }

  // Actualizar etiquetas de precio en botones de $1
  for (var f = 0; f < EXTRAS.length; f++) {
    var ef   = EXTRAS[f];
    var tag  = document.getElementById('mextra-' + ef.id);
    if (!tag) continue;
    var priceSpan = tag.querySelector('.extra-price');
    if (!priceSpan) continue;

    if (freeCount > 0 && ef.price <= 1.0) {
      var qtyF = (modalState.selectedExtras && modalState.selectedExtras[ef.id]) || 0;

      if (freeUsed < freeCount) {
        // Aún hay cupo gratis
        priceSpan.textContent = 'Gratis';
        priceSpan.className   = 'extra-price extra-free-tag';
      } else {
        // Ya no hay cupo — mostrar precio real
        if (qtyF > 0) {
          // Está seleccionado: primera(s) gratis, resto cobrado
          var freeInThis = 0;
          // Contar cuántos gratis le corresponden a este extra
          var tempFree = 0;
          for (var g = 0; g < EXTRAS.length; g++) {
            var eg   = EXTRAS[g];
            var qtyG = (modalState.selectedExtras && modalState.selectedExtras[eg.id]) || 0;
            if (qtyG === 0 || eg.price > 1.0) continue;
            for (var ug = 0; ug < qtyG; ug++) {
              if (tempFree < freeCount) {
                if (eg.id === ef.id) freeInThis++;
                tempFree++;
              }
            }
          }
          if (freeInThis > 0 && freeInThis < qtyF) {
            priceSpan.textContent = freeInThis + ' gratis + ' + (qtyF - freeInThis) + ' x ' + formatPrice(ef.price);
          } else if (freeInThis >= qtyF) {
            priceSpan.textContent = 'Gratis';
            priceSpan.className   = 'extra-price extra-free-tag';
          } else {
            priceSpan.textContent = '+' + formatPrice(ef.price);
            priceSpan.className   = 'extra-price';
          }
        } else {
          priceSpan.textContent = '+' + formatPrice(ef.price);
          priceSpan.className   = 'extra-price';
        }
      }
    }
  }

  // Nota de gratis restantes
  var note = document.getElementById('modalFreeNote');
  if (note && freeCount > 0) {
    var remaining = freeCount - freeUsed;
    if (remaining > 0) {
      note.innerHTML     = 'Puedes elegir <strong>' + remaining + '</strong> ingrediente' + (remaining > 1 ? 's' : '') + ' gratis más';
      note.style.background  = '';
      note.style.borderColor = '';
      note.style.color       = '';
    } else {
      note.innerHTML     = 'Ya elegiste tu' + (freeCount > 1 ? 's ' + freeCount : '') + ' ingrediente' + (freeCount > 1 ? 's' : '') + ' gratis. Los siguientes tienen costo.';
      note.style.background  = 'rgba(226,53,37,0.06)';
      note.style.borderColor = 'var(--red)';
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
        exCopy.price = 0;
        exCopy.name  = ex.name + ' (incl.)';
        freeUsed++;
      }
      selectedExtrasArr.push(exCopy);
    }
  }

  var extrasKey = JSON.stringify(modalState.selectedExtras || {});
  var fullKey   = cartKey + ':' + extrasKey;

  var existing = null;
  for (var k = 0; k < cartItems.length; k++) {
    if (cartItems[k].fullKey === fullKey) { existing = cartItems[k]; break; }
  }

  if (existing) {
    existing.qty++;
  } else {
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

// ── ADD DIRECT (bebidas) ──────────────────────────────────────────────────────
function addDirect(itemId) {
  var item = findItem(itemId);
  if (!item) return;
  var existing = null;
  for (var i = 0; i < cartItems.length; i++) {
    if (cartItems[i].key === itemId) { existing = cartItems[i]; break; }
  }
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
  var cat  = findCategory(itemId);
  var html = '';
  if (cat.id === 'combos')        html = renderComboCard(item);
  else if (item.type === 'drink') html = renderSmallCard(item);
  else                            html = renderPizzaCard(item);
  card.outerHTML = html;
}

// ── CART BADGE ────────────────────────────────────────────────────────────────
function updateCartBadge() {
  var total = 0;
  for (var i = 0; i < cartItems.length; i++) total += cartItems[i].qty;
  var badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
}

function initDragHandle() {
  var panel  = document.getElementById('cartPanel');
  var handle = document.getElementById('cartDragHandle');
  if (!handle || window.innerWidth > 600 || handle._initialized) return;
  handle._initialized = true;

  var startY = 0, startH = 0, dragging = false;

  handle.addEventListener('touchstart', function(e) {
    startY   = e.touches[0].clientY;
    startH   = panel.offsetHeight;
    dragging = true;
    panel.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!dragging) return;
    var delta = startY - e.touches[0].clientY;
    var newH  = Math.min(Math.max(startH + delta, 160), window.innerHeight * 0.92);
    panel.style.height = newH + 'px';
  }, { passive: true });

  document.addEventListener('touchend', function() {
    if (!dragging) return;
    dragging = false;
    panel.style.transition = '';
    if (panel.offsetHeight < 160) closeCart();
  });
}

// ── CART PANEL ────────────────────────────────────────────────────────────────
function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
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
    var entry     = cartItems[i];
    var extraSum  = 0;
    for (var j = 0; j < entry.extras.length; j++) extraSum += entry.extras[j].price;
    var unitPrice = entry.basePrice + extraSum;
    var linePrice = unitPrice * entry.qty;
    total    += linePrice;
    totalQty += entry.qty;

    var metaParts = [];
    if (entry.sizeLabel)      metaParts.push(entry.sizeLabel);
    if (entry.extras.length)  {
      var extraNames = [];
      for (var k = 0; k < entry.extras.length; k++) extraNames.push(entry.extras[k].name);
      metaParts.push('+ ' + extraNames.join(', '));
    }
    var metaText = metaParts.join(' · ');
    var qtyStr   = entry.qty > 1 ? ' (' + entry.qty + ' x ' + formatPrice(unitPrice) + ')' : '';
    var imgHTML  = entry.img ? '<img src="' + entry.img + '" alt="' + entry.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' : '';
    var ph       = '<div class="ci-img-placeholder"' + (entry.img ? ' style="display:none"' : '') + '>🍕</div>';

    html += '<div class="ci">'
          + '<div class="ci-img">' + imgHTML + ph + '</div>'
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
  }

  container.innerHTML = html;
  document.getElementById('cartTotal').textContent = formatPrice(total);
  document.getElementById('cartSub').textContent   = totalQty + ' producto' + (totalQty !== 1 ? 's' : '');
}

function cartChg(fullKey, delta) {
  var itemId = null;
  for (var i = 0; i < cartItems.length; i++) {
    if (cartItems[i].fullKey === fullKey) { itemId = cartItems[i].itemId; cartItems[i].qty += delta; if (cartItems[i].qty <= 0) cartItems.splice(i, 1); break; }
  }
  if (itemId) refreshCard(itemId);
  updateCartBadge();
  renderCartItems();
  updateSendBtn();
}

function updateSendBtn() {
  document.getElementById('waSendBtn').disabled = cartItems.length === 0;
}
function selectOrderType(type) {
  var btnPickup   = document.getElementById('btnPickup');
  var btnDelivery = document.getElementById('btnDelivery');
  if (type === 'pickup') {
    btnPickup.classList.add('active');
    btnDelivery.classList.remove('active');
  } else {
    btnDelivery.classList.add('active');
    btnPickup.classList.remove('active');
  }
}

function getOrderType() {
  var btnDelivery = document.getElementById('btnDelivery');
  return btnDelivery && btnDelivery.classList.contains('active') ? 'delivery' : 'pickup';
}
// ── WHATSAPP ─────────────────────────────────────────────────────────────────
function sendWA() {
  if (!currentBranch || cartItems.length === 0) return;
  var name  = document.getElementById('custName').value.trim();
  var notes = document.getElementById('custNotes').value.trim();
  var total = 0;
  var lines = [];

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

  var orderType = getOrderType();
  var orderTypeText = orderType === 'delivery' ? 'Delivery' : 'Pick-up (retiro en sucursal)';
  var greeting = name ? 'Hola, soy *' + name + '*. Quisiera hacer el siguiente pedido:' : 'Hola, quisiera hacer el siguiente pedido:';
  var msg = '*FIORELLA B\'PIZZAS*\n'
          + 'Sucursal: *' + currentBranch.name + '*\n'
          + currentBranch.addr + '\n'
          + '─────────────────────────\n'
          + greeting + '\n\n'
          + lines.join('\n')
          + '\n─────────────────────────\n'
          + '*Total estimado: ' + formatPrice(total) + '*\n'
          + 'Tipo de pedido: *' + orderTypeText + '*\n'
          + (notes ? 'Notas: ' + notes + '\n' : '')
          + '\n¡Muchas gracias!';

  window.open('https://wa.me/' + currentBranch.phones[0] + '?text=' + encodeURIComponent(msg), '_blank');
}

// ── SCROLL SPY ────────────────────────────────────────────────────────────────
function scrollToCat(catId) {
  var el = document.getElementById('cat-' + catId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setActiveNav(catId);
}

function setActiveNav(catId) {
  var btns = document.querySelectorAll('.cat-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  var nb = document.getElementById('navbtn-' + catId);
  if (nb) nb.classList.add('active');
}

function setupScrollSpy() {
  if (!window.IntersectionObserver) return;
  var observer = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        setActiveNav(entries[i].target.id.replace('cat-', ''));
      }
    }
  }, { rootMargin: '-30% 0px -65% 0px' });
  for (var i = 0; i < MENU.length; i++) {
    var el = document.getElementById('cat-' + MENU[i].id);
    if (el) observer.observe(el);
  }
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
