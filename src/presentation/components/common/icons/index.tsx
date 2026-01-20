import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

export function LayoutGridIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  )
}

export function SearchIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

export function CloseIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function LayoutCarouselIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  )
}

export function LayoutListIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function LayoutCardsIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  )
}

export function ChevronLeftIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

export function ChevronRightIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function ChevronUpIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}

export function PhotoPlaceholderIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

export function ExclamationTriangleIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

export function HeartOutlineIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )
}

export function HeartSolidIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden={ariaHidden} {...props}>
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function EyeIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  )
}

export function ArrowsExpandIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  )
}

export function CalendarIcon({ 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

