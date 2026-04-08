'use client'

import { useScrollFade } from '@/hooks/useScrollFade'

interface ScrollFadeProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function ScrollFade({ children, className = '', delay = 0 }: ScrollFadeProps) {
  const ref = useScrollFade()
  return (
    <div
      ref={ref}
      className={`scroll-fade ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
