# 🌀 Loader Animado SecretDot

Loader animado estilo Web3/Polkadot inspirado en el logo de SecretDot con 3 lóbulos geométricos.

## 🎨 Características

- ✨ Diseño inspirado en el logo de SecretDot (3 lóbulos con elipses rotatorias)
- 🎭 Animaciones suaves con pulsos por lóbulo
- 📱 Responsive y escalable
- ♿ Compatible con `prefers-reduced-motion`
- 🎨 Usa colores del tema (emerald/cyan)

## 📦 Componentes Disponibles

### 1. `Loader` - Loader básico

```tsx
import { Loader } from "~/components/ui/loader"

// Uso básico
<Loader />

// Con tamaño personalizado
<Loader size={120} />

// Con clases adicionales
<Loader size={80} className="my-4 opacity-75" />
```

**Props:**
- `size?: number` - Tamaño en píxeles (default: 80)
- `className?: string` - Clases CSS adicionales

---

### 2. `FullScreenLoader` - Loader pantalla completa

Ideal para estados de carga de toda la aplicación o transacciones blockchain.

```tsx
import { FullScreenLoader } from "~/components/ui/loader"

// Uso básico
<FullScreenLoader />

// Con mensaje personalizado
<FullScreenLoader message="Procesando transacción..." />
```

**Props:**
- `message?: string` - Mensaje a mostrar (default: "Cargando...")

---

### 3. `InlineLoader` - Loader pequeño inline

Perfecto para botones, textos o indicadores pequeños.

```tsx
import { InlineLoader } from "~/components/ui/loader"

// Uso básico
<InlineLoader />

// En un botón
<Button disabled={loading}>
  {loading && <InlineLoader size={16} className="mr-2" />}
  {loading ? "Cargando..." : "Enviar"}
</Button>

// En texto
<p className="flex items-center gap-2">
  <InlineLoader size={20} />
  Procesando mensaje cifrado...
</p>
```

**Props:**
- `size?: number` - Tamaño en píxeles (default: 20)
- `className?: string` - Clases CSS adicionales

---

## 🚀 Ejemplos de Uso

### Ejemplo 1: Estado de carga en Dashboard

```tsx
import { Loader } from "~/components/ui/loader"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={120} />
      </div>
    )
  }
  
  return <div>Contenido del dashboard</div>
}
```

### Ejemplo 2: Botón con loading

```tsx
import { InlineLoader } from "~/components/ui/loader"
import { Button } from "~/components/ui/button"

export default function SendButton() {
  const [sending, setSending] = useState(false)
  
  return (
    <Button 
      onClick={handleSend} 
      disabled={sending}
      className="bg-emerald-600 hover:bg-emerald-700"
    >
      {sending && <InlineLoader size={16} className="mr-2" />}
      {sending ? "Enviando..." : "Enviar mensaje"}
    </Button>
  )
}
```

### Ejemplo 3: Transacción blockchain

```tsx
import { FullScreenLoader } from "~/components/ui/loader"

export default function TransactionHandler() {
  const [txPending, setTxPending] = useState(false)
  
  const handleTransaction = async () => {
    setTxPending(true)
    try {
      await sendTransaction()
    } finally {
      setTxPending(false)
    }
  }
  
  return (
    <>
      <Button onClick={handleTransaction}>
        Confirmar transacción
      </Button>
      
      {txPending && (
        <FullScreenLoader message="Procesando en blockchain..." />
      )}
    </>
  )
}
```

### Ejemplo 4: Lista de mensajes cargando

```tsx
import { Loader } from "~/components/ui/loader"

export default function MessageList() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-8">
          <Loader size={80} />
        </div>
        <p className="text-center text-slate-400 text-sm">
          Descargando mensajes cifrados...
        </p>
      </div>
    )
  }
  
  return (
    <div>
      {messages.map(msg => <MessageCard key={msg.id} {...msg} />)}
    </div>
  )
}
```

---

## 🎨 Personalización de Colores

El loader usa `currentColor` para el color de trazo, lo que significa que puedes cambiar el color usando clases de Tailwind:

```tsx
// Verde (default)
<Loader className="text-emerald-500" />

// Cian
<Loader className="text-cyan-500" />

// Gradiente (usando un wrapper)
<div className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
  <Loader />
</div>

// Púrpura (Polkadot theme)
<Loader className="text-purple-500" />
```

---

## 🎭 Animaciones

El loader incluye 3 tipos de animaciones:

1. **Rotación global** - El SVG completo rota continuamente
2. **Pulso por lóbulo** - Cada uno de los 3 lóbulos pulsa con delay
3. **Fade de elipses** - Cada elipse cambia opacidad y grosor

Estas animaciones se respetan las preferencias de `prefers-reduced-motion` definidas en `globals.css`.

---

## 🧪 Demo

Para ver todos los ejemplos en acción, ejecuta:

```bash
cd secretdotfrontend
npm run dev
```

Luego abre: `http://localhost:3000/loader-demo`

*(Nota: Necesitas crear la ruta en `src/app/loader-demo/page.tsx` apuntando al componente `LoaderDemo`)*

---

## 🛠️ Integración con el Dashboard Actual

El loader está listo para usarse pero **no modifica ninguna funcionalidad existente**. Puedes integrarlo gradualmente:

### Opción 1: Reemplazar MessageSkeletonList (opcional)

```tsx
// Antes (Dashboard.tsx línea 641-642)
{loadingMessages ? (
  <MessageSkeletonList count={3} />
) : ...}

// Después (si quieres usar el nuevo loader)
{loadingMessages ? (
  <div className="flex justify-center py-12">
    <Loader size={100} />
  </div>
) : ...}
```

### Opción 2: Agregar al botón de refresh

```tsx
// Dashboard.tsx línea 630-639
<Button
  onClick={fetchAndDecryptMessages}
  disabled={loadingMessages}
>
  {loadingMessages ? (
    <InlineLoader size={16} className="mr-2" />
  ) : (
    <RefreshCw className="h-4 w-4 mr-2" />
  )}
  {loadingMessages ? "Actualizando..." : "Actualizar"}
</Button>
```

### Opción 3: Loading de transacciones

```tsx
// En handleMakePublicKey o fetchAndDecryptMessages
const [txLoading, setTxLoading] = useState(false)

// Durante la transacción
{txLoading && (
  <FullScreenLoader message="Registrando clave en blockchain..." />
)}
```

---

## 📝 Notas Técnicas

- **Rendimiento**: El loader usa CSS animations (GPU-accelerated), muy eficiente
- **Tamaño**: ~3KB (componente + estilos inline)
- **Dependencias**: Solo React, sin librerías externas
- **Compatibilidad**: Todos los navegadores modernos que soporten SVG

---

## 🎯 Roadmap / Mejoras Futuras

- [ ] Variante con gradiente animado
- [ ] Diferentes velocidades de animación
- [ ] Variante con partículas (estilo blockchain)
- [ ] Sonido opcional (accesibilidad para usuarios con discapacidad visual)

---

¡Disfruta del nuevo loader! 🚀✨

