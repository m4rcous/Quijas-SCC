import { crearCutoverAdministrativo } from '../../../../src/contexts/platform/index.js'
import { SolicitudObsoleta } from '../ports/administracion.js'
export function crearCutoverAdministrativoPortal({ puerto, scope }) {
  if (!puerto) return null
  const servicio = crearCutoverAdministrativo({ cutoverAdministrativo: puerto })
  const ejecutar = async (accion) => {
    const c = await scope.tenantContext.obtener()
    if (!scope.vigente(c)) throw new SolicitudObsoleta()
    try {
      const r = await accion(c.tenantId)
      if (!scope.vigente(c)) throw new SolicitudObsoleta()
      return r
    } catch (e) {
      if (scope.vigente(c)) await scope.onError(e)
      throw e
    }
  }
  return Object.freeze({
    consultar: (campaniaId) => ejecutar((t) => servicio.consultar(t, campaniaId)),
    activar: (d) => ejecutar((t) => servicio.activar(t, d))
  })
}
