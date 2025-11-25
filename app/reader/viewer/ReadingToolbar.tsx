'use client'

import { FontSizeControl } from './FontSizeControl'
import { ThemeSwitch } from './ThemeSwitch'
import { AutoScrollToggle } from './AutoScrollToggle'
import { AutoPagingToggle } from './AutoPagingToggle'
import { Separator } from '../common/Separator'

export function ReadingToolbar() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FontSizeControl />
          <Separator orientation="vertical" className="h-6" />
          <ThemeSwitch />
        </div>
        <div className="flex items-center gap-3">
          <AutoScrollToggle />
          <AutoPagingToggle />
        </div>
      </div>
    </footer>
  )
}
