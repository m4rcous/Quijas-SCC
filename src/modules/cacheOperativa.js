import { supabase } from '../supabase'

import { guardarCache } from '../offline/db'
import { parametrosCampania } from './campaniaOperador'

export async function actualizarCacheOperativa(dniOperador, campaniaId) {
  const { data, error } = await supabase.rpc(
    ...parametrosCampania(campaniaId, 'obtener_cache_operativa', {
      p_dni_operador: dniOperador
    })
  )

  if (error) {
    throw new Error(error.message)
  }

  await guardarCache(data)

  return data
}
