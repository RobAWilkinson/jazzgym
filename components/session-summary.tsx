'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { SessionSummary as SessionSummaryType } from '@/lib/types'

interface SessionSummaryProps {
  summary: SessionSummaryType | null
  open: boolean
  onClose: () => void
}

export function SessionSummary({ summary, open, onClose }: SessionSummaryProps) {
  if (!summary) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Practice Session Complete!</DialogTitle>
          <DialogDescription>
            Great job practicing your jazz chords.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Chords Practiced:</span>
            <span className="text-2xl font-bold">{summary.chordsCompleted}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Duration:</span>
            <span className="text-2xl font-bold">{summary.durationMinutes} min</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
