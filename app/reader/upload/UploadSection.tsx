'use client'

import { useState } from 'react'
import { FileDropzone } from './FileDropzone'
import { FilePicker } from './FilePicker'
import { UploadProgress } from './UploadProgress'
import { UnsupportedFormatModal } from './UnsupportedFormatModal'
import { Card } from '../common/Card'

export function UploadSection() {
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false)
  const [unsupportedFormat, setUnsupportedFormat] = useState('')

  const handleFileSelect = (file: File) => {
    const supportedFormats = ['pdf', 'epub', 'txt', 'mobi', 'azw', 'azw3', 'fb2', 'cbz', 'cbr']
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (!ext || !supportedFormats.includes(ext)) {
      setUnsupportedFormat(ext || 'unknown')
      setShowUnsupportedModal(true)
      return
    }

    setUploadingFile(file)
    // Simulate upload progress (实际逻辑在任务2绑定)
    simulateUpload()
  }

  const simulateUpload = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setUploadingFile(null)
          setUploadProgress(0)
        }, 500)
      }
    }, 200)
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" className="p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Upload Your Book
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Support PDF, EPUB, MOBI, AZW, FB2, Comics and more formats
        </p>

        {uploadingFile ? (
          <UploadProgress
            fileName={uploadingFile.name}
            progress={uploadProgress}
            onCancel={() => {
              setUploadingFile(null)
              setUploadProgress(0)
            }}
          />
        ) : (
          <>
            <FileDropzone onFileDrop={handleFileSelect} />
            <div className="mt-4 text-center text-sm text-slate-500">
              or
            </div>
            <div className="mt-4">
              <FilePicker onFileSelect={handleFileSelect} />
            </div>
          </>
        )}
      </Card>

      <UnsupportedFormatModal
        isOpen={showUnsupportedModal}
        format={unsupportedFormat}
        onClose={() => setShowUnsupportedModal(false)}
      />
    </div>
  )
}
