// Impure helpers kept out of the domain layer.

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

/** 128-bit random, base64url. In production: stored hashed server-side, with expiry. */
export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * A video-call link in Google Meet's shape (abc-defg-hij). Prototype only: the real
 * build would create the meeting through the nursery's connected Google or Microsoft calendar.
 */
export function newMeetingLink(): string {
  const letters = crypto.getRandomValues(new Uint8Array(10))
  const code = Array.from(letters, (b) => String.fromCharCode(97 + (b % 26))).join('')
  return `https://meet.google.com/${code.slice(0, 3)}-${code.slice(3, 7)}-${code.slice(7)}`
}
