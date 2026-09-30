export function statusUrl(token: string): string {
  return `${window.location.origin}${window.location.pathname}#/status/${token}`
}
