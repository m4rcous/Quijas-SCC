import { supabase } from '../supabase'

import { guardarOperador, obtenerOperador } from '../offline/db'

export async function validarOperador(dni) {
  // ========================================================
  // SIN INTERNET
  // ========================================================

  if (!navigator.onLine) {
    const operadorLocal = await obtenerOperador(dni)

    if (!operadorLocal) {
      throw new Error(
        'Este operador no está disponible sin conexión. Conéctese a Internet al menos una vez para validar el dispositivo.'
      )
    }

    return {
      ...operadorLocal,
      offline: true
    }
  }

  // ========================================================
  // CON INTERNET
  // ========================================================

  try {
    const { data, error } = await supabase.rpc('validar_operador', {
      p_dni: dni
    })

    if (error) {
      throw new Error(error.message)
    }

    await guardarOperador({
      dni: data.dni,
      nombre: data.nombre,
      actualizado_en: new Date().toISOString()
    })

    return data
  } catch (error) {
    // Puede ocurrir que navigator.onLine diga
    // true pero Supabase sea inalcanzable.

    const operadorLocal = await obtenerOperador(dni)

    if (operadorLocal) {
      return {
        ...operadorLocal,
        offline: true
      }
    }

    throw error
  }
}
