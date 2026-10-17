import { useState } from 'react'
import { useCarga, Carga, Aviso } from './GestionUi.jsx'
export function CutoverAdministrativo({ servicio, campaniaId }) {
  const consulta = useCarga(
      () => servicio.consultar(campaniaId),
      [servicio, campaniaId]
    ),
    [motivo, setMotivo] = useState(''),
    [revisados, setRevisados] = useState(false),
    [intencion, setIntencion] = useState(null),
    [ocupado, setOcupado] = useState(false),
    [error, setError] = useState(null)
  async function activar(e) {
    e?.preventDefault()
    setError(null)
    setOcupado(true)
    const d = intencion ?? {
      campaniaId,
      operacionId: crypto.randomUUID(),
      motivo,
      pendientesRevisados: revisados
    }
    setIntencion(d)
    try {
      await servicio.activar(d)
      consulta.refrescar()
    } catch (e) {
      if (e.name !== 'SolicitudObsoleta') setError(e)
    } finally {
      setOcupado(false)
    }
  }
  return (
    <section className="management-section">
      <h2>Autoridad administrativa</h2>
      <Carga consulta={consulta}>
        {(d) =>
          d.autoridad === 'PORTAL' ? (
            <>
              <p role="status">
                Portal: autoridad de escritura. Sheets: sin escrituras administrativas
                nuevas.
              </p>
              <p>
                Activado:{' '}
                {new Date(d.corte.activado_en).toLocaleString('es-PE', {
                  timeZone: 'America/Lima'
                })}{' '}
                (Lima) · Actor: {d.corte.actor_usuario_id}
              </p>
              <p>Motivo: {d.corte.motivo}</p>
              <p>
                El histórico y los reportes de consulta de Sheets se conservan. El
                cutover administrativo es independiente del cutover Harvest.
              </p>
            </>
          ) : (
            <form className="settings-form" onSubmit={activar}>
              <p>
                Transición: esta campaña todavía admite escritura Sheets. El corte la
                retira definitivamente en backend y conserva los archivos como
                histórico.
              </p>
              <p>
                Antes de continuar, revise las filas PENDIENTE/ERROR de todas las hojas,
                sincronice o concilie sus cambios en el Portal y compruebe lotes,
                personal y jornada de jaberos. El servidor no puede leer celdas locales
                pendientes.
              </p>
              <fieldset disabled={ocupado || !!intencion}>
                <legend>Revisión previa al corte</legend>
                <label>
                  Motivo del cutover{' '}
                  <input
                    required
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    required
                    checked={revisados}
                    onChange={(e) => setRevisados(e.target.checked)}
                  />
                  He revisado y conciliado los pendientes de Sheets y verificado las
                  operaciones equivalentes en Portal.
                </label>
                <button className="primary">Migrar administración al Portal</button>
              </fieldset>
              <Aviso error={error} />
              {intencion && error && (
                <button type="button" disabled={ocupado} onClick={() => activar()}>
                  Reintentar mismo cutover
                </button>
              )}
              {intencion && error && error.name !== 'ServicioNoDisponible' && (
                <button
                  type="button"
                  onClick={() => {
                    setIntencion(null)
                    setError(null)
                  }}
                >
                  Revisar intención
                </button>
              )}
            </form>
          )
        }
      </Carga>
    </section>
  )
}
