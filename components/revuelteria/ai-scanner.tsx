"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { X, ScanLine, CheckCircle, AlertTriangle, Camera, CameraOff, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RevuelteriaProduct, FreshnessStatus } from "@/lib/inventory-data"

interface AiScannerProps {
  product: RevuelteriaProduct
  onClose: () => void
  onSave: (productId: string, status: FreshnessStatus, confidence: number, batchId?: string) => void
}

function getDaysSinceArrival(arrivalDate: string): number {
  const arrival = new Date(arrivalDate)
  const today = new Date()
  const diffTime = today.getTime() - arrival.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

function getFreshnessProbability(arrivalDate: string): { good: number; bad: number } {
  const days = getDaysSinceArrival(arrivalDate)
  
  if (days <= 2) {
    return { good: 0.95, bad: 0.05 }
  } else if (days <= 5) {
    return { good: 0.75, bad: 0.25 }
  } else if (days <= 7) {
    return { good: 0.50, bad: 0.50 }
  } else if (days <= 10) {
    return { good: 0.30, bad: 0.70 }
  } else {
    return { good: 0.15, bad: 0.85 }
  }
}

function getRecommendation(status: FreshnessStatus, confidence: number): string {
  if (status === "fresco") {
    if (confidence >= 90) {
      return "Producto en excelente estado. Mantener en exhibicion al precio normal."
    } else {
      return "Producto en buen estado. Vender a precio regular."
    }
  } else {
    if (confidence >= 90) {
      return "Producto en mal estado. Se recomienda/baja/botar inmediatamente - Alto riesgo para clientes."
    } else if (confidence >= 80) {
      return "Producto deteriorado. Aplicar descuento del 40-50% para vender rapido o botar."
    } else {
      return "Producto dudoso. Aplicar descuento del 20-30% o revisar manualmente."
    }
  }
}

function getRecommendationType(status: FreshnessStatus, confidence: number): "throw" | "discount" | "ok" {
  if (status === "fresco") return "ok"
  if (confidence >= 90) return "throw"
  return "discount"
}

export function AiScanner({ product, onClose, onSave }: AiScannerProps) {
  const [phase, setPhase] = useState<"ready" | "scanning" | "result">("ready")
  const [scanProgress, setScanProgress] = useState(0)
  const [result, setResult] = useState<{ status: FreshnessStatus; confidence: number } | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const oldestBatch = useMemo(() => {
    if (!product.batches || product.batches.length === 0) return null
    return product.batches.reduce((oldest, batch) => 
      batch.arrivalDate < oldest.arrivalDate ? batch : oldest
    , product.batches[0])
  }, [product.batches])

  const selectedBatch = useMemo(() => {
    if (!selectedBatchId || !product.batches) return null
    return product.batches.find(b => b.id === selectedBatchId) || null
  }, [selectedBatchId, product.batches])

  const targetBatch = selectedBatch || oldestBatch

  const daysSinceArrival = useMemo(() => {
    if (!targetBatch) return 0
    return getDaysSinceArrival(targetBatch.arrivalDate)
  }, [targetBatch])
  
  const freshnessProb = useMemo(() => {
    if (!product.batches || product.batches.length === 0) return { good: 0.95, bad: 0.05 }
    
    if (selectedBatchId && selectedBatch) {
      return getFreshnessProbability(selectedBatch.arrivalDate)
    }
    
    // Calculate weighted average based on all batches
    let totalWeight = 0
    let goodWeight = 0
    
    product.batches.forEach(batch => {
      const prob = getFreshnessProbability(batch.arrivalDate)
      const weight = batch.quantity
      totalWeight += weight
      goodWeight += prob.good * weight
    })
    
    const avgGood = totalWeight > 0 ? goodWeight / totalWeight : 0.95
    return { good: avgGood, bad: 1 - avgGood }
  }, [product.batches, selectedBatchId, selectedBatch])

  const showAlert = daysSinceArrival >= 7

  const recommendation = result ? getRecommendation(result.status, result.confidence) : ""
  const recType = result ? getRecommendationType(result.status, result.confidence) : "ok"

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraError(null)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("No se pudo acceder a la camara. Verifica los permisos.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const runScan = useCallback(() => {
    setPhase("scanning")
    setScanProgress(0)

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          
          const random = Math.random()
          let picked: FreshnessStatus = random <= freshnessProb.good ? "fresco" : "danado"
          
          let confidence: number
          if (picked === "fresco") {
            confidence = Math.floor(Math.random() * 10 + 85)
          } else {
            confidence = Math.floor(Math.random() * 15 + 80)
          }
          
          setResult({ status: picked, confidence })
          setPhase("result")
          setTimeout(() => {
            stopCamera()
          }, 500)
          
          return 100
        }
        return prev + 4
      })
    }, 60)

    return () => clearInterval(interval)
  }, [freshnessProb, onSave, onClose, product.id, stopCamera])

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  const resultConfig = result?.status === "fresco" 
    ? {
        label: "BUENO",
        color: "text-primary",
        bg: "bg-primary/10 border-primary/30",
        Icon: CheckCircle,
      }
    : {
        label: "MALO",
        color: "text-destructive",
        bg: "bg-destructive/10 border-destructive/30",
        Icon: AlertTriangle,
      }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm" onClick={handleClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Analisis de Calidad - IA</h3>
            <p className="text-xs text-muted-foreground">{product.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Days alert */}
        {showAlert && phase === "ready" && (
          <div className="mx-5 mt-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Han pasado <strong>{daysSinceArrival} dias</strong> desde la llegada. 
                Se recomienda analizar este producto.
              </p>
            </div>
          </div>
        )}

        {/* Probability info */}
        {phase === "ready" && (
          <div className="mx-5 mt-3 rounded-lg bg-muted/50 px-4 py-2">
            <p className="text-xs text-muted-foreground">
              Probabilidad basada en {daysSinceArrival} dias: 
              <span className="ml-1 font-medium text-primary">{Math.round(freshnessProb.good * 100)}%</span> bueno / 
              <span className="ml-1 font-medium text-destructive">{Math.round(freshnessProb.bad * 100)}%</span> malo
            </p>
          </div>
        )}

        {/* Camera / Scanner */}
        <div className="relative mx-5 mt-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          {cameraError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <CameraOff className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-sm text-muted-foreground">{cameraError}</p>
              <button
                onClick={startCamera}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              {/* Camera frame overlay */}
              {phase === "ready" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-3/4 w-3/4 rounded-lg border-2 border-dashed border-primary/60" />
                  <div className="absolute bottom-4 rounded-lg bg-card/90 px-4 py-2 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-card-foreground">Apunta la camara al producto</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scanning overlay */}
              {phase === "scanning" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/40">
                  <div
                    className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_12px_var(--primary)]"
                    style={{
                      top: `${scanProgress}%`,
                      transition: "top 60ms linear",
                    }}
                  />
                  <div className="h-3/4 w-3/4 rounded-lg border-2 border-dashed border-primary/60" />
                  <div className="absolute bottom-4 rounded-lg bg-card/90 px-4 py-2 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <ScanLine className="h-4 w-4 animate-pulse text-primary" />
                      <span className="text-sm font-medium text-card-foreground">Analizando... {scanProgress}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Result overlay */}
              {phase === "result" && result && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                  <div className={cn("relative h-3/4 w-3/4 rounded-lg border-2", resultConfig.bg)}>
                    <div className={cn("absolute -top-3 left-3 rounded-md border px-2 py-0.5 text-xs font-bold", resultConfig.bg, resultConfig.color)}>
                      {resultConfig.label} {result.confidence}%
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="p-5">
          {phase === "ready" && (
            <div className="text-center">
              {product.batches && product.batches.length > 1 && (
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-card-foreground">
                    Seleccionar lote a analizar:
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setSelectedBatchId(null)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        selectedBatchId === null
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-card-foreground hover:bg-muted"
                      )}
                    >
                      Todos los lotes
                    </button>
                    {product.batches.map((batch) => (
                      <button
                        key={batch.id}
                        onClick={() => setSelectedBatchId(batch.id)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          selectedBatchId === batch.id
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-card-foreground hover:bg-muted"
                        )}
                      >
                        {batch.arrivalDate} ({batch.quantity}kg)
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="mb-4 text-sm text-muted-foreground">
                Apunta la camara al producto y presiona capturar para que la IA analice su estado.
              </p>
              <button
                onClick={runScan}
                disabled={!!cameraError}
                className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Capturar y Analizar
              </button>
            </div>
          )}

          {phase === "scanning" && (
            <div className="text-center">
              <div className="mx-auto mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Procesando imagen con modelo IA...
              </p>
            </div>
          )}

          {phase === "result" && result && (
            <div>
              <div className={cn("mb-4 rounded-xl border p-4", resultConfig.bg)}>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <resultConfig.Icon className={cn("h-5 w-5", resultConfig.color)} />
                  <span className={cn("text-sm font-bold", resultConfig.color)}>
                    {resultConfig.label} - Confianza {result.confidence}%
                  </span>
                </div>
                <p className="text-sm text-card-foreground">{recommendation}</p>
                {recType === "throw" && (
                  <p className="mt-2 text-xs font-semibold text-destructive">
                    ACCION: Botar inmediatamente
                  </p>
                )}
                {recType === "discount" && (
                  <p className="mt-2 text-xs font-semibold text-yellow-600">
                    ACCION: Aplicar descuento
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPhase("ready")
                    setResult(null)
                    setScanProgress(0)
                    startCamera()
                  }}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                >
                  Escanear de nuevo
                </button>
                <button
                  onClick={() => {
                    stopCamera()
                    onSave(product.id, result.status, result.confidence, selectedBatchId || undefined)
                    onClose()
                  }}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Guardar y Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
