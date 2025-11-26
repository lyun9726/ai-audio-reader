"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { UploadCloud, LinkIcon, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [urlInput, setUrlInput] = useState("")

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

  const handleFileSelect = (file: File) => {
    // Stub: Check if supported
    const supportedTypes = ["application/pdf", "application/epub+zip", "text/plain"]
    if (!supportedTypes.includes(file.type)) {
      setShowErrorModal(true)
    } else {
      console.log("Uploading file:", file.name)
      // Initiate upload logic here
    }
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Processing URL:", urlInput)
    // Initiate URL ingest
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Add Content</h1>

      <div className="grid gap-8">
        {/* Drag & Drop Area */}
        <div
          className={`border-3 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.epub,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Click to upload or drag and drop</h3>
          <p className="text-muted-foreground mb-6">PDF, EPUB, or TXT (Max 50MB)</p>
          <Button>Select File</Button>
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
              <Button type="submit">Import</Button>
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
              We currently support PDF, EPUB, and TXT files. Please try converting your file or uploading a different
              format.
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
