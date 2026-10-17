import {
  DataTable,
  DetailHero,
  EmptyState,
  ManagementPageHeader,
  StatusBadge
} from './Ui.jsx'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Aviso, Carga, useCarga, useMutacion, Paginacion } from './GestionUi.jsx'

function Lista({ servicio }) {
  const [texto, setTexto] = useState(''),
    [f, setFiltro] = useState({ busqueda: '', activo: null, offset: 0 })
  const consulta = useCarga(() => servicio.listar(f), [servicio, f])
  return (
    <>
      <div className="management-list-intro">
        <div>
          <span className="eyebrow">Directorio laboral</span>
          <h2>Trabajadores de la empresa</h2>
          <p>Identidad agrícola, estado y participación operativa en un solo directorio.</p>
        </div>
      </div>
      <form
        className="search-form management-filterbar"
        onSubmit={(e) => {
          e.preventDefault()
          setFiltro({ ...f, busqueda: texto.trim(), offset: 0 })
        }}
      >
        <label>
          Buscar por DNI o nombre
          <input value={texto} onChange={(e) => setTexto(e.target.value)} />
        </label>
        <label>
          Estado del trabajador
          <select
            value={f.activo === null ? '' : String(f.activo)}
            onChange={(e) =>
              setFiltro({
                ...f,
                activo: e.target.value === '' ? null : e.target.value === 'true',
                offset: 0
              })
            }
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </label>
        <button className="secondary">Buscar</button>
      </form>
      <Carga consulta={consulta}>
        {(d) => (
          <>
            <DataTable className="management-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">DNI</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {d.trabajadores.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="table-identity">
                          <strong>
                            {t.nombres} {t.apellidos}
                          </strong>
                          <small>DNI {t.dni}</small>
                        </div>
                      </td>
                      <td className="secondary-data">{t.dni}</td>
                      <td>
                        <StatusBadge tone={t.activo ? 'success' : 'neutral'}>
                          {t.activo ? 'Activo' : 'Inactivo'}
                        </StatusBadge>
                      </td>
                      <td>
                        <Link className="table-detail-link" to={'/personal/' + t.id}>
                          Ver trabajador
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
            {!d.trabajadores.length && (
              <EmptyState>No hay trabajadores que coincidan.</EmptyState>
            )}
            <Paginacion
              total={d.total}
              offset={f.offset}
              cambiar={(offset) => setFiltro({ ...f, offset })}
            />
          </>
        )}
      </Carga>
    </>
  )
}
function FormTrabajador({ trabajador, servicio, refrescar }) {
  const navigate = useNavigate(),
    m = useMutacion(),
    [d, setDatos] = useState(trabajador ?? { dni: '', nombres: '', apellidos: '' })
  return (
    <form
      className="settings-form management-form"
      onSubmit={(e) => {
        e.preventDefault()
        void m.ejecutar(async () => {
          if (trabajador) {
            await servicio.editar(trabajador.id, d)
            refrescar()
          } else {
            const t = await servicio.crear(d)
            navigate('/personal/' + t.id)
          }
        })
      }}
    >
      <div className="form-intro">
        <span className="eyebrow">Identidad laboral</span>
        <h2>{trabajador ? 'Datos del trabajador' : 'Nuevo trabajador'}</h2>
        <p>Información de la persona que participa en campo, independiente de una cuenta del Portal.</p>
      </div>
      <fieldset className="data-fields form-section" disabled={m.ocupado}>
        <legend>Identificación del trabajador</legend>
        <label>
          DNI
          <input
            required
            inputMode="numeric"
            pattern="[0-9]{8}"
            maxLength={8}
            value={d.dni}
            onChange={(e) => setDatos({ ...d, dni: e.target.value })}
          />
        </label>
        <label>
          Nombres
          <input
            required
            value={d.nombres}
            onChange={(e) => setDatos({ ...d, nombres: e.target.value })}
          />
        </label>
        <label>
          Apellidos
          <input
            required
            value={d.apellidos}
            onChange={(e) => setDatos({ ...d, apellidos: e.target.value })}
          />
        </label>
        <p className="context-note">
          Un trabajador no necesita cuenta de usuario. El DNI es único dentro de esta
          empresa.
        </p>
      </fieldset>
      <Aviso error={m.error} />
      <div className="form-actions">
        <button className="primary" disabled={m.ocupado}>
          {trabajador ? 'Guardar trabajador' : 'Crear trabajador'}
        </button>
      </div>
    </form>
  )
}
function Participacion({ servicio, trabajador, catalogo, participaciones, refrescar }) {
  const [campania, setCampania] = useState(''),
    [rol, setRol] = useState(catalogo.roles[0] ?? ''),
    m = useMutacion()
  const cambiar = (c, r, activo) =>
    m.ejecutar(async () => {
      if (r === 'JABERO')
        await servicio[activo ? 'habilitarJaberoDelDia' : 'retirarJabero'](
          trabajador.id,
          c
        )
      else await servicio[activo ? 'asignarRol' : 'retirarRol'](trabajador.id, c, r)
      refrescar()
    })
  return (
    <section className="management-section">
      <h2>Participación y roles operativos</h2>
      <p className="context-note">
        Roles laborales independientes de los permisos de una cuenta de gestión. JABERO
        conserva su asignación diaria en el PDA; el Portal ofrece habilitar su jornada
        con reloj del servidor y retirarlo sin cambiar su identidad.
      </p>
      <Aviso error={m.error} />
      <ul className="participation-list">
        {participaciones.map((p) => (
          <li key={p.id}>
            <strong>
              {p.campania} · {p.rol}
            </strong>{' '}
            · {p.activo ? 'Activa' : 'Inactiva'}
            {p.administrable ||
            (p.rol === 'JABERO' && servicio.habilitarJaberoDelDia) ? (
              <button
                disabled={m.ocupado || (!p.activo && !trabajador.activo)}
                onClick={() => cambiar(p.campaniaId, p.rol, !p.activo)}
              >
                {p.activo ? 'Retirar' : 'Reactivar'} {p.rol} en {p.campania}
              </button>
            ) : (
              <small>
                Vigencia diaria: {p.fechaJabero ?? 'Sin asignación vigente'}. Consulta;
                gestión en PDA.
              </small>
            )}
            {p.rol === 'JABERO' && p.activo && servicio.habilitarJaberoDelDia && (
              <button
                disabled={m.ocupado}
                onClick={() => cambiar(p.campaniaId, 'JABERO', true)}
              >
                Habilitar jornada de hoy en {p.campania}
              </button>
            )}
          </li>
        ))}
      </ul>
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault()
          void cambiar(campania, rol, true)
        }}
      >
        <label>
          Campaña para participación
          <select
            required
            value={campania}
            onChange={(e) => setCampania(e.target.value)}
          >
            <option value="">Seleccione campaña activa</option>
            {catalogo.campanias
              .filter((c) => c.estado === 'ACTIVA')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} · {c.nombre}
                </option>
              ))}
          </select>
        </label>
        <label>
          Rol operativo
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            {catalogo.roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
            {servicio.habilitarJaberoDelDia && (
              <option value="JABERO">JABERO — jornada de hoy</option>
            )}
          </select>
        </label>
        <button disabled={m.ocupado || !trabajador.activo}>
          {rol === 'JABERO' ? 'Habilitar jabero para hoy' : 'Asignar rol operativo'}
        </button>
      </form>
    </section>
  )
}
function Detalle({ servicio, id }) {
  const consulta = useCarga(
      async () => ({
        trabajador: await servicio.obtener(id),
        catalogo: await servicio.catalogo(),
        participaciones: await servicio.participaciones(id)
      }),
      [servicio, id]
    ),
    m = useMutacion()
  return (
    <Carga consulta={consulta}>
      {(d) => (
        <div key={consulta.revision} className="detail-stack">
          <Link className="back-link" to="/personal">← Personal</Link>
          <DetailHero
            eyebrow="Trabajador agrícola"
            icon="people"
            title={`${d.trabajador.nombres} ${d.trabajador.apellidos}`}
            description={`DNI ${d.trabajador.dni} · identidad laboral de la empresa`}
            status={
              <StatusBadge tone={d.trabajador.activo ? 'success' : 'neutral'}>
                {d.trabajador.activo ? 'Activo' : 'Inactivo'}
              </StatusBadge>
            }
            facts={[
              ['DNI', d.trabajador.dni],
              ['Participaciones', d.participaciones.length],
              ['Tipo de identidad', 'Trabajador agrícola'],
              ['Cuenta de sistema', 'Independiente']
            ]}
          />
          <FormTrabajador
            trabajador={d.trabajador}
            servicio={servicio}
            refrescar={consulta.refrescar}
          />
          <section className="management-section">
            <h2>Estado: {d.trabajador.activo ? 'Activo' : 'Inactivo'}</h2>
            <p>
              La desactivación conserva su historial y participación; no elimina al
              trabajador ni su cuenta asociada.
            </p>
            <Aviso error={m.error} />
            <button
              className="secondary"
              disabled={m.ocupado}
              onClick={() =>
                m.ejecutar(async () => {
                  await servicio[d.trabajador.activo ? 'desactivar' : 'activar'](id)
                  consulta.refrescar()
                })
              }
            >
              {d.trabajador.activo ? 'Desactivar trabajador' : 'Activar trabajador'}
            </button>
          </section>
          <Participacion {...d} servicio={servicio} refrescar={consulta.refrescar} />
        </div>
      )}
    </Carga>
  )
}
export function Personal({ servicio, path }) {
  const id = path.split('/')[2]
  return (
    <>
      <ManagementPageHeader
        eyebrow="Personal agrícola"
        icon="people"
        title="Personal"
        description="Trabajadores y participación operativa de la empresa activa."
        action={
          !id ? (
            <Link className="primary button-link" to="/personal/nuevo">
              Crear trabajador
            </Link>
          ) : null
        }
      />
      <section
        className="content-card management-surface management-surface-editorial workforce-surface"
        key={path}
      >
        {id === 'nuevo' ? (
          <>
            <Link className="back-link" to="/personal">← Personal</Link>
            <div className="creation-context">
              <span className="eyebrow">Alta de trabajador</span>
              <h2>Registrar identidad laboral</h2>
              <p>La cuenta de usuario se administra por separado en Configuración.</p>
            </div>
            <FormTrabajador servicio={servicio} />
          </>
        ) : id ? (
          <Detalle servicio={servicio} id={id} />
        ) : (
          <Lista servicio={servicio} />
        )}
      </section>
    </>
  )
}
