import { crearGestionEstructuraAgricola } from '../../../../src/contexts/farm-structure/index.js'
import { crearVinculacionParcelas } from '../../../../src/contexts/campaign-management/index.js'
import { crearEntitlements } from '../../../../src/contexts/platform/index.js'
import { SolicitudObsoleta } from '../ports/administracion.js'
function proteger(servicio, { scope, entitlements, modulos }) {
  const capacidades = crearEntitlements({ entitlements })
  return Object.freeze(
    Object.fromEntries(
      Object.entries(servicio).map(([m, accion]) => [
        m,
        async (...args) => {
          const c = await scope.tenantContext.obtener()
          const vigente = () => {
            if (!scope.vigente(c)) throw new SolicitudObsoleta()
          }
          vigente()
          try {
            for (const modulo of modulos) {
              await capacidades.exigirModulo(c.tenantId, modulo)
              vigente()
            }
            const r = await accion(c.tenantId, ...args)
            vigente()
            return r
          } catch (e) {
            if (scope.vigente(c)) await scope.onError(e)
            throw e
          }
        }
      ])
    )
  )
}
export function crearEstructuraAgricolaPortal({ puerto, ...scope }) {
  return puerto
    ? proteger(crearGestionEstructuraAgricola({ estructuraAgricola: puerto }), {
        ...scope,
        modulos: ['FARM_STRUCTURE']
      })
    : null
}
export function crearParcelasCampaniaPortal({ puerto, ...scope }) {
  if (!puerto) return null
  return proteger(
    crearVinculacionParcelas({
      referenciasParcelas: { listar: puerto.opciones },
      lotesParcelas: puerto
    }),
    { ...scope, modulos: ['CAMPAIGN', 'FARM_STRUCTURE'] }
  )
}
