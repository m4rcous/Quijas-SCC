import {
  obtenerColaCompleta,
  marcarOperacionSincronizada,
  marcarOperacionError,
  marcarTicketSincronizado,
  marcarTicketError,
  marcarLecturaSincronizada
} from './db'

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

    operaciones.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en))

    for (const operacion of operaciones) {
      if (operacion.estado === 'SINCRONIZADA') {
        continue
      }

      if (operacion.estado === 'ERROR') {
        break
      }

      if (operacion.estado !== 'PENDIENTE') {
        continue
      }

      try {
        await procesarOperacion(operacion)

        await marcarOperacionSincronizada(operacion.id)

        if (operacion.tipo === 'ASIGNAR_TICKET') {
          await marcarTicketSincronizado(operacion.payload.codigoTicket)
        }
        if (operacion.tipo === 'REGISTRAR_JABA') {
          await marcarLecturaSincronizada(operacion.payload.lecturaId)
        }
      } catch (error) {
        await marcarOperacionError(operacion.id, error.message)

        if (operacion.tipo === 'ASIGNAR_TICKET') {
          await marcarTicketError(operacion.payload.codigoTicket, error.message)
        }

        break
      }
    }
  } finally {
    sincronizando = false
  }
}

async function procesarOperacion(operacion) {
  switch (operacion.tipo) {
    case 'ASIGNAR_TICKET':
      return asignarTicket(operacion.payload)

    case 'REGISTRAR_JABERO':
      return registrarJabero(operacion.payload)

    case 'INICIAR_SESION':
      return iniciarSesionLectura(operacion.payload)

    case 'REGISTRAR_JABA':
      return registrarLecturaJaba({
        dniOperador: operacion.payload.dniOperador,
        sesionId: operacion.payload.sesionId,
        codigoTicket: operacion.payload.codigoTicket,
        lecturaId: operacion.payload.lecturaId,
        fechaHora: operacion.payload.fechaHora
      })

    case 'CERRAR_SESION':
      return cerrarSesionLectura({
        dniOperador: operacion.payload.dniOperador,
        sesionId: operacion.payload.sesionId
      })

    default:
      throw new Error(`Tipo de operación no soportado: ${operacion.tipo}`)
  }
}
