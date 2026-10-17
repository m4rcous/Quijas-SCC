import { crearGestionCampanias } from '../../../../src/contexts/campaign-management/index.js'
import { crearGestionPersonal } from '../../../../src/contexts/workforce/index.js'
import { crearEntitlements } from '../../../../src/contexts/platform/index.js'
import { SolicitudObsoleta } from '../ports/administracion.js'

export function crearGestionPortal({ puerto, scope, entitlements, tipo }) {
  if (!puerto) return null
  const campaign = tipo === 'campaign',
    modulo = campaign ? 'CAMPAIGN' : 'WORKFORCE'
  const capacidades = crearEntitlements({ entitlements })
  const servicio = campaign
    ? crearGestionCampanias({ campaign: puerto })
    : crearGestionPersonal({ workforce: puerto })
  return Object.freeze(
    Object.fromEntries(
      Object.entries(servicio).map(([nombre, accion]) => [
        nombre,
        async (...args) => {
          const c = await scope.tenantContext.obtener()
          if (!scope.vigente(c)) throw new SolicitudObsoleta()
          try {
            await capacidades.exigirModulo(c.tenantId, modulo)
            if (!scope.vigente(c)) throw new SolicitudObsoleta()
            const resultado = await accion(c.tenantId, ...args)
            if (!scope.vigente(c)) throw new SolicitudObsoleta()
            return resultado
          } catch (e) {
            if (scope.vigente(c)) await scope.onError(e)
            throw e
          }
        }
      ])
    )
  )
}
