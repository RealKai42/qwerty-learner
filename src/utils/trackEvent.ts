import { track } from '@vercel/analytics'

export const trackEvent = (event: string, properties: Record<string, string>) => {
  track(event, properties)

  // @ts-expect-error gtag is not defined in the window object
  if (typeof window !== 'undefined' && window?.gtag) {
    try {
      window.gtag('event', event, { ...properties })
    } catch (error) {
      console.error(error)
    }
  }
}
