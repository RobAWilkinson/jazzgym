'use client'

import { useRouter } from 'next/navigation'
import { Music, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface ModeSelectorProps {
  className?: string
}

export function ModeSelector({ className }: ModeSelectorProps) {
  const router = useRouter()

  return (
    <div className={className}>
      <div className="text-center space-y-6 mb-8">
        <h1 className="text-4xl font-bold">JazzGym Practice</h1>
        <p className="text-muted-foreground text-lg">
          Choose your practice mode to get started
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Chord Practice Mode */}
        <Card
          className="group hover:border-primary hover:shadow-lg transition-all cursor-pointer"
          onClick={() => router.push('/chords')}
          data-testid="mode-chord"
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music className="w-8 h-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Chord Practice</CardTitle>
            <CardDescription className="text-base">
              Practice jazz chord recognition
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Work on identifying chord types including Major, Minor, Dominant, Diminished, and more.
            </p>
            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                router.push('/chords')
              }}
            >
              Start Chord Practice
            </Button>
          </CardContent>
        </Card>

        {/* Scale Practice Mode */}
        <Card
          className="group hover:border-primary hover:shadow-lg transition-all cursor-pointer"
          onClick={() => router.push('/scales')}
          data-testid="mode-scale"
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale className="w-8 h-8 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Scale Practice</CardTitle>
            <CardDescription className="text-base">
              Practice jazz scale recognition
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Work on identifying scale types including Major, Minor, Dorian, Mixolydian, and more.
            </p>
            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                router.push('/scales')
              }}
            >
              Start Scale Practice
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Both modes feature customizable time limits and filterable content types</p>
      </div>
    </div>
  )
}
