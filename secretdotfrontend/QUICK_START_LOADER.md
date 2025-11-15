# 🚀 Quick Start - Loader AnimadoLo que se agregó (sin tocar la funcionalidad existente):

## 📦 Archivos Creados

### Componentes:
1. **`src/components/ui/loader.tsx`** - Loader básico verde emerald
2. **`src/components/ui/loader-polkadot.tsx`** - Loader variante con gradiente Polkadot
3. **`src/components/ui/loader-demo.tsx`** - Página de demostración interactiva

### Rutas:
4. **`src/app/loader-demo/page.tsx`** - Ruta Next.js para la demo

### Documentación:
5. **`LOADER_README.md`** - Documentación completa con ejemplos
6. **`QUICK_START_LOADER.md`** - Este archivo
7. **`public/loader-preview.html`** - Preview HTML standalone

---

## ⚡ Ver el Loader en Acción (3 formas)

### Opción 1: HTML Standalone (más rápido)
```bash
# Abrir directamente en el navegador
open secretdotfrontend/public/loader-preview.html
# O en Windows:
start secretdotfrontend/public/loader-preview.html
```

### Opción 2: En la aplicación Next.js
```bash
cd secretdotfrontend
npm run dev
# Luego abrir: http://localhost:3000/loader-demo
```

### Opción 3: Integrar en tu código
Ver ejemplos en `LOADER_README.md`

---

## 🎯 Uso Rápido

### Importar y usar el loader:

```tsx
import { Loader, FullScreenLoader, InlineLoader } from "~/components/ui/loader"

// Loader básico
<Loader size={80} />

// Loader pantalla completa
<FullScreenLoader message="Procesando transacción..." />

// Loader inline (pequeño)
<InlineLoader size={20} />
```

### Variante Polkadot (con gradiente):

```tsx
import { PolkadotLoader, PolkadotFullScreenLoader } from "~/components/ui/loader-polkadot"

// Loader con gradiente rosa-púrpura-cyan
<PolkadotLoader size={100} />

// Pantalla completa estilo Polkadot
<PolkadotFullScreenLoader message="Conectando a Polkadot..." />
```

---

## 🔧 Integración Opcional en Dashboard

Si quieres usar el loader en tu Dashboard actual, aquí hay algunas sugerencias:

### 1. Reemplazar spinner del botón de refresh

```tsx
// En Dashboard.tsx, línea ~630
import { InlineLoader } from "~/components/ui/loader"

<Button onClick={fetchAndDecryptMessages} disabled={loadingMessages}>
  {loadingMessages ? (
    <InlineLoader size={16} className="mr-2" />
  ) : (
    <RefreshCw className="h-4 w-4 mr-2" />
  )}
  {loadingMessages ? "Actualizando..." : "Actualizar"}
</Button>
```

### 2. Estado de carga de mensajes

```tsx
// En Dashboard.tsx, línea ~641
import { Loader } from "~/components/ui/loader"

{loadingMessages ? (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Loader size={100} />
    <p className="text-slate-400 text-sm">Descargando mensajes cifrados...</p>
  </div>
) : decryptedMessages.length === 0 ? (
  // ... resto del código
```

### 3. Transacciones blockchain

```tsx
// Cuando registras la clave pública o envías mensajes
import { FullScreenLoader } from "~/components/ui/loader"

const [txPending, setTxPending] = useState(false)

// Durante la transacción
{txPending && (
  <FullScreenLoader message="Registrando clave en blockchain..." />
)}
```

---

## 🎨 Personalización

### Cambiar colores:

```tsx
// Verde (default)
<Loader className="text-emerald-500" />

// Cian
<Loader className="text-cyan-500" />

// Púrpura (Polkadot style)
<Loader className="text-purple-500" />
```

### Ajustar tamaño:

```tsx
<Loader size={40} />  // Pequeño
<Loader size={80} />  // Mediano (default)
<Loader size={120} /> // Grande
<Loader size={200} /> // Muy grande
```

---

## 📊 Comparación de Variantes

| Variante | Color | Uso Recomendado |
|----------|-------|----------------|
| `Loader` | Verde emerald | Estado general, mensajes, transacciones |
| `PolkadotLoader` | Gradiente rosa-púrpura-cyan | Conexión Polkadot, operaciones blockchain |
| `InlineLoader` | Verde (pequeño) | Botones, texto inline |
| `PolkadotInlineLoader` | Gradiente (pequeño) | Botones Polkadot, indicadores |

---

## ✅ Checklist de Integración

- [ ] Vista previa en `loader-preview.html` ✓
- [ ] Probado en `/loader-demo` de Next.js
- [ ] Decidir dónde usar el loader en la app
- [ ] Importar componentes necesarios
- [ ] Reemplazar spinners existentes (opcional)
- [ ] Probar con `prefers-reduced-motion`

---

## 🐛 Troubleshooting

### El loader no se ve:
- Verificar que los imports sean correctos
- Verificar que el componente tenga espacio suficiente (min-height)

### Las animaciones son muy rápidas/lentas:
- Editar los valores en los `@keyframes` dentro del componente
- Por defecto: rotación 3s, pulso 2s

### Quiero desactivar el loader:
- No hay problema, los componentes son independientes
- Solo no los importes y listo

---

## 📚 Recursos

- **Documentación completa**: `LOADER_README.md`
- **Preview HTML**: `public/loader-preview.html`
- **Demo interactiva**: `/loader-demo` (Next.js)
- **Código fuente**: `src/components/ui/loader.tsx`

---

¡Listo para usar! 🎉

