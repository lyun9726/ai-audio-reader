'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { BookOpen, Upload, ArrowLeft, Loader2, FileText, Languages, Search } from 'lucide-react'
import { LANGUAGE_GROUPS, searchLanguages, type Language } from '@/lib/constants/languages'

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    sourceLang: 'en',
    targetLang: 'zh',
  })
  const [file, setFile] = useState<File | null>(null)
  const [sourceLangSearch, setSourceLangSearch] = useState('')
  const [targetLangSearch, setTargetLangSearch] = useState('')
  const [showSourceDropdown, setShowSourceDropdown] = useState(false)
  const [showTargetDropdown, setShowTargetDropdown] = useState(false)

  // 筛选语言列表
  const filteredSourceLanguages = useMemo(() => {
    if (!sourceLangSearch) return LANGUAGE_GROUPS.all
    return searchLanguages(sourceLangSearch)
  }, [sourceLangSearch])

  const filteredTargetLanguages = useMemo(() => {
    if (!targetLangSearch) return LANGUAGE_GROUPS.all
    return searchLanguages(targetLangSearch)
  }, [targetLangSearch])

  // 获取当前选中语言的显示名称
  const getSelectedLanguage = (code: string) => {
    const lang = LANGUAGE_GROUPS.all.find(l => l.code === code)
    return lang ? `${lang.name} (${lang.nativeName})` : code
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.language-dropdown')) {
        setShowSourceDropdown(false)
        setShowTargetDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileType = selectedFile.name.toLowerCase()
      if (!fileType.endsWith('.pdf') && !fileType.endsWith('.epub')) {
        setError('Please upload a PDF or EPUB file')
        setFile(null)
        return
      }

      // Check file size (4MB limit for Vercel free tier)
      const MAX_SIZE = 4 * 1024 * 1024 // 4MB
      if (selectedFile.size > MAX_SIZE) {
        const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2)
        setError(`File too large (${sizeMB}MB). Maximum size is 4MB on hosted version. For larger files, use local development (npm run dev).`)
        setFile(null)
        return
      }

      // Auto-fill title from filename if empty
      if (!formData.title) {
        const filename = selectedFile.name.replace(/\.(pdf|epub)$/i, '')
        setFormData(prev => ({ ...prev, title: filename }))
      }

      setFile(selectedFile)
      setError('')
    }
  }

  const extractPdfText = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const numPages = pdf.numPages

    const textParts: string[] = []
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      if (pageText.trim()) {
        textParts.push(pageText)
      }

      if (pageNum % 10 === 0) {
        setProgress(`Extracting text: ${pageNum}/${numPages} pages...`)
      }
    }

    return textParts.join('\n\n')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    if (!formData.title.trim()) {
      setError('Please enter a book title')
      return
    }

    setUploading(true)
    setError('')
    setProgress('Uploading file...')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('author', formData.author)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('sourceLang', formData.sourceLang)
      formDataToSend.append('targetLang', formData.targetLang)

      // Extract text on client-side for PDF files
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setProgress('Extracting text from PDF...')
        const extractedText = await extractPdfText(file)
        formDataToSend.append('extractedText', extractedText)
        console.log('[Upload] Extracted text length:', extractedText.length)
      }

      setProgress('Uploading to server...')

      const response = await fetch('/api/books/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Upload failed')
      }

      setProgress('Processing complete!')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      console.error('[Upload] Error:', err)
      setError(err.message || 'An error occurred during upload')
      setProgress('')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-xl mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Upload Your Book</h1>
          <p className="text-slate-400">
            Upload a PDF or EPUB file to convert it into an audio book with translation
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {progress && (
            <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{progress}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Book File *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.epub"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    file
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    {file ? (
                      <>
                        <FileText className="w-10 h-10 text-blue-400 mb-2" />
                        <p className="text-sm text-blue-400 font-medium">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-300">Click to upload PDF or EPUB</p>
                        <p className="text-xs text-slate-500 mt-1">Max file size: 50MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                Book Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                disabled={uploading}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Enter book title"
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-slate-300 mb-2">
                Author (Optional)
              </label>
              <input
                id="author"
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                disabled={uploading}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Enter author name"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={uploading}
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
                placeholder="Enter book description"
              />
            </div>

            {/* Language Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Source Language */}
              <div className="relative language-dropdown">
                <label htmlFor="sourceLang" className="block text-sm font-medium text-slate-300 mb-2">
                  <Languages className="inline w-4 h-4 mr-1" />
                  原始语言
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center justify-between"
                  >
                    <span className="truncate">{getSelectedLanguage(formData.sourceLang)}</span>
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showSourceDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-80 overflow-hidden">
                      {/* 搜索框 */}
                      <div className="p-2 border-b border-slate-600 sticky top-0 bg-slate-700">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="搜索语言..."
                            value={sourceLangSearch}
                            onChange={(e) => setSourceLangSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* 常用语言 */}
                      {!sourceLangSearch && (
                        <div className="border-b border-slate-600">
                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800">
                            常用语言
                          </div>
                          {LANGUAGE_GROUPS.common.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, sourceLang: lang.code }))
                                setShowSourceDropdown(false)
                                setSourceLangSearch('')
                              }}
                              className={`w-full px-4 py-2 text-left hover:bg-slate-600 transition-colors ${
                                formData.sourceLang === lang.code ? 'bg-blue-600' : ''
                              }`}
                            >
                              <div className="text-white text-sm">{lang.name}</div>
                              <div className="text-slate-400 text-xs">{lang.nativeName}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 所有语言 */}
                      <div className="overflow-y-auto max-h-60">
                        {!sourceLangSearch && (
                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800 sticky top-0">
                            所有语言
                          </div>
                        )}
                        {filteredSourceLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, sourceLang: lang.code }))
                              setShowSourceDropdown(false)
                              setSourceLangSearch('')
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-slate-600 transition-colors ${
                              formData.sourceLang === lang.code ? 'bg-blue-600' : ''
                            }`}
                          >
                            <div className="text-white text-sm">{lang.name}</div>
                            <div className="text-slate-400 text-xs">{lang.nativeName}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Language */}
              <div className="relative language-dropdown">
                <label htmlFor="targetLang" className="block text-sm font-medium text-slate-300 mb-2">
                  <Languages className="inline w-4 h-4 mr-1" />
                  翻译为
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center justify-between"
                  >
                    <span className="truncate">{getSelectedLanguage(formData.targetLang)}</span>
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showTargetDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-80 overflow-hidden">
                      {/* 搜索框 */}
                      <div className="p-2 border-b border-slate-600 sticky top-0 bg-slate-700">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="搜索语言..."
                            value={targetLangSearch}
                            onChange={(e) => setTargetLangSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* 常用语言 */}
                      {!targetLangSearch && (
                        <div className="border-b border-slate-600">
                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800">
                            常用语言
                          </div>
                          {LANGUAGE_GROUPS.common.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, targetLang: lang.code }))
                                setShowTargetDropdown(false)
                                setTargetLangSearch('')
                              }}
                              className={`w-full px-4 py-2 text-left hover:bg-slate-600 transition-colors ${
                                formData.targetLang === lang.code ? 'bg-blue-600' : ''
                              }`}
                            >
                              <div className="text-white text-sm">{lang.name}</div>
                              <div className="text-slate-400 text-xs">{lang.nativeName}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 所有语言 */}
                      <div className="overflow-y-auto max-h-60">
                        {!targetLangSearch && (
                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800 sticky top-0">
                            所有语言
                          </div>
                        )}
                        {filteredTargetLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, targetLang: lang.code }))
                              setShowTargetDropdown(false)
                              setTargetLangSearch('')
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-slate-600 transition-colors ${
                              formData.targetLang === lang.code ? 'bg-blue-600' : ''
                            }`}
                          >
                            <div className="text-white text-sm">{lang.name}</div>
                            <div className="text-slate-400 text-xs">{lang.nativeName}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload and Process</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">1.</span>
              Your file will be uploaded and text extracted
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">2.</span>
              Text will be automatically translated to your target language
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">3.</span>
              AI will generate natural-sounding audio for the translated text
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">4.</span>
              You can start reading and listening once processing is complete
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
