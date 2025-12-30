'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PracticeHistory } from '@/components/practice-history'
import { usePracticeHistory } from '@/hooks/use-practice-history'

export default function HistoryPage() {
  const router = useRouter()
  const { history, stats, loading, error, deleteSession, clearAllHistory } = usePracticeHistory()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)

  const handleDeleteClick = (sessionId: number) => {
    setSelectedSessionId(sessionId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedSessionId !== null) {
      const success = await deleteSession(selectedSessionId)
      if (success) {
        toast.success('Practice session deleted')
        setDeleteDialogOpen(false)
        setSelectedSessionId(null)
      } else {
        toast.error('Failed to delete session. Please try again.')
      }
    }
  }

  const handleClearAllClick = () => {
    setClearAllDialogOpen(true)
  }

  const handleClearAllConfirm = async () => {
    const success = await clearAllHistory()
    if (success) {
      toast.success('All practice history cleared')
      setClearAllDialogOpen(false)
    } else {
      toast.error('Failed to clear history. Please try again.')
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading history: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Practice History</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              View your past practice sessions and statistics
            </p>
          </div>
          <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto min-h-[44px]">
            Back to Practice
          </Button>
        </div>

        {/* Statistics Card */}
        {stats && stats.totalSessions > 0 && (
          <Card data-testid="practice-stats">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your practice progress summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">{stats.totalSessions}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.totalSessions === 1 ? 'Session' : 'Sessions'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.totalChords}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.totalChords === 1 ? 'Chord' : 'Chords'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.totalMinutes}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.totalMinutes === 1 ? 'Minute' : 'Minutes'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session History */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">Sessions</h2>
            {history.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAllClick}
                className="w-full sm:w-auto min-h-[40px]"
              >
                Clear All History
              </Button>
            )}
          </div>

          <PracticeHistory
            sessions={history}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Delete Session Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Session?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this practice session? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear All History Confirmation Dialog */}
        <Dialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All History?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all practice sessions? This will permanently remove all {history.length} session{history.length !== 1 ? 's' : ''} and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setClearAllDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllConfirm}
              >
                Clear All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
