import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Icon, routeIcon, Skeleton, ThemeSwitcher, UserMenu } from './Ui.jsx'
import { NavigationRail } from './Navigation.jsx'
import { AgriculturalVisual } from './AgriculturalVisual.jsx'
import { PortalHero, WeatherCard } from './DashboardWidgets.jsx'
const Dashboard = lazy(() =>
  import('./Dashboard.jsx').then((m) => ({ default: m.Dashboard }))
)
const Ranking = lazy(() =>
  import('./Ranking.jsx').then((m) => ({ default: m.Ranking }))
)
const Configuracion = lazy(() =>
  import('./Configuracion.jsx').then((m) => ({ default: m.Configuracion }))
)
const Reportes = lazy(() =>
  import('./Reportes.jsx').then((m) => ({ default: m.Reportes }))
)
const Campanias = lazy(() =>
  import('./Campanias.jsx').then((m) => ({ default: m.Campanias }))
)
const Personal = lazy(() =>
  import('./Personal.jsx').then((m) => ({ default: m.Personal }))
)
const Cosecha = lazy(() =>
  import('./Cosecha.jsx').then((m) => ({ default: m.Cosecha }))
)
const EstructuraAgricola = lazy(() =>
  import('./EstructuraAgricola.jsx').then((m) => ({ default: m.EstructuraAgricola }))
)

function Marca() {
  return (
    <div className="brand">
      <div>
        <strong>
          <span>Ges</span>GROW
        </strong>
        <small>Portal de gestión</small>
      </div>
    </div>
  )
}

function IdentidadAgricola({ editorial = false }) {
  return (
    <aside
      className={`access-story ${editorial ? 'access-editorial' : ''}`}
      aria-label="GesGROW, gestión agrícola"
    >
      {editorial && <AgriculturalVisual />}
      <span className="eyebrow">Gestión agrícola conectada</span>
      <h2>
        Una visión clara.
        <br />
        Desde el campo.
      </h2>
      <p>
        Su operación agrícola, sus equipos y su producción en un mismo espacio de
        gestión.
      </p>
      {!editorial && (
        <svg
          className="field-pattern"
          viewBox="0 0 520 260"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="currentColor" strokeWidth="1.5" opacity=".42">
            <path d="M20 90 255 20l245 72-245 78Z" />
            <path d="m20 115 235 78 245-76M20 140l235 78 245-76M20 165l235 78 245-76M80 72l245 77M140 54l245 77M200 36l245 77M80 108l235-70M140 128l235-72M200 150l235-73" />
          </g>
          <path d="m255 20 60 18-235 70-60-18Z" fill="currentColor" opacity=".12" />
          <path d="m385 130 60-17 55 16-60 19Z" fill="var(--color-accent-harvest)" />
        </svg>
      )}
      {editorial && (
        <span className="access-story-caption">Del campo a las decisiones.</span>
      )}
    </aside>
  )
}

function Estado({ titulo, children, mensaje, acciones, leading }) {
  return (
    <section className="state-card">
      <span className="eyebrow">Portal Web GesGROW</span>
      {leading}
      <h1>{titulo}</h1>
      {children}
      <Mensaje texto={mensaje} />
      {acciones && <div className="actions">{acciones}</div>}
    </section>
  )
}

function Mensaje({ texto }) {
  return texto ? (
    <p className="notice" role="alert">
      {texto}
    </p>
  ) : null
}
function Cargando({ texto = 'Cargando…' }) {
  return <Skeleton text={texto} />
}

function Login({ portal, estado }) {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState('')
  async function enviar(event) {
    event.preventDefault()
    const secreto = password
    setPassword('')
    await portal.login({ email: email.trim(), password: secreto })
  }
  return (
    <Estado
      titulo="Acceda a su espacio de gestión"
      mensaje={estado.mensaje}
      leading={<Marca />}
    >
      <p className="muted">
        Inicie sesión con su cuenta para trabajar con sus empresas.
      </p>
      <form className="login-form" onSubmit={enviar}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={estado.cargando}
        />
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={estado.cargando}
        />
        <button className="primary" type="submit" disabled={estado.cargando}>
          {estado.cargando ? 'Verificando…' : 'Iniciar sesión'}
        </button>
      </form>
    </Estado>
  )
}

function AceptarInvitacion({ portal, estado }) {
  const [password, setPassword] = useState(''),
    [confirmacion, setConfirmacion] = useState(''),
    [error, setError] = useState('')
  async function enviar(e) {
    e.preventDefault()
    if (password !== confirmacion) {
      setError('Las contraseñas deben coincidir.')
      return
    }
    const secreto = password
    setPassword('')
    setConfirmacion('')
    setError('')
    await portal.completarInvitacion({ password: secreto })
  }
  return (
    <Estado titulo="Active su cuenta de gestión" mensaje={error || estado.mensaje}>
      <p>Defina una contraseña para completar su invitación.</p>
      <form className="login-form" onSubmit={enviar}>
        <label>
          Nueva contraseña
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={estado.cargando}
          />
        </label>
        <label>
          Confirmar contraseña
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            disabled={estado.cargando}
          />
        </label>
        <button className="primary" disabled={estado.cargando}>
          Activar cuenta
        </button>
      </form>
    </Estado>
  )
}

function SeleccionEmpresa({ portal, estado }) {
  return (
    <Estado titulo="Seleccione una empresa" mensaje={estado.mensaje}>
      <p className="muted">
        Su cuenta tiene acceso a estas empresas. Elija con cuál trabajar.
      </p>
      <div className="company-list">
        {estado.empresas.map((empresa) => (
          <button
            key={empresa.id}
            className="company-option"
            disabled={estado.cargando}
            onClick={() => portal.seleccionarEmpresa(empresa.id)}
          >
            <span>
              <strong>{empresa.nombre}</strong>
              <small>Entrar al espacio de gestión</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      {estado.cargando && <Cargando texto="Validando la empresa seleccionada…" />}
      <button
        className="quiet"
        onClick={() => portal.logout()}
        disabled={estado.cargando}
      >
        Cerrar sesión
      </button>
    </Estado>
  )
}

function ContenidoProtegido({ portal, estado, path }) {
  if (
    estado.cargando ||
    !estado.contexto ||
    estado.ruta?.path !== path ||
    estado.ruta?.estado === 'cargando'
  )
    return <Cargando />
  if (estado.ruta.estado !== 'permitida')
    return (
      <section className="content-card" role="alert">
        <span className="eyebrow">Acceso al Portal</span>
        <h1>
          {estado.ruta.estado === 'no-encontrada'
            ? 'Página no encontrada'
            : 'Acceso restringido'}
        </h1>
        <p>{estado.ruta.mensaje}</p>
        <Link className="text-link" to="/">
          Volver al inicio
        </Link>
      </section>
    )
  const ruta = estado.ruta.ruta
  if (ruta.path === '/estructura' && portal.estructuraAgricola)
    return (
      <Suspense fallback={<Cargando />}>
        <EstructuraAgricola servicio={portal.estructuraAgricola} path={path} />
      </Suspense>
    )
  if (ruta.path === '/reportes' && portal.reportes)
    return (
      <Suspense fallback={<Cargando />}>
        {path === '/reportes/ranking' ? (
          <Ranking servicio={portal.reportes} />
        ) : (
          <Reportes servicio={portal.reportes} path={path} />
        )}
      </Suspense>
    )
  if (
    path === '/' &&
    portal.reportes &&
    estado.contexto.permite('reports.view') &&
    estado.modulos.includes('HARVEST')
  )
    return (
      <Suspense fallback={<Cargando />}>
        <Dashboard servicio={portal.reportes} empresa={estado.contexto.empresa} />
      </Suspense>
    )
  if (ruta.path === '/cosecha' && portal.cosecha)
    return (
      <Suspense fallback={<Cargando />}>
        <Cosecha servicio={portal.cosecha} path={path} contexto={estado.contexto} />
      </Suspense>
    )
  if (ruta.path === '/campanias' && portal.campanias)
    return (
      <Suspense fallback={<Cargando />}>
        <Campanias
          servicio={portal.campanias}
          path={path}
          cutover={
            estado.contexto.permite('company.manage')
              ? portal.cutoverAdministrativo
              : null
          }
          parcelas={
            estado.modulos.includes('FARM_STRUCTURE') ? portal.parcelasCampania : null
          }
        />
      </Suspense>
    )
  if (ruta.path === '/personal' && portal.personal)
    return (
      <Suspense fallback={<Cargando />}>
        <Personal servicio={portal.personal} path={path} />
      </Suspense>
    )
  if (path === '/configuracion' || path.startsWith('/configuracion/'))
    return (
      <Suspense fallback={<Cargando />}>
        <Configuracion portal={portal} path={path} />
      </Suspense>
    )
  if (path === '/')
    return (
      <>
        <div className="home-welcome">
          <PortalHero empresa={estado.contexto.empresa} />
          <WeatherCard />
        </div>
        <section className="page-heading">
          <span className="eyebrow">Gestión de su empresa</span>
          {portal.reportes && (
            <p role="status">
              {!estado.contexto.permite('reports.view')
                ? 'Sin permiso reports.view para consultar el dashboard.'
                : 'Módulo HARVEST deshabilitado: dashboard no disponible.'}
            </p>
          )}
          <p>
            Un espacio para organizar el trabajo y consultar la operación de{' '}
            {estado.contexto.empresa}.
          </p>
        </section>
        <section className="content-card">
          <div className="section-title">
            <h2>Sus áreas de trabajo</h2>
            <span className="badge">{estado.navegacion.length - 1} disponibles</span>
          </div>
          <div className="areas">
            {estado.navegacion
              .filter((r) => r.path !== '/')
              .map((r) => (
                <Link className="area" key={r.path} to={r.path}>
                  <span className="area-mark" aria-hidden="true">
                    <Icon name={routeIcon(r.path)} />
                  </span>
                  <h3>{r.nombre}</h3>
                  <p>{r.descripcion}</p>
                  <span className="text-link">Abrir sección →</span>
                </Link>
              ))}
          </div>
          {estado.navegacion.length === 1 && (
            <p className="muted">
              No tiene áreas operativas habilitadas. Consulte al administrador de su
              empresa.
            </p>
          )}
        </section>
        <section className="base-note">
          <strong>Empresa activa: {estado.contexto.empresa}</strong>
          <p>
            Las áreas disponibles dependen de sus permisos y de los módulos habilitados
            para esta empresa.
          </p>
        </section>
      </>
    )
  return (
    <>
      <section className="page-heading">
        <span className="eyebrow">{estado.contexto.empresa}</span>
        <h1>{ruta.nombre}</h1>
        <p>{ruta.descripcion}</p>
      </section>
      <section className="content-card shell">
        <span className="area-mark" aria-hidden="true">
          <Icon name={routeIcon(ruta.path)} />
        </span>
        <h2>Espacio de {ruta.nombre.toLowerCase()}</h2>
        <p>
          Esta sección está preparada para incorporar sus herramientas de gestión en la
          siguiente etapa.
        </p>
        <p className="muted">
          La operación actual continúa disponible en sus herramientas habituales.
        </p>
        <button className="secondary" onClick={() => portal.revalidar()}>
          Actualizar acceso
        </button>
      </section>
    </>
  )
}

function Layout({ portal, estado }) {
  const location = useLocation(),
    navigate = useNavigate()
  const [menu, setMenu] = useState(false)
  const closeMenu = useCallback(() => setMenu(false), [])
  useEffect(() => {
    const desktop = window.matchMedia?.('(min-width: 1024px)')
    const closeDrawer = () => {
      if (desktop?.matches) closeMenu()
    }
    desktop?.addEventListener('change', closeDrawer)
    return () => desktop?.removeEventListener('change', closeDrawer)
  }, [closeMenu])
  const path = location.pathname.replace(/\/$/, '') || '/'
  useEffect(() => {
    if (path === '/aceptar-invitacion') {
      navigate('/', { replace: true })
      return
    }
    void portal.abrirRuta(path)
    setMenu(false)
  }, [portal, path, estado.scope, navigate])
  useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState !== 'hidden') void portal.revalidar()
    }
    window.addEventListener('focus', refrescar)
    document.addEventListener('visibilitychange', refrescar)
    return () => {
      window.removeEventListener('focus', refrescar)
      document.removeEventListener('visibilitychange', refrescar)
    }
  }, [portal])
  async function cambiar(tenant) {
    if (await portal.seleccionarEmpresa(tenant)) navigate('/', { replace: true })
  }
  return (
    <div className="portal-layout">
      <a href="#contenido" className="skip-link">
        Ir al contenido
      </a>
      <NavigationRail
        key={estado.contexto?.tenantId ?? 'checking'}
        navegacion={estado.navegacion}
        path={path}
        mobileOpen={menu}
        onClose={closeMenu}
      />
      {menu && (
        <button
          className="nav-overlay"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace" inert={menu || undefined}>
        <header className="header">
          <button
            className="menu-button secondary icon-button"
            aria-label="Menú"
            aria-controls="portal-nav"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon name="menu" />
          </button>
          {estado.empresas.length > 1 && (
            <div className="tenant-control">
              <label htmlFor="tenant">Empresa activa</label>
              <select
                id="tenant"
                value={estado.contexto?.tenantId ?? ''}
                disabled={estado.cargando}
                onChange={(e) => cambiar(e.target.value)}
              >
                {!estado.contexto && <option value="">Validando…</option>}
                {estado.empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="header-actions">
            <ThemeSwitcher />
            <UserMenu usuario={estado.usuario} onLogout={() => portal.logout()} />
          </div>
        </header>
        <main
          id="contenido"
          className="content"
          tabIndex={-1}
          key={`${estado.scope}:${estado.contexto?.tenantId ?? 'checking'}`}
        >
          <ContenidoProtegido portal={portal} estado={estado} path={path} />
        </main>
        <footer className="workspace-footer">GesGROW · Portal Web de Gestión</footer>
      </div>
    </div>
  )
}

export function Portal({ portal }) {
  const estado = useSyncExternalStore(portal.suscribir, portal.estadoActual)
  useEffect(() => {
    void portal.iniciar()
    return () => portal.detener()
  }, [portal])
  if (estado.fase === 'listo') return <Layout portal={portal} estado={estado} />
  return (
    <div
      className={`access-screen ${estado.fase === 'login' ? 'login-editorial' : ''}`}
    >
      <header>
        <Marca />
        <ThemeSwitcher />
      </header>
      <main>
        <IdentidadAgricola editorial={estado.fase === 'login'} />
        {estado.fase === 'restaurando' && (
          <Estado titulo="Preparando su espacio">
            <Cargando texto="Validando su acceso…" />
          </Estado>
        )}
        {estado.fase === 'login' && <Login portal={portal} estado={estado} />}
        {estado.fase === 'invitacion' && (
          <AceptarInvitacion portal={portal} estado={estado} />
        )}
        {estado.fase === 'seleccion' && (
          <SeleccionEmpresa portal={portal} estado={estado} />
        )}
        {estado.fase === 'sin-empresas' && (
          <Estado
            titulo="Su cuenta aún no tiene una empresa"
            mensaje={estado.mensaje}
            acciones={
              <>
                <button className="secondary" onClick={() => portal.restaurar()}>
                  Actualizar acceso
                </button>
                <button className="quiet" onClick={() => portal.logout()}>
                  Cerrar sesión
                </button>
              </>
            }
          >
            <p>
              Solicite al administrador que le asigne una membresía activa para acceder
              al Portal.
            </p>
          </Estado>
        )}
        {['sin-acceso', 'error', 'salida-fallida'].includes(estado.fase) && (
          <Estado
            titulo={
              estado.fase === 'salida-fallida'
                ? 'Cierre de sesión pendiente'
                : 'No se pudo validar el acceso'
            }
            mensaje={estado.mensaje}
            acciones={
              <>
                {estado.fase !== 'salida-fallida' && (
                  <button className="secondary" onClick={() => portal.restaurar()}>
                    Reintentar
                  </button>
                )}
                <button className="quiet" onClick={() => portal.logout()}>
                  Cerrar sesión
                </button>
              </>
            }
          />
        )}
      </main>
      <footer>Portal Web GesGROW · Gestión de empresas</footer>
    </div>
  )
}

export function ErrorConfiguracion({ mensaje }) {
  return (
    <div className="access-screen">
      <header>
        <Marca />
      </header>
      <main>
        <Estado titulo="Portal pendiente de configuración" mensaje={mensaje} />
      </main>
    </div>
  )
}
