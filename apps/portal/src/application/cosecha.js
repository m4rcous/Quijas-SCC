import { crearAdministracionHarvest } from '../../../../src/contexts/harvest/index.js'
import { crearEntitlements } from '../../../../src/contexts/platform/index.js'
import { SolicitudObsoleta } from '../ports/administracion.js'

export function crearCosechaPortal({ puerto, scopePara, entitlements }) {
  if (!puerto) return null
  const servicio = crearAdministracionHarvest({ administracionHarvest: puerto }),
    capacidades = crearEntitlements({ entitlements })
  return Object.freeze(
    Object.fromEntries(
      Object.entries(servicio).map(([nombre, accion]) => [
        nombre,
        async (...args) => {
          const scope = scopePara(
            nombre === 'generar'
              ? 'harvest.manage'
              : ['harvest.view', 'harvest.manage'],
            'HARVEST'
          )
          const c = await scope.tenantContext.obtener()
          if (!scope.vigente(c)) throw new SolicitudObsoleta()
          try {
            await capacidades.exigirModulo(c.tenantId, 'HARVEST')
            if (!scope.vigente(c)) throw new SolicitudObsoleta()
            const d = await accion(c.tenantId, ...args)
            if (!scope.vigente(c)) throw new SolicitudObsoleta()
            return d
          } catch (e) {
            if (scope.vigente(c)) await scope.onError(e)
            throw e
          }
        }
      ])
    )
  )
}
