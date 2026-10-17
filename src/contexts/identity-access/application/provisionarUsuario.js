// Caso de uso exclusivo de backend: todos los puertos se inyectan del lado
// confiable. La autorización y el ownership se revalidan al confirmar el alta.
export function crearProvisionarUsuario({ autorizacion, registro, proveedor }) {
  if (
    typeof autorizacion?.verificarSesion !== 'function' ||
    !['preparar', 'destinatario', 'completar'].every(
      (m) => typeof registro?.[m] === 'function'
    ) ||
    typeof proveedor?.invitar !== 'function'
  )
    throw new Error('Puertos de aprovisionamiento incompletos.')
  return async function provisionar(solicitud) {
    await autorizacion.verificarSesion()
    const intento = await registro.preparar(solicitud)
    if (intento.estado === 'COMPLETADA') return intento.resultado
    let destino = await registro.destinatario(intento.id)
    let sujeto = destino.sujeto
    if (!sujeto) {
      try {
        sujeto = await proveedor.invitar(destino.email)
      } catch (error) {
        // Recuperar alta del proveedor con respuesta perdida, o carrera con
        // otro administrador, sin reenviar correo ni crear identidades dobles.
        destino = await registro.destinatario(intento.id)
        if (!destino.sujeto) throw error
        sujeto = destino.sujeto
      }
    }
    if (!sujeto) throw new Error('El proveedor no devolvió una identidad válida.')
    return registro.completar(intento.id, sujeto)
  }
}
