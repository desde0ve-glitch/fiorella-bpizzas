// api/admin.js — Vercel Edge Function para operaciones del panel admin
// Las keys NUNCA llegan al navegador

export const config = { runtime: 'edge' };

export default async function handler(req) {
  var SUPABASE_URL = process.env.SUPABASE_URL;
  var SUPABASE_KEY = process.env.SUPABASE_KEY;

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  var body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Body inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  var action = body.action;

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (action === 'login') {
    var res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
    var data = await res.json();
    if (data.access_token) {
      return new Response(JSON.stringify({ access_token: data.access_token }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Credenciales incorrectas' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── VERIFICAR TOKEN ────────────────────────────────────────────────────────
  var token = body.token;
  if (!token) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verificar que el token es válido
  var userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + token,
    },
  });
  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: 'Token inválido' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  var authHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Prefer': 'return=representation',
  };

  // ── LOAD ALL DATA ──────────────────────────────────────────────────────────
  if (action === 'loadAll') {
    var results = await Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/categories?select=*&order=sort_order',    { headers: authHeaders }).then(function(r) { return r.json(); }),
      fetch(SUPABASE_URL + '/rest/v1/products?select=*&order=sort_order',      { headers: authHeaders }).then(function(r) { return r.json(); }),
      fetch(SUPABASE_URL + '/rest/v1/product_sizes?select=*&order=sort_order', { headers: authHeaders }).then(function(r) { return r.json(); }),
      fetch(SUPABASE_URL + '/rest/v1/extras?select=*&order=sort_order',        { headers: authHeaders }).then(function(r) { return r.json(); }),
      fetch(SUPABASE_URL + '/rest/v1/branches?select=*&order=sort_order',      { headers: authHeaders }).then(function(r) { return r.json(); }),
    ]);
    return new Response(JSON.stringify({
      categories:    Array.isArray(results[0]) ? results[0] : [],
      products:      Array.isArray(results[1]) ? results[1] : [],
      product_sizes: Array.isArray(results[2]) ? results[2] : [],
      extras:        Array.isArray(results[3]) ? results[3] : [],
      branches:      Array.isArray(results[4]) ? results[4] : [],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // ── DB OPERATION ───────────────────────────────────────────────────────────
  if (action === 'db') {
    var method  = body.method;
    var table   = body.table;
    var params  = body.params || '';
    var payload = body.body;

    // Whitelist de tablas permitidas
    var allowed = ['products', 'product_sizes', 'extras', 'branches', 'categories'];
    if (!allowed.includes(table)) {
      return new Response(JSON.stringify({ error: 'Tabla no permitida' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    var url = SUPABASE_URL + '/rest/v1/' + table + (params ? '?' + params : '');
    var fetchRes = await fetch(url, {
      method: method,
      headers: authHeaders,
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (fetchRes.status === 204) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    var result = await fetchRes.json();
    return new Response(JSON.stringify(result), {
      status: fetchRes.ok ? 200 : fetchRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── UPLOAD IMAGE URL ───────────────────────────────────────────────────────
  if (action === 'getUploadUrl') {
    // Retorna la URL del storage para que el cliente suba directo
    // pero verificamos que esté autenticado antes
    return new Response(JSON.stringify({
      storageUrl: process.env.SUPABASE_URL + '/storage/v1/object/menu-images/',
      // No retornamos la key — el cliente usará su token JWT para subir
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Acción no reconocida' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
