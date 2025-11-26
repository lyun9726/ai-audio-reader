"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Play, Pause, SkipBack, SkipForward, Settings2, ScrollText, Layers } from "lucide-react"
import { ttsPresets } from "@/data/languages"
import { useState } from "react"

export function BottomControlBar() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([1.0])
  const [layoutMode, setLayoutMode] = useState("single")

  return (
    <div className="h-20 border-t bg-background flex items-center px-4 gap-4 sticky bottom-0 z-40 shadow-[0_-1px_6px_rgba(0,0,0,0.05)]">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button className="h-12 w-12 rounded-full shadow-md" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause className="fill-current h-5 w-5" /> : <Play className="fill-current h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress */}
      <div className="flex-1 px-4 flex flex-col justify-center gap-1">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Block 12/150</span>
          <span>12:45 remaining</span>
        </div>
        <Slider defaultValue={[15]} max={100} step={1} className="w-full" />
      </div>

      {/* Tools */}
      <div className="flex items-center gap-3 border-l pl-4">
        {/* Voice Selector */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <Select defaultValue={ttsPresets[0].id}>
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
              <label className="text-xs font-medium">Speed: {speed}x</label>
              <Slider value={speed} onValueChange={setSpeed} min={0.5} max={3} step={0.1} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Pitch</label>
              <Slider defaultValue={[1]} min={0.5} max={2} step={0.1} />
            </div>
          </PopoverContent>
        </Popover>

        {/* Layout Mode */}
        <Select defaultValue="single" onValueChange={setLayoutMode}>
          <SelectTrigger className="w-[40px] px-0 justify-center h-9">
            <Layers className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Pane</SelectItem>
            <SelectItem value="split">Split View</SelectItem>
            <SelectItem value="overlay">Overlay</SelectItem>
          </SelectContent>
        </Select>

        <Button variant={isPlaying ? "secondary" : "ghost"} size="icon" title="Auto Scroll" className="hidden sm:flex">
          <ScrollText className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
