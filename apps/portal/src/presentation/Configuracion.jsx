import { DataTable, EmptyState, ManagementPageHeader, StatusBadge } from './Ui.jsx'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { Skeleton } from './Ui.jsx'
import { Suscripcion } from './Suscripcion.jsx'

function useConsulta(cargar, claves) {
  const [version, setVersion] = useState(0)
  const [estado, setEstado] = useState({ cargando: true })
  useEffect(() => {
    let vigente = true
    setEstado({ cargando: true })
    Promise.resolve()
      .then(cargar)
      .then(
        (datos) => {
          if (vigente) setEstado({ datos })
        },
        (error) => {
          if (vigente && error.name !== 'SolicitudObsoleta') setEstado({ error })
        }
      )
    return () => {
      vigente = false
    }
  }, [...claves, version])
  return { ...estado, refrescar: () => setVersion((v) => v + 1) }
}
function Aviso({ error, mensaje }) {
  return error || mensaje ? (
    <p role={error ? 'alert' : 'status'} className="notice">
      {error?.message ?? mensaje}
    </p>
  ) : null
}
function Consulta({ consulta, children }) {
  if (consulta.cargando) return <Skeleton text="Cargando configuración…" />
  if (consulta.error)
    return (
      <>
        <Aviso error={consulta.error} />
        <button onClick={consulta.refrescar}>Reintentar</button>
      </>
    )
  return children(consulta.datos)
}
function Permisos({ permisos }) {
  return (
    <ul className="permission-list">
      {permisos.map((p) => (
        <li key={p}>
          <code>{p}</code>
        </li>
      ))}
      {!permisos.length && <li>Sin permisos efectivos</li>}
    </ul>
  )
}
function Roles({ catalogo, seleccion, cambiar }) {
  return (
    <fieldset>
      <legend>Roles de aplicación</legend>
      {catalogo.roles.map((r) => (
        <label className="check-row" key={r.id}>
          <input
            type="checkbox"
            checked={seleccion.includes(r.id)}
            onChange={(e) =>
              cambiar(
                e.target.checked
                  ? [...seleccion, r.id]
                  : seleccion.filter((id) => id !== r.id)
              )
            }
          />
          <span>
            <strong>{r.codigo}</strong>
            <small>{r.permisos.join(' · ')}</small>
          </span>
        </label>
      ))}
    </fieldset>
  )
}
function Trabajador({ catalogo, valor, cambiar }) {
  return (
    <label>
      Trabajador asociado (opcional)
      <select value={valor ?? ''} onChange={(e) => cambiar(e.target.value || null)}>
        <option value="">Sin trabajador asociado</option>
        {catalogo.trabajadores.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre} · {t.dni}
            {t.activo ? '' : ' (inactivo)'}
          </option>
        ))}
      </select>
      <small>La cuenta de gestión y el trabajador agrícola son independientes.</small>
    </label>
  )
}
function EmpresaForm({ empresa, servicio, portal }) {
  const [nombre, setNombre] = useState(empresa.nombre),
    [guardando, setGuardando] = useState(false),
    [error, setError] = useState(null)
  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      await servicio.guardarEmpresa({ nombre })
      await portal.restaurar()
    } catch (e) {
      if (e.name !== 'SolicitudObsoleta') setError(e)
    } finally {
      setGuardando(false)
    }
  }
  return (
    <form className="settings-form" onSubmit={guardar}>
      <h2>Datos de la empresa</h2>
      <dl className="fact-list">
        <dt>Código</dt>
        <dd>{empresa.codigo}</dd>
        <dt>Estado</dt>
        <dd>{empresa.estado}</dd>
      </dl>
      <label>
        Nombre de la empresa
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          maxLength={200}
        />
      </label>
      <p className="muted">
        El código, el propietario y los identificadores internos no se modifican desde
        el Portal.
      </p>
      <Aviso error={error} />
      <button className="primary" disabled={guardando}>
        Guardar empresa
      </button>
    </form>
  )
}
function Empresa({ servicio, portal }) {
  const consulta = useConsulta(() => servicio.obtenerEmpresa(), [servicio])
  return (
    <Consulta consulta={consulta}>
      {(empresa) => (
        <EmpresaForm empresa={empresa} servicio={servicio} portal={portal} />
      )}
    </Consulta>
  )
}
function Usuarios({ servicio }) {
  const [texto, setTexto] = useState(''),
    [busqueda, setBusqueda] = useState(''),
    [offset, setOffset] = useState(0)
  const consulta = useConsulta(
    () => servicio.listarUsuarios({ busqueda, offset }),
    [servicio, busqueda, offset]
  )
  return (
    <>
      <div className="management-list-intro">
        <div>
          <span className="eyebrow">Identidad y acceso</span>
          <h2>Usuarios de la empresa</h2>
          <p>Cuentas del Portal, membresía y vínculo opcional con identidad laboral.</p>
        </div>
        <Link className="primary button-link" to="/configuracion/invitaciones">
          Invitar usuario
        </Link>
      </div>
      <form
        className="search-form management-filterbar"
        onSubmit={(e) => {
          e.preventDefault()
          setOffset(0)
          setBusqueda(texto.trim())
        }}
      >
        <label>
          Buscar por nombre o correo
          <input value={texto} onChange={(e) => setTexto(e.target.value)} />
        </label>
        <button className="secondary">Buscar</button>
      </form>
      <Consulta consulta={consulta}>
        {(datos) => (
          <>
            <DataTable className="management-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Usuario</th>
                    <th scope="col">Membresía</th>
                    <th scope="col">Trabajador</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.usuarios.map((u) => (
                    <tr key={u.usuarioId}>
                      <td>
                        <div className="table-identity">
                          <strong>{u.nombre}</strong>
                          <small>{u.email}</small>
                          {!u.cuentaActiva && <small>Cuenta inactiva</small>}
                        </div>
                      </td>
                      <td>
                        <StatusBadge tone={u.activo ? 'success' : 'warning'}>
                          {u.activo ? 'Activa' : 'Suspendida'}
                        </StatusBadge>
                      </td>
                      <td>{u.trabajador?.nombre ?? 'Sin asociación'}</td>
                      <td>
                        <Link
                          className="table-detail-link"
                          to={`/configuracion/usuarios/${u.usuarioId}`}
                          aria-label={`Ver accesos de ${u.nombre}`}
                        >
                          Ver accesos
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
            {!datos.usuarios.length && (
              <EmptyState>No hay usuarios que coincidan.</EmptyState>
            )}
            <div className="actions">
              <span>{datos.total} usuarios</span>
              <button
                disabled={!offset}
                onClick={() => setOffset(Math.max(0, offset - 50))}
              >
                Anterior
              </button>
              <button
                disabled={offset + 50 >= datos.total}
                onClick={() => setOffset(offset + 50)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </Consulta>
    </>
  )
}
function MembresiaForm({ usuario, catalogo, servicio, portal }) {
  const [nombre, setNombre] = useState(usuario.nombre),
    [activo, setActivo] = useState(usuario.activo),
    [roles, setRoles] = useState(usuario.roles),
    [trabajadorId, setTrabajador] = useState(usuario.trabajadorId),
    [permisos, setPermisos] = useState(usuario.permisos)
  const [error, setError] = useState(null),
    [guardando, setGuardando] = useState(false)
  async function guardar(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const guardada = await servicio.guardarMembresia({
        usuarioId: usuario.usuarioId,
        nombre,
        activo,
        roles,
        trabajadorId
      })
      setNombre(guardada.nombre)
      setActivo(guardada.activo)
      setRoles(guardada.roles)
      setTrabajador(guardada.trabajadorId)
      setPermisos(guardada.permisos)
      await portal.revalidar()
    } catch (e) {
      if (e.name !== 'SolicitudObsoleta') setError(e)
    } finally {
      setGuardando(false)
    }
  }
  return (
    <form className="settings-form" onSubmit={guardar}>
      <Link className="back-link" to="/configuracion/usuarios">← Usuarios</Link>
      <h2>Accesos de {usuario.nombre}</h2>
      <p>{usuario.email}</p>
      <label>
        Nombre en esta empresa
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={200}
        />
      </label>
      <label>
        Estado de la membresía
        <select
          value={activo ? 'activa' : 'suspendida'}
          onChange={(e) => setActivo(e.target.value === 'activa')}
        >
          <option value="activa">Activa</option>
          <option value="suspendida">Suspendida</option>
        </select>
      </label>
      <p className="context-note">
        Suspender esta membresía conserva la cuenta y sus accesos en otras empresas.
      </p>
      <Roles catalogo={catalogo} seleccion={roles} cambiar={setRoles} />
      <Trabajador catalogo={catalogo} valor={trabajadorId} cambiar={setTrabajador} />
      <h3>Permisos efectivos guardados</h3>
      <Permisos permisos={permisos} />
      <Aviso error={error} />
      <button className="primary" disabled={guardando}>
        Guardar membresía
      </button>
    </form>
  )
}
function Detalle({ servicio, portal, id }) {
  const consulta = useConsulta(
    async () => ({
      usuario: await servicio.obtenerUsuario(id),
      catalogo: await servicio.catalogoAccesos()
    }),
    [servicio, id]
  )
  return (
    <Consulta consulta={consulta}>
      {(datos) => <MembresiaForm {...datos} servicio={servicio} portal={portal} />}
    </Consulta>
  )
}
function AltaForm({ servicio, catalogo, invitaciones }) {
  const navigate = useNavigate(),
    operacion = useRef(crypto.randomUUID())
  const [nombre, setNombre] = useState(''),
    [email, setEmail] = useState(''),
    [roles, setRoles] = useState([]),
    [trabajadorId, setTrabajador] = useState(null)
  const [error, setError] = useState(null),
    [guardando, setGuardando] = useState(false)
  async function enviar(datos) {
    setError(null)
    setGuardando(true)
    try {
      const recibo = await servicio.invitarUsuario(datos)
      navigate(`/configuracion/usuarios/${recibo.usuarioId}`)
    } catch (e) {
      if (e.name !== 'SolicitudObsoleta') setError(e)
    } finally {
      setGuardando(false)
    }
  }
  return (
    <>
      <form
        className="settings-form"
        onSubmit={(e) => {
          e.preventDefault()
          void enviar({
            operacionId: operacion.current,
            nombre,
            email,
            roles,
            trabajadorId
          })
        }}
      >
        <h2>Invitar o vincular usuario</h2>
        <p className="context-note">
          Si la cuenta ya existe, se añade su membresía. Las cuentas nuevas reciben un
          enlace para definir su contraseña. Una membresía existente conserva sus
          accesos.
        </p>
        <label>
          Nombre
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={200}
          />
        </label>
        <label>
          Correo electrónico
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <Roles catalogo={catalogo} seleccion={roles} cambiar={setRoles} />
        <Trabajador catalogo={catalogo} valor={trabajadorId} cambiar={setTrabajador} />
        <Aviso error={error} />
        <div className="actions">
          <button className="primary" disabled={guardando}>
            Invitar o vincular
          </button>
          <button
            type="button"
            disabled={guardando}
            onClick={() => {
              operacion.current = crypto.randomUUID()
              setNombre('')
              setEmail('')
              setRoles([])
              setTrabajador(null)
              setError(null)
            }}
          >
            Preparar otra invitación
          </button>
        </div>
      </form>
      <h3>Invitaciones de la empresa</h3>
      <ul className="invitation-list">
        {invitaciones.map((i) => (
          <li key={i.id}>
            <strong>{i.email}</strong> · {i.estado}
            {i.estado === 'PENDIENTE' && (
              <button
                disabled={guardando}
                onClick={() =>
                  enviar({
                    operacionId: i.id,
                    nombre: i.nombre,
                    email: i.email,
                    roles: i.roles,
                    trabajadorId: i.trabajadorId
                  })
                }
              >
                Reintentar alta de {i.email}
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
function Invitaciones({ servicio }) {
  const consulta = useConsulta(
    async () => ({
      catalogo: await servicio.catalogoAccesos(),
      invitaciones: await servicio.listarInvitaciones()
    }),
    [servicio]
  )
  return (
    <Consulta consulta={consulta}>
      {(datos) => <AltaForm {...datos} servicio={servicio} />}
    </Consulta>
  )
}
function CatalogoRoles({ servicio }) {
  const consulta = useConsulta(() => servicio.catalogoAccesos(), [servicio])
  return (
    <Consulta consulta={consulta}>
      {(catalogo) => (
        <>
          <h2>Roles y permisos</h2>
          <p>
            Los roles de aplicación están separados de los roles laborales de campo.
          </p>
          {catalogo.roles.map((r) => (
            <section className="role-card" key={r.id}>
              <h3>{r.codigo}</h3>
              <Permisos permisos={r.permisos} />
            </section>
          ))}
        </>
      )}
    </Consulta>
  )
}
function Modulos({ servicio }) {
  const consulta = useConsulta(() => servicio.modulosHabilitados(), [servicio])
  return (
    <Consulta consulta={consulta}>
      {(modulos) => (
        <>
          <h2>Módulos habilitados</h2>
          <p>
            La administración de usuarios no modifica la contratación. Los cambios
            comerciales requieren una delegación independiente.
          </p>
          <ul className="module-status-list">
            {['HARVEST', 'CAMPAIGN', 'WORKFORCE', 'FARM_STRUCTURE'].map((m) => (
              <li key={m}>
                <StatusBadge tone={modulos.includes(m) ? 'success' : 'neutral'}>
                  {`${m}: ${modulos.includes(m) ? 'Habilitado' : 'No habilitado'}`}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </>
      )}
    </Consulta>
  )
}
export function Configuracion({ portal, path }) {
  const servicio = portal.configuracion,
    seccion = path.split('/')[2] ?? 'empresa',
    id = path.split('/')[3]
  return (
    <>
      <ManagementPageHeader
        eyebrow="Administración"
        icon="settings"
        title="Configuración"
        description="Empresa, usuarios, accesos y estado comercial del espacio activo."
      />
      <nav className="settings-tabs settings-secondary-nav" aria-label="Configuración">
        {[
          ['empresa', 'Empresa'],
          ['usuarios', 'Usuarios'],
          ['invitaciones', 'Invitaciones'],
          ['roles', 'Roles y permisos'],
          ['modulos', 'Módulos'],
          ['suscripcion', 'Suscripción']
        ].map(([ruta, texto]) => (
          <NavLink key={ruta} to={`/configuracion/${ruta}`}>
            {texto}
          </NavLink>
        ))}
      </nav>
      <section
        className="content-card management-surface management-surface-editorial settings-surface"
        key={path}
      >
        {seccion === 'suscripcion' ? (
          portal.suscripcion ? (
            <Suscripcion servicio={portal.suscripcion} />
          ) : (
            <p role="alert">Consulta comercial no disponible.</p>
          )
        ) : !servicio ? (
          <p role="alert">Administración no disponible.</p>
        ) : seccion === 'empresa' ? (
          <Empresa servicio={servicio} portal={portal} />
        ) : seccion === 'usuarios' ? (
          id ? (
            <Detalle servicio={servicio} portal={portal} id={id} />
          ) : (
            <Usuarios servicio={servicio} />
          )
        ) : seccion === 'invitaciones' ? (
          <Invitaciones servicio={servicio} />
        ) : seccion === 'roles' ? (
          <CatalogoRoles servicio={servicio} />
        ) : (
          <Modulos servicio={servicio} />
        )}
      </section>
    </>
  )
}
