import { supabase } from '../supabase'

import { guardarOperador, obtenerOperador } from '../offline/db'
import { validarOperadorConFuentes } from './authLogic'

export async function validarOperador(dni) {
  return validarOperadorConFuentes(
    dni,
    (valor) => supabase.rpc('validar_operador_diario', { p_dni: valor }),
    obtenerOperador,
    guardarOperador
  )
}
