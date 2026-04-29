// api/menu.js — Vercel Edge Function
// Las keys nunca llegan al navegador — viven aquí en el servidor

export const config = { runtime: 'edge' };

export default async function handler(req) {
  var SUPABASE_URL = process.env.SUPABASE_URL;
  var SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Variables de entorno no configuradas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  var headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    var results = await Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/branches?select=*&active=eq.true&order=sort_order', { headers }).then(function(r) { return r.json(); }),
      fetch(SUPABASE_URL + '/rest/v1/categories?select=*&order=sort_order', { headers }).then(function(r) { return r.json(); }),
      fetch(SUPABASE_URL + '/rest/v1/products?select=*&active=eq.true&deleted_at=is.null&order=sort_order', { headers }).then(function(r) { return r.json(); }),
      fetch(SUPABASE_URL + '/rest/v1/product_sizes?select=*&order=sort_order', { headers }).then(function(r) { return r.json(); }),
      fetch(SUPABASE_URL + '/rest/v1/extras?select=*&active=eq.true&order=sort_order', { headers }).then(function(r) { return r.json(); }),
    ]);

    return new Response(JSON.stringify({
      branches:      Array.isArray(results[0]) ? results[0] : [],
      categories:    Array.isArray(results[1]) ? results[1] : [],
      products:      Array.isArray(results[2]) ? results[2] : [],
      product_sizes: Array.isArray(results[3]) ? results[3] : [],
      extras:        Array.isArray(results[4]) ? results[4] : [],
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // cache 60 segundos
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error conectando con la base de datos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
