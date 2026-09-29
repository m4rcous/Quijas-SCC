import { esErrorTemporal } from '../offline/errores.js'

export async function validarOperadorConFuentes(
  dni,
  consultar,
  obtenerLocal,
  guardarLocal
) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const local = await obtenerLocal(dni)
    if (!local)
      throw new Error(
        'Este operador no está disponible sin conexión. Conéctese a Internet al menos una vez para validar el dispositivo.'
      )
    return { ...local, offline: true }
  }
  try {
    const { data, error } = await consultar(dni)
    if (error) throw error
    if (!data?.dni) throw new Error('El servidor no autorizó al operador.')
    await guardarLocal({
      dni: data.dni,
      nombre: data.nombre,
      actualizado_en: new Date().toISOString()
    })
    return data
  } catch (error) {
    if (!esErrorTemporal(error)) throw error
    const local = await obtenerLocal(dni)
    if (local) return { ...local, offline: true }
    throw error
  }
}
