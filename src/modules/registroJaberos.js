import { supabase } from '../supabase'

export async function registrarJabero({ dniOperador, dniTrabajador, operacionId }) {
  const { data, error } = await supabase.rpc('registrar_jabero', {
    p_dni_operador: dniOperador,
    p_dni_trabajador: dniTrabajador,
    p_operacion_id: operacionId
  })

  if (error) {
    throw error
  }

  return data
}
