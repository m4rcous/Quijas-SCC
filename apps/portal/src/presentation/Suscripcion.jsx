import { DataTable, StatusBadge } from './Ui.jsx'
import { useState } from 'react'
import { useCarga, Carga } from './GestionUi.jsx'

const operaciones = [
  ['cambiarPlan', 'Cambiar plan'],
  ['renovarSuscripcion', 'Renovar suscripción'],
  ['suspenderSuscripcion', 'Suspender suscripción'],
  ['reactivarSuscripcion', 'Reactivar suscripción'],
  ['cancelarSuscripcion', 'Cancelar suscripción'],
  ['habilitarModulo', 'Habilitar módulo'],
  ['deshabilitarModulo', 'Deshabilitar módulo']
]
const fecha = (v) =>
  v ? new Date(v).toLocaleString('es-PE', { timeZone: 'America/Lima' }) : 'Sin límite'
const iso = (v) => (v ? new Date(v).toISOString() : null)

export function Suscripcion({ servicio }) {
  const consulta = useCarga(() => servicio.consultar(), [servicio])
  const [intencion, setIntencion] = useState(null),
    [recibo, setRecibo] = useState(null),
    [error, setError] = useState(null),
    [ocupado, setOcupado] = useState(false)
  async function enviar(solicitud) {
    setError(null)
    setOcupado(true)
    // Congelar la intención y su versión: un fallo de transporte sólo permite
    // reintentar ese mismo comando, nunca generar silenciosamente otro UUID.
    const i = intencion ?? solicitud
    setIntencion(i)
    try {
      const r = await servicio[i.metodo](i.datos)
      setRecibo(r)
      consulta.refrescar()
      // Acceso/nav se resuelven de nuevo al navegar; no remontar aquí el Portal,
      // para conservar el recibo y el bloqueo explícito contra dobles envíos.
    } catch (e) {
      if (e.name !== 'SolicitudObsoleta') setError(e)
    } finally {
      setOcupado(false)
    }
  }
  return (
    <>
      <div className="management-list-intro subscription-intro">
        <div>
          <span className="eyebrow">Estado comercial</span>
          <h2>Suscripción de la empresa</h2>
          <p>Plan vigente, módulos efectivos y próximos cambios desde una sola vista.</p>
        </div>
        <button
          className="secondary"
          disabled={
            ocupado ||
            (intencion && !recibo && !error) ||
            error?.name === 'ServicioNoDisponible'
          }
          onClick={consulta.refrescar}
        >
          Actualizar suscripción
        </button>
      </div>
      {recibo && (
        <p role="status" className="notice">
          {recibo.fase === 'PROGRAMADA'
            ? `Cambio programado para ${fecha(recibo.effectiveAt)}. El estado actual se mantiene hasta su aplicación en servidor.`
            : 'Cambio aplicado y auditado.'}{' '}
          Operación: {recibo.operacionId}
        </p>
      )}
      {error && (
        <div role="alert">
          <p>{error.message}</p>
          {error.name === 'ConflictoVersionComercial' && (
            <p>
              Actualice los datos y prepare una nueva intención con la versión actual.
            </p>
          )}
        </div>
      )}
      {intencion && !recibo && error?.name === 'ServicioNoDisponible' && (
        <p>
          No hay confirmación del servidor. Reintente la misma solicitud; conserva ID,
          parámetros y versión.
        </p>
      )}
      {intencion && !recibo && (
        <button
          disabled={ocupado || !error || error.name === 'ConflictoVersionComercial'}
          onClick={() => enviar(intencion)}
        >
          Reintentar misma solicitud
        </button>
      )}
      {intencion && (recibo || (error && error.name !== 'ServicioNoDisponible')) && (
        <button
          disabled={
            ocupado ||
            consulta.cargando ||
            (error?.name === 'ConflictoVersionComercial' &&
              consulta.datos?.versionBase === intencion.datos.versionBase)
          }
          onClick={() => {
            setIntencion(null)
            setRecibo(null)
            setError(null)
          }}
        >
          Preparar otro cambio
        </button>
      )}
      <Carga consulta={consulta}>
        {(d) => (
          <>
            <p className="muted">
              Consultado en servidor: {fecha(d.actualizadoEn)} (Lima). Versión
              comercial: {d.versionBase}.
            </p>
            <ResumenComercial datos={d} />
            {d.puedeAdministrar ? (
              <Formulario
                key={d.versionBase}
                datos={d}
                enviar={enviar}
                bloqueado={ocupado || !!intencion}
              />
            ) : (
              <p className="notice">
                Sólo consulta. company.manage permite consultar; modificar requiere
                además la delegación comercial subscription.manage. Esta delegación no
                se concede desde la administración de usuarios.
              </p>
            )}
            <Programados filas={d.programados} />
            <Historial filas={d.historial} />
          </>
        )}
      </Carga>
    </>
  )
}
function ResumenComercial({ datos: d }) {
  const s = d.estado.suscripcion
  return (
    <section
      className="commercial-current commercial-current-hero"
      aria-labelledby="commercial-current-title"
    >
      <div className="commercial-current-heading">
        <div>
          <span className="eyebrow">Estado vigente</span>
          <h3 id="commercial-current-title">Estado comercial actual</h3>
        </div>
        {s && <StatusBadge>{s.estado}</StatusBadge>}
      </div>
      {!s ? (
        <p>
          Esta empresa no tiene suscripción. Solicite su aprovisionamiento comercial
          autorizado.
        </p>
      ) : (
        <dl className="commercial-plan-summary">
          <div className="sr-only">
            <dt>Estado</dt>
            <dd>{s.estado}</dd>
          </div>
          <div className="commercial-plan-primary">
            <dt>Plan actual</dt>
            <dd>{d.planActual?.nombre ?? 'Plan no disponible'}</dd>
          </div>
          <div>
            <dt>Vigencia desde</dt>
            <dd>{fecha(s.desde)}</dd>
          </div>
          <div>
            <dt>Vigencia hasta</dt>
            <dd>{fecha(s.hasta)}</dd>
          </div>
        </dl>
      )}
      <div className="commercial-modules-grid">
        <div>
          <span className="eyebrow">Catálogo del plan</span>
          <h4>Módulos contratados</h4>
          <p>{d.modulosPlan.join(' · ') || 'Sin módulos de plan'}</p>
        </div>
        <div className="commercial-effective-modules">
          <span className="eyebrow">Acceso real</span>
          <h4>Módulos efectivos</h4>
          <p>{d.modulosEfectivos.join(' · ') || 'Ningún módulo habilitado actualmente'}</p>
        </div>
      </div>
      <p className="muted">
        El acceso efectivo lo resuelve Platform con suscripción, vigencia y
        entitlements. El catálogo del plan no concede acceso por sí solo.
      </p>
      <DataTable className="management-table commercial-entitlements-table">
        <table>
          <caption>Entitlements, add-ons y excepciones</caption>
          <thead>
            <tr>
              {[
                'Módulo',
                'Origen',
                'Habilitado en contrato',
                'Desde',
                'Hasta',
                'Acceso efectivo'
              ].map((t) => (
                <th scope="col" key={t}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.estado.modulos.map((m) => (
              <tr key={m.modulo_codigo}>
                <th scope="row">{m.modulo_codigo}</th>
                <td>{m.origen}</td>
                <td>{m.habilitado ? 'Sí' : 'No'}</td>
                <td>{fecha(m.desde)}</td>
                <td>{fecha(m.hasta)}</td>
                <td>
                  <StatusBadge
                    tone={d.modulosEfectivos.includes(m.modulo_codigo) ? 'success' : 'neutral'}
                  >
                    {d.modulosEfectivos.includes(m.modulo_codigo)
                      ? 'Habilitado'
                      : 'No habilitado'}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
      {!d.estado.modulos.length && <p>Sin entitlements contratados.</p>}
    </section>
  )
}
function Formulario({ datos, enviar, bloqueado }) {
  const [metodo, setMetodo] = useState('cambiarPlan'),
    [planId, setPlan] = useState(''),
    [modulo, setModulo] = useState(''),
    [origen, setOrigen] = useState('ADD_ON'),
    [hasta, setHasta] = useState(''),
    [programar, setProgramar] = useState(false),
    [effectiveAt, setEffectiveAt] = useState(''),
    [motivo, setMotivo] = useState(''),
    [confirmar, setConfirmar] = useState(false)
  const tieneModulo = ['habilitarModulo', 'deshabilitarModulo'].includes(metodo)
  function guardar(e) {
    e.preventDefault()
    const d = {
      operacionId: crypto.randomUUID(),
      versionBase: datos.versionBase,
      motivo,
      effectiveAt: programar ? iso(effectiveAt) : null
    }
    if (metodo === 'cambiarPlan') d.planId = planId
    if (tieneModulo) d.modulo = modulo
    if (metodo === 'habilitarModulo') d.origen = origen
    if (['renovarSuscripcion', 'habilitarModulo'].includes(metodo)) d.hasta = iso(hasta)
    void enviar({ metodo, datos: d })
  }
  return (
    <form className="settings-form commercial-form" onSubmit={guardar}>
      <h3>Administración comercial delegada</h3>
      <p>
        Los cambios se validan en Platform y requieren motivo. Ninguna operación realiza
        cobros.
      </p>
      <fieldset disabled={bloqueado || !datos.estado.suscripcion}>
        <legend>Intención comercial</legend>
        <label>
          Operación{' '}
          <select
            value={metodo}
            onChange={(e) => {
              setMetodo(e.target.value)
              setConfirmar(false)
            }}
          >
            {operaciones.map(([m, n]) => (
              <option key={m} value={m}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {metodo === 'cambiarPlan' && (
          <label>
            Nuevo plan{' '}
            <select required value={planId} onChange={(e) => setPlan(e.target.value)}>
              <option value="">Seleccione un plan</option>
              {datos.planes
                .filter((p) => p.activo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
            </select>
          </label>
        )}
        {tieneModulo && (
          <label>
            Módulo{' '}
            <select required value={modulo} onChange={(e) => setModulo(e.target.value)}>
              <option value="">Seleccione un módulo</option>
              {datos.modulos
                .filter((m) => m.disponible)
                .map((m) => (
                  <option key={m.codigo}>{m.codigo}</option>
                ))}
            </select>
          </label>
        )}
        {metodo === 'habilitarModulo' && (
          <label>
            Origen{' '}
            <select value={origen} onChange={(e) => setOrigen(e.target.value)}>
              <option value="ADD_ON">Add-on</option>
              <option value="EXCEPCION">Excepción</option>
            </select>
          </label>
        )}
        {['renovarSuscripcion', 'habilitarModulo'].includes(metodo) && (
          <label>
            Vigencia hasta (hora local){metodo === 'habilitarModulo' && ' — opcional'}{' '}
            <input
              type="datetime-local"
              required={metodo === 'renovarSuscripcion'}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </label>
        )}
        <label className="check-row">
          <input
            type="checkbox"
            checked={programar}
            onChange={(e) => setProgramar(e.target.checked)}
          />
          Programar cambio futuro
        </label>
        {programar && (
          <label>
            Fecha efectiva (hora local){' '}
            <input
              type="datetime-local"
              required
              value={effectiveAt}
              onChange={(e) => setEffectiveAt(e.target.value)}
            />
          </label>
        )}
        <p className="muted">
          Sin programación, se solicita un cambio inmediato. El reloj del servidor
          decide la vigencia y aplicación de los cambios.
        </p>
        <label>
          Motivo{' '}
          <textarea
            required
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </label>
        {metodo === 'cancelarSuscripcion' && (
          <label className="check-row">
            <input
              type="checkbox"
              required
              checked={confirmar}
              onChange={(e) => setConfirmar(e.target.checked)}
            />
            Entiendo que la cancelación es terminal y afecta el acceso a los módulos.
          </label>
        )}
        <button
          className="primary"
          type="submit"
          disabled={metodo === 'cancelarSuscripcion' && !confirmar}
        >
          Solicitar cambio comercial
        </button>
      </fieldset>
    </form>
  )
}
function Programados({ filas }) {
  return (
    <section className="management-section commercial-future">
      <h3>Cambios futuros programados</h3>
      <p>
        Son intenciones pendientes; no sustituyen el estado actual. Platform los
        aplicará o rechazará al llegar la fecha del servidor y revalidar autorización y
        versión.
      </p>
      {!filas.length ? (
        <p>Sin cambios programados pendientes.</p>
      ) : (
        <DataTable className="management-table">
          <table>
            <caption>Cambios programados</caption>
            <thead>
              <tr>
                {[
                  'Cambio',
                  'Fecha efectiva (Lima)',
                  'Actor',
                  'Versión base',
                  'Motivo',
                  'Intención'
                ].map((s) => (
                  <th scope="col" key={s}>
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((o) => (
                <tr key={o.id}>
                  <td>{o.tipo_evento}</td>
                  <td>{fecha(o.effective_at)}</td>
                  <td>{o.actor.usuarioId ?? o.actor.tipo}</td>
                  <td>{o.version_base}</td>
                  <td>{o.motivo}</td>
                  <td>
                    <Json valor={o.parametros} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}
    </section>
  )
}
function Json({ valor }) {
  return <pre className="commercial-json">{JSON.stringify(valor, null, 2)}</pre>
}
function Historial({ filas }) {
  return (
    <section className="management-section commercial-audit">
      <h3>Historial comercial inmutable</h3>
      <p>Consulta de eventos de auditoría; sus datos no se pueden editar ni borrar.</p>
      {!filas.length ? (
        <p>Sin eventos comerciales.</p>
      ) : (
        <ol className="commercial-history">
          {filas.map((e) => (
            <li key={e.id}>
              <h4>
                {e.tipo_evento} · {e.fase}
              </h4>
              <p>
                Fecha: {fecha(e.fecha_hora)} · Efectivo: {fecha(e.effective_at)} ·
                Actor: {e.actor.usuarioId ?? e.actor.tipo}
              </p>
              <p>Motivo: {e.motivo}</p>
              <details>
                <summary>Ver estado anterior, nuevo y contexto</summary>
                <h5>Estado anterior</h5>
                <Json valor={e.estado_anterior} />
                <h5>Estado nuevo</h5>
                <Json valor={e.estado_nuevo} />
                <h5>Contexto</h5>
                <Json valor={e.contexto} />
              </details>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
