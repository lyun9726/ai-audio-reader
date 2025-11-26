"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { List, Languages, Sparkles, Highlighter } from "lucide-react"
import { languages } from "@/data/languages"

export function RightSidePanel() {
  return (
    <div className="w-80 border-l bg-muted/10 flex flex-col h-[calc(100vh-4rem-5rem)]">
      <Tabs defaultValue="toc" className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="toc">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="translate">
              <Languages className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="notes">
              <Highlighter className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="toc" className="mt-0">
              <h3 className="font-semibold mb-3">Table of Contents</h3>
              <nav className="space-y-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Button key={i} variant="ghost" className="w-full justify-start text-sm font-normal h-auto py-2">
                    Chapter {i}: The Beginning
                  </Button>
                ))}
              </nav>
            </TabsContent>

            <TabsContent value="translate" className="mt-0 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Translate to</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="bg-primary/5 border-primary">
                    Paragraph
                  </Button>
                  <Button variant="outline" size="sm">
                    Word
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-4">
              <div className="p-3 bg-primary/5 rounded-lg border">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Sparkles className="h-3 w-3 text-primary" /> Ask the Book
                </h4>
                <p className="text-xs text-muted-foreground mb-3">Ask questions about characters, plot, or themes.</p>
                <Button size="sm" className="w-full">
                  Start Chat
                </Button>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
                  Generate Chapter Summary
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
                  Explain Complex Terms
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
                  Create Mindmap
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <h3 className="font-semibold mb-3">Notes & Highlights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
                  <p className="mb-1 italic">"The green light..."</p>
                  <p className="text-xs text-muted-foreground">Symbol of hope and the American Dream.</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
