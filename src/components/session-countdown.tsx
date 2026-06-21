'use client'

import { useEffect, useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '~/lib/utils'

interface SessionCountdownProps {
  startAt: string
  endAt: string
  compact?: boolean
  hideWhenDone?: boolean
  showBeforeStart?: boolean
  className?: string
}

function parseTime(value: string) {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function SessionCountdown({
  startAt,
  endAt,
  compact = false,
  hideWhenDone = false,
  showBeforeStart = true,
  className,
}: SessionCountdownProps) {
  const [now, setNow] = useState<number | null>(null)

  const startTime = useMemo(() => parseTime(startAt), [startAt])
  const endTime = useMemo(() => parseTime(endAt), [endAt])

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (!startTime || !endTime) return null

  if (now === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground',
          compact ? 'text-[10px]' : 'text-sm',
          className
        )}
      >
        <Clock className="size-3.5" />
        --:--
      </span>
    )
  }

  const startsIn = startTime - now
  const endsIn = endTime - now
  const isBeforeStart = startsIn > 0
  const isDone = endsIn <= 0

  if (isBeforeStart && !showBeforeStart) return null
  if (isDone && hideWhenDone) return null

  const label = isBeforeStart ? 'Mulai dalam' : isDone ? 'Sesi selesai' : 'Berakhir dalam'
  const value = isDone ? '00:00' : formatRemaining(isBeforeStart ? startsIn : endsIn)
  const isEndingSoon = !isBeforeStart && !isDone && endsIn <= 10 * 60 * 1000

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold tabular-nums',
        compact ? 'text-[10px]' : 'text-sm',
        isDone && 'bg-muted text-muted-foreground',
        isBeforeStart && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        !isBeforeStart && !isDone && !isEndingSoon && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        isEndingSoon && 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        className
      )}
      aria-live="polite"
    >
      <Clock className="size-3.5" />
      {compact ? value : `${label} ${value}`}
    </span>
  )
}
