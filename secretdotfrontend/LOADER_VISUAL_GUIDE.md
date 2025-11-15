# 🌀 Loader Animado SecretDot - Guía Visual

## 🎨 Tu Logo Original

Tu logo tiene este diseño geométrico hermoso:
- **3 lóbulos** distribuidos en 120° (triángulo equilátero)
- **Múltiples elipses** por lóbulo con rotación progresiva
- **Patrón tipo Polkadot** con líneas que se entrelazan

```
        ╱╲
       ╱  ╲
      ╱ ⚪ ╲      ← Lóbulo 1 (arriba)
     ╱      ╲
    ╱________╲
    
⚪          ⚪     ← Lóbulo 2 y 3 (abajo, 120° entre sí)
```

---

## ✨ El Loader Animado

He creado un loader que captura la esencia de tu logo:

### 🎭 Animaciones

```
┌─────────────────────────────────┐
│                                 │
│        🔄 Rotación Global       │
│         (todo el SVG)           │
│                                 │
│    ┌──────────────────┐        │
│    │   💓 Pulso 1     │        │
│    │   (Lóbulo 1)     │        │
│    └──────────────────┘        │
│                                 │
│  ┌──────────────────┐          │
│  │   💓 Pulso 2     │          │
│  │   (Lóbulo 2)     │          │
│  └──────────────────┘          │
│                                 │
│         ┌──────────────────┐   │
│         │   💓 Pulso 3     │   │
│         │   (Lóbulo 3)     │   │
│         └──────────────────┘   │
│                                 │
│  ✨ Cada elipse también pulsa  │
│     y cambia de grosor          │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 Dos Variantes

### 1️⃣ Loader Verde (Default)

```
     🟢
    ╱  ╲
   ╱ 🟢 ╲      Color: Emerald (#10b981)
  ╱      ╲     Uso: General, mensajes, estados
 ╱________╲

🟢          🟢
```

**Componente:** `Loader`

```tsx
<Loader size={80} />
```

---

### 2️⃣ Loader Polkadot (Gradiente)

```
     🌈
    ╱  ╲
   ╱ 🎨 ╲      Gradiente: Rosa → Púrpura → Cyan
  ╱      ╲     Uso: Polkadot, blockchain, transacciones
 ╱________╲

🎨          🌈
```

**Componente:** `PolkadotLoader`

```tsx
<PolkadotLoader size={80} />
```

---

## 📦 Tamaños Disponibles

```
┌──────┐  ┌──────────┐  ┌──────────────┐
│  🔹  │  │    🔷    │  │      🔵      │
│ 40px │  │   80px   │  │    120px     │
│Pequeño│  │  Mediano │  │    Grande    │
└──────┘  └──────────┘  └──────────────┘

<Loader   <Loader      <Loader
size={40} size={80}    size={120}
/>        />           />
```

---

## 🚀 Casos de Uso

### 1. Loader Básico (Centro de pantalla)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              🌀                     │
│           Cargando...               │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

```tsx
<div className="flex justify-center py-12">
  <Loader size={100} />
</div>
```

---

### 2. Loader Pantalla Completa

```
┌─────────────────────────────────────┐
│         [Fondo oscuro blur]         │
│                                     │
│                                     │
│              🌀🌀                   │
│        Procesando transacción...    │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

```tsx
<FullScreenLoader message="Procesando transacción..." />
```

---

### 3. Loader en Botón

```
┌────────────────────────┐
│  🔄 Enviando mensaje   │  ← Botón deshabilitado
└────────────────────────┘

┌────────────────────────┐
│   Enviar mensaje       │  ← Botón normal
└────────────────────────┘
```

```tsx
<Button disabled={loading}>
  {loading && <InlineLoader size={16} className="mr-2" />}
  {loading ? "Enviando mensaje" : "Enviar mensaje"}
</Button>
```

---

### 4. Loader Inline (en texto)

```
📥 Cargando mensajes  🔄  [3 de 10]
```

```tsx
<p className="flex items-center gap-2">
  📥 Cargando mensajes
  <InlineLoader size={20} />
  [3 de 10]
</p>
```

---

## 📂 Estructura de Archivos

```
secretdotfrontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── loader.tsx          ✅ Loader verde
│   │       ├── loader-polkadot.tsx ✅ Loader gradiente
│   │       └── loader-demo.tsx     ✅ Demo interactiva
│   └── app/
│       └── loader-demo/
│           └── page.tsx            ✅ Ruta demo
├── public/
│   └── loader-preview.html         ✅ Preview HTML
├── LOADER_README.md                ✅ Documentación completa
├── QUICK_START_LOADER.md           ✅ Guía rápida
├── LOADER_SUMMARY.md               ✅ Resumen
└── LOADER_VISUAL_GUIDE.md          ✅ Esta guía
```

---

## 🎯 ¿Cómo Verlo?

### Opción A: HTML Standalone ⚡ (MÁS RÁPIDO)

1. Abrir en tu navegador:
   ```
   secretdotfrontend/public/loader-preview.html
   ```

2. Verás:
   - Loader pequeño, mediano, grande
   - Variante Polkadot
   - Ejemplos de código
   - Características del loader

---

### Opción B: Demo Interactiva en Next.js 🚀

1. Ejecutar:
   ```bash
   cd secretdotfrontend
   npm run dev
   ```

2. Ir a:
   ```
   http://localhost:3000/loader-demo
   ```

3. Verás:
   - Diferentes tamaños
   - Botones interactivos
   - Loaders pantalla completa
   - Ejemplos de código copiables

---

## 🛠️ Integración en Dashboard (Opcional)

### Escenario 1: Botón "Actualizar mensajes"

**ANTES:**
```tsx
<Button onClick={fetchAndDecryptMessages} disabled={loadingMessages}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Actualizar
</Button>
```

**DESPUÉS:**
```tsx
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

---

### Escenario 2: Cargando mensajes

**ANTES:**
```tsx
{loadingMessages ? (
  <MessageSkeletonList count={3} />
) : (
  // mensajes...
)}
```

**DESPUÉS (Opción 1 - Reemplazar skeleton):**
```tsx
import { Loader } from "~/components/ui/loader"

{loadingMessages ? (
  <div className="flex justify-center py-12">
    <Loader size={100} />
  </div>
) : (
  // mensajes...
)}
```

**DESPUÉS (Opción 2 - Mantener skeleton, agregar loader arriba):**
```tsx
import { Loader } from "~/components/ui/loader"

{loadingMessages ? (
  <>
    <div className="flex justify-center py-8">
      <Loader size={80} />
    </div>
    <MessageSkeletonList count={3} />
  </>
) : (
  // mensajes...
)}
```

---

### Escenario 3: Transacción blockchain

**NUEVO:**
```tsx
import { FullScreenLoader } from "~/components/ui/loader"

const [txPending, setTxPending] = useState(false)

const handleMakePublicKey = async () => {
  setTxPending(true)
  try {
    // ... código de transacción
  } finally {
    setTxPending(false)
  }
}

return (
  <>
    {/* ... resto del componente */}
    
    {txPending && (
      <FullScreenLoader message="Registrando clave en blockchain..." />
    )}
  </>
)
```

---

## 🎨 Personalización de Colores

### Loader Verde (customizable)

```tsx
// Verde emerald (default)
<Loader className="text-emerald-500" />

// Cyan
<Loader className="text-cyan-500" />

// Púrpura
<Loader className="text-purple-500" />

// Rosa
<Loader className="text-pink-500" />

// Amarillo
<Loader className="text-yellow-500" />
```

### Loader Polkadot (NO customizable)

El gradiente está hardcoded:
- Rosa (#ec4899)
- Púrpura (#a855f7)
- Cyan (#06b6d4)

---

## ⚡ Performance

### Optimizado para:
- ✅ 60 FPS con animaciones CSS (GPU-accelerated)
- ✅ SVG ligero (~3KB)
- ✅ Sin dependencias externas
- ✅ Respeta `prefers-reduced-motion`
- ✅ Compatible con todos los navegadores modernos

### NO usar para:
- ❌ Animaciones de más de 5 minutos (el usuario se frustrará)
- ❌ Múltiples loaders grandes simultáneos (afecta performance)

---

## 📊 Comparativa con MessageSkeleton

| Aspecto | MessageSkeleton | Loader Animado |
|---------|----------------|----------------|
| **Tipo** | Skeleton placeholder | Loader circular |
| **Uso** | Carga de lista de mensajes | Estados generales |
| **Diseño** | Rectángulos pulsantes | Círculo rotatorio |
| **Información** | Muestra estructura | Solo indica carga |
| **Mejor para** | Listas, tablas, cards | Pantallas completas, botones |

**Recomendación:** Puedes usar ambos juntos o elegir uno según tu preferencia.

---

## 🎓 Tips de UX

### ✅ Buenas prácticas:

1. **Siempre agregar un mensaje**: No solo el loader, también texto explicativo
   ```tsx
   <Loader />
   <p>Descargando mensajes cifrados...</p>
   ```

2. **Usar el tamaño apropiado**:
   - Botones: 16-20px
   - Cards: 60-80px
   - Pantalla completa: 100-120px

3. **Timeout para loaders de red**: Si tarda más de 10s, mostrar un mensaje
   ```tsx
   {loadingTime > 10000 && (
     <p>Esto está tardando más de lo normal...</p>
   )}
   ```

### ❌ Evitar:

1. No usar loaders muy grandes en botones pequeños
2. No poner múltiples loaders grandes en la misma vista
3. No usar el loader sin un mensaje explicativo en cargas largas

---

## 🐛 Troubleshooting

### Problema: El loader no se ve

**Solución:**
```tsx
// Asegurar que el contenedor tenga altura
<div style={{ minHeight: "150px" }}>
  <Loader size={80} />
</div>
```

---

### Problema: El loader se ve cortado

**Solución:**
```tsx
// Agregar padding al contenedor
<div className="p-4">
  <Loader size={100} />
</div>
```

---

### Problema: Las animaciones son muy rápidas

**Solución:** Editar los tiempos en `loader.tsx`:
```tsx
// Cambiar de:
animation: loader-rotate 3s linear infinite;

// A:
animation: loader-rotate 5s linear infinite;  // Más lento
```

---

## 📚 Recursos Adicionales

| Documento | ¿Para qué? |
|-----------|------------|
| `LOADER_README.md` | Documentación completa con todos los ejemplos de código |
| `QUICK_START_LOADER.md` | Guía rápida para empezar a usar el loader |
| `LOADER_SUMMARY.md` | Resumen ejecutivo de lo que se creó |
| `LOADER_VISUAL_GUIDE.md` | Esta guía visual paso a paso |
| `public/loader-preview.html` | Preview HTML para ver el loader sin instalar nada |

---

## ✅ Checklist Final

- [ ] Vi el preview en `loader-preview.html` ✓
- [ ] Entiendo las dos variantes (verde y Polkadot)
- [ ] Sé cómo importar los componentes
- [ ] Probé la demo en `/loader-demo`
- [ ] Decidí dónde quiero usar el loader (o no usarlo)
- [ ] Leí los ejemplos de integración
- [ ] Estoy listo para usar el loader en mi app

---

## 🎉 ¡Fin!

**¿Tienes dudas?** Consulta los otros documentos o el código fuente en `src/components/ui/loader.tsx`

**¿No quieres usar el loader?** No hay problema, no se modificó ninguna funcionalidad existente. Los componentes están ahí si los necesitas en el futuro.

---

**Diseñado con** ❤️ **para SecretDot**  
**Inspirado en el hermoso logo geométrico** 🌀

