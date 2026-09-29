import {
  obtenerColaCompleta,
  marcarOperacionSincronizada,
  marcarOperacionError,
  marcarOperacionTemporal,
  marcarTicketSincronizado,
  marcarTicketError,
  marcarLecturaSincronizada,
  marcarJabero,
  limpiarOperacionesSincronizadas
} from './db'
import { ejecutarCola } from './cola'

import { asignarTicket } from '../modules/asignacionTickets'
import { registrarJabero } from '../modules/registroJaberos'
import {
  iniciarSesionLectura,
  registrarLecturaJaba,
  cerrarSesionLectura
} from '../modules/lecturaJabas'

let sincronizando = false

export async function sincronizarPendientes() {
  if (sincronizando) {
    return
  }

  if (!navigator.onLine) {
    return
  }

  sincronizando = true

  try {
    const operaciones = await obtenerColaCompleta()

    await ejecutarCola(
      operaciones,
      procesarOperacion,
      async (operacion) => {
        if (operacion.tipo === 'ASIGNAR_TICKET') {
          await marcarTicketSincronizado(operacion.payload.codigoTicket)
        }
        if (operacion.tipo === 'REGISTRAR_JABA') {
          await marcarLecturaSincronizada(operacion.payload.lecturaId)
        }
        if (operacion.tipo === 'REGISTRAR_JABERO') {
          await marcarJabero(
            operacion.payload.dniTrabajador,
            'SINCRONIZADO',
            operacion.id
          )
        }
        await marcarOperacionSincronizada(operacion.id)
      },
      async (operacion, error, temporal) => {
        if (temporal) {
          await marcarOperacionTemporal(operacion.id, error.message)
          return
        }
        await marcarOperacionError(operacion.id, error.message)
        if (operacion.tipo === 'ASIGNAR_TICKET') {
          await marcarTicketError(operacion.payload.codigoTicket, error.message)
        }
        if (operacion.tipo === 'REGISTRAR_JABERO') {
          await marcarJabero(operacion.payload.dniTrabajador, 'ERROR', operacion.id)
        }
      }
    )
    await limpiarOperacionesSincronizadas()
  } finally {
    sincronizando = false
  }
}

async function procesarOperacion(operacion) {
  switch (operacion.tipo) {
    case 'ASIGNAR_TICKET':
      return asignarTicket({ ...operacion.payload, operacionId: operacion.id })

    case 'REGISTRAR_JABERO':
      return registrarJabero({ ...operacion.payload, operacionId: operacion.id })

    case 'INICIAR_SESION':
      return iniciarSesionLectura(operacion.payload)

    case 'REGISTRAR_JABA':
      return registrarLecturaJaba({
        dniOperador: operacion.payload.dniOperador,
        sesionId: operacion.payload.sesionId,
        codigoTicket: operacion.payload.codigoTicket,
        lecturaId: operacion.payload.lecturaId,
        fechaHora: operacion.payload.fechaHora,
        operacionId: operacion.id
      })

    case 'CERRAR_SESION':
      return cerrarSesionLectura({
        dniOperador: operacion.payload.dniOperador,
        sesionId: operacion.payload.sesionId,
        operacionId: operacion.id
      })

    default:
      throw new Error(`Tipo de operación no soportado: ${operacion.tipo}`)
  }
}
