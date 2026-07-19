"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, Check, X } from "lucide-react"

interface ImageCropModalProps {
  open: boolean
  imageSrc: string | null
  /** output aspect ratio (width / height). Default 3:4 portrait. */
  aspect?: number
  onCancel: () => void
  onCropped: (dataUrl: string) => void
}

// Fixed viewport size for the crop frame (CSS px). Output keeps the same ratio.
const VIEW_W = 300

/**
 * Dependency-free image cropper. The image is pan-and-zoomed behind a fixed
 * crop frame; on confirm the visible region is drawn to a canvas and returned
 * as a JPEG data URL. Used for personal profile photos.
 */
export function ImageCropModal({ open, imageSrc, aspect = 3 / 4, onCancel, onCropped }: ImageCropModalProps) {
  const viewW = VIEW_W
  const viewH = Math.round(VIEW_W / aspect)

  const imgRef = useRef<HTMLImageElement | null>(null)
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)

  const clampOffset = useCallback(
    (x: number, y: number, s: number) => {
      const w = (nat?.w || 0) * s
      const h = (nat?.h || 0) * s
      const minX = Math.min(0, viewW - w)
      const minY = Math.min(0, viewH - h)
      return {
        x: Math.max(minX, Math.min(0, x)),
        y: Math.max(minY, Math.min(0, y)),
      }
    },
    [nat, viewW, viewH]
  )

  // Initialise scale/offset once the image dimensions are known
  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const w = img.naturalWidth
    const h = img.naturalHeight
    const cover = Math.max(viewW / w, viewH / h)
    setNat({ w, h })
    setBaseScale(cover)
    setScale(cover)
    setOffset({ x: (viewW - w * cover) / 2, y: (viewH - h * cover) / 2 })
  }

  useEffect(() => {
    if (!open) {
      setNat(null)
      setScale(1)
      setOffset({ x: 0, y: 0 })
    }
  }, [open])

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    setOffset(clampOffset(drag.current.ox + dx, drag.current.oy + dy, scale))
  }
  const onPointerUp = () => {
    drag.current = null
  }

  const applyScale = (next: number) => {
    const s = Math.max(baseScale, Math.min(baseScale * 4, next))
    // Zoom around the viewport centre
    const cx = viewW / 2
    const cy = viewH / 2
    const ratio = s / scale
    const nx = cx - (cx - offset.x) * ratio
    const ny = cy - (cy - offset.y) * ratio
    setScale(s)
    setOffset(clampOffset(nx, ny, s))
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    applyScale(scale * (e.deltaY < 0 ? 1.08 : 0.92))
  }

  const doCrop = () => {
    if (!imgRef.current || !nat) return
    const sx = -offset.x / scale
    const sy = -offset.y / scale
    const sw = viewW / scale
    const sh = viewH / scale

    // Output at 2x the frame for crispness
    const outW = viewW * 2
    const outH = viewH * 2
    const canvas = document.createElement("canvas")
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outW, outH)
    onCropped(canvas.toDataURL("image/jpeg", 0.9))
  }

  if (!open || !imageSrc) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1F4068]">Adjust your photo</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-[#1F4068]" aria-label="Cancel">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="relative mx-auto touch-none overflow-hidden rounded-xl bg-[#faf8f4] ring-1 ring-[#f0ebe3]"
          style={{ width: viewW, height: viewH, cursor: "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop preview"
            onLoad={onImgLoad}
            draggable={false}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: nat ? nat.w * scale : "auto",
              height: nat ? nat.h * scale : "auto",
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              maxWidth: "none",
              userSelect: "none",
            }}
          />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/40" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomIn className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="range"
            min={baseScale}
            max={baseScale * 4}
            step={0.001}
            value={scale}
            onChange={(e) => applyScale(Number(e.target.value))}
            className="w-full accent-[#e87898]"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" className="rounded-xl border-[#f0ebe3]" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white" onClick={doCrop}>
            <Check className="mr-1.5 h-4 w-4" /> Use photo
          </Button>
        </div>
      </div>
    </div>
  )
}
