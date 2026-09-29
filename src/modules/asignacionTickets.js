import { supabase } from '../supabase'

export async function buscarCosechador(dni) {
  const { data, error } = await supabase.rpc('buscar_cosechador_activo', {
    p_dni: dni
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function asignarTicket({ dniOperador, dniCosechador, codigoTicket }) {
  const { data, error } = await supabase.rpc('asignar_ticket', {
    p_dni_operador: dniOperador,
    p_dni_cosechador: dniCosechador,
    p_codigo_ticket: codigoTicket
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
