import { useEffect, useState } from 'react'

function getWidth(): number | null {
  if (typeof window === 'undefined' || typeof window.innerWidth !== 'number') {
    return null
  }
  return window.innerWidth
}

/**
 * Returns the current viewport width and updates on resize.
 * Returns `null` in non-browser environments.
 */
export function useViewportWidth(): number | null {
  const [width, setWidth] = useState<number | null>(() => getWidth())

  useEffect(() => {
    const onResize = () => setWidth(getWidth())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return width
}

