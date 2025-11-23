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
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    sourceLang: 'en',
    targetLang: 'zh',
  })
  const [file, setFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [extractingCover, setExtractingCover] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
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

  const processFile = async (selectedFile: File) => {
    const fileType = selectedFile.name.toLowerCase()
    if (!fileType.endsWith('.pdf') && !fileType.endsWith('.epub')) {
      setError('请上传 PDF 或 EPUB 文件')
      return false
    }

    // Check file size (50MB limit) - strict enforcement
    const MAX_SIZE = 50 * 1024 * 1024 // 50MB (52,428,800 bytes)
    if (selectedFile.size >= MAX_SIZE) {
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2)
      setError(`文件过大 (${sizeMB}MB)。最大支持 50MB (约 52,428,800 字节)`)
      setFile(null)
      setCoverPreview(null)
      return false
    }

    // Auto-fill title from filename if empty
    if (!formData.title) {
      const filename = selectedFile.name.replace(/\.(pdf|epub)$/i, '')
      setFormData(prev => ({ ...prev, title: filename }))
    }

    setFile(selectedFile)
    setError('')

    // 提取封面
    setExtractingCover(true)
    try {
      if (fileType.endsWith('.pdf')) {
        const { extractPdfCoverClient } = await import('@/lib/services/coverExtractor')
        const cover = await extractPdfCoverClient(selectedFile)
        setCoverPreview(cover)
      } else if (fileType.endsWith('.epub')) {
        const { extractEpubCoverClient } = await import('@/lib/services/coverExtractor')
        const cover = await extractEpubCoverClient(selectedFile)
        setCoverPreview(cover)
      }
    } catch (err) {
      console.error('封面提取失败:', err)
      // 封面提取失败不影响上传
    } finally {
      setExtractingCover(false)
    }

    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  // 拖拽上传
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
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
    setUploadProgress(0)
    setProgress('准备上传...')

    try {
      // Step 1: 提取文本(PDF)
      let extractedText = ''
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setProgress('正在提取文本...')
        extractedText = await extractPdfText(file)
        console.log('[Upload] Extracted text length:', extractedText.length)
      }

      // Step 2: 直接上传文件到Storage (带进度)
      setProgress('正在上传文件...')
      const { directUploadWithProgress } = await import('@/lib/services/directUpload')

      const uploadResult = await directUploadWithProgress({
        file,
        onProgress: (progress) => {
          setUploadProgress(progress)
          setProgress(`上传进度: ${progress.toFixed(1)}%`)
        },
        onError: (error) => {
          console.error('[Upload] Direct upload error:', error)
        }
      })

      console.log('[Upload] File uploaded to:', uploadResult.publicUrl)

      // Step 3: 通知后端处理
      setProgress('正在处理书籍...')
      setUploadProgress(100)

      const formDataToSend = new FormData()
      formDataToSend.append('fileUrl', uploadResult.publicUrl)
      formDataToSend.append('filePath', uploadResult.path)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('author', formData.author)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('sourceLang', formData.sourceLang)
      formDataToSend.append('targetLang', formData.targetLang)

      // 添加封面（如果已提取）
      if (coverPreview) {
        formDataToSend.append('coverPreview', coverPreview)
      }

      // 添加提取的文本
      if (extractedText) {
        formDataToSend.append('extractedText', extractedText)
      }

      const response = await fetch('/api/books/process', {
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
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg mb-6 overflow-hidden">
              {/* 进度条 */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="h-2 bg-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              {/* 进度文本 */}
              <div className="px-4 py-3 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-blue-400">{progress}</span>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <span className="ml-2 text-sm text-blue-300">
                      ({uploadProgress.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload with Drag & Drop */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📚 书籍文件 *
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
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploading && document.getElementById('file-upload')?.click()}
                  className={`relative flex items-center gap-6 w-full min-h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-400 bg-blue-500/20 scale-[1.02]'
                      : file
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {file ? (
                    <>
                      {/* 封面预览 */}
                      <div className="flex-shrink-0 ml-6">
                        <div className="w-24 h-32 bg-slate-900 rounded-lg overflow-hidden border border-slate-600 flex items-center justify-center">
                          {extractingCover ? (
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                          ) : coverPreview ? (
                            <img
                              src={coverPreview}
                              alt="Book cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-8 h-8 text-slate-600" />
                          )}
                        </div>
                      </div>

                      {/* 文件信息 */}
                      <div className="flex-1 py-6 pr-6">
                        <div className="flex items-start gap-3">
                          <FileText className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-base text-blue-400 font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                              大小: {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {extractingCover && (
                              <p className="text-xs text-blue-400 mt-2 flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                正在提取封面...
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setFile(null)
                                setCoverPreview(null)
                              }}
                              className="text-xs text-red-400 hover:text-red-300 mt-2"
                            >
                              ✕ 移除文件
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-8">
                      <Upload className={`w-12 h-12 mb-3 transition-colors ${
                        isDragging ? 'text-blue-400' : 'text-slate-400'
                      }`} />
                      <p className={`text-base font-medium mb-1 transition-colors ${
                        isDragging ? 'text-blue-400' : 'text-slate-300'
                      }`}>
                        {isDragging ? '松开鼠标上传文件' : '点击选择或拖拽文件到此处'}
                      </p>
                      <p className="text-sm text-slate-500">
                        支持 PDF、EPUB 格式，最大 50MB
                      </p>
                    </div>
                  )}
                </div>
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
                    <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col">
                      {/* 搜索框 */}
                      <div className="p-2 border-b border-slate-600 bg-slate-700 flex-shrink-0">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="搜索语言..."
                            value={sourceLangSearch}
                            onChange={(e) => setSourceLangSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* 语言列表容器 - 可滚动 */}
                      <div className="overflow-y-auto flex-1">
                        {/* 常用语言 */}
                        {!sourceLangSearch && (
                          <div className="border-b border-slate-600">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800 sticky top-0">
                              常用语言
                            </div>
                            <div className="max-h-48 overflow-y-auto">
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
                          </div>
                        )}

                        {/* 所有语言 */}
                        <div>
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
                    <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col">
                      {/* 搜索框 */}
                      <div className="p-2 border-b border-slate-600 bg-slate-700 flex-shrink-0">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="搜索语言..."
                            value={targetLangSearch}
                            onChange={(e) => setTargetLangSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* 语言列表容器 - 可滚动 */}
                      <div className="overflow-y-auto flex-1">
                        {/* 常用语言 */}
                        {!targetLangSearch && (
                          <div className="border-b border-slate-600">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800 sticky top-0">
                              常用语言
                            </div>
                            <div className="max-h-48 overflow-y-auto">
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
                          </div>
                        )}

                        {/* 所有语言 */}
                        <div>
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
