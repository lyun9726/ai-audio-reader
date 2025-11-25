'use client'

import { useEffect, useState, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface SelectionPortalProps {
  children: ReactNode
  isVisible: boolean
}

export function SelectionPortal({ children, isVisible }: SelectionPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const portalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const updatePosition = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Position above selection
      const top = rect.top + window.scrollY - 60
      const left = rect.left + window.scrollX + rect.width / 2

      setPosition({ top, left })
    }

    updatePosition()

    // Update on scroll
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible])

  if (!mounted || !isVisible) return null

  return createPortal(
    <div
      ref={portalRef}
      className="fixed z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>,
    document.body
  )
}
