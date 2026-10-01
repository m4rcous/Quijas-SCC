import { obtenerCampaniaActiva, obtenerTrabajador } from '../offline/db.js'

export function nombreCosechadorVisible(nombre, dni) {
  const nombreNormalizado = String(nombre ?? '').trim()
  if (nombreNormalizado) return nombreNormalizado
  const dniNormalizado = String(dni ?? '').trim()
  return dniNormalizado ? `DNI ${dniNormalizado}` : 'DNI no disponible'
}

export async function buscarCosechadorLocal(dni, { permitirProvisional = false } = {}) {
  const dniNormalizado = String(dni ?? '').trim()
  if (!/^\d{8}$/.test(dniNormalizado)) {
    throw new Error('El DNI debe contener 8 dígitos.')
  }

  const [trabajador, campania] = await Promise.all([
    obtenerTrabajador(dniNormalizado),
    obtenerCampaniaActiva()
  ])

  if (!campania) {
    throw new Error('El cosechador no está disponible en la campaña activa local.')
  }

  if (trabajador?.activo === false) {
    throw new Error('El trabajador está inactivo.')
  }

  const campaniaNombre = campania.nombre ?? campania
  if (trabajador?.roles?.includes('COSECHADOR')) {
    return {
      ...trabajador,
      nombre: nombreCosechadorVisible(trabajador.nombre, dniNormalizado),
      campania: campaniaNombre
    }
  }

  if (!permitirProvisional) {
    throw new Error('El cosechador no está disponible en la campaña activa local.')
  }

  return {
    ...(trabajador ?? {}),
    dni: dniNormalizado,
    nombre: nombreCosechadorVisible(trabajador?.nombre, dniNormalizado),
    roles: [...new Set([...(trabajador?.roles ?? []), 'COSECHADOR'])],
    activo: trabajador?.activo ?? true,
    provisional_local: true,
    campania: campaniaNombre
  }
}
