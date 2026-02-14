import { Resend } from 'resend'

// Initialize lazily to avoid build-time errors when env vars aren't available
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// Keep backward-compatible export (lazy getter)
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    return (getResend() as any)[prop]
  }
})
