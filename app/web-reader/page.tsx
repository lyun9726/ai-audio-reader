"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Loader2, AlertCircle } from "lucide-react"
import { parseAPI, type ReaderBlock } from "@/lib/api-client"
import { BlockComponent } from "@/components/reader/block-component"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function WebReaderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [blocks, setBlocks] = useState<ReaderBlock[]>([])
  const [metadata, setMetadata] = useState<{ title?: string; author?: string } | null>(null)

  // Load content if URL is in query params
  useEffect(() => {
    const urlParam = searchParams.get("url")
    if (urlParam) {
      setUrl(urlParam)
      handleExtract(urlParam)
    }
  }, [searchParams])

  const handleExtract = async (targetUrl?: string) => {
    const urlToExtract = targetUrl || url
    if (!urlToExtract) return

    try {
      setIsLoading(true)
      setError(null)

      const result = await parseAPI.fromUrl(urlToExtract)

      setBlocks(result.blocks)
      setMetadata(result.metadata || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract content from URL")
      console.error("URL extraction failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    handleExtract()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Web Reader</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste any article URL to read it distraction-free with AI translation and text-to-speech.
        </p>
      </div>

      <Card className="mb-12 shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-4 flex-col sm:flex-row">
            <Input
              placeholder="https://medium.com/..."
              className="h-12 text-lg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" size="lg" className="h-12 px-8" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isLoading ? "Extracting..." : "Read Now"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-8 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Failed to extract content</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {blocks.length > 0 && (
        <div className="space-y-6">
          {metadata && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{metadata.title || "Untitled"}</h1>
              {metadata.author && <p className="text-muted-foreground">By {metadata.author}</p>}
            </div>
          )}

          <ScrollArea className="h-[600px] rounded-lg border p-8">
            <div className="space-y-4 max-w-3xl mx-auto">
              {blocks.map((block, i) => (
                <BlockComponent
                  key={block.id}
                  id={block.id}
                  originalText={block.text}
                  isActive={false}
                  onPlay={(id) => console.log("Play", id)}
                  onTranslate={(id) => console.log("Translate", id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {!blocks.length && !isLoading && !error && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Preview Example</h2>
          <div className="aspect-video bg-muted rounded-xl border shadow-sm overflow-hidden relative">
            <img
              src="https://blob.v0.app/9f3a4491-8585-454a-87a0-642067c922df.png"
              alt="Web Reader Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
              <div className="text-white">
                <h3 className="text-xl font-bold">The Future of AI in Education</h3>
                <p className="opacity-90">Read time: 5 min • Extracted from TechCrunch</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
