import 'fake-indexeddb/auto'
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  contarLecturasCosechador,
  contarLecturasSesion,
  guardarLecturaLocal,
  guardarTicketLocal,
  obtenerTicket,
  obtenerTrabajador,
  obtenerUltimaLecturaSesion
} from '../src/offline/db.js'
import {
  mostrarContadorCosechador,
  mostrarSesionLecturaEnVista
} from '../src/modules/vistaSesionLectura.js'

const consultas = {
  contarLecturasSesion,
  obtenerUltimaLecturaSesion,
  contarLecturasCosechador,
  obtenerTicket,
  obtenerTrabajador
}

function elemento() {
  const clases = new Set()
  return {
    textContent: '',
    className: '',
    value: '',
    enfocado: false,
    classList: {
      add: (clase) => clases.add(clase),
      remove: (clase) => clases.delete(clase),
      contains: (clase) => clases.has(clase)
    },
    focus() {
      this.enfocado = true
    }
  }
}

function vista() {
  return Object.fromEntries(
    [
      'configuracionLectura',
      'sesionLecturaActiva',
      'sesionJabero',
      'sesionLote',
      'sesionVariedad',
      'totalSesion',
      'etiquetaCosechador',
      'totalCosechador',
      'mensajeModuloLectura',
      'ticketLectura'
    ].map((nombre) => [nombre, elemento()])
  )
}

function sesion(id) {
  return { sesion_id: id, jabero: 'Juan', lote_codigo: 'L1', variedad: 'Uva' }
}

test('una sesión válida oculta el error previo de configuración', async () => {
  const elementos = vista()
  elementos.mensajeModuloLectura.textContent = 'El DNI debe contener 8 dígitos.'
  elementos.mensajeModuloLectura.className = 'resultado error'
  await mostrarSesionLecturaEnVista(sesion('ui-sesion-nueva'), elementos, consultas)

  assert.equal(elementos.mensajeModuloLectura.textContent, '')
  assert.equal(elementos.mensajeModuloLectura.className, 'resultado oculto')
  assert.equal(elementos.configuracionLectura.classList.contains('oculto'), true)
  assert.equal(elementos.sesionLecturaActiva.classList.contains('oculto'), false)
  assert.equal(elementos.ticketLectura.enfocado, true)
})

test('una sesión sin lecturas muestra el estado inicial neutral', async () => {
  const elementos = vista()
  await mostrarSesionLecturaEnVista(sesion('ui-sesion-vacia'), elementos, consultas)

  assert.equal(elementos.totalSesion.textContent, 0)
  assert.equal(elementos.etiquetaCosechador.textContent, 'Cosechador actual')
  assert.equal(elementos.totalCosechador.textContent, '0')
})

test('una lectura actualiza inmediatamente el nombre y las jabas del cosechador', async () => {
  const elementos = vista()
  const id = 'ui-sesion-escaneo'
  for (const numero of [1, 2]) {
    await guardarLecturaLocal({
      id: `ui-escaneo-${numero}`,
      sesion_id: id,
      codigo_ticket: 'UI-TICKET-ANA',
      cosechador_dni: '80000001',
      cosechador: 'Ana López',
      fecha_hora: `2026-09-29T10:00:0${numero}Z`
    })
    elementos.totalSesion.textContent = await contarLecturasSesion(id)
    mostrarContadorCosechador(
      'Ana López',
      await contarLecturasCosechador(id, '80000001'),
      elementos
    )
  }

  assert.equal(elementos.totalSesion.textContent, 2)
  assert.equal(elementos.etiquetaCosechador.textContent, 'Ana López')
  assert.equal(elementos.totalCosechador.textContent, '2 jabas')
})

test('al restaurar usa la última lectura y resuelve su nombre desde el ticket', async () => {
  const id = 'ui-sesion-restaurada'
  await guardarTicketLocal({
    codigoTicket: 'UI-TICKET-ANA-ANTIGUO',
    cosechadorDni: '80000001',
    cosechador: 'Ana López'
  })
  await guardarTicketLocal({
    codigoTicket: 'UI-TICKET-LUIS',
    cosechadorDni: '80000002',
    cosechador: 'Luis Pérez'
  })
  for (const [numero, codigo, dni] of [
    [1, 'UI-TICKET-ANA-ANTIGUO', '80000001'],
    [2, 'UI-TICKET-LUIS', '80000002'],
    [3, 'UI-TICKET-ANA-ANTIGUO', '80000001']
  ]) {
    await guardarLecturaLocal({
      id: `ui-restaurada-${numero}`,
      sesion_id: id,
      codigo_ticket: codigo,
      cosechador_dni: dni,
      fecha_hora: `2026-09-29T11:00:0${numero}Z`
    })
  }

  const elementos = vista()
  await mostrarSesionLecturaEnVista(sesion(id), elementos, consultas)
  assert.equal(elementos.totalSesion.textContent, 3)
  assert.equal(elementos.etiquetaCosechador.textContent, 'Ana López')
  assert.equal(elementos.totalCosechador.textContent, '2 jabas')
})
