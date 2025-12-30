import { PracticeSession } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PracticeHistoryProps {
  sessions: PracticeSession[]
  onDelete: (sessionId: number) => void
  onViewDetails?: (sessionId: number) => void
}

export function PracticeHistory({ sessions, onDelete, onViewDetails }: PracticeHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const calculateDuration = (startedAt: string, endedAt: string | null) => {
    if (!endedAt) return 'In progress...'

    const start = new Date(startedAt)
    const end = new Date(endedAt)
    const durationMs = end.getTime() - start.getTime()
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No practice sessions yet. Start practicing to see your history here!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-medium">
                    {formatDate(session.startedAt)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(session.startedAt)}
                  </span>
                </div>
                <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                  <span>{session.chordCount} chords</span>
                  <span>{calculateDuration(session.startedAt, session.endedAt)}</span>
                  <span>{session.timeLimit}s per chord</span>
                </div>
              </div>
              <div className="flex gap-2">
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(session.id)}
                  >
                    Details
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(session.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
