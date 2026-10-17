import { DataTable, EmptyState, ManagementPageHeader, StatusBadge } from './Ui.jsx'
import { useState } from 'react'
import { Link } from 'react-router'
import { Aviso, Carga, useCarga, useMutacion, Paginacion } from './GestionUi.jsx'

const tipos = { fundos: 'Fundos', sectores: 'Sectores', parcelas: 'Parcelas' }
const padres = { sectores: 'fundos', parcelas: 'sectores' }

function SelectorPadre({ servicio, tipo, valor, cambiar }) {
  const [busqueda, setBusqueda] = useState(''),
    [offset, setOffset] = useState(0)
  const consulta = useCarga(
    () => servicio.listar(tipo, { busqueda, offset, activo: true }),
    [servicio, tipo, busqueda, offset]
  )
  return (
    <div className="management-section">
      <label>
        Buscar {tipos[tipo].toLowerCase()} para la jerarquía
        <input
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setOffset(0)
          }}
        />
      </label>
      <Carga consulta={consulta}>
        {(d) => (
          <>
            <label>
              {tipo === 'fundos' ? 'Fundo padre' : 'Sector padre'}
              <select required value={valor} onChange={(e) => cambiar(e.target.value)}>
                <option value="">Seleccione</option>
                {valor && !d.filas.some((x) => x.id === valor) && (
                  <option value={valor}>Selección conservada</option>
                )}
                {d.filas.map((x) => (
                  <option key={x.id} value={x.id} disabled={!x.habilitado}>
                    {x.codigo} · {x.nombre}
                    {x.habilitado ? '' : ' (jerarquía inactiva)'}
                  </option>
                ))}
              </select>
            </label>
            <Paginacion total={d.total} offset={offset} cambiar={setOffset} />
          </>
        )}
      </Carga>
    </div>
  )
}
function Formulario({ servicio, tipo, fila, terminar }) {
  const [datos, setDatos] = useState(
      fila ?? { codigo: '', nombre: '', activo: true, padreId: '' }
    ),
    m = useMutacion()
  const campo = (k, v) => setDatos((d) => ({ ...d, [k]: v }))
  return (
    <form
      className="settings-form management-form"
      onSubmit={(e) => {
        e.preventDefault()
        void m.ejecutar(async () => {
          await servicio.guardar(tipo, datos)
          terminar()
        })
      }}
    >
      <div className="form-intro">
        <span className="eyebrow">Jerarquía física</span>
        <h2>{fila ? 'Editar registro físico' : 'Crear registro físico'}</h2>
        <p>La relación padre define su ubicación dentro de Fundo → Sector → Parcela.</p>
      </div>
      <fieldset className="form-section" disabled={m.ocupado}>
        <legend>Identidad y relación</legend>
        <label>
          Código físico
          <input
            required
            maxLength={30}
            value={datos.codigo}
            onChange={(e) => campo('codigo', e.target.value)}
          />
        </label>
        <label>
          Nombre físico
          <input
            required
            maxLength={150}
            value={datos.nombre}
            onChange={(e) => campo('nombre', e.target.value)}
          />
        </label>
        {padres[tipo] &&
          (fila ? (
            <p className="context-note">
              La relación con su {tipo === 'sectores' ? 'Fundo' : 'Sector'} se conserva.
              No se cambia la jerarquía histórica.
            </p>
          ) : (
            <SelectorPadre
              servicio={servicio}
              tipo={padres[tipo]}
              valor={datos.padreId}
              cambiar={(v) => campo('padreId', v)}
            />
          ))}
        <label className="check-row">
          <input
            type="checkbox"
            checked={datos.activo}
            onChange={(e) => campo('activo', e.target.checked)}
          />
          Registro activo
        </label>
        <button className="primary">Guardar estructura</button>
        <button type="button" onClick={terminar}>
          Cancelar edición
        </button>
      </fieldset>
      <Aviso error={m.error} />
    </form>
  )
}
function Gestion({ servicio, tipo }) {
  const [busqueda, setBusqueda] = useState(''),
    [activo, setActivo] = useState(''),
    [offset, setOffset] = useState(0),
    [edicion, setEdicion] = useState(null),
    m = useMutacion()
  const consulta = useCarga(
    () =>
      servicio.listar(tipo, {
        busqueda,
        activo: activo === '' ? null : activo === 'true',
        offset
      }),
    [servicio, tipo, busqueda, activo, offset]
  )
  const terminar = () => {
    setEdicion(null)
    consulta.refrescar()
  }
  return (
    <>
      <div className="management-list-intro">
        <div>
          <span className="eyebrow">Nivel de estructura</span>
          <h2>{tipos[tipo]}</h2>
          <p>
            {tipo === 'fundos'
              ? 'Raíz física de la empresa agrícola.'
              : tipo === 'sectores'
                ? 'Sectores contenidos dentro de un Fundo.'
                : 'Parcelas contenidas dentro de un Sector.'}
          </p>
        </div>
        <button className="primary" onClick={() => setEdicion({ nueva: true })}>
          Crear{' '}
          {tipo === 'fundos' ? 'Fundo' : tipo === 'sectores' ? 'Sector' : 'Parcela'}
        </button>
      </div>
      <div className="search-form management-filterbar">
        <label>
          Buscar por código o nombre
          <input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label>
          Estado físico
          <select
            value={activo}
            onChange={(e) => {
              setActivo(e.target.value)
              setOffset(0)
            }}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </label>
        <button onClick={consulta.refrescar}>Actualizar</button>
      </div>
      {edicion && (
        <Formulario
          key={edicion.id ?? 'nueva'}
          servicio={servicio}
          tipo={tipo}
          fila={edicion.nueva ? null : edicion}
          terminar={terminar}
        />
      )}
      <Aviso error={m.error} />
      <Carga consulta={consulta}>
        {(d) => (
          <>
            <DataTable className="management-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Jerarquía</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {d.filas.map((x) => (
                    <tr key={x.id}>
                      <td className="secondary-data">{x.codigo}</td>
                      <td>
                        <div className="table-identity">
                          <strong>{x.nombre}</strong>
                          <small>{tipo === 'fundos' ? 'Fundo' : tipo === 'sectores' ? 'Sector' : 'Parcela'}</small>
                        </div>
                      </td>
                      <td>
                        <span className="context-pill hierarchy-parent">
                          {x.padreCodigo
                            ? `${x.padreCodigo} · ${x.padreNombre}`
                            : 'Raíz · Fundo de la empresa'}
                        </span>
                      </td>
                      <td className="management-row-actions">
                        <StatusBadge
                          tone={x.activo && x.habilitado ? 'success' : 'neutral'}
                        >
                          {x.activo
                            ? x.habilitado
                              ? 'Activo'
                              : 'Activo; jerarquía inactiva'
                            : 'Inactivo'}
                        </StatusBadge>
                      </td>
                      <td>
                        <button onClick={() => setEdicion(x)}>Editar {x.codigo}</button>
                        <button
                          disabled={m.ocupado}
                          onClick={() =>
                            m.ejecutar(async () => {
                              await servicio[x.activo ? 'desactivar' : 'activar'](
                                tipo,
                                x.id
                              )
                              consulta.refrescar()
                            })
                          }
                        >
                          {x.activo ? 'Desactivar' : 'Activar'} {x.codigo}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
            {!d.filas.length && (
              <EmptyState>Sin estructura registrada para esta consulta.</EmptyState>
            )}
            <Paginacion total={d.total} offset={offset} cambiar={setOffset} />
          </>
        )}
      </Carga>
    </>
  )
}
export function EstructuraAgricola({ servicio, path }) {
  const tipo = path.split('/')[2] || 'fundos'
  return (
    <>
      <ManagementPageHeader
        eyebrow="Estructura física"
        icon="farm"
        title="Estructura agrícola"
        description="Estructura física persistente. Los lotes operativos de campaña se administran por separado."
      />
      <section className="content-card management-surface management-surface-editorial farm-structure-surface">
        <div className="hierarchy-guide" aria-label="Jerarquía física Fundo, Sector y Parcela">
          <span className={tipo === 'fundos' ? 'active' : undefined}>Fundo</span>
          <span aria-hidden="true">→</span>
          <span className={tipo === 'sectores' ? 'active' : undefined}>Sector</span>
          <span aria-hidden="true">→</span>
          <span className={tipo === 'parcelas' ? 'active' : undefined}>Parcela</span>
        </div>
        <nav className="actions settings-tabs hierarchy-tabs" aria-label="Jerarquía agrícola">
          {Object.entries(tipos).map(([k, v]) => (
            <Link
              key={k}
              to={'/estructura/' + k}
              aria-current={k === tipo ? 'page' : undefined}
            >
              {v}
            </Link>
          ))}
        </nav>
        <p className="context-note">
          Desactivar conserva el histórico. Una jerarquía inactiva no admite nuevos
          vínculos operativos.
        </p>
        {tipos[tipo] ? (
          <Gestion key={tipo} servicio={servicio} tipo={tipo} />
        ) : (
          <p>Sección no encontrada.</p>
        )}
      </section>
    </>
  )
}
