function loadMenuFromSupabase() {
  return fetch('/api/menu')
    .then(function(r) {
      if (!r.ok) throw new Error('Error ' + r.status);
      return r.json();
    })
    .then(function(data) {
      var branches  = data.branches      || [];
      var cats      = data.categories    || [];
      var products  = data.products      || [];
      var sizes     = data.product_sizes || [];
      var extras    = data.extras        || [];

      var sizesByProduct = {};
      sizes.forEach(function(s) {
        if (!s || !s.product_id) return;
        if (!sizesByProduct[s.product_id]) sizesByProduct[s.product_id] = [];
        sizesByProduct[s.product_id].push({ label: s.label, price: parseFloat(s.price) });
      });

      var MENU_DATA = cats.map(function(cat) {
        var catProducts = products
          .filter(function(p) { return p.category_id === cat.id; })
          .map(function(p) {
            var pSizes = sizesByProduct[p.id] || [{ label: 'Único', price: 0 }];
            return {
              id: p.id, type: p.type, name: p.name,
              img: p.img_url || null, desc: p.description || '',
              description: p.description || '',
              allowExtras: p.allow_extras, freeExtras: p.free_extras || 0,
              sizes: pSizes, price: pSizes[0] ? pSizes[0].price : 0,
            };
          });
        return { id: cat.slug, name: cat.name, icon: cat.icon || '', items: catProducts };
      });

      var BRANCHES_DATA = branches.map(function(b) {
        return { id: b.slug, name: b.name, addr: b.address, icon: '📍', phones: b.phones || [] };
      });

      var EXTRAS_DATA = extras.map(function(e) {
        return { id: e.id, name: e.name, price: parseFloat(e.price), img: null };
      });

      return { BRANCHES: BRANCHES_DATA, MENU: MENU_DATA, EXTRAS: EXTRAS_DATA };
    });
}