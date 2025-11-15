"use client"

import React, { useState } from "react"
import { Loader, FullScreenLoader, InlineLoader } from "./loader"
import { PolkadotLoader, PolkadotFullScreenLoader, PolkadotInlineLoader } from "./loader-polkadot"
import { Button } from "./button"
import { Card, CardContent } from "./card"

/**
 * Componente de demostración del Loader
 * Este componente muestra diferentes usos del loader animado estilo Web3/Polkadot
 * 
 * EJEMPLOS DE USO:
 * 
 * 1. Loader básico:
 *    <Loader size={80} />
 * 
 * 2. Loader pantalla completa:
 *    <FullScreenLoader message="Procesando transacción..." />
 * 
 * 3. Loader inline (pequeño):
 *    <InlineLoader size={20} />
 * 
 * 4. Loader con clases personalizadas:
 *    <Loader size={100} className="my-4 opacity-75" />
 */
export default function LoaderDemo() {
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [showPolkadotFullScreen, setShowPolkadotFullScreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [polkadotLoading, setPolkadotLoading] = useState(false)

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

  const simulatePolkadotLoading = () => {
    setPolkadotLoading(true)
    setTimeout(() => setPolkadotLoading(false), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            SecretDot Loader Demo
          </h1>
          <p className="text-slate-400">
            Loader animado inspirado en el diseño geométrico del logo
          </p>
        </div>

        {/* Tamaños diferentes */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-emerald-400">
              Diferentes Tamaños
            </h2>
            <div className="flex items-center justify-around gap-4 flex-wrap">
              <div className="text-center">
                <Loader size={40} />
                <p className="text-xs text-slate-400 mt-2">Pequeño (40px)</p>
              </div>
              <div className="text-center">
                <Loader size={80} />
                <p className="text-xs text-slate-400 mt-2">Mediano (80px)</p>
              </div>
              <div className="text-center">
                <Loader size={120} />
                <p className="text-xs text-slate-400 mt-2">Grande (120px)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inline Loader */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-emerald-400">
              Loader Inline
            </h2>
            <div className="space-y-4">
              <p className="text-slate-300 flex items-center gap-2">
                {loading && <InlineLoader size={20} />}
                Procesando transacción...
              </p>
              <Button
                onClick={simulateLoading}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <InlineLoader size={16} className="mr-2" />
                    Cargando...
                  </>
                ) : (
                  "Simular carga"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Full Screen Loader */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-emerald-400">
              Loader Pantalla Completa
            </h2>
            <Button
              onClick={() => setShowFullScreen(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Mostrar Loader Pantalla Completa
            </Button>
          </CardContent>
        </Card>

        {/* Variante Polkadot */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text">
              Variante Polkadot (Gradiente)
            </h2>
            <div className="flex items-center justify-around gap-4 flex-wrap mb-6">
              <div className="text-center">
                <PolkadotLoader size={40} />
                <p className="text-xs text-slate-400 mt-2">Pequeño</p>
              </div>
              <div className="text-center">
                <PolkadotLoader size={80} />
                <p className="text-xs text-slate-400 mt-2">Mediano</p>
              </div>
              <div className="text-center">
                <PolkadotLoader size={120} />
                <p className="text-xs text-slate-400 mt-2">Grande</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-slate-300 flex items-center gap-2">
                {polkadotLoading && <PolkadotInlineLoader size={20} />}
                Conectando a Polkadot Asset Hub...
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={simulatePolkadotLoading}
                  disabled={polkadotLoading}
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600"
                >
                  {polkadotLoading ? (
                    <>
                      <PolkadotInlineLoader size={16} className="mr-2" />
                      Cargando...
                    </>
                  ) : (
                    "Simular carga Polkadot"
                  )}
                </Button>
                <Button
                  onClick={() => setShowPolkadotFullScreen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Pantalla completa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Código de ejemplo */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">
              Ejemplos de Código
            </h2>
            <div className="space-y-4 text-sm font-mono">
              <div className="bg-slate-950 p-4 rounded">
                <p className="text-slate-500 mb-2">// Loader básico (verde)</p>
                <p className="text-cyan-400">{`<Loader size={80} />`}</p>
              </div>
              
              <div className="bg-slate-950 p-4 rounded">
                <p className="text-slate-500 mb-2">// Loader Polkadot (gradiente)</p>
                <p className="text-pink-400">{`<PolkadotLoader size={80} />`}</p>
              </div>
              
              <div className="bg-slate-950 p-4 rounded">
                <p className="text-slate-500 mb-2">// Loader pantalla completa</p>
                <p className="text-cyan-400">{`<FullScreenLoader message="Procesando..." />`}</p>
              </div>
              
              <div className="bg-slate-950 p-4 rounded">
                <p className="text-slate-500 mb-2">// Loader inline pequeño</p>
                <p className="text-cyan-400">{`<InlineLoader size={20} />`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Screen Loaders */}
      {showFullScreen && (
        <>
          <FullScreenLoader message="Conectando a la blockchain..." />
          {/* Auto-cerrar después de 3 segundos */}
          {setTimeout(() => setShowFullScreen(false), 3000) && null}
        </>
      )}
      
      {showPolkadotFullScreen && (
        <>
          <PolkadotFullScreenLoader message="Conectando a Polkadot Asset Hub..." />
          {/* Auto-cerrar después de 3 segundos */}
          {setTimeout(() => setShowPolkadotFullScreen(false), 3000) && null}
        </>
      )}
    </div>
  )
}

