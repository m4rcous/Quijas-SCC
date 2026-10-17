import { Link, useSearchParams } from 'react-router'
import { useCarga } from './GestionUi.jsx'
import { ChartCard, DataTable, EmptyState, Icon } from './Ui.jsx'
import { EstadoConsulta, Resultado, fecha, numero } from './Reportes.jsx'
import { PortalHero, WeatherCard, MetricWidget } from './DashboardWidgets.jsx'
import { ReportActions } from './ReportActions.jsx'

export function Dashboard({ servicio, empresa }) {
  const [params, setParams] = useSearchParams()
  const campaigns = useCarga(() => servicio.campanias(), [servicio])
  return (
    <div className="dashboard-page">
      <EstadoConsulta consulta={campaigns}>
        {(lista) => {
          if (!lista.length)
            return (
              <>
                <div className="home-welcome">
                  <PortalHero empresa={empresa} />
                  <WeatherCard />
                </div>
                <EmptyState>Sin campañas disponibles para esta empresa.</EmptyState>
              </>
            )
          const id =
            params.get('campania') ||
            (lista.find((c) => c.estado === 'ACTIVA') ?? lista[0]).id
          const campaign = lista.find((c) => c.id === id)
          const controls = (
            <div className="dashboard-controls">
              <label>
                Campaña
                <select
                  value={id}
                  onChange={(e) =>
                    setParams(
                      (p) => {
                        const next = new URLSearchParams(p)
                        next.set('campania', e.target.value)
                        return next
                      },
                      { replace: true }
                    )
                  }
                >
                  {!campaign && <option value={id}>Selección no autorizada</option>}
                  {lista.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} · {c.nombre}
                      {c.estado === 'CERRADA' ? ' · Cerrada' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="quiet icon-button"
                aria-label="Actualizar campañas"
                title="Actualizar campañas"
                onClick={campaigns.refrescar}
              >
                <Icon name="refresh" />
              </button>
            </div>
          )
          return !campaign ? (
            <>
              <div className="home-welcome">
                <PortalHero empresa={empresa} />
                <WeatherCard />
              </div>
              {controls}
              <p role="alert">
                Campaña ajena o no disponible. Seleccione una campaña de esta empresa.
              </p>
            </>
          ) : (
            <DashboardData
              key={id}
              servicio={servicio}
              empresa={empresa}
              campania={campaign}
              controls={controls}
            />
          )
        }}
      </EstadoConsulta>
    </div>
  )
}

function DashboardData({ servicio, empresa, campania, controls }) {
  const consulta = useCarga(
    () => servicio.consultar({ campaniaId: campania.id, tipo: 'DASHBOARD' }),
    [servicio, campania.id]
  )
  return (
    <div className="dashboard-grid">
      <PortalHero
        empresa={empresa}
        campania={campania}
        hoy={consulta.datos?.datos.hoy}
      />
      <WeatherCard />
      <div className="dashboard-context-row">
        {controls}
        <ReportActions consulta={consulta} servicio={servicio} />
      </div>
      <EstadoConsulta consulta={consulta}>
        {(r) => {
          const d = r.datos,
            s = d.resumen
          return (
            <>
              <section className="production-widget">
                <div className="section-title">
                  <span className="eyebrow">Producción de campaña</span>
                  <Icon name="harvest" />
                </div>
                <dl>
                  <dt>Total jabas</dt>
                  <dd>{numero(s.total_jabas)}</dd>
                </dl>
                <div className="production-widget-footer">
                  <span>jabas · campaña completa</span>
                  <div>
                    <span>Jabas hoy</span>
                    <strong>{numero(d.hoy.total_jabas)}</strong>
                    <small>jabas · Lima</small>
                  </div>
                </div>
                {s.total_jabas === 0 && <p>Sin datos de producción en esta campaña.</p>}
              </section>
              <DashboardPanel
                className="ranking-preview"
                servicio={servicio}
                campania={campania}
                tipo="RANKING"
                titulo="Ranking de cosechadores"
              />
              <dl className="compact-metrics">
                <MetricWidget
                  label="Cosechadores con producción"
                  value={numero(s.total_cosechadores)}
                  unit="personas"
                  icon="people"
                />
                <MetricWidget
                  label="Lotes operativos con producción"
                  value={numero(s.total_lotes)}
                  unit="lotes"
                  icon="farm"
                />
                <MetricWidget
                  label="Sesiones"
                  value={numero(s.total_sesiones)}
                  unit="sesiones"
                  icon="harvest"
                />
                <MetricWidget
                  label="Días con producción"
                  value={numero(s.dias_con_produccion)}
                  unit="días"
                  icon="campaign"
                />
              </dl>
              <DashboardPanel
                className="dashboard-daily"
                servicio={servicio}
                campania={campania}
                tipo="DIARIA"
                titulo="Producción diaria"
              />
              <DashboardPanel
                className="dashboard-lots"
                servicio={servicio}
                campania={campania}
                tipo="LOTES"
                titulo="Producción por lote operativo"
              />
              <section className="activity-widget">
                <span className="activity-icon">
                  <Icon name="clock" />
                </span>
                <span className="eyebrow">El pulso de su campaña</span>
                <h2>Última actividad</h2>
                <p>
                  <time dateTime={s.ultima_lectura ?? undefined}>
                    {fecha(s.ultima_lectura)}
                  </time>
                </p>
                <span className="muted">
                  Actividad de producción de {d.campania.nombre}.
                </span>
              </section>
            </>
          )
        }}
      </EstadoConsulta>
    </div>
  )
}

function DashboardPanel({ servicio, campania, tipo, titulo, className }) {
  const consulta = useCarga(
    () =>
      servicio.consultar({
        campaniaId: campania.id,
        tipo,
        periodo: 'CAMPANIA',
        busqueda: '',
        orden: 'mas-jabas'
      }),
    [servicio, campania.id, tipo]
  )
  const link = `/reportes/${tipo === 'RANKING' ? 'ranking' : tipo === 'DIARIA' ? 'diaria' : 'lotes'}?campania=${encodeURIComponent(campania.id)}`
  return (
    <ChartCard
      className={className}
      title={titulo}
      context={`${campania.nombre} · Campaña completa`}
    >
      <EstadoConsulta consulta={consulta}>
        {(r) =>
          tipo === 'RANKING' ? (
            <RankingPreview filas={r.datos.ranking} />
          ) : (
            <Resultado reporte={r} embedded />
          )
        }
      </EstadoConsulta>
      <Link className="widget-link text-link" to={link}>
        {tipo === 'RANKING' ? 'Ver ranking completo' : 'Ver reporte'}
        <Icon name="arrow" />
      </Link>
    </ChartCard>
  )
}

function RankingPreview({ filas }) {
  if (!filas.length)
    return <EmptyState>Sin datos para los filtros seleccionados.</EmptyState>
  return (
    <DataTable label="Ranking de cosechadores">
      <table className="preview-table">
        <caption className="sr-only">Ranking de cosechadores</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Posición</th>
            <th scope="col">Cosechador</th>
            <th scope="col">Jabas</th>
          </tr>
        </thead>
        <tbody>
          {filas.slice(0, 5).map((f) => (
            <tr key={f.cosechador_dni}>
              <td>
                <span className="ranking-position">{f.posicion}</span>
              </td>
              <th scope="row">{f.cosechador}</th>
              <td className="numeric">
                <strong>{numero(f.total_jabas)}</strong>
                <small>jabas</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  )
}
