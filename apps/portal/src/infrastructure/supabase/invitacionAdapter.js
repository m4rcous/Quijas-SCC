// Sólo infraestructura procesa el enlace del proveedor. Nunca se propagan
// tokens al estado React, a parámetros RPC o a logs de Application.
export function crearInvitacionAdapter(cliente, href, limpiarUrl) {
  const url = new URL(href),
    hash = new URLSearchParams(url.hash.slice(1))
  const token =
    url.searchParams.get('type') === 'invite'
      ? url.searchParams.get('token_hash')
      : null
  const access = hash.get('type') === 'invite' ? hash.get('access_token') : null
  const refresh = hash.get('refresh_token')
  let pendiente =
    url.pathname === '/aceptar-invitacion' && Boolean(token || (access && refresh))
  let verificada = false
  if (pendiente) limpiarUrl('/aceptar-invitacion')
  return {
    tieneInvitacion: () => pendiente,
    async completarInvitacion(password) {
      if (!pendiente)
        throw new Error(
          'Enlace de invitación inválido. Solicite un nuevo enlace al administrador.'
        )
      if (!verificada) {
        const { error } = token
          ? await cliente.auth.verifyOtp({ token_hash: token, type: 'invite' })
          : await cliente.auth.setSession({
              access_token: access,
              refresh_token: refresh
            })
        if (error)
          throw new Error('El enlace de invitación ha caducado o no es válido.')
        const { data, error: validation } = await cliente.auth.getUser()
        if (validation || !data.user)
          throw new Error('No se pudo verificar la cuenta invitada.')
        verificada = true
      }
      const { error } = await cliente.auth.updateUser({ password })
      if (error)
        throw new Error(
          'No se pudo establecer la contraseña. Revise la política de contraseñas del servicio.'
        )
      pendiente = false
      limpiarUrl('/')
    }
  }
}
