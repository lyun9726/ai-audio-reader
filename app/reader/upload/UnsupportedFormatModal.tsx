'use client'

import { Modal } from '../common/Modal'
import { Button } from '../common/Button'

interface UnsupportedFormatModalProps {
  isOpen: boolean
  format: string
  onClose: () => void
}

export function UnsupportedFormatModal({ isOpen, format, onClose }: UnsupportedFormatModalProps) {
  const supportedFormats = ['PDF', 'EPUB', 'MOBI', 'AZW/AZW3', 'FB2', 'CBZ/CBR', 'TXT']

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unsupported Format" size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-300">
              .{format} format is not supported
            </h4>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              Please upload a file in one of the supported formats below.
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Supported Formats:</h4>
          <div className="grid grid-cols-2 gap-2">
            {supportedFormats.map((fmt) => (
              <div
                key={fmt}
                className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{fmt}</span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={onClose} variant="primary" className="w-full">
          Got it
        </Button>
      </div>
    </Modal>
  )
}
