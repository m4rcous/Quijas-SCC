import { supabase } from '../supabase'

export async function registrarJabero({ dniOperador, dniTrabajador }) {
  const { data, error } = await supabase.rpc('registrar_jabero', {
    p_dni_operador: dniOperador,
    p_dni_trabajador: dniTrabajador
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
