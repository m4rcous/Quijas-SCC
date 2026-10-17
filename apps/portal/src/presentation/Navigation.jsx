import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Icon, routeIcon } from './Ui.jsx'

const collections = [
  { id: 'inicio', name: 'Inicio', icon: 'home', paths: ['/'] },
  {
    id: 'operacion',
    name: 'Operación agrícola',
    icon: 'harvest',
    paths: ['/campanias', '/personal', '/cosecha', '/reportes']
  },
  {
    id: 'estructura',
    name: 'Estructura agrícola',
    icon: 'farm',
    paths: ['/estructura']
  },
  { id: 'plataforma', name: 'Plataforma', icon: 'settings', paths: ['/configuracion'] }
]
const children = {
  '/cosecha': [
    ['lotes', 'Lotes de tickets'],
    ['tickets', 'Tickets'],
    ['asignaciones', 'Asignaciones'],
    ['registros', 'Registros de cosecha']
  ],
  '/reportes': [
    ['resumen', 'Resumen de campaña'],
    ['ranking', 'Ranking de cosechadores'],
    ['diaria', 'Producción diaria'],
    ['lotes', 'Producción por lote']
  ],
  '/estructura': [
    ['fundos', 'Fundos'],
    ['sectores', 'Sectores'],
    ['parcelas', 'Parcelas']
  ],
  '/configuracion': [
    ['usuarios', 'Usuarios y accesos'],
    ['suscripcion', 'Suscripción'],
    ['modulos', 'Módulos'],
    ['empresa', 'Empresa'],
    ['invitaciones', 'Invitaciones'],
    ['roles', 'Roles']
  ]
}
const belongs = (path, base) =>
  base === '/' ? path === '/' : path === base || path.startsWith(base + '/')

function NavigationModules({ rutas, path, panelOpen, onNavigate }) {
  const [expandedModule, setExpandedModule] = useState(null)
  useEffect(() => {
    setExpandedModule(null)
  }, [panelOpen, path])
  return (
    <div
      className="navigation-modules"
      onMouseLeave={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        )
          return
        if (!event.currentTarget.contains(document.activeElement))
          setExpandedModule(null)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpandedModule(null)
      }}
    >
      {rutas.map((ruta) => (
        <NavigationModule
          key={ruta.path}
          ruta={ruta}
          path={path}
          expanded={expandedModule === ruta.path}
          onExpand={() => setExpandedModule(children[ruta.path] ? ruta.path : null)}
          onCollapse={() =>
            setExpandedModule((current) => (current === ruta.path ? null : current))
          }
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}

function NavigationModule({ ruta, path, expanded, onExpand, onCollapse, onNavigate }) {
  const toggle = useRef(null),
    pointer = useRef('mouse')
  const id = useId()
  const subroutes = children[ruta.path]
  const content = (
    <>
      <Icon name={routeIcon(ruta.path)} />
      <span>{ruta.nombre}</span>
      <Icon name={subroutes ? 'chevron' : 'arrow'} />
    </>
  )
  return (
    <div
      className={`navigation-module ${belongs(path, ruta.path) ? 'is-active-module' : ''}`}
      onMouseEnter={onExpand}
      onKeyDown={(e) => {
        if (!subroutes) return
        if (e.key === 'Escape' && expanded) {
          e.preventDefault()
          e.stopPropagation()
          onCollapse()
          toggle.current?.focus()
        } else if (e.key === 'ArrowDown' && e.target === toggle.current) {
          e.preventDefault()
          onExpand()
        }
      }}
    >
      {subroutes ? (
        <button
          ref={toggle}
          type="button"
          className="navigation-module-link"
          aria-expanded={expanded}
          aria-controls={id}
          onPointerDown={(e) => {
            pointer.current = e.pointerType
          }}
          onClick={(e) => {
            if (expanded && (e.detail === 0 || pointer.current === 'touch'))
              onCollapse()
            else onExpand()
          }}
        >
          {content}
        </button>
      ) : (
        <NavLink to={ruta.path} className="navigation-module-link" onClick={onNavigate}>
          {content}
        </NavLink>
      )}
      {subroutes && (
        <div id={id} className="navigation-routes" hidden={!expanded}>
          {subroutes.map(([sub, name]) => (
            <NavLink key={sub} to={`${ruta.path}/${sub}`} onClick={onNavigate}>
              {name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export function NavigationRail({ navegacion, path, mobileOpen, onClose }) {
  // Sólo se agrupan rutas ya autorizadas por Application; no se resuelven permisos aquí.
  const available = collections
    .map((c) => ({
      ...c,
      routes: c.paths.map((p) => navegacion.find((r) => r.path === p)).filter(Boolean)
    }))
    .filter((c) => c.routes.length)
  const active =
    available.find((c) => c.routes.some((r) => belongs(path, r.path)))?.id ?? 'inicio'
  const [selection, setSelection] = useState(active)
  const [expanded, setExpanded] = useState(false)
  const [expandedBy, setExpandedBy] = useState('focus-expanded')
  const [pinned, setPinned] = useState(false)
  const container = useRef(null),
    rail = useRef(null),
    lastTrigger = useRef(null)
  const id = useId()
  const current = available.find((c) => c.id === selection) ?? available[0]
  const open = current?.id !== 'inicio' && (expanded || pinned || mobileOpen)

  useEffect(() => {
    setSelection(active)
    setExpanded(false)
  }, [path, active])

  useEffect(() => {
    if (!mobileOpen) return
    if (selection === 'inicio')
      setSelection(available.find((c) => c.id !== 'inicio')?.id ?? 'inicio')
    const previous = document.activeElement,
      root = container.current
    const focusable = () =>
      [...root.querySelectorAll('a, button')].filter(
        (el) =>
          !el.disabled && !el.closest('[hidden]') && !el.classList.contains('rail-pin')
      )
    focusable()[0]?.focus()
    const keydown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Tab') {
        const items = focusable(),
          first = items[0],
          last = items.at(-1)
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    root.addEventListener('keydown', keydown)
    return () => {
      root.removeEventListener('keydown', keydown)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [mobileOpen, onClose])

  function reveal(collection, trigger, reason) {
    setSelection(collection.id)
    setExpanded(true)
    setExpandedBy(reason)
    lastTrigger.current = trigger
  }
  function home() {
    setSelection('inicio')
    setExpanded(false)
    setPinned(false)
  }
  function closePanel() {
    // El foco permanece en el control de la rail tras Escape; no reabrir por ese foco.
    lastTrigger.current?.focus()
    setExpanded(false)
    setPinned(false)
  }
  function railKeys(event) {
    const items = [...rail.current.querySelectorAll('a, button')]
    const index = items.indexOf(document.activeElement)
    let next
    if (event.key === 'ArrowDown') next = (index + 1) % items.length
    if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = items.length - 1
    if (next != null) {
      event.preventDefault()
      items[next]?.focus()
    }
  }
  return (
    <aside
      ref={container}
      id="portal-nav"
      className={`suite-navigation ${open ? 'is-expanded' : ''} ${mobileOpen ? 'is-open' : ''} ${pinned ? 'is-pinned' : ''}`}
      data-state={
        mobileOpen
          ? 'mobile-drawer'
          : pinned
            ? 'pinned'
            : open
              ? expandedBy
              : 'collapsed'
      }
      role={mobileOpen ? 'dialog' : undefined}
      aria-modal={mobileOpen || undefined}
      aria-label="Menú del Portal"
      onMouseLeave={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          container.current?.contains(event.relatedTarget)
        )
          return
        if (!container.current?.contains(document.activeElement)) setExpanded(false)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !mobileOpen) {
          e.preventDefault()
          closePanel()
        }
      }}
    >
      {mobileOpen && (
        <button
          className="drawer-close quiet"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <Icon name="close" /> Cerrar
        </button>
      )}
      <nav aria-label="Navegación principal" className="suite-nav-content">
        <div className="navigation-rail">
          <Link
            className="rail-wordmark"
            to="/"
            aria-label="GesGROW · Inicio"
            onClick={onClose}
          >
            <Icon name="farm" />
          </Link>
          <div ref={rail} className="rail-collections" onKeyDown={railKeys}>
            {available.map((c) => (
              <div className="rail-entry" key={c.id}>
                {c.id === 'inicio' ? (
                  <NavLink
                    to="/"
                    end
                    className={`rail-collection ${active === c.id ? 'is-active' : ''}`}
                    aria-label="Inicio"
                    aria-describedby={`${id}-${c.id}`}
                    onMouseEnter={home}
                    onFocus={home}
                    onClick={() => {
                      home()
                      onClose()
                    }}
                  >
                    <Icon name="home" />
                  </NavLink>
                ) : (
                  <button
                    className={`rail-collection ${active === c.id ? 'is-active' : ''} ${open && selection === c.id ? 'is-selected' : ''}`}
                    aria-label={c.name}
                    aria-expanded={open && selection === c.id}
                    aria-controls={id}
                    aria-describedby={`${id}-${c.id}`}
                    aria-current={active === c.id ? 'true' : undefined}
                    onMouseEnter={(e) => reveal(c, e.currentTarget, 'hover-expanded')}
                    onFocus={(e) => reveal(c, e.currentTarget, 'focus-expanded')}
                    onClick={(e) => reveal(c, e.currentTarget, 'focus-expanded')}
                  >
                    <Icon name={c.icon} />
                    <span className="sr-only">{c.name}</span>
                  </button>
                )}
                <span className="rail-tooltip" role="tooltip" id={`${id}-${c.id}`}>
                  {c.name}
                </span>
              </div>
            ))}
          </div>
          <button
            className="rail-pin quiet icon-button"
            aria-label={pinned ? 'Contraer navegación' : 'Fijar navegación'}
            aria-pressed={pinned}
            onClick={() => {
              if (!pinned && current?.id === 'inicio')
                setSelection(available.find((c) => c.id !== 'inicio')?.id ?? 'inicio')
              setPinned(!pinned)
              setExpanded(false)
            }}
          >
            <Icon name="panel" />
          </button>
          <span className="rail-caption" aria-hidden="true">
            GesGROW
          </span>
        </div>
        <section
          className="navigation-panel"
          onMouseEnter={() => {
            if (current?.id !== 'inicio') setExpanded(true)
          }}
          id={id}
          hidden={!open}
          aria-label={current?.name}
        >
          <header className="navigation-panel-heading">
            <strong>{current?.name}</strong>
          </header>
          {current?.id !== 'inicio' && (
            <NavigationModules
              key={current?.id}
              rutas={current?.routes ?? []}
              path={path}
              panelOpen={open}
              onNavigate={() => {
                setExpanded(false)
                onClose()
              }}
            />
          )}
        </section>
      </nav>
    </aside>
  )
}
