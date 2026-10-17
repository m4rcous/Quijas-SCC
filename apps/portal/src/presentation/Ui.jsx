import { useEffect, useId, useRef, useState } from 'react'
import { applyTheme, readTheme } from '../theme.js'

// Una sola familia lineal: cuadrícula 24, trazo 1.75 y extremos redondeados.
const paths = {
  home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  campaign: 'M4 6h16v15H4ZM8 3v6m8-6v6M4 11h16m-12 4h3m2 0h3',
  people:
    'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3m20 0v-3a4 4 0 0 0-3-3.87M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8-7.87a4 4 0 0 1 0 7.75',
  farm: 'M3 5h18v14H3ZM3 12h18M10 5v7m4 0v7M6 8h1m10 7h1',
  harvest: 'm3 7 9-4 9 4v12l-9 3-9-3Zm0 0 9 4 9-4m-9 4v11M7 5l10 4',
  reports: 'M4 3v18h17M8 16v-5m5 5V7m5 9V4',
  settings:
    'm9 3-1 3-3 1-2 3 2 2v3l3 2 1 4h6l1-4 3-2v-3l2-2-2-3-3-1-1-3Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  panel: 'M3 4h18v16H3ZM9 4v16m4-11 3 3-3 3',
  theme:
    'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  refresh: 'M20 7v5h-5M4 17v-5h5m-4-5a8 8 0 0 1 13-2l2 3M4 16l2 3a8 8 0 0 0 13-2',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  info: 'M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  check: 'm5 12 4 4L19 6',
  empty: 'M4 5h16v15H4ZM4 14h5l2 3h2l2-3h5M8 9h8',
  chevron: 'm6 9 6 6 6-6',
  logout: 'M9 4H4v16h5m5-13 5 5-5 5m-6-5h11',
  weather:
    'M8 3v2M3 8H1m3-4 2 2m8-2-2 2M8 13a5 5 0 1 1 5-5m-7 9a4 4 0 0 1 1-8 6 6 0 0 1 11 3 4 4 0 0 1 0 8H7',
  compare: 'M6 3v18m12-18v18M3 8h6m6 8h6M3 8l3-3 3 3m6 8 3 3 3-3'
}
export const routeIcon = (path) =>
  ({
    '/': 'home',
    '/campanias': 'campaign',
    '/personal': 'people',
    '/estructura': 'farm',
    '/cosecha': 'harvest',
    '/reportes': 'reports',
    '/configuracion': 'settings'
  })[path] ?? 'farm'
export function Icon({ name, ...props }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] ?? paths.farm} />
    </svg>
  )
}
export function ThemeSwitcher() {
  const [theme, setTheme] = useState(readTheme)
  const id = useId()
  useEffect(() => {
    applyTheme(theme)
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const update = () => applyTheme(theme)
    media?.addEventListener('change', update)
    return () => media?.removeEventListener('change', update)
  }, [theme])
  return (
    <label className="theme-switcher" htmlFor={id}>
      <Icon name="theme" />
      <span className="sr-only">Tema</span>
      <select id={id} value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </select>
    </label>
  )
}
export function UserMenu({ usuario, onLogout }) {
  const [open, setOpen] = useState(false)
  const id = useId(),
    container = useRef(null),
    trigger = useRef(null),
    action = useRef(null)
  useEffect(() => {
    if (!open) return
    action.current?.focus()
    const outside = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])
  return (
    <div
      className="user-menu"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={trigger}
        className="user-menu-trigger quiet"
        aria-label="Menú de usuario"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span className="avatar" aria-hidden="true">
          {usuario?.nombre?.slice(0, 1)}
        </span>
        <span className="user-menu-name">{usuario?.nombre}</span>
        <Icon name="chevron" />
      </button>
      {open && (
        <div
          className="user-menu-panel"
          id={id}
          role="region"
          aria-label="Cuenta de usuario"
        >
          <small>Cuenta de usuario</small>
          <strong>{usuario?.nombre}</strong>
          <p>{usuario?.email}</p>
          <button ref={action} className="quiet" onClick={onLogout}>
            <Icon name="logout" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
export function Skeleton({ text = 'Cargando gestión…' }) {
  return (
    <div className="loading-state" role="status" aria-busy="true">
      <span>{text}</span>
      <div className="skeleton-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}
const statusTones = {
  DISPONIBLE: 'available',
  ASIGNADO: 'warning',
  UTILIZADO: 'success',
  CONSUMIDO: 'success',
  RECHAZADO: 'error'
}
export function StatusBadge({ children, tone, as: Component = 'span' }) {
  const semanticTone = tone ?? (typeof children === 'string' ? statusTones[children.toUpperCase()] : undefined) ?? 'neutral'
  return <Component className={`badge status-badge ${semanticTone}`}>{children}</Component>
}
export function EmptyState({ children }) {
  return (
    <div className="empty-state" role="status">
      <Icon name="empty" />
      <p>{children}</p>
    </div>
  )
}
export function ManagementPageHeader({ eyebrow, icon, title, description, action, children }) {
  return (
    <section className="management-page-header">
      <div className="management-page-header-main">
        {icon && (
          <span className="management-page-icon" aria-hidden="true">
            <Icon name={icon} />
          </span>
        )}
        <div className="management-page-copy">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </div>
      {action && <div className="management-page-action">{action}</div>}
      {children && <div className="management-page-context">{children}</div>}
    </section>
  )
}
export function DetailHero({ eyebrow, icon, title, description, status, facts = [], actions }) {
  return (
    <section className="detail-hero">
      <div className="detail-hero-heading">
        {icon && (
          <span className="detail-hero-icon" aria-hidden="true">
            <Icon name={icon} />
          </span>
        )}
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <div className="detail-hero-title-row">
            <h2>{title}</h2>
            {status}
          </div>
          {description && <p>{description}</p>}
        </div>
      </div>
      {facts.length > 0 && (
        <dl className="detail-hero-facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="detail-hero-actions">{actions}</div>}
    </section>
  )
}
export function DataTable({ children, label = 'Tabla de datos', className = '' }) {
  return (
    <div
      className={`table-scroll ${className}`.trim()}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {children}
    </div>
  )
}
export function ChartCard({ title, context, children, className = '' }) {
  return (
    <section className={`chart-card ${className}`}>
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          {context && <p className="muted">{context}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}
