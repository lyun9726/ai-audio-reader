'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

interface SidebarLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  defaultCollapsed?: boolean
}

export function SidebarLayout({ sidebar, children, defaultCollapsed = false }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className={cn(
        'border-r border-slate-200 dark:border-slate-700 transition-all duration-300',
        collapsed ? 'w-0 overflow-hidden' : 'w-80'
      )}>
        <div className="h-full overflow-y-auto p-4">
          {sidebar}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <svg
            className={cn('w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform', collapsed && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {children}
      </div>
    </div>
  )
}
