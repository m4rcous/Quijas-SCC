export function validarAdministracion(puerto) {
  for (const metodo of [
    'obtenerEmpresa',
    'guardarEmpresa',
    'listarUsuarios',
    'obtenerUsuario',
    'catalogoAccesos',
    'guardarMembresia',
    'invitarUsuario',
    'listarInvitaciones'
  ])
    if (typeof puerto?.[metodo] !== 'function')
      throw new Error(`Administración requiere ${metodo}.`)
  return puerto
}
export class SolicitudObsoleta extends Error {
  constructor() {
    super('La empresa o sesión cambió.')
    this.name = 'SolicitudObsoleta'
  }
}
