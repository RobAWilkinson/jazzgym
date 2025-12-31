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
import { SessionSummary as SessionSummaryType, ScaleSessionSummary } from '@/lib/types'

interface SessionSummaryProps {
  summary: SessionSummaryType | ScaleSessionSummary | null
  open: boolean
  onClose: () => void
  mode?: 'chord' | 'scale'
}

export function SessionSummary({ summary, open, onClose, mode = 'chord' }: SessionSummaryProps) {
  if (!summary) return null

  const isChordMode = mode === 'chord'
  const itemCount = isChordMode
    ? (summary as SessionSummaryType).chordsCompleted
    : (summary as ScaleSessionSummary).scalesCompleted
  const itemLabel = isChordMode ? 'Chords' : 'Scales'
  const itemLabelLower = isChordMode ? 'chords' : 'scales'
  const practiceSubject = isChordMode ? 'jazz chords' : 'scales'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="session-summary" aria-describedby="session-summary-description">
        <DialogHeader>
          <DialogTitle>Practice Session Complete!</DialogTitle>
          <DialogDescription id="session-summary-description">
            Great job practicing your {practiceSubject}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4" role="region" aria-label="Session statistics">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{itemLabel} Practiced:</span>
            <span className="text-2xl font-bold" aria-label={`${itemCount} ${itemLabelLower} practiced`}>
              {itemCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Duration:</span>
            <span className="text-2xl font-bold" aria-label={`${summary.durationMinutes} minutes duration`}>
              {summary.durationMinutes} min
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} aria-label="Close session summary">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
