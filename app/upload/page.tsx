"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { UploadCloud, LinkIcon, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { booksAPI, parseAPI } from "@/lib/api-client"

export default function UploadPage() {
  const router = useRouter()
  const [isDragOver, setIsDragOver] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [processingUrl, setProcessingUrl] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = async (file: File) => {
    // Check if supported
    const supportedTypes = ["application/pdf", "application/epub+zip", "text/plain"]
    if (!supportedTypes.includes(file.type)) {
      setErrorMessage("We currently support PDF, EPUB, and TXT files. Please try a different format.")
      setShowErrorModal(true)
      return
    }

    try {
      setUploading(true)
      setUploadSuccess(false)

      // Upload the file
      const result = await booksAPI.upload(file)

      setUploadSuccess(true)

      // Redirect to reader after a brief delay
      setTimeout(() => {
        router.push(`/reader/${result.bookId}`)
      }, 1500)
    } catch (error) {
      console.error("Upload failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "Upload failed. Please try again.")
      setShowErrorModal(true)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!urlInput.trim()) {
      setErrorMessage("Please enter a valid URL")
      setShowErrorModal(true)
      return
    }

    try {
      setProcessingUrl(true)
      setUploadSuccess(false)

      // Parse the URL and get content
      const result = await parseAPI.fromUrl(urlInput)

      setUploadSuccess(true)

      // Redirect to reader with parsed content
      // Note: This assumes the parseAPI returns a bookId or we need to create one
      setTimeout(() => {
        router.push(`/web-reader?url=${encodeURIComponent(urlInput)}`)
      }, 1500)
    } catch (error) {
      console.error("URL processing failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to process URL. Please try again.")
      setShowErrorModal(true)
    } finally {
      setProcessingUrl(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Add Content</h1>

      <div className="grid gap-8">
        {/* Drag & Drop Area */}
        <div
          className={`border-3 border-dashed rounded-xl p-12 text-center transition-colors ${
            uploading || uploadSuccess
              ? "border-muted-foreground/25 cursor-not-allowed"
              : isDragOver
                ? "border-primary bg-primary/5 cursor-pointer"
                : "border-muted-foreground/25 hover:border-primary/50 cursor-pointer"
          }`}
          onDragOver={uploading || uploadSuccess ? undefined : handleDragOver}
          onDragLeave={uploading || uploadSuccess ? undefined : handleDragLeave}
          onDrop={uploading || uploadSuccess ? undefined : handleDrop}
          onClick={uploading || uploadSuccess ? undefined : () => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.epub,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            disabled={uploading || uploadSuccess}
          />
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : uploadSuccess ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {uploading ? "Uploading..." : uploadSuccess ? "Upload Successful!" : "Click to upload or drag and drop"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {uploading
              ? "Please wait while we process your file"
              : uploadSuccess
                ? "Redirecting to reader..."
                : "PDF, EPUB, or TXT (Max 50MB)"}
          </p>
          {!uploading && !uploadSuccess && <Button>Select File</Button>}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or import from web</span>
          </div>
        </div>

        {/* URL Input */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleUrlSubmit} className="flex gap-4 items-end">
              <div className="grid w-full items-center gap-1.5">
                <label htmlFor="url" className="text-sm font-medium">
                  Article or Webpage URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="url"
                    placeholder="https://example.com/article"
                    className="pl-9"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={processingUrl || uploadSuccess}>
                {processingUrl ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Preview */}
        <div className="mt-8 border rounded-lg p-6 bg-muted/20">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
            Preview of Document Layout
          </h3>
          <div className="aspect-[16/9] bg-background border rounded-lg overflow-hidden relative shadow-sm">
            <img
              src="https://blob.v0.app/9f3a4491-8585-454a-87a0-642067c922df.png"
              alt="Document Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Format Not Supported
            </DialogTitle>
            <DialogDescription>
              {errorMessage || "We currently support PDF, EPUB, and TXT files. Please try converting your file or uploading a different format."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowErrorModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
