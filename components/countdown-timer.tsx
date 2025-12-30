'use client'

import { Card, CardContent } from './ui/card'

interface CountdownTimerProps {
  timeLeft: number
  totalTime: number
}

export function CountdownTimer({ timeLeft, totalTime }: CountdownTimerProps) {
  const percentage = (timeLeft / totalTime) * 100
  const getColor = () => {
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold tabular-nums">
            {timeLeft}s
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${getColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
