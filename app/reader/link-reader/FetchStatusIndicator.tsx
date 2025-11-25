'use client'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorBox } from '../common/ErrorBox'
export function FetchStatusIndicator({ status, error }: { status: 'idle' | 'fetching' | 'success' | 'error'; error?: string }) {
  if (status === 'idle') return null
  if (status === 'fetching') return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-blue-700 dark:text-blue-300">Fetching article...</span>
    </div>
  )
  if (status === 'error') return <ErrorBox title="Fetch Failed" message={error || 'Failed to fetch the article.'} />
  return null
}
