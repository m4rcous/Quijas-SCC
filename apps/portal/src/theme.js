// Preferencia exclusivamente visual del Portal, independiente de la sesión y empresa.
const key = 'gesgrow.portal.theme.v1'
export function readTheme() {
  try {
    const value = localStorage.getItem(key)
    return ['light', 'dark', 'system'].includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}
export function applyTheme(preference) {
  const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  document.documentElement.dataset.theme =
    preference === 'system' ? (dark ? 'dark' : 'light') : preference
  try {
    localStorage.setItem(key, preference)
  } catch {
    /* La interfaz sigue funcionando si no se puede persistir. */
  }
}
