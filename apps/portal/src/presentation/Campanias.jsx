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
import { CutoverAdministrativo } from './CutoverAdministrativo.jsx'
import { VinculosParcela } from './VinculosParcela.jsx'

function Lista({ servicio }) {
  const [texto, setTexto] = useState(''),
    [filtros, setFiltros] = useState({
      busqueda: '',
      estado: '',
      cultivoId: null,
      offset: 0
    })
  const catalogo = useCarga(() => servicio.cultivos(), [servicio])
  const consulta = useCarga(() => servicio.listar(filtros), [servicio, filtros])
  return (
    <>
      <div className="management-list-intro">
        <div>
          <span className="eyebrow">Portafolio operativo</span>
          <h2>Campañas de la empresa</h2>
          <p>Filtre por estado, cultivo o nombre para ubicar rápidamente la campaña activa.</p>
        </div>
      </div>
      <form
        className="search-form management-filterbar"
        onSubmit={(e) => {
          e.preventDefault()
          setFiltros({ ...filtros, busqueda: texto.trim(), offset: 0 })
        }}
      >
        <label>
          Buscar campañas
          <input value={texto} onChange={(e) => setTexto(e.target.value)} />
        </label>
        <label>
          Estado
          <select
            value={filtros.estado}
            onChange={(e) =>
              setFiltros({ ...filtros, estado: e.target.value, offset: 0 })
            }
          >
            <option value="">Todos</option>
            <option>ACTIVA</option>
            <option>CERRADA</option>
          </select>
        </label>
        <label>
          Cultivo
          <select
            value={filtros.cultivoId ?? ''}
            onChange={(e) =>
              setFiltros({ ...filtros, cultivoId: e.target.value || null, offset: 0 })
            }
          >
            <option value="">Todos los cultivos</option>
            {catalogo.datos?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary">Buscar</button>
      </form>
      <Aviso error={catalogo.error} />
      <Carga consulta={consulta}>
        {(d) => (
          <>
            <DataTable className="management-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Código y campaña</th>
                    <th scope="col">Cultivo</th>
                    <th scope="col">Fechas</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {d.campanias.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="table-identity">
                          <strong>{c.nombre}</strong>
                          <small>{c.codigo}</small>
                        </div>
                      </td>
                      <td>{c.cultivo}</td>
                      <td>
                        {c.fechaInicio ?? 'Sin fecha'} · {c.fechaFin ?? 'Sin fin'}
                      </td>
                      <td>
                        <StatusBadge
                          tone={c.estado === 'ACTIVA' ? 'success' : 'neutral'}
                        >
                          {c.estado}
                        </StatusBadge>
                      </td>
                      <td>
                        <Link
                          className="table-detail-link"
                          to={'/campanias/' + c.id}
                          aria-label={`Ver ${c.codigo}`}
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
            {!d.campanias.length && (
              <EmptyState>No hay campañas que coincidan.</EmptyState>
            )}
            <Paginacion
              total={d.total}
              offset={filtros.offset}
              cambiar={(offset) => setFiltros({ ...filtros, offset })}
            />
          </>
        )}
      </Carga>
    </>
  )
}
function FormCampania({ campania, cultivos, servicio, refrescar }) {
  const nueva = !campania,
    navigate = useNavigate(),
    m = useMutacion()
  const [datos, setDatos] = useState(
    campania ?? {
      codigo: '',
      nombre: '',
      cultivoId: cultivos.find((c) => c.activo)?.id ?? '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'ACTIVA'
    }
  )
  const campo = (nombre, valor) => setDatos({ ...datos, [nombre]: valor })
  async function guardar(e) {
    e.preventDefault()
    await m.ejecutar(async () => {
      if (nueva) {
        const c = await servicio.crear(datos)
        navigate('/campanias/' + c.id)
      } else {
        await servicio.editar(campania.id, datos)
        refrescar()
      }
    })
  }
  return (
    <form className="settings-form management-form" onSubmit={guardar}>
      <div className="form-intro">
        <span className="eyebrow">{nueva ? 'Configuración inicial' : 'Información editable'}</span>
        <h2>{nueva ? 'Nueva campaña' : 'Datos de campaña'}</h2>
        <p>Defina la identidad de la campaña y su contexto operativo sin perder el histórico.</p>
      </div>
      <fieldset disabled={m.ocupado} className="data-fields form-section">
        <legend>Identidad y cultivo</legend>
        <label>
          Código de campaña
          <input
            required
            value={datos.codigo}
            onChange={(e) => campo('codigo', e.target.value)}
          />
        </label>
        <label>
          Nombre de campaña
          <input
            required
            value={datos.nombre}
            onChange={(e) => campo('nombre', e.target.value)}
          />
        </label>
        <label>
          Cultivo de campaña
          <select
            required
            value={datos.cultivoId}
            onChange={(e) => campo('cultivoId', e.target.value)}
          >
            {cultivos
              .filter((c) => c.activo || c.id === datos.cultivoId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                  {c.activo ? '' : ' (inactivo)'}
                </option>
              ))}
          </select>
        </label>
      </fieldset>
      <fieldset disabled={m.ocupado} className="data-fields form-section">
        <legend>Periodo y estado</legend>
        <label>
          Fecha de inicio
          <input
            type="date"
            required
            value={datos.fechaInicio ?? ''}
            onChange={(e) => campo('fechaInicio', e.target.value)}
          />
        </label>
        <label>
          Fecha de fin
          <input
            type="date"
            min={datos.fechaInicio || undefined}
            value={datos.fechaFin ?? ''}
            onChange={(e) => campo('fechaFin', e.target.value)}
          />
        </label>
        {nueva ? (
          <label>
            Estado inicial
            <select
              value={datos.estado}
              onChange={(e) => campo('estado', e.target.value)}
            >
              <option>ACTIVA</option>
              <option>CERRADA</option>
            </select>
          </label>
        ) : (
          <p>
            Estado actual: <strong>{campania.estado}</strong>. Utilice las acciones de
            ciclo de campaña para cambiarlo.
          </p>
        )}
        <p className="muted">
          Una campaña activa por cultivo y empresa. El cultivo histórico se conserva
          cuando ya hay lotes o personal.
        </p>
      </fieldset>
      <Aviso error={m.error} />
      <div className="form-actions">
        <button className="primary" disabled={m.ocupado}>
          {nueva ? 'Crear campaña' : 'Guardar campaña'}
        </button>
      </div>
    </form>
  )
}
function Ciclo({ campania, servicio, refrescar }) {
  const m = useMutacion(),
    [fin, setFin] = useState('')
  return (
    <section className="management-section">
      <h2>Ciclo de campaña</h2>
      <Aviso error={m.error} />
      {campania.estado === 'CERRADA' ? (
        <>
          <p>Activar elimina la fecha de fin y conserva el inicio de la campaña.</p>
          <button
            className="secondary"
            disabled={m.ocupado}
            onClick={() =>
              m.ejecutar(async () => {
                await servicio.activar(campania.id)
                refrescar()
              })
            }
          >
            Activar campaña
          </button>
        </>
      ) : (
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault()
            void m.ejecutar(async () => {
              await servicio.cerrar(campania.id, fin)
              refrescar()
            })
          }}
        >
          <label>
            Fecha de cierre (opcional)
            <input
              type="date"
              min={campania.fechaInicio || undefined}
              value={fin}
              onChange={(e) => setFin(e.target.value)}
            />
            <small>Vacía: fecha actual del servidor en Lima.</small>
          </label>
          <button className="secondary" disabled={m.ocupado}>
            Cerrar campaña
          </button>
        </form>
      )}
    </section>
  )
}
function VariedadForm({ variedad, campaniaId, servicio, refrescar }) {
  const [nombre, setNombre] = useState(variedad?.nombre ?? ''),
    [activo, setActivo] = useState(variedad?.activo ?? true),
    m = useMutacion()
  return (
    <form
      className="variety-form"
      onSubmit={(e) => {
        e.preventDefault()
        void m.ejecutar(async () => {
          await servicio.guardarVariedad(campaniaId, {
            id: variedad?.id,
            nombre,
            activo
          })
          refrescar()
        })
      }}
    >
      <label>
        {variedad ? 'Nombre de variedad ' + variedad.nombre : 'Nueva variedad'}
        <input required value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => setActivo(e.target.checked)}
        />
        Activa
      </label>
      <button disabled={m.ocupado}>
        {variedad ? 'Guardar variedad' : 'Crear variedad'}
      </button>
      <Aviso error={m.error} />
    </form>
  )
}
function Lote({ lote, variedades, campaniaId, servicio, refrescar }) {
  const [ids, setIds] = useState(lote.variedadIds),
    m = useMutacion()
  return (
    <form
      className="settings-form management-section"
      onSubmit={(e) => {
        e.preventDefault()
        void m.ejecutar(async () => {
          await servicio.configurarVariedadesLote(campaniaId, lote.id, ids)
          refrescar()
        })
      }}
    >
      <h3>
        {lote.codigo} · {lote.nombre}
      </h3>
      <p>{lote.activo ? 'Operativo activo' : 'Operativo inactivo'}</p>
      <fieldset disabled={m.ocupado}>
        <legend>Variedades del lote {lote.codigo}</legend>
        {variedades
          .filter((v) => v.activo || lote.variedadIds.includes(v.id))
          .map((v) => (
            <label className="check-row" key={v.id}>
              <input
                type="checkbox"
                checked={ids.includes(v.id)}
                onChange={(e) =>
                  setIds(
                    e.target.checked ? [...ids, v.id] : ids.filter((id) => id !== v.id)
                  )
                }
              />
              {v.nombre}
              {v.activo ? '' : ' (inactiva)'}
            </label>
          ))}
      </fieldset>
      <Aviso error={m.error} />
      <button disabled={m.ocupado}>Guardar variedades de {lote.codigo}</button>
    </form>
  )
}
function DatosLote({ lote, campaniaId, variedades, servicio, refrescar }) {
  const [codigo, setCodigo] = useState(lote?.codigo ?? ''),
    [nombre, setNombre] = useState(lote?.nombre ?? ''),
    [activo, setActivo] = useState(lote?.activo ?? true),
    [ids, setIds] = useState(lote?.variedadIds ?? []),
    m = useMutacion()
  return (
    <form
      className="settings-form management-section"
      onSubmit={(e) => {
        e.preventDefault()
        void m.ejecutar(async () => {
          await servicio.guardarLote(campaniaId, {
            id: lote?.id,
            codigo,
            nombre,
            activo,
            variedadIds: ids
          })
          refrescar()
        })
      }}
    >
      <h3>{lote ? 'Datos del lote ' + lote.codigo : 'Crear lote operativo'}</h3>
      <fieldset disabled={m.ocupado}>
        <legend>Identificación operativa</legend>
        <label>
          Código de lote {lote?.codigo ?? 'nuevo'}{' '}
          <input
            required
            maxLength={30}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </label>
        <label>
          Nombre de lote {lote?.codigo ?? 'nuevo'}{' '}
          <input
            maxLength={100}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
          Lote activo {lote?.codigo ?? 'nuevo'}
        </label>
        {!lote && (
          <fieldset>
            <legend>Variedades del nuevo lote</legend>
            {variedades
              .filter((v) => v.activo)
              .map((v) => (
                <label className="check-row" key={v.id}>
                  <input
                    type="checkbox"
                    checked={ids.includes(v.id)}
                    onChange={(e) =>
                      setIds(
                        e.target.checked
                          ? [...ids, v.id]
                          : ids.filter((id) => id !== v.id)
                      )
                    }
                  />
                  Nueva asociación: {v.nombre}
                </label>
              ))}
          </fieldset>
        )}
        <button>{lote ? 'Guardar lote ' + lote.codigo : 'Crear lote operativo'}</button>
      </fieldset>
      <Aviso error={m.error} />
    </form>
  )
}
function Detalle({ servicio, id, cutover, parcelas }) {
  const consulta = useCarga(
    async () => ({
      campania: await servicio.obtener(id),
      cultivos: await servicio.cultivos(),
      variedades: await servicio.variedades(id),
      lotes: await servicio.lotes(id)
    }),
    [servicio, id]
  )
  return (
    <Carga consulta={consulta}>
      {(d) => (
        <div key={consulta.revision} className="detail-stack">
          <Link className="back-link" to="/campanias">← Campañas</Link>
          <DetailHero
            eyebrow="Campaña"
            icon="campaign"
            title={d.campania.nombre}
            description={`Código ${d.campania.codigo} · ${d.campania.cultivo}`}
            status={
              <StatusBadge tone={d.campania.estado === 'ACTIVA' ? 'success' : 'neutral'}>
                {d.campania.estado}
              </StatusBadge>
            }
            facts={[
              ['Cultivo', d.campania.cultivo],
              ['Inicio', d.campania.fechaInicio ?? 'Sin fecha'],
              ['Fin', d.campania.fechaFin ?? 'Sin fin'],
              ['Actividad', d.campania.estado === 'ACTIVA' ? 'En curso' : 'Histórica']
            ]}
          />
          <FormCampania {...d} servicio={servicio} refrescar={consulta.refrescar} />
          <Ciclo
            campania={d.campania}
            servicio={servicio}
            refrescar={consulta.refrescar}
          />
          {cutover && <CutoverAdministrativo servicio={cutover} campaniaId={id} />}
          <section className="management-section">
            <h2>Variedades de {d.campania.cultivo}</h2>
            <p>
              Catálogo compartido por las campañas de este cultivo en la empresa. No se
              modifica el catálogo global de cultivos.
            </p>
            {d.variedades.map((v) => (
              <VariedadForm
                key={v.id}
                variedad={v}
                campaniaId={id}
                servicio={servicio}
                refrescar={consulta.refrescar}
              />
            ))}
            <VariedadForm
              campaniaId={id}
              servicio={servicio}
              refrescar={consulta.refrescar}
            />
          </section>
          <section className="management-section">
            <h2>Lotes operativos de campaña</h2>
            <p className="context-note">
              Configuración operativa actual; estos registros no definen parcelas
              físicas.
            </p>
            {d.lotes.map((l) => (
              <div className="operational-lot-group" key={l.id}>
                {servicio.guardarLote && (
                  <DatosLote
                    lote={l}
                    campaniaId={id}
                    variedades={d.variedades}
                    servicio={servicio}
                    refrescar={consulta.refrescar}
                  />
                )}
                <Lote
                  key={l.id}
                  lote={l}
                  variedades={d.variedades}
                  campaniaId={id}
                  servicio={servicio}
                  refrescar={consulta.refrescar}
                />
                {parcelas && (
                  <VinculosParcela servicio={parcelas} campaniaId={id} lote={l} />
                )}
              </div>
            ))}
            {!d.lotes.length && <p>Sin lotes operativos registrados.</p>}
            {servicio.guardarLote && (
              <DatosLote
                campaniaId={id}
                variedades={d.variedades}
                servicio={servicio}
                refrescar={consulta.refrescar}
              />
            )}
          </section>
        </div>
      )}
    </Carga>
  )
}
function Nueva({ servicio }) {
  const consulta = useCarga(() => servicio.cultivos(), [servicio])
  return (
    <Carga consulta={consulta}>
      {(cultivos) => (
        <>
          <Link className="back-link" to="/campanias">← Campañas</Link>
          <div className="creation-context">
            <span className="eyebrow">Alta de campaña</span>
            <h2>Prepare el siguiente ciclo productivo</h2>
            <p>Complete primero su identidad y cultivo; luego defina periodo y estado inicial.</p>
          </div>
          <FormCampania cultivos={cultivos} servicio={servicio} />
        </>
      )}
    </Carga>
  )
}
export function Campanias({ servicio, path, cutover, parcelas }) {
  const id = path.split('/')[2]
  return (
    <>
      <ManagementPageHeader
        eyebrow="Gestión operativa"
        icon="campaign"
        title="Campañas"
        description="Campañas y configuración por cultivo de la empresa activa."
        action={
          !id ? (
            <Link className="primary button-link" to="/campanias/nueva">
              Crear campaña
            </Link>
          ) : null
        }
      />
      <section
        className="content-card management-surface management-surface-editorial campaign-surface"
        key={path}
      >
        {id === 'nueva' ? (
          <Nueva servicio={servicio} />
        ) : id ? (
          <Detalle servicio={servicio} id={id} cutover={cutover} parcelas={parcelas} />
        ) : (
          <Lista servicio={servicio} />
        )}
      </section>
    </>
  )
}
