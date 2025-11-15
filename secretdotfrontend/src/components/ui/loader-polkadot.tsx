import React from "react"

interface PolkadotLoaderProps {
  size?: number
  className?: string
}

/**
 * Loader con gradiente estilo Polkadot (rosa-púrpura-cyan)
 * Variante del loader principal con colores más vibrantes
 */
export const PolkadotLoader: React.FC<PolkadotLoaderProps> = ({ 
  size = 80, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes polkadot-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes polkadot-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          
          @keyframes polkadot-ellipse-fade {
            0%, 100% { 
              stroke-width: 1;
              opacity: 0.4;
            }
            50% { 
              stroke-width: 2.5;
              opacity: 1;
            }
          }
          
          @keyframes polkadot-gradient {
            0% { stop-color: #ec4899; }
            33% { stop-color: #a855f7; }
            66% { stop-color: #06b6d4; }
            100% { stop-color: #ec4899; }
          }
          
          .polkadot-loader-svg {
            animation: polkadot-rotate 3s linear infinite;
            filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
          }
          
          .polkadot-lobe-1 {
            animation: polkadot-pulse 2s ease-in-out infinite;
            transform-origin: center;
          }
          
          .polkadot-lobe-2 {
            animation: polkadot-pulse 2s ease-in-out infinite;
            animation-delay: 0.666s;
            transform-origin: center;
          }
          
          .polkadot-lobe-3 {
            animation: polkadot-pulse 2s ease-in-out infinite;
            animation-delay: 1.333s;
            transform-origin: center;
          }
          
          .polkadot-ellipse-path {
            animation: polkadot-ellipse-fade 2s ease-in-out infinite;
          }
        `
      }} />
      <svg
        width={size}
        height={size}
        viewBox="-150 -150 300 300"
        className="polkadot-loader-svg"
      >
        {/* Definir gradiente Polkadot */}
        <defs>
          <linearGradient id="polkadot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#a855f7", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Definir los 3 lóbulos en ángulos de triángulo equilátero */}
        {[
          Math.PI / 2,
          Math.PI / 2 + (2 * Math.PI / 3),
          Math.PI / 2 + (4 * Math.PI / 3),
        ].map((baseAngle, lobeIndex) => {
          const nEllipses = 12
          const rx = 60
          const ry = 35
          const R = 90

          return (
            <g key={lobeIndex} className={`polkadot-lobe-${lobeIndex + 1}`}>
              {Array.from({ length: nEllipses }).map((_, k) => {
                const frac = k / (nEllipses - 1)
                const cx = R * Math.cos(baseAngle) * frac
                const cy = R * Math.sin(baseAngle) * frac
                const theta = baseAngle + (frac - 0.5) * 1.2
                const rotateDeg = (theta * 180) / Math.PI

                return (
                  <ellipse
                    key={k}
                    cx={cx}
                    cy={cy}
                    rx={rx}
                    ry={ry}
                    fill="none"
                    stroke="url(#polkadot-gradient)"
                    strokeWidth="1.5"
                    transform={`rotate(${rotateDeg} ${cx} ${cy})`}
                    opacity={0.4 + (frac * 0.6)}
                    className="polkadot-ellipse-path"
                    style={{
                      animationDelay: `${(lobeIndex * 0.15) + (k * 0.03)}s`
                    }}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export const PolkadotFullScreenLoader: React.FC<{ message?: string }> = ({ 
  message = "Conectando a Polkadot..." 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <PolkadotLoader size={120} />
      <p className="mt-6 text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text font-mono text-sm animate-pulse font-bold">
        {message}
      </p>
    </div>
  )
}

export const PolkadotInlineLoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20,
  className = ""
}) => {
  return (
    <PolkadotLoader size={size} className={className} />
  )
}

