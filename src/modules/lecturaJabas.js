import { supabase } from '../supabase'

export async function listarLotesActivos() {
  const { data, error } = await supabase.rpc('listar_lotes_activos')

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function iniciarSesionLectura({
  dniOperador,
  dniJabero,
  loteId,
  sesionId
}) {
  const { data, error } = await supabase.rpc('iniciar_sesion_lectura', {
    p_dni_operador: dniOperador,
    p_dni_jabero: dniJabero,
    p_lote_id: loteId,
    p_sesion_id: sesionId
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function registrarLecturaJaba({
  dniOperador,
  sesionId,
  codigoTicket,
  lecturaId = crypto.randomUUID(),
  fechaHora = new Date().toISOString()
}) {
  const { data, error } = await supabase.rpc('registrar_lectura_jaba', {
    p_dni_operador: dniOperador,
    p_sesion_id: sesionId,
    p_codigo_ticket: codigoTicket,
    p_lectura_id: lecturaId,
    p_fecha_hora: fechaHora
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function cerrarSesionLectura({ dniOperador, sesionId }) {
  const { data, error } = await supabase.rpc('cerrar_sesion_lectura', {
    p_dni_operador: dniOperador,
    p_sesion_id: sesionId
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
