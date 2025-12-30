'use client'

import { Card, CardContent } from './ui/card'

interface ChordDisplayProps {
  chordName: string
}

export function ChordDisplay({ chordName }: ChordDisplayProps) {
  return (
    <Card className="border-2" data-testid="chord-display">
      <CardContent className="pt-6">
        <div className="text-center">
          <div
            className="text-8xl md:text-9xl font-bold tracking-tight"
            role="heading"
            aria-level={1}
            aria-label={`Current chord: ${chordName}`}
          >
            {chordName}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Play this chord on your guitar
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
