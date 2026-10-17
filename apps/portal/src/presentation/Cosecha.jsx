import {
  DataTable,
  DetailHero,
  EmptyState,
  ManagementPageHeader,
  StatusBadge
} from './Ui.jsx'
import { useRef, useState } from 'react'
import { Link, NavLink, useSearchParams } from 'react-router'
import { Aviso, Carga, useCarga, useMutacion, Paginacion } from './GestionUi.jsx'

const titulos = {
  lotes: 'Lotes de tickets',
  tickets: 'Tickets',
  asignaciones: 'Asignaciones',
  registros: 'Registros de cosecha'
}
const descripciones = {
  lotes: 'Agrupaciones físicas de tickets, su asignación y avance de consumo.',
  tickets: 'Códigos individuales y trazabilidad de su estado de consumo.',
  asignaciones: 'Relación registrada entre un lote de tickets y un trabajador.',
  registros: 'Hechos de cosecha confirmados y su trazabilidad operativa.'
}
const enlace = (tipo, id) => '/cosecha/' + tipo + '/' + encodeURIComponent(id)
function Persona({ persona }) {
  return persona ? (
    <span>
      {persona.nombre} · {persona.dni}
    </span>
  ) : (
    <span>Sin trabajador asignado</span>
  )
}
function Progreso({ lote }) {
  return (
    <span className="ticket-progress">
      <progress
        aria-label="Tickets utilizados"
        value={lote.utilizados}
        max={lote.cantidadTickets || 1}
      />
      {lote.utilizados} / {lote.cantidadTickets} utilizados
    </span>
  )
}
function Listado({ servicio, tipo }) {
  const [params] = useSearchParams()
  const [texto, setTexto] = useState(''),
    [f, setFiltros] = useState({
      busqueda: '',
      campaniaId: params.get('campania') || null,
      loteId: params.get('lote') || null,
      trabajadorId: null,
      estado: '',
      offset: 0
    })
  const [loteTexto, setLoteTexto] = useState(params.get('lote') || '')
  const catalogo = useCarga(() => servicio.campanias(), [servicio])
  const recursos = useCarga(
    () => servicio.filtros(f.campaniaId),
    [servicio, f.campaniaId]
  )
  const consulta = useCarga(() => servicio.listar(tipo, f), [servicio, tipo, f])
  const cambiar = (k, v) =>
    setFiltros({ ...f, [k]: v, ...(k === 'offset' ? {} : { offset: 0 }) })
  return (
    <>
      <div className="management-list-intro harvest-entity-intro">
        <div>
          <span className="eyebrow">Entidad Harvest</span>
          <h2>{titulos[tipo]}</h2>
          <p>{descripciones[tipo]}</p>
        </div>
        <span className="context-pill">Consulta administrativa</span>
      </div>
      <p className="context-note">
        Estas vistas consultan el modelo Harvest. El histórico anterior se conserva en
        los reportes y herramientas actuales.
      </p>
      <form
        className="search-form management-filterbar"
        onSubmit={(e) => {
          e.preventDefault()
          setFiltros({
            ...f,
            busqueda: texto.trim(),
            loteId: loteTexto.trim() || null,
            offset: 0
          })
        }}
      >
        <label>
          Buscar{' '}
          {tipo === 'tickets'
            ? 'código de Ticket'
            : tipo === 'lotes'
              ? 'lote o campaña'
              : 'por ticket, DNI o nombre'}
          <input value={texto} onChange={(e) => setTexto(e.target.value)} />
        </label>
        <label>
          Campaña
          <select
            value={f.campaniaId ?? ''}
            onChange={(e) => {
              setLoteTexto('')
              setFiltros({
                ...f,
                campaniaId: e.target.value || null,
                loteId: null,
                trabajadorId: null,
                offset: 0
              })
            }}
          >
            <option value="">Todas las campañas</option>
            {catalogo.datos?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} · {c.modelo}
              </option>
            ))}
          </select>
        </label>
        {tipo !== 'lotes' && (
          <label>
            Lote de tickets (ID)
            <input
              value={loteTexto}
              onChange={(e) => setLoteTexto(e.target.value)}
              placeholder="UUID del lote"
            />
          </label>
        )}
        <label>
          Trabajador asignado
          <select
            value={f.trabajadorId ?? ''}
            onChange={(e) => cambiar('trabajadorId', e.target.value || null)}
          >
            <option value="">Todos los trabajadores</option>
            {recursos.datos?.trabajadores.map((w) => (
              <option key={w.id} value={w.id}>
                {w.dni} · {w.nombre}
              </option>
            ))}
          </select>
        </label>
        {['tickets', 'lotes'].includes(tipo) && (
          <label>
            {tipo === 'tickets' ? 'Estado de consumo' : 'Estado de asignación'}
            <select
              value={f.estado}
              onChange={(e) => cambiar('estado', e.target.value)}
            >
              <option value="">Todos</option>
              <option>DISPONIBLE</option>
              <option>{tipo === 'tickets' ? 'UTILIZADO' : 'ASIGNADO'}</option>
            </select>
          </label>
        )}
        <button className="secondary">Buscar</button>
      </form>
      <Aviso error={catalogo.error || recursos.error} />
      <Carga consulta={consulta}>
        {(d) => (
          <>
            <DataTable className="management-table harvest-management-table">
              <table className={`harvest-table harvest-${tipo}-table`}>
                <thead>
                  <tr>
                    <th scope="col">
                      {tipo === 'tickets'
                        ? 'Ticket'
                        : tipo === 'registros'
                          ? 'Registro'
                          : 'Lote'}
                    </th>
                    <th scope="col">Campaña</th>
                    <th scope="col">Trabajador</th>
                    <th scope="col">
                      {tipo === 'registros' ? 'Fecha / admisión' : 'Estado / consumo'}
                    </th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {d.filas.map((row) => {
                    const l = tipo === 'tickets' ? row.lote : row,
                      id = tipo === 'tickets' ? row.codigo : row.id,
                      w =
                        tipo === 'tickets'
                          ? l.asignacion?.trabajador
                          : (row.trabajador ?? l.asignacion?.trabajador)
                    return (
                      <tr key={id}>
                        <td>
                          <div className="table-identity">
                            <strong className="identifier">{id}</strong>
                            <small>
                              {tipo === 'tickets'
                                ? 'Ticket'
                                : tipo === 'registros'
                                  ? 'Registro de cosecha'
                                  : tipo === 'asignaciones'
                                    ? 'Asignación'
                                    : 'Lote de tickets'}
                            </small>
                          </div>
                        </td>
                        <td>{tipo === 'tickets' ? l.campania : row.campania}</td>
                        <td>
                          <Persona persona={w} />
                        </td>
                        <td>
                          {tipo === 'registros' ? (
                            <>
                              {row.fechaHora}
                              <small>
                                {row.versionProduccion === null
                                  ? 'Histórico piloto'
                                  : 'Producción v' + row.versionProduccion}
                              </small>
                            </>
                          ) : tipo === 'tickets' ? (
                            <StatusBadge>{row.estado}</StatusBadge>
                          ) : (
                            <>
                              <StatusBadge>{row.estado}</StatusBadge>
                              <Progreso lote={l} />
                            </>
                          )}
                        </td>
                        <td>
                          <Link
                            className="table-detail-link"
                            to={enlace(tipo, id)}
                            aria-label={
                              tipo === 'tickets'
                                ? `Ver Ticket ${id}`
                                : tipo === 'registros'
                                  ? `Ver Registro ${id}`
                                  : tipo === 'asignaciones'
                                    ? `Ver Asignación ${id}`
                                    : `Ver Lote ${id}`
                            }
                          >
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </DataTable>
            {!d.filas.length && (
              <EmptyState>Sin resultados para estos filtros de Harvest.</EmptyState>
            )}
            <Paginacion
              total={d.total}
              offset={f.offset}
              cambiar={(offset) => cambiar('offset', offset)}
            />
            <button className="quiet" onClick={consulta.refrescar}>
              Actualizar consulta
            </button>
          </>
        )}
      </Carga>
    </>
  )
}
function Generar({ servicio }) {
  const catalogo = useCarga(() => servicio.campanias(), [servicio]),
    operacion = useRef(crypto.randomUUID()),
    m = useMutacion()
  const [campania, setCampania] = useState(''),
    [cantidad, setCantidad] = useState(''),
    [tamanio, setTamanio] = useState(''),
    [intento, setIntento] = useState(null),
    [resultado, setResultado] = useState(null)
  function enviar(e) {
    e.preventDefault()
    const d = intento ?? {
      operacionId: operacion.current,
      campaniaId: campania,
      cantidadTickets: Number(cantidad),
      tamanioLote: Number(tamanio)
    }
    setIntento(d)
    void m.ejecutar(async () => setResultado(await servicio.generar(d)))
  }
  return (
    <>
      <div className="creation-context">
        <span className="eyebrow">Preparación Harvest</span>
        <h2>Generar lotes de tickets</h2>
        <p>
          Harvest prepara los códigos y la distribución. Generar no imprime ni cambia cómo
          opera la campaña.
        </p>
      </div>
      <Carga consulta={catalogo}>
        {(campanias) => (
          <form className="settings-form management-form" onSubmit={enviar}>
            <fieldset
              className="data-fields form-section"
              disabled={m.ocupado || Boolean(intento)}
            >
              <legend>Distribución de tickets</legend>
              <label>
                Campaña para generación
                <select
                  required
                  value={campania}
                  onChange={(e) => setCampania(e.target.value)}
                >
                  <option value="">Seleccione campaña activa</option>
                  {campanias
                    .filter((c) => c.estado === 'ACTIVA')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} · {c.modelo}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Cantidad total de tickets
                <input
                  required
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </label>
              <label>
                Tamaño del lote
                <input
                  required
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  value={tamanio}
                  onChange={(e) => setTamanio(e.target.value)}
                />
              </label>
            </fieldset>
            <Aviso error={m.error} />
            <div className="actions">
              <button className="primary" disabled={m.ocupado || Boolean(resultado)}>
                {intento && !resultado ? 'Reintentar generación' : 'Generar tickets'}
              </button>
              <button
                type="button"
                disabled={m.ocupado}
                onClick={() => {
                  operacion.current = crypto.randomUUID()
                  setIntento(null)
                  setResultado(null)
                  setCantidad('')
                  setTamanio('')
                }}
              >
                Preparar otra generación
              </button>
            </div>
            <p className="muted">
              Los reintentos usan el mismo recibo. Para cambiar una solicitud enviada,
              prepare otra generación explícitamente.
            </p>
          </form>
        )}
      </Carga>
      {resultado && (
        <section className="management-section" role="status">
          <h3>Generación confirmada</h3>
          <p>
            {resultado.cantidadTickets} tickets · {resultado.lotes.length} lotes
          </p>
          <p>Operación: {resultado.operacionId}</p>
          <p>
            Actor: {resultado.actorUsuarioId} · {resultado.creadaEn}
          </p>
          <ul>
            {resultado.lotes.map((l) => (
              <li key={l.id}>
                <Link to={enlace('lotes', l.id)}>{l.id}</Link> · {l.cantidadTickets}{' '}
                tickets
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
function FichaLote({ lote }) {
  return (
    <>
      <dl className="fact-list">
        <dt>Lote de tickets</dt>
        <dd className="identifier">{lote.id}</dd>
        <dt>Campaña</dt>
        <dd>{lote.campania}</dd>
        <dt>Estado derivado</dt>
        <dd>
          <StatusBadge>{lote.estado}</StatusBadge>
        </dd>
        <dt>Asignación</dt>
        <dd>
          <Persona persona={lote.asignacion?.trabajador} />
        </dd>
      </dl>
      <Progreso lote={lote} />
      <div className="actions">
        <Link to={'/cosecha/tickets?lote=' + lote.id + '&campania=' + lote.campaniaId}>
          Consultar tickets del lote
        </Link>
        {lote.asignacion && (
          <Link to={enlace('asignaciones', lote.id)}>Ver asignación</Link>
        )}
      </div>
    </>
  )
}
function FichaRegistro({ registro: r }) {
  return (
    <>
      <dl className="fact-list">
        <dt>RegistroCosecha</dt>
        <dd>{r.id}</dd>
        <dt>Ticket</dt>
        <dd>
          <Link to={enlace('tickets', r.codigoTicket)}>{r.codigoTicket}</Link>
        </dd>
        <dt>Campaña</dt>
        <dd>{r.campania}</dd>
        <dt>Trabajador atribuido</dt>
        <dd>
          <Persona persona={r.trabajador} />
        </dd>
        <dt>Fecha del hecho</dt>
        <dd>{r.fechaHora}</dd>
        <dt>Confirmado en servidor</dt>
        <dd>{r.registradoEn ?? 'No disponible'}</dd>
        <dt>Admisión de producción</dt>
        <dd>
          {r.versionProduccion === null
            ? 'Histórico piloto; no admitido como producción'
            : 'Versión ' + r.versionProduccion}
        </dd>
        <dt>Sesión</dt>
        <dd>{r.sesionId ?? 'No disponible'}</dd>
        <dt>Lote operativo / variedad</dt>
        <dd>
          {r.loteOperativo ?? 'No disponible'} · {r.variedad ?? 'No disponible'}
        </dd>
        <dt>Operación de asignación</dt>
        <dd>{r.asignacionOperacionId}</dd>
      </dl>
      <Link to={enlace('asignaciones', r.loteId)}>Ver asignación de origen</Link>
      <p className="context-note">
        Hecho histórico de consulta. El registro de cosecha se realiza desde la PWA.
      </p>
    </>
  )
}
function Detalle({ servicio, tipo, id }) {
  const consulta = useCarga(() => servicio.obtener(tipo, id), [servicio, tipo, id])
  return (
    <>
      <Link className="back-link" to={'/cosecha/' + tipo}>← {titulos[tipo]}</Link>
      <Carga consulta={consulta}>
        {(d) => (
          <>
            <DetailHero
              eyebrow={tipo === 'registros' ? 'Hecho operativo' : 'Entidad Harvest'}
              icon="harvest"
              title={
                tipo === 'tickets'
                  ? `Ticket ${d.codigo}`
                  : tipo === 'registros'
                    ? 'Registro de cosecha'
                    : tipo === 'asignaciones'
                      ? 'Asignación de lote'
                      : 'Lote de tickets'
              }
              description={
                tipo === 'registros'
                  ? `Ticket ${d.codigoTicket} · ${d.campania}`
                  : tipo === 'tickets'
                    ? `Lote ${d.lote.id} · ${d.lote.campania}`
                    : `${d.campania} · ${d.id}`
              }
              status={
                tipo === 'registros' ? (
                  <StatusBadge tone={d.versionProduccion === null ? 'neutral' : 'success'}>
                    {d.versionProduccion === null ? 'Histórico' : 'Confirmado'}
                  </StatusBadge>
                ) : (
                  <StatusBadge>{d.estado}</StatusBadge>
                )
              }
              facts={
                tipo === 'registros'
                  ? [
                      ['Ticket', d.codigoTicket],
                      ['Trabajador', d.trabajador?.nombre ?? 'Sin trabajador'],
                      ['Fecha', d.fechaHora],
                      ['Versión', d.versionProduccion ?? 'Piloto']
                    ]
                  : tipo === 'tickets'
                    ? [
                        ['Lote de origen', d.lote.id],
                        ['Campaña', d.lote.campania],
                        ['Asignación', d.lote.asignacion?.trabajador?.nombre ?? 'Sin asignar'],
                        ['Estado', d.estado]
                      ]
                    : [
                        ['Campaña', d.campania],
                        ['Trabajador', d.asignacion?.trabajador?.nombre ?? d.trabajador?.nombre ?? 'Sin asignar'],
                        ['Tickets', `${d.utilizados ?? 0} / ${d.cantidadTickets ?? 0}`],
                        ['Estado', d.estado]
                      ]
              }
            />
            {tipo === 'registros' ? (
              <FichaRegistro registro={d} />
            ) : tipo === 'tickets' ? (
              <>
                <p>
                  Estado: <strong>{d.estado}</strong>
                </p>
                <Link to={enlace('lotes', d.lote.id)}>Ver lote de origen</Link>
                <FichaLote lote={d.lote} />
                {d.registro ? (
                  <section className="management-section">
                    <Link to={enlace('registros', d.registro.id)}>
                      Ver RegistroCosecha
                    </Link>
                    <FichaRegistro registro={d.registro} />
                  </section>
                ) : (
                  <p>Este ticket todavía no tiene RegistroCosecha.</p>
                )}
              </>
            ) : (
              <>
                <FichaLote lote={d} />
                {tipo === 'asignaciones' && (
                  <>
                    <p>Operación de asignación: {d.operacionId}</p>
                    <p className="context-note">
                      Consulta de asignación física registrada en campo. La corrección
                      administrativa requiere un caso de uso explícito; no se permite
                      reasignar desde esta vista.
                    </p>
                  </>
                )}
              </>
            )}
            <button className="quiet" onClick={consulta.refrescar}>
              Actualizar detalle
            </button>
          </>
        )}
      </Carga>
    </>
  )
}
export function Cosecha({ servicio, path, contexto }) {
  const partes = path.split('/'),
    tipo = partes[2] ?? 'lotes'
  let id
  try {
    id = partes[3] ? decodeURIComponent(partes[3]) : null
  } catch {
    return <p role="alert">Identificador Harvest inválido.</p>
  }
  return (
    <>
      <ManagementPageHeader
        eyebrow="Harvest"
        icon="harvest"
        title="Cosecha"
        description="Generación y consulta. Asignación física y registro de cosecha en la PWA."
      />
      <nav className="settings-tabs harvest-tabs" aria-label="Cosecha">
        {Object.entries(titulos).map(([ruta, nombre]) => (
          <NavLink key={ruta} to={'/cosecha/' + ruta}>
            {nombre}
          </NavLink>
        ))}
        {contexto.permite('harvest.manage') && (
          <NavLink to="/cosecha/generar">Generar tickets</NavLink>
        )}
      </nav>
      <section
        className={`content-card management-surface management-surface-editorial harvest-surface harvest-${tipo}`}
        key={path}
      >
        {tipo === 'generar' ? (
          <Generar servicio={servicio} />
        ) : id ? (
          <Detalle servicio={servicio} tipo={tipo} id={id} />
        ) : (
          <Listado servicio={servicio} tipo={tipo} />
        )}
      </section>
      <p className="base-note">
        Generar no imprime. La impresión y reimpresión auditada se incorporarán en una
        fase posterior.
      </p>
    </>
  )
}
