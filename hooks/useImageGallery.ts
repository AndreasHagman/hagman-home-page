import { useState, useRef, useEffect } from 'react'

interface Options {
  slot: string
  resolvedImages: string[]
  positions: string[]
  initialHeight: number | undefined
  defaultHeight: number
}

export function useImageGallery({ slot, resolvedImages, positions, initialHeight, defaultHeight }: Options) {
  const [index, setIndex] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [imageHeight, setImageHeight] = useState(initialHeight ?? defaultHeight)
  const [localImages, setLocalImages] = useState(resolvedImages)
  const [localPositions, setLocalPositions] = useState(positions)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (initialHeight) setImageHeight(initialHeight)
  }, [initialHeight])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalImages(resolvedImages) }, [JSON.stringify(resolvedImages)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalPositions(positions) }, [JSON.stringify(positions)])

  const hasImages = localImages.length > 0
  const hasMultiple = localImages.length > 1
  const src = localImages[index] ?? ''

  function prev() { setIndex((i) => (i - 1 + localImages.length) % localImages.length) }
  function next() { setIndex((i) => (i + 1) % localImages.length) }

  async function save(imgs: string[], pos: string[]) {
    await fetch('/api/admin/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [slot]: imgs, [`${slot}-positions`]: pos }),
    }).catch(console.error)
  }

  async function reorder(dir: -1 | 1) {
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= localImages.length) return
    const imgs = [...localImages]
    const pos = [...localPositions]
    ;[imgs[index], imgs[newIndex]] = [imgs[newIndex], imgs[index]]
    ;[pos[index], pos[newIndex]] = [pos[newIndex], pos[index]]
    setLocalImages(imgs)
    setLocalPositions(pos)
    setIndex(newIndex)
    await save(imgs, pos)
  }

  async function deleteImage() {
    const imgs = localImages.filter((_, i) => i !== index)
    const pos = localPositions.filter((_, i) => i !== index)
    setLocalImages(imgs)
    setLocalPositions(pos)
    setIndex((i) => Math.max(0, Math.min(i, imgs.length - 1)))
    await save(imgs, pos)
  }

  function onTouchStart(e: React.TouchEvent) {
    if (!isRepositioning) touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (isRepositioning || !hasMultiple || touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
    touchStartX.current = null
  }

  return {
    index, setIndex,
    isRepositioning, setIsRepositioning,
    imageHeight, setImageHeight,
    localImages, localPositions,
    hasImages, hasMultiple, src,
    prev, next, reorder, deleteImage,
    onTouchStart, onTouchEnd,
  }
}
