import '@testing-library/jest-dom'

// JSDOM doesn't consistently implement HTMLImageElement.loading.
// Some tests assert against `image.loading`, so we polyfill it to reflect the
// element's `loading` attribute.
if (typeof HTMLImageElement !== 'undefined') {
  Object.defineProperty(HTMLImageElement.prototype, 'loading', {
    configurable: true,
    get() {
      return this.getAttribute('loading') ?? 'auto'
    },
    set(value: string) {
      this.setAttribute('loading', value)
    },
  })
}
