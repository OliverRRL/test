import { useState, useEffect } from 'react'

const KEY = 'dmx_roast_count'
const RESET_KEY = 'dmx_roast_reset'
const LIMIT = 3
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function useRoastCount() {
  const [count, setCount] = useState(0)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    const resetAt = parseInt(localStorage.getItem(RESET_KEY) || '0')
    const now = Date.now()

    if (now > resetAt) {
      localStorage.setItem(KEY, '0')
      localStorage.setItem(RESET_KEY, String(now + WINDOW_MS))
    }

    setCount(parseInt(localStorage.getItem(KEY) || '0'))
    setUnlocked(localStorage.getItem('dmx_unlocked') === 'true')
  }, [])

  const increment = () => {
    const next = count + 1
    localStorage.setItem(KEY, String(next))
    setCount(next)
  }

  const unlock = () => {
    localStorage.setItem('dmx_unlocked', 'true')
    setUnlocked(true)
  }

  return {
    count,
    limit: LIMIT,
    remaining: unlocked ? Infinity : Math.max(0, LIMIT - count),
    canRoast: unlocked || count < LIMIT,
    unlocked,
    increment,
    unlock,
  }
}
