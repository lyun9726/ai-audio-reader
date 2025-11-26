import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VoiceCardProps {
  name: string
  lang: string
  gender: string
  previewUrl?: string
  isCloned?: boolean
}

export function VoiceCard({ name, lang, gender, isCloned }: VoiceCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {name[0]}
          </div>
          {isCloned && <Badge variant="secondary">Cloned</Badge>}
        </div>
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground capitalize">
          {lang} • {gender}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
        <Button size="sm" variant="ghost" className="gap-2">
          <Play className="h-4 w-4" /> Preview
        </Button>
        <Button size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
