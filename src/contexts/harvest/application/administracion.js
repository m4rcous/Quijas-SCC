import { validarAdministracionHarvest } from '../ports/administracion.js'
import { modeloOperativoHarvest } from '../domain/cutoverHarvest.js'

// API pública equivalente de GenerarLotesDeTickets con autoridad en servidor:
// se transmite intención, nunca una lista de lotes/códigos construida por UI.
export function crearAdministracionHarvest({ administracionHarvest }) {
  const p = validarAdministracionHarvest(administracionHarvest)
  const colecciones = ['lotes', 'tickets', 'asignaciones', 'registros']
  return Object.freeze({
    filtros: (t, campaniaId) => p.filtros(t, campaniaId || null),
    async campanias(t) {
      const filas = await p.campanias(t)
      return filas.map((c) => ({
        ...c,
        modelo: modeloOperativoHarvest(c.cutover, c.id)
      }))
    },
    generar(t, d) {
      if (
        !d.operacionId ||
        !d.campaniaId ||
        ![d.cantidadTickets, d.tamanioLote].every(
          (n) => Number.isSafeInteger(n) && n > 0 && n <= 100000
        )
      )
        throw new Error('Campaña, ID y cantidades enteras entre 1 y 100000 requeridos.')
      return p.generar(t, {
        operacionId: d.operacionId,
        campaniaId: d.campaniaId,
        cantidadTickets: d.cantidadTickets,
        tamanioLote: d.tamanioLote
      })
    },
    listar(t, tipo, f = {}) {
      if (!colecciones.includes(tipo)) throw new Error('Consulta Harvest desconocida.')
      return p.listar(t, tipo, {
        campaniaId: f.campaniaId || null,
        busqueda: f.busqueda?.trim() || '',
        loteId: f.loteId || null,
        trabajadorId: f.trabajadorId || null,
        estado: f.estado || '',
        offset: f.offset ?? 0
      })
    },
    obtener(t, tipo, id) {
      if (!colecciones.includes(tipo) || !id)
        throw new Error('Recurso Harvest requerido.')
      return p.obtener(t, tipo, id)
    }
  })
}
