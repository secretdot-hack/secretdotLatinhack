"use client"

import { type SVGProps } from "react"

interface LogoSecretDotProps extends SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

export function LogoSecretDot({ 
  size = 40, 
  className = "",
  ...props 
}: LogoSecretDotProps) {
  // Parámetros del patrón
  const nEllipses = 45
  const rx = 60
  const ry = 35
  const R = 90
  const ellipsePoints = 220

  // Ángulos de los 3 lóbulos (triángulo equilátero)
  const lobeAngles = [
    Math.PI / 2,
    Math.PI / 2 + (2 * Math.PI / 3),
    Math.PI / 2 + (4 * Math.PI / 3),
  ]

  const generateEllipsePaths = () => {
    const paths: string[] = []

    for (const base of lobeAngles) {
      for (let k = 0; k < nEllipses; k++) {
        const frac = k / (nEllipses - 1)

        const cx = R * Math.cos(base) * frac
        const cy = R * Math.sin(base) * frac

        const theta = base + (frac - 0.5) * 1.2

        const points: string[] = []
        for (let i = 0; i < ellipsePoints; i++) {
          const u = (2 * Math.PI * i) / ellipsePoints

          const xu = rx * Math.cos(u)
          const yu = ry * Math.sin(u)

          const x = cx + xu * Math.cos(theta) - yu * Math.sin(theta)
          const y = cy + xu * Math.sin(theta) + yu * Math.cos(theta)

          points.push(`${x.toFixed(3)},${y.toFixed(3)}`)
        }

        paths.push(points.join(" "))
      }
    }

    return paths
  }

  const paths = generateEllipsePaths()

  return (
    <svg
      width={size}
      height={size}
      viewBox="-150 -150 300 300"
      className={className}
      {...props}
    >
      {paths.map((points, index) => (
        <polyline
          key={index}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

