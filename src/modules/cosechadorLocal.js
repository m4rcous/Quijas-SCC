import { obtenerCampaniaActiva, obtenerTrabajador } from '../offline/db.js'

export async function buscarCosechadorLocal(dni) {
  const [trabajador, campania] = await Promise.all([
    obtenerTrabajador(dni),
    obtenerCampaniaActiva()
  ])
  if (!campania || !trabajador?.roles?.includes('COSECHADOR')) {
    throw new Error('El cosechador no está disponible en la campaña activa local.')
  }
  return { ...trabajador, campania: campania.nombre ?? campania }
}
