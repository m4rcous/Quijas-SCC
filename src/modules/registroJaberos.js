import { supabase } from '../supabase'
import { parametrosCampania } from './campaniaOperador'

export async function registrarJabero({
  dniOperador,
  dniTrabajador,
  operacionId,
  campaniaId
}) {
  const { data, error } = await supabase.rpc(
    ...parametrosCampania(campaniaId, 'registrar_jabero', {
      p_dni_operador: dniOperador,
      p_dni_trabajador: dniTrabajador,
      p_operacion_id: operacionId
    })
  )

  if (error) {
    throw error
  }

  return data
}
