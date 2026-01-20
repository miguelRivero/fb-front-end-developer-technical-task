import { useEffect, useMemo, useState } from 'react'

import { ChevronUpIcon } from '@/presentation/components/common/icons'
import styles from './ScrollToTopButton.module.scss'

const DEFAULT_VISIBILITY_THRESHOLD_PX = 200

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getScrollTop(): number {
  if (typeof window === 'undefined') return 0
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

export interface ScrollToTopButtonProps {
  /**
   * Scroll distance (in px) after which the button becomes visible.
   */
  visibilityThresholdPx?: number
}

/**
 * ScrollToTopButton
 *
 * A floating "scroll to top" affordance that appears after the user has scrolled down.
 * Styled to match the app's carousel buttons, but with inverted colors (dark background + white icon).
 */
export function ScrollToTopButton({
  visibilityThresholdPx = DEFAULT_VISIBILITY_THRESHOLD_PX,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  const prefersReducedMotion = useMemo(() => getPrefersReducedMotion(), [])

  useEffect(() => {
    const onScroll = () => setIsVisible(getScrollTop() > visibilityThresholdPx)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [visibilityThresholdPx])

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${isVisible ? styles.visible : styles.hidden}`}
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Scroll to top"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={isVisible ? undefined : true}
      data-testid="scroll-to-top"
    >
      <ChevronUpIcon className={styles.icon} />
    </button>
  )
}

