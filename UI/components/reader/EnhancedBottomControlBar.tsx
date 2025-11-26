/**
 * Enhanced Bottom Control Bar
 * Integrates with useReaderState for playback control
 * Provides TTS controls, progress tracking, and layout modes
 */

'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings2,
  ScrollText,
  Layers,
} from 'lucide-react'
import { ttsPresets } from '@/data/languages'
import { UseReaderStateReturn } from '../../hooks/useReaderState'

interface EnhancedBottomControlBarProps {
  readerState: UseReaderStateReturn
}

export function EnhancedBottomControlBar({
  readerState,
}: EnhancedBottomControlBarProps) {
  const { state, togglePlay, prevBlock, nextBlock, setSpeed, setVoice, setLayoutMode } =
    readerState

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate estimated time remaining (rough estimate: 150 words/min)
  const estimateTimeRemaining = (): string => {
    const remainingBlocks = state.blocks.slice(state.currentBlockIndex + 1)
    const totalWords = remainingBlocks.reduce((acc, block) => {
      return acc + (block.text?.split(' ').length || 0)
    }, 0)
    const minutes = totalWords / 150 / state.speed
    const totalSeconds = Math.ceil(minutes * 60)
    return formatTime(totalSeconds)
  }

  return (
    <div className="h-20 border-t bg-background flex items-center px-4 gap-4 sticky bottom-0 z-40 shadow-[0_-1px_6px_rgba(0,0,0,0.05)]">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevBlock}
          disabled={state.currentBlockIndex === 0}
          title="Previous Block"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          className="h-12 w-12 rounded-full shadow-md"
          onClick={togglePlay}
          disabled={state.blocks.length === 0}
          title={state.isPlaying ? 'Pause' : 'Play'}
        >
          {state.isPlaying ? (
            <Pause className="fill-current h-5 w-5" />
          ) : (
            <Play className="fill-current h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextBlock}
          disabled={state.currentBlockIndex >= state.totalBlocks - 1}
          title="Next Block"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress */}
      <div className="flex-1 px-4 flex flex-col justify-center gap-1">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>
            Block {state.currentBlockIndex + 1}/{state.totalBlocks}
          </span>
          <span>{estimateTimeRemaining()} remaining</span>
        </div>
        <Slider
          value={[state.progress]}
          max={100}
          step={0.1}
          className="w-full"
          onValueChange={(value) => {
            const newIndex = Math.round((value[0] / 100) * state.totalBlocks)
            readerState.goToBlock(newIndex)
          }}
        />
      </div>

      {/* Tools */}
      <div className="flex items-center gap-3 border-l pl-4">
        {/* Voice Selector */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <Select value={state.voice} onValueChange={setVoice}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Voice" />
            </SelectTrigger>
            <SelectContent>
              {ttsPresets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed/Pitch Settings */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" title="Audio Settings">
              <Settings2 className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">
                Speed: {state.speed.toFixed(1)}x
              </label>
              <Slider
                value={[state.speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={0.5}
                max={3}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Pitch (Not yet implemented)
              </label>
              <Slider defaultValue={[1]} min={0.5} max={2} step={0.1} disabled />
            </div>
          </PopoverContent>
        </Popover>

        {/* Layout Mode */}
        <Select
          value={state.layoutMode}
          onValueChange={(value) =>
            setLayoutMode(value as 'single' | 'split' | 'overlay')
          }
        >
          <SelectTrigger className="w-[40px] px-0 justify-center h-9">
            <Layers className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Pane</SelectItem>
            <SelectItem value="split">Split View</SelectItem>
            <SelectItem value="overlay">Overlay</SelectItem>
          </SelectContent>
        </Select>

        {/* Auto Scroll Toggle */}
        <Button
          variant={state.autoScroll ? 'secondary' : 'ghost'}
          size="icon"
          title={state.autoScroll ? 'Auto Scroll: ON' : 'Auto Scroll: OFF'}
          className="hidden sm:flex"
          onClick={() => {
            // Toggle autoScroll (we'll need to add this to useReaderState)
            console.log('Auto-scroll toggle clicked')
          }}
        >
          <ScrollText className="h-5 w-5" />
        </Button>

        {/* Status Indicators */}
        {state.isSpeaking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-primary animate-pulse rounded-full" />
              <div
                className="w-1 h-3 bg-primary animate-pulse rounded-full"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-1 h-3 bg-primary animate-pulse rounded-full"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
            <span className="hidden md:inline">Speaking...</span>
          </div>
        )}
      </div>
    </div>
  )
}
