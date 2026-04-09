'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

function parsePosition(pos: string): [number, number] {
  if (!pos) return [50, 50]
  const match = pos.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/)
  if (match) return [parseFloat(match[1]), parseFloat(match[2])]
  const named: Record<string, [number, number]> = {
    'top left': [0, 0],    'top center': [50, 0],    'top right': [100, 0],
    'center left': [0, 50], 'center': [50, 50],       'center right': [100, 50],
    'bottom left': [0, 100],'bottom center': [50, 100],'bottom right': [100, 100],
  }
  return named[pos] ?? [50, 50]
}

interface DraggableImageProps {
  src: string
  alt: string
  sizes: string
  slot: string
  imageIndex: number
  allPositions: string[]
  isRepositioning: boolean
}

export default function DraggableImage({
  src, alt, sizes, slot, imageIndex, allPositions, isRepositioning,
}: DraggableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null)
  const [posX, setPosX] = useState(50)
  const [posY, setPosY] = useState(50)

  useEffect(() => {
    const [x, y] = parsePosition(allPositions[imageIndex])
    setPosX(x)
    setPosY(y)
  }, [allPositions, imageIndex])

  function startDrag(clientX: number, clientY: number) {
    dragRef.current = { clientX, clientY, startX: posX, startY: posY }
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!dragRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = clientX - dragRef.current.clientX
    const dy = clientY - dragRef.current.clientY
    setPosX(Math.max(0, Math.min(100, dragRef.current.startX - (dx / rect.width) * 100)))
    setPosY(Math.max(0, Math.min(100, dragRef.current.startY - (dy / rect.height) * 100)))
  }

  async function endDrag() {
    if (!dragRef.current) return
    dragRef.current = null
    const updated = [...allPositions]
    while (updated.length <= imageIndex) updated.push('50% 50%')
    updated[imageIndex] = `${Math.round(posX)}% ${Math.round(posY)}%`
    await fetch('/api/admin/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [`${slot}-positions`]: updated }),
    }).catch(console.error)
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        cursor: isRepositioning ? (dragRef.current ? 'grabbing' : 'grab') : 'default',
        touchAction: isRepositioning ? 'none' : 'auto',
      }}
      onMouseDown={isRepositioning ? (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY) } : undefined}
      onMouseMove={isRepositioning ? (e) => moveDrag(e.clientX, e.clientY) : undefined}
      onMouseUp={isRepositioning ? endDrag : undefined}
      onMouseLeave={isRepositioning ? endDrag : undefined}
      onTouchStart={isRepositioning ? (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY) : undefined}
      onTouchMove={isRepositioning ? (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY) : undefined}
      onTouchEnd={isRepositioning ? endDrag : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ objectPosition: `${posX}% ${posY}%`, pointerEvents: 'none', userSelect: 'none' }}
        sizes={sizes}
        unoptimized={src.includes('.gif')}
        draggable={false}
      />
      {isRepositioning && (
        <div className="absolute inset-0 ring-2 ring-accent ring-inset pointer-events-none" />
      )}
    </div>
  )
}
