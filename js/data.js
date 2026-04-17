// ═══════════════════════════════════════════
//  data.js — Sucursales y Menú de Fiorella B'Pizzas
//  Edita este archivo para actualizar precios, productos y sucursales
// ═══════════════════════════════════════════

// ── SUCURSALES ──────────────────────────────────────────────────────────────
// phone: número con código de país sin + ni espacios (58 = Venezuela)
const BRANCHES = [
  {
    id: "san-jacinto",
    name: "San Jacinto",
    addr: "Parque de Ferias San Jacinto",
    icon: "📍",
    phones: ["584220459596", "584243443278"],
  },
  {
    id: "turmero",
    name: "Turmero",
    addr: "Calle 4, frente al liceo José Rafael Revenga",
    icon: "📍",
    phones: ["584127799509"],
  },
  {
    id: "guasimal",
    name: "Guasimal",
    addr: "Principal de Guasimal, a 300 metros de la Guardia Nacional",
    icon: "📍",
    phones: ["584243791465", "584124682005"],
  },
  {
    id: "cagua",
    name: "Cagua",
    addr: "Calle Rondón cruce con Av. Hugo Oliveros",
    icon: "📍",
    phones: ["584127798999"],
  },
];

// ── INGREDIENTES ADICIONALES ────────────────────────────────────────────────
// Aparecen en el modal cuando el cliente agrega una pizza o combo
const EXTRAS = [
  { id: "x1",  name: "Maíz",            price: 1.0,  img: null },
  { id: "x2",  name: "Tocineta",        price: 1.0,  img: null },
  { id: "x3",  name: "Pepperoni",       price: 1.0,  img: null },
  { id: "x4",  name: "Jamón",           price: 1.0,  img: null },
  { id: "x5",  name: "Salchichón",      price: 1.0,  img: null },
  { id: "x6",  name: "Cebolla",         price: 1.0,  img: null },
  { id: "x13", name: "Pimentón",        price: 1.0,  img: null },
  { id: "x7",  name: "Chorizo",         price: 1.0,  img: null },
  { id: "x8",  name: "Aceitunas Negras",price: 1.0,  img: null },
  { id: "x9",  name: "Anchoas",         price: 1.5,  img: null },
  { id: "x10", name: "Champiñón",       price: 1.5,  img: null },
  { id: "x11", name: "Doble Queso",     price: 2.5,  img: null },
  { id: "x12", name: "Borde de Queso",  price: 2.5,  img: null },
];

// ── MENÚ ────────────────────────────────────────────────────────────────────
// img: ruta relativa a /images/ — pon null si aún no tienes la imagen
// type: "pizza" (con tamaños) | "combo" | "extra" | "drink"
// allowExtras: true → muestra modal de ingredientes al agregar

const MENU = [
  // ════════════ COMBOS ════════════
  {
    id: "combos",
    name: "Combos",
    icon: "🎉",
    desc: "La mejor relación precio-cantidad. Ahorra más pidiendo en combo.",
    items: [
      {
        id: "c1", type: "combo",
        name: "Combo 1",
        img: null,
        price: 9,
        allowExtras: true,
        freeExtras: 1,
        desc: "1 Pizza Margarita 40cm + 1 Coca-Cola 1.5L + 1 ingrediente adicional",
      },
      {
        id: "c2", type: "combo",
        name: "Combo 2",
        img: null,
        price: 16,
        allowExtras: true,
        freeExtras: 2,
        desc: "2 Pizzas Margarita 40cm + 1 Coca-Cola 1.5L + 1 ingrediente adicional por pizza",
      },
      {
        id: "c3", type: "combo",
        name: "Combo 3",
        img: null,
        price: 19,
        allowExtras: true,
        desc: "3 Pizzas Margarita 40cm + 1 Coca-Cola 1.5L",
      },
      {
        id: "c4", type: "combo",
        name: "Combo 4",
        img: null,
        price: 25,
        allowExtras: true,
        desc: "4 Pizzas Margarita 40cm + 1 Coca-Cola 1.5L",
      },
      {
        id: "c5", type: "combo",
        name: "Combo 5",
        img: null,
        price: 23,
        allowExtras: true,
        desc: "2 Pizzas Margarita 40cm + 1 Pizza Charcutera 40cm + 1 Coca-Cola 1.5L",
      },
      {
        id: "c6", type: "combo",
        name: "Combo 6",
        img: null,
        price: 26,
        allowExtras: true,
        desc: "1 Pizza Vegetariana + 1 Pizza Charcutera + 1 Pizza Caprese (todas 40cm) + 1 Coca-Cola 1.5L",
      },
      {
        id: "c7", type: "combo",
        name: "Combo 7",
        img: null,
        price: 26,
        allowExtras: true,
        desc: "3 Pizzas Charcutera 40cm + 1 Coca-Cola 1.5L",
      },
      {
        id: "c8", type: "combo",
        name: "Combo 8",
        img: null,
        price: 13,
        allowExtras: true,
        desc: "2 Pizzas Margarita 40cm",
      },
      {
        id: "c9", type: "combo",
        name: "Combo 9",
        img: null,
        price: 14,
        allowExtras: true,
        desc: "2 Pizzas 33cm (salsa napole, queso, jamón, tocineta, salchichón y maíz) + 1 Coca-Cola 1.5L",
      },
      {
        id: "c10", type: "combo",
        name: "Combo 10",
        img: null,
        price: 21,
        allowExtras: true,
        desc: "2 Pizzas Charcutera 40cm + 1 Coca-Cola 1.5L",
      },
    ],
  },

  // ════════════ PIZZAS ════════════
  {
    id: "pizzas",
    name: "Pizzas",
    icon: "🍕",
    desc: "Masa artesanal con salsa napole y queso mozzarella fresco.",
    items: [
      {
        id: "p1", type: "pizza",
        name: "Margarita",
        img: "images/pizza-margarita.png",
        desc: "Salsa napole, mozzarella y jamón",
        allowExtras: true,
        sizes: [
          { label: "22 cm", price: 2.5 },
          { label: "33 cm", price: 4.0 },
          { label: "40 cm", price: 6.0 },
        ],
      },
      {
        id: "p2", type: "pizza",
        name: "Charcutera",
        img: "images/pizza-charcutera.png",
        desc: "Salsa napole, mozzarella, jamón, pepperoni, tocineta, chorizo y salchichón",
        allowExtras: true,
        sizes: [
          { label: "22 cm", price: 4.0 },
          { label: "33 cm", price: 7.0 },
          { label: "40 cm", price: 9.0 },
        ],
      },
      {
        id: "p3", type: "pizza",
        name: "Vegetariana",
        img: "images/pizza-vegetariana.png",
        desc: "Salsa napole, mozzarella, maíz, champiñones, cebolla, pimentón y aceitunas negras",
        allowExtras: true,
        sizes: [
          { label: "22 cm", price: 4.0 },
          { label: "33 cm", price: 8.0 },
          { label: "40 cm", price: 9.0 },
        ],
      },
      {
        id: "p4", type: "pizza",
        name: "Caprese",
        img: "images/pizza-caprese.png",
        desc: "Salsa napole, mozzarella, jamón, tomate y albahaca",
        allowExtras: true,
        sizes: [
          { label: "40 cm", price: 9.0 },
        ],
      },
      {
        id: "p5", type: "pizza",
        name: "La Fiore",
        img: "images/pizza-la-fiore.png",
        desc: "Salsa napole, mozzarella, pepperoni, tocineta, salchicha polaca, salchichón, borde de queso y salsa de la casa",
        allowExtras: true,
        sizes: [
          { label: "33 cm", price: 8.0 },
        ],
      },
      {
        id: "p6", type: "pizza",
        name: "La Ahumadita",
        img: "images/pizza-la-ahumadita.png",
        desc: "Salsa napole, mozzarella, tomates cherry deshidratados, chistorra, jamón ahumado, chimichurri ahumado con tocineta crispy y queso parmesano",
        allowExtras: true,
        sizes: [
          { label: "33 cm", price: 8.0 },
        ],
      },
      {
        id: "p7", type: "pizza",
        name: "Hawaiana",
        img: "images/pizza-hawaiana.png",
        desc: "Salsa napole, mozzarella, jamón y piña",
        allowExtras: true,
        sizes: [
          { label: "22 cm", price: 7.0 },
          { label: "33 cm", price: 8.0 },
          { label: "40 cm", price: 10.0 },
        ],
      },
      {
        id: "p8", type: "pizza",
        name: "Megapizza",
        img: "images/pizza-megapizza.png",
        desc: "Salsa napole, mozzarella, jamón, pepperoni, tocineta, chorizo y salchichón (También disponible como vegetariana) — 80 cm de pura delicia",
        allowExtras: true,
        sizes: [
          { label: "80 cm", price: 24.0 },
        ],
      },
      {
        id: "p9", type: "pizza",
        name: "4 Quesos",
        img: "images/pizza-cuatro-quesos.png",
        desc: "Salsa napole, mozzarella, queso azul, queso pecorino, queso manchego y jamón",
        allowExtras: true,
        sizes: [
          { label: "22 cm", price: 8.0  },
          { label: "33 cm", price: 10.0 },
          { label: "40 cm", price: 12.0 },
        ],
      },
      {
  id: "p10", type: "pizza",
  name: "Chocopizza",
  img: "images/pizza-chocopizza.png",
  desc: "Nutella o arequipe, gomitas, caramelo Dandy y lluvia de colores",
  allowExtras: false,
  sizes: [
    { label: "22 cm", price: 6.0  },
    { label: "33 cm", price: 8.0  },
  ],
},
    ],
  },

  // ════════════ CALZONES & MÁS ════════════
  {
    id: "otros",
    name: "Calzones & Más",
    icon: "🥙",
    desc: "Pasticho, calzones y rolls artesanales.",
    items: [
      {
        id: "o1", type: "pizza",
        name: "Pasticho",
        img: "images/pasticho.png",
        desc: "Salsa napole, mozzarella, jamón, tocineta y carne molida",
        allowExtras: true,
        sizes: [{ label: "18×14 cm", price: 7.0 }],
      },
      {
        id: "o2", type: "pizza",
        name: "Calzone",
        img: "images/Calzone.png",
        desc: "Salsa napole, mozzarella y jamón",
        allowExtras: true,
        sizes: [{ label: "33 cm", price: 6.0 }],
      },
      {
        id: "o3", type: "pizza",
        name: "Calzone de Atún",
        img: "images/Calzone.png",
        desc: "Salsa napole, mozzarella, jamón, cebolla, pimentón y atún",
        allowExtras: true,
        sizes: [{ label: "33 cm", price: 8.0 }],
      },
      {
        id: "o4", type: "pizza",
        name: "Roll Tasty",
        img: "images/Roll-tasty.png",
        desc: "Salsa napole, mozzarella, jamón, tocineta, tomate y albahaca",
        allowExtras: true,
        sizes: [{ label: "4 rolls", price: 6.0 }],
      },
    ],
  },

  // ════════════ BEBIDAS ════════════
  {
    id: "bebidas",
    name: "Bebidas",
    icon: "🥤",
    desc: "Refrescantes acompañantes para tu pedido.",
    items: [
      { id: "b1", type: "drink", name: "Refresco 1.5L", img: "images/coca-cola.png",  price: 2.5, allowExtras: false },
      { id: "b2", type: "drink", name: "Lipton 500ml",        img: "images/lipton.png",    price: 2.0, allowExtras: false },
      { id: "b3", type: "drink", name: "Gatorade 500ml",      img: "images/gatorade.png",  price: 2.0, allowExtras: false },
      { id: "b4", type: "drink", name: "Agua pequeña 355ml",  img: "images/agua.png",      price: 1.0, allowExtras: false },
      { id: "b5", type: "drink", name: "Agua grande 1L",   img: "images/agua.png",      price: 1.5, allowExtras: false },
      { id: "b6", type: "drink", name: "Yukery 250ml",        img: "images/yukery.png",    price: 1.0, allowExtras: false },
      { id: "b7", type: "drink", name: "Bombita 355ml",       img: "images/bombita.png",   price: 1.0, allowExtras: false },
    ],
  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────
function findItem(itemId) {
  for (const cat of MENU) {
    const it = cat.items.find(i => i.id === itemId);
    if (it) return it;
  }
  return null;
}

function findCategory(itemId) {
  return MENU.find(cat => cat.items.some(i => i.id === itemId));
}

function formatPrice(n) {
  return "$" + (Number.isInteger(n) ? n : n.toFixed(2));
}
