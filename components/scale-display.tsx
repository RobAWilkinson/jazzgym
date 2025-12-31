'use client'

import { Card, CardContent } from './ui/card'

interface ScaleDisplayProps {
  scaleName: string
}

export function ScaleDisplay({ scaleName }: ScaleDisplayProps) {
  return (
    <Card className="border-2" data-testid="scale-display">
      <CardContent className="pt-6">
        <div className="text-center">
          <div
            className="text-8xl md:text-9xl font-bold tracking-tight"
            role="heading"
            aria-level={1}
            aria-label={`Current scale: ${scaleName}`}
          >
            {scaleName}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Play this scale on your instrument
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
