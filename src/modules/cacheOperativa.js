import { supabase } from '../supabase'

import { guardarCache } from '../offline/db'

export async function actualizarCacheOperativa(dniOperador) {
  const { data, error } = await supabase.rpc('obtener_cache_operativa', {
    p_dni_operador: dniOperador
  })

  if (error) {
    throw new Error(error.message)
  }

  await guardarCache(data)

  return data
}
