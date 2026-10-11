import { supabase } from '../supabase'
import { buscarCosechadorLocal } from './cosechadorLocal'
import { parametrosCampania } from './campaniaOperador'

export async function buscarCosechador(dni) {
  return buscarCosechadorLocal(dni, { permitirProvisional: true })
}

export async function asignarTicket({
  dniOperador,
  campaniaId,
  dniCosechador,
  codigoTicket,
  operacionId
}) {
  const { data, error } = await supabase.rpc(
    ...parametrosCampania(campaniaId, 'asignar_ticket', {
      p_dni_operador: dniOperador,
      p_dni_cosechador: dniCosechador,
      p_codigo_ticket: codigoTicket,
      p_operacion_id: operacionId
    })
  )

  if (error) {
    throw error
  }

  return data
}
