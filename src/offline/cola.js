import { esErrorTemporal } from './errores.js'

export function obtenerOperacionesDependientes(operacion, operaciones) {
  if (!operacion) return []

  return operaciones.filter((posterior) => {
    if (posterior.id === operacion.id || posterior.creado_en <= operacion.creado_en) {
      return false
    }

    if (operacion.tipo === 'ASIGNAR_TICKET') {
      return (
        posterior.tipo === 'REGISTRAR_JABA' &&
        operacion.payload.codigoTicket != null &&
        posterior.payload.codigoTicket === operacion.payload.codigoTicket
      )
    }

    if (operacion.tipo === 'REGISTRAR_JABERO') {
      return (
        posterior.tipo === 'INICIAR_SESION' &&
        operacion.payload.dniTrabajador != null &&
        posterior.payload.dniJabero === operacion.payload.dniTrabajador
      )
    }

    if (operacion.tipo === 'INICIAR_SESION') {
      return (
        ['REGISTRAR_JABA', 'CERRAR_SESION'].includes(posterior.tipo) &&
        operacion.payload.sesionId != null &&
        posterior.payload.sesionId === operacion.payload.sesionId
      )
    }

    return false
  })
}

export function evaluarDescarteOperacion(operacion, operaciones) {
  const dependientes = obtenerOperacionesDependientes(operacion, operaciones).length

  return {
    permitido:
      operacion?.estado === 'ERROR' &&
      ['ASIGNAR_TICKET', 'REGISTRAR_JABERO'].includes(operacion.tipo) &&
      dependientes === 0,
    dependientes
  }
}

export async function ejecutarCola(operaciones, procesar, alSincronizar, alFallar) {
  const ordenadas = [...operaciones].sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en)
  )
  for (const operacion of ordenadas) {
    if (operacion.estado === 'SINCRONIZADA') continue
    if (operacion.estado !== 'PENDIENTE') break
    try {
      await procesar(operacion)
    } catch (error) {
      await alFallar(operacion, error, esErrorTemporal(error))
      break
    }
    await alSincronizar(operacion)
  }
}
