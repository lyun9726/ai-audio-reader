import { ReactNode } from 'react'

export const metadata = {
  title: 'AI Audio Reader',
  description: 'Smart reading with AI-powered translation and TTS',
}

export default function ReaderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
