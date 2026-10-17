import { validarAdministracion, SolicitudObsoleta } from '../ports/administracion.js'
import { crearEntitlements } from '../../../../src/contexts/platform/index.js'

export function crearConfiguracion({
  tenantContext,
  administracion,
  entitlements,
  vigente = () => true,
  onError = async () => {}
}) {
  validarAdministracion(administracion)
  const capacidades = crearEntitlements({ entitlements })
  const ejecutar = async (accion) => {
    const c = await tenantContext.obtener()
    c.exigir('company.manage')
    if (!vigente(c)) throw new SolicitudObsoleta()
    let resultado
    try {
      resultado = await accion(c.tenantId)
    } catch (e) {
      if (vigente(c)) await onError(e)
      throw e
    }
    if (!vigente(c)) throw new SolicitudObsoleta()
    return resultado
  }
  const membresia = (d) => ({
    usuarioId: d.usuarioId,
    activo: d.activo,
    roles: [...d.roles],
    trabajadorId: d.trabajadorId || null,
    nombre: d.nombre?.trim() || null
  })
  return Object.freeze({
    obtenerEmpresa: () => ejecutar((tenant) => administracion.obtenerEmpresa(tenant)),
    guardarEmpresa: ({ nombre }) =>
      ejecutar((tenant) => {
        if (!nombre?.trim()) throw new Error('Nombre de empresa requerido.')
        return administracion.guardarEmpresa(tenant, nombre.trim())
      }),
    listarUsuarios: ({ busqueda = '', offset = 0 } = {}) =>
      ejecutar((tenant) => administracion.listarUsuarios(tenant, busqueda, offset)),
    obtenerUsuario: (usuarioId) =>
      ejecutar((tenant) => administracion.obtenerUsuario(tenant, usuarioId)),
    catalogoAccesos: () => ejecutar((tenant) => administracion.catalogoAccesos(tenant)),
    guardarMembresia: (datos) =>
      ejecutar((tenant) => administracion.guardarMembresia(tenant, membresia(datos))),
    invitarUsuario: (d) =>
      ejecutar((tenant) => {
        if (
          !d.operacionId ||
          !d.nombre?.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email?.trim() ?? '')
        )
          throw new Error('Nombre, correo e ID de invitación requeridos.')
        return administracion.invitarUsuario(tenant, {
          operacionId: d.operacionId,
          email: d.email.trim().toLowerCase(),
          nombre: d.nombre.trim(),
          roles: [...d.roles],
          trabajadorId: d.trabajadorId || null
        })
      }),
    listarInvitaciones: () =>
      ejecutar((tenant) => administracion.listarInvitaciones(tenant)),
    modulosHabilitados: () =>
      ejecutar((tenant) => capacidades.modulosHabilitados(tenant))
  })
}
