import { supabase } from '../supabase'

export async function listarLotesActivos() {
  const { data, error } = await supabase.rpc('listar_lotes_activos_v2')

  if (error) {
    throw error
  }

  return data
}

export async function iniciarSesionLectura({
  dniOperador,
  dniJabero,
  loteId,
  variedadId,
  sesionId
}) {
  const { data, error } = await supabase.rpc('iniciar_sesion_lectura', {
    p_dni_operador: dniOperador,
    p_dni_jabero: dniJabero,
    p_lote_id: loteId,
    p_sesion_id: sesionId,
    ...(variedadId ? { p_variedad_id: variedadId } : {})
  })

  if (error) {
    throw error
  }

  return data
}

export async function registrarLecturaJaba({
  dniOperador,
  sesionId,
  codigoTicket,
  lecturaId = crypto.randomUUID(),
  fechaHora = new Date().toISOString(),
  operacionId
}) {
  const { data, error } = await supabase.rpc('registrar_lectura_jaba', {
    p_dni_operador: dniOperador,
    p_sesion_id: sesionId,
    p_codigo_ticket: codigoTicket,
    p_lectura_id: lecturaId,
    p_fecha_hora: fechaHora,
    p_operacion_id: operacionId
  })

  if (error) {
    throw error
  }

  return data
}

export async function cerrarSesionLectura({ dniOperador, sesionId, operacionId }) {
  const { data, error } = await supabase.rpc('cerrar_sesion_lectura', {
    p_dni_operador: dniOperador,
    p_sesion_id: sesionId,
    p_operacion_id: operacionId
  })

  if (error) {
    throw error
  }

  return data
}
