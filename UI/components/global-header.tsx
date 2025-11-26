"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Mic, Upload, Settings, Library, FileText, BrainCircuit, MessageSquare } from "lucide-react"
import { usePathname } from "next/navigation"

export function GlobalHeader() {
  const pathname = usePathname()

  const navItems = [
    { href: "/library", label: "Library", icon: Library },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/web-reader", label: "Web Reader", icon: BookOpen },
    { href: "/voices", label: "Voices", icon: Mic },
    { href: "/notes", label: "Notes", icon: FileText },
    { href: "/mindmap", label: "Mindmap", icon: BrainCircuit },
    { href: "/ask", label: "Ask AI", icon: MessageSquare },
  ]

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <span>ReadAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant={pathname === item.href ? "secondary" : "ghost"} size="sm" className="gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
            <img src="/placeholder.svg?height=32&width=32" alt="User" />
          </div>
        </div>
      </div>
    </header>
  )
}
