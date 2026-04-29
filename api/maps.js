// api/maps.js — Sirve el script de Google Maps con la key desde variables de entorno

export const config = { runtime: 'edge' };

export default async function handler(req) {
  var MAPS_KEY = process.env.MAPS_KEY;

  if (!MAPS_KEY) {
    return new Response('// Maps key no configurada', {
      status: 500,
      headers: { 'Content-Type': 'application/javascript' },
    });
  }

  // Redirige al script real de Google Maps con la key del servidor
  return Response.redirect(
    'https://maps.googleapis.com/maps/api/js?key=' + MAPS_KEY + '&libraries=places&callback=initMap',
    302
  );
}
