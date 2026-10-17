import { useState } from 'react'
import { Aviso, Carga, useCarga, useMutacion } from './GestionUi.jsx'

export function VinculosParcela({ servicio, campaniaId, lote }) {
  const [busqueda, setBusqueda] = useState(''),
    [parcela, setParcela] = useState(''),
    m = useMutacion()
  const consulta = useCarga(
    () => servicio.listar(campaniaId, lote.id),
    [servicio, campaniaId, lote.id]
  )
  const opciones = useCarga(() => servicio.opciones(busqueda), [servicio, busqueda])
  return (
    <section className="management-section">
      <h3>Parcelas del lote operativo {lote.codigo}</h3>
      <p>
        Vínculo opcional. Un lote puede vincular varias parcelas y una parcela puede
        participar en varios lotes. El vínculo no redefine la producción histórica.
      </p>
      <Carga consulta={consulta}>
        {(filas) => (
          <>
            {!filas.length && (
              <p>Sin parcelas vinculadas. Este lote sigue siendo válido.</p>
            )}
            <ul>
              {filas.map((x) => (
                <li key={x.id}>
                  {x.codigo} · {x.nombre} —{' '}
                  {x.vinculoActivo ? 'Vínculo activo' : 'Vínculo inactivo'}
                  {!x.habilitado && ' (jerarquía física inactiva)'}{' '}
                  <button
                    disabled={m.ocupado || (!x.vinculoActivo && !x.habilitado)}
                    onClick={() =>
                      m.ejecutar(async () => {
                        await servicio[x.vinculoActivo ? 'desvincular' : 'vincular'](
                          campaniaId,
                          lote.id,
                          x.id
                        )
                        consulta.refrescar()
                      })
                    }
                  >
                    {x.vinculoActivo ? 'Desvincular' : 'Volver a vincular'} {x.codigo}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Carga>
      <form
        className="settings-form"
        onSubmit={(e) => {
          e.preventDefault()
          void m.ejecutar(async () => {
            await servicio.vincular(campaniaId, lote.id, parcela)
            setParcela('')
            consulta.refrescar()
          })
        }}
      >
        <label>
          Buscar parcela para {lote.codigo}
          <input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setParcela('')
            }}
          />
        </label>
        <Carga consulta={opciones}>
          {(filas) => (
            <label>
              Parcela para {lote.codigo}
              <select
                required
                value={parcela}
                onChange={(e) => setParcela(e.target.value)}
              >
                <option value="">Seleccione una parcela</option>
                {filas.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.codigo} · {x.nombre}
                  </option>
                ))}
              </select>
              <small>
                Hasta 50 coincidencias. Busque por código, nombre, sector o fundo.
              </small>
            </label>
          )}
        </Carga>
        <button disabled={m.ocupado || !parcela}>
          Vincular parcela a {lote.codigo}
        </button>
        <Aviso error={m.error} />
      </form>
    </section>
  )
}
