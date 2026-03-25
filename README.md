# Fiorella B'Pizzas — App de Pedidos

App de menú y pedidos por WhatsApp para Fiorella B'Pizzas.  
Proyecto estático: HTML + CSS + JS puro. Sin frameworks, sin dependencias.

---

## Estructura del proyecto

```
fiorella-bpizzas/
├── index.html          ← Pantalla de selección de sucursal
├── menu.html           ← Menú completo + carrito
├── css/
│   ├── base.css        ← Variables, reset, animaciones
│   ├── branch.css      ← Estilos pantalla sucursales
│   └── menu.css        ← Estilos menú, carrito y modal
├── js/
│   ├── data.js         ← TODA la data: sucursales, menú, precios
│   ├── branch.js       ← Lógica selección de sucursal
│   └── menu.js         ← Lógica menú, carrito, modal y WhatsApp
├── images/             ← Aquí van los PNG de los productos
│   ├── pizza-margarita.png
│   ├── pizza-charcutera.png
│   └── ...
├── vercel.json         ← Configuración de routing para Vercel
└── README.md
```

---

## Agregar imágenes de los productos

1. Coloca tus archivos PNG en la carpeta `images/`
2. Los nombres deben coincidir exactamente con los definidos en `js/data.js`:

| Producto        | Archivo esperado              |
|----------------|-------------------------------|
| Margarita      | `pizza-margarita.png`         |
| Charcutera     | `pizza-charcutera.png`        |
| Vegetariana    | `pizza-vegetariana.png`       |
| Caprese        | `pizza-caprese.png`           |
| La Fiore       | `pizza-la-fiore.png`          |
| La Ahumadita   | `pizza-la-ahumadita.png`      |
| Hawaiana       | `pizza-hawaiana.png`          |
| Megapizza      | `pizza-megapizza.png`         |
| 4 Quesos       | `pizza-4-quesos.png`          |
| Pasticho       | `pasticho.png`                |
| Calzone        | `calzone.png`                 |
| Calzone Atún   | `calzone-atun.png`            |
| Roll Tasty     | `roll-tasty.png`              |
| Refresco       | `refresco.png`                |
| Lipton         | `lipton.png`                  |
| Gatorade       | `gatorade.png`                |
| Agua           | `agua.png`                    |
| Yukery         | `yukery.png`                  |
| Bombita        | `bombita.png`                 |

> Si alguna imagen no está, la app muestra un emoji como fallback automáticamente.

---

## Actualizar precios o productos

Todo el menú está en `js/data.js`. Edita el array `MENU` para:
- Cambiar precios → modifica el campo `price` o los `sizes[].price`
- Agregar productos → agrega un nuevo objeto al array `items` de la categoría
- Cambiar sucursales → edita el array `BRANCHES`

---

## Configurar en VS Code

1. Abre VS Code
2. `File → Open Folder` → selecciona la carpeta `fiorella-bpizzas`
3. Instala la extensión **"Live Server"** (ritwickdey.LiveServer)
4. Clic derecho sobre `index.html` → **"Open with Live Server"**
5. La app se abre en el navegador y se actualiza automáticamente al guardar

---

## Subir a GitHub

```bash
# Dentro de la carpeta del proyecto:
git init
git add .
git commit -m "feat: app inicial Fiorella B'Pizzas"

# Crear repo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/fiorella-bpizzas.git
git branch -M main
git push -u origin main
```

---

## Desplegar en Vercel

### Opción A — Desde el dashboard (más fácil)
1. Ve a [vercel.com](https://vercel.com) → Sign up con GitHub
2. Click **"Add New Project"**
3. Selecciona el repo `fiorella-bpizzas`
4. Framework Preset: **"Other"** (no selecciones ninguno)
5. Click **"Deploy"** — listo en ~30 segundos

### Opción B — Desde la terminal
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Actualizar la app después del deploy

Cada vez que hagas cambios:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detecta el push automáticamente y redespliega en ~20 segundos.

---

## Notas importantes

- La app **no procesa pagos** — solo genera el pedido y redirige a WhatsApp
- Los precios son **estimados** — el pago real se hace en sucursal
- El número de WhatsApp al que se envía el mensaje es el **primer teléfono** de cada sucursal definido en `BRANCHES`
- Si una sucursal tiene múltiples números, puedes modificar la función `sendWA()` en `menu.js` para agregar un selector
