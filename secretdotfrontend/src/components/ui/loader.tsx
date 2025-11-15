import React from "react"

interface LoaderProps {
  size?: number
  className?: string
}

export const Loader: React.FC<LoaderProps> = ({ size = 80, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loader-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes loader-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          
          @keyframes loader-ellipse-fade {
            0%, 100% { 
              stroke-width: 1;
              opacity: 0.3;
            }
            50% { 
              stroke-width: 2;
              opacity: 0.8;
            }
          }
          
          .loader-svg {
            animation: loader-rotate 3s linear infinite;
          }
          
          .loader-lobe-1 {
            animation: loader-pulse 2s ease-in-out infinite;
            transform-origin: center;
          }
          
          .loader-lobe-2 {
            animation: loader-pulse 2s ease-in-out infinite;
            animation-delay: 0.666s;
            transform-origin: center;
          }
          
          .loader-lobe-3 {
            animation: loader-pulse 2s ease-in-out infinite;
            animation-delay: 1.333s;
            transform-origin: center;
          }
          
          .loader-ellipse-path {
            animation: loader-ellipse-fade 2s ease-in-out infinite;
          }
        `
      }} />
      <svg
        width={size}
        height={size}
        viewBox="-150 -150 300 300"
        className="loader-svg text-emerald-500"
      >
        {/* Definir los 3 lóbulos en ángulos de triángulo equilátero */}
        {[
          Math.PI / 2,
          Math.PI / 2 + (2 * Math.PI / 3),
          Math.PI / 2 + (4 * Math.PI / 3),
        ].map((baseAngle, lobeIndex) => {
          const nEllipses = 12 // número de elipses por lóbulo
          const rx = 60
          const ry = 35
          const R = 90

          return (
            <g key={lobeIndex} className={`loader-lobe-${lobeIndex + 1}`}>
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
                    stroke="currentColor"
                    strokeWidth="1.5"
                    transform={`rotate(${rotateDeg} ${cx} ${cy})`}
                    opacity={0.3 + (frac * 0.7)}
                    className="loader-ellipse-path"
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

export const FullScreenLoader: React.FC<{ message?: string }> = ({ 
  message = "Cargando..." 
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <Loader size={120} />
      <p className="mt-6 text-slate-300 font-mono text-sm animate-pulse">
        {message}
      </p>
    </div>
  )
}

// Loader más pequeño para usar inline
export const InlineLoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20,
  className = ""
}) => {
  return (
    <Loader size={size} className={className} />
  )
}

