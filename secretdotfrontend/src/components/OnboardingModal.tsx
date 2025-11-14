"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "./ui/dialog"
import { Button } from "./ui/button"
import { Key, Lock, Shield, CheckCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react"

interface OnboardingModalProps {
  open: boolean
  onComplete: () => void
  onPublishKey: () => Promise<void>
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "¿Qué es una clave pública?",
    description: "Es como tu dirección postal digital. Cualquiera puede usarla para enviarte mensajes cifrados, pero solo tú puedes leerlos.",
    icon: Key,
    iconColor: "text-cyan-400",
    details: [
      "Se comparte públicamente sin riesgos",
      "Es única para tu cuenta",
      "Permite que otros te envíen mensajes seguros"
    ],
    illustration: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-400/50 flex items-center justify-center animate-pulse">
            <Key className="h-10 w-10 text-cyan-400" />
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-cyan-500/5 animate-ping" style={{ animationDuration: '3s' }} />
      </div>
    )
  },
  {
    id: 2,
    title: "¿Cómo se usa para cifrar?",
    description: "Cuando alguien quiere enviarte un mensaje, usa tu clave pública para cifrarlo. Solo tu clave privada (que nunca sale de tu billetera) puede descifrarlo.",
    icon: Lock,
    iconColor: "text-emerald-400",
    details: [
      "El mensaje se cifra localmente en el navegador del remitente",
      "Viaja encriptado por la blockchain",
      "Solo tú puedes descifrarlo con tu billetera"
    ],
    illustration: (
      <div className="relative w-full h-32 flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50 flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <span className="text-xs text-slate-400">Mensaje</span>
        </div>
        
        <div className="flex flex-col items-center">
          <ArrowRight className="h-6 w-6 text-emerald-400 animate-pulse" />
          <Lock className="h-5 w-5 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/50 flex items-center justify-center">
            <Lock className="h-8 w-8 text-emerald-400" />
          </div>
          <span className="text-xs text-slate-400">Cifrado</span>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Publica tu clave pública",
    description: "Registra tu clave pública en la blockchain de Polkadot para que otros puedan enviarte mensajes seguros. Este proceso es necesario solo una vez.",
    icon: Shield,
    iconColor: "text-emerald-400",
    details: [
      "Se guardará en la blockchain de Polkadot",
      "Es completamente segura y pública",
      "Permite que recibas mensajes privados"
    ],
    illustration: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border-2 border-emerald-400/50 flex items-center justify-center">
            <Shield className="h-12 w-12 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-emerald-400/20 animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-emerald-400/30 animate-ping" style={{ animationDuration: '3s' }} />
      </div>
    )
  }
]

export default function OnboardingModal({ open, onComplete, onPublishKey }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const step = ONBOARDING_STEPS[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onPublishKey()
      setIsComplete(true)
      // Esperar un momento para mostrar el estado de éxito antes de cerrar
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (error) {
      console.error("Error al publicar la clave:", error)
      setIsPublishing(false)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-100 overflow-hidden">
        <div className="relative">
          {/* Progress indicator */}
          <div className="flex gap-2 mb-6">
            {ONBOARDING_STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  idx <= currentStep
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                    : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          {/* Content with animation */}
          <div key={currentStep} className="space-y-6 animate-fade-slide-in">
            {/* Icon and Title */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-800/50 border border-slate-700 ${step.iconColor}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {step.title}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Paso {currentStep + 1} de {ONBOARDING_STEPS.length}
                </p>
              </div>
            </div>

            {/* Illustration */}
            <div className="my-6 p-6 bg-slate-950/50 rounded-xl border border-slate-800">
              {step.illustration}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">{step.description}</p>
              
              {/* Details list */}
              <div className="space-y-2 pl-4 border-l-2 border-emerald-400/30">
                {step.details.map((detail, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-slate-400 animate-fade-slide-left"
                    style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              {/* Previous button */}
              {currentStep > 0 && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}

              {/* Skip button (only on first step) */}
              {currentStep === 0 && (
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-300"
                >
                  Saltar tutorial
                </Button>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Next or Publish button */}
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || isComplete}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 min-w-[180px]"
                >
                  {isComplete ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      ¡Listo!
                    </>
                  ) : isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Publicar mi clave
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

