"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, FileEdit, Languages, Highlighter } from "lucide-react"
import { cn } from "@/lib/utils"

interface BlockProps {
  id: string
  originalText: string
  translation?: string
  isActive?: boolean
  onPlay?: (id: string) => void
  onTranslate?: (id: string) => void
}

export function BlockComponent({ id, originalText, translation, isActive, onPlay, onTranslate }: BlockProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "group relative p-4 rounded-lg transition-colors mb-4 border border-transparent",
        isActive ? "bg-primary/10 border-primary/20" : "hover:bg-muted/30",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Action Overlay */}
      <div
        className={cn(
          "absolute -top-3 right-4 flex gap-1 bg-background shadow-sm border rounded-full p-1 transition-opacity",
          isHovered || isActive ? "opacity-100" : "opacity-0",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={() => onPlay?.(id)}
          title="Play Block"
        >
          <Play className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={() => onTranslate?.(id)}
          title="Translate"
        >
          <Languages className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" title="Highlight">
          <Highlighter className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" title="Add Note">
          <FileEdit className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <p className="text-lg leading-relaxed text-foreground font-serif">{originalText}</p>
        {translation && (
          <p className="text-base leading-relaxed text-muted-foreground font-sans border-l-2 border-primary/30 pl-3">
            {translation}
          </p>
        )}
      </div>
    </div>
  )
}
