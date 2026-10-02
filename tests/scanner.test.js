import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import {
  configurarEnvioScanner,
  esDniValido,
  normalizarValorScanner
} from '../src/modules/scanner.js'

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const siguienteTurno = () => new Promise((resolve) => setTimeout(resolve, 0))

function elemento() {
  const eventos = new Map()
  return {
    value: '',
    disabled: false,
    addEventListener(tipo, callback) {
      const callbacks = eventos.get(tipo) ?? []
      callbacks.push(callback)
      eventos.set(tipo, callbacks)
    },
    emitir(tipo, propiedades = {}) {
      const event = {
        currentTarget: this,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true
        },
        ...propiedades
      }
      for (const callback of eventos.get(tipo) ?? []) callback(event)
      return event
    }
  }
}

for (const [descripcion, valor, esperado] of [
  ['ocho dígitos', '17480378', '17480378'],
  ['terminador CR', '17480378\r', '17480378'],
  ['terminador LF', '17480378\n', '17480378'],
  ['terminador tab', '17480378\t', '17480378'],
  ['cero inicial', '01748037', '01748037']
]) {
  test(`normaliza DNI con ${descripcion} y conserva el string`, () => {
    const dni = normalizarValorScanner(valor)
    assert.equal(dni, esperado)
    assert.equal(typeof dni, 'string')
    assert.equal(esDniValido(dni), true)
  })
}

for (const valor of ['1748037', '174803789', '1748A378', '1748\r0378']) {
  test(`rechaza DNI inválido ${JSON.stringify(valor)} sin eliminar caracteres`, () => {
    const dni = normalizarValorScanner(valor)
    assert.equal(dni, valor)
    assert.equal(esDniValido(dni), false)
  })
}

test('normaliza valores ausentes a string vacío', () => {
  assert.equal(normalizarValorScanner(null), '')
  assert.equal(normalizarValorScanner(undefined), '')
  assert.equal(esDniValido(''), false)
})

for (const key of ['Enter', '\r', '\n']) {
  test(`el terminador ${JSON.stringify(key)} procesa el DNI completo una vez`, async () => {
    const form = elemento()
    const input = elemento()
    const valores = []
    configurarEnvioScanner(form, input, (dni) => valores.push(dni))
    input.value = '17480378'
    const event = input.emitir('keydown', { key })
    assert.equal(event.defaultPrevented, true)
    await siguienteTurno()
    assert.deepEqual(valores, ['17480378'])
  })
}

test('Enter lee el DOM después de completar la escritura, sin usar un valor anterior', async () => {
  const form = elemento()
  const input = elemento()
  const valores = []
  configurarEnvioScanner(form, input, (dni) => valores.push(dni))
  input.value = '1748037'
  input.emitir('keydown', { key: 'Enter' })
  input.value = '17480378\r'
  input.emitir('input')
  assert.deepEqual(valores, [])
  await siguienteTurno()
  assert.deepEqual(valores, ['17480378'])
})

test('keydown, keyup y submit de un escaneo generan una sola ejecución', async () => {
  const form = elemento()
  const input = elemento()
  let ejecuciones = 0
  configurarEnvioScanner(form, input, () => ejecuciones++)
  input.value = '17480378'
  input.emitir('keydown', { key: 'Enter' })
  input.emitir('keyup', { key: 'Enter' })
  const event = form.emitir('submit')
  input.emitir('keydown', { key: 'Enter' })
  assert.equal(event.defaultPrevented, true)
  await siguienteTurno()
  assert.equal(ejecuciones, 1)
})

test('no repite la operación pendiente y permite el siguiente escaneo al terminar', async () => {
  const form = elemento()
  const input = elemento()
  let terminar
  let ejecuciones = 0
  configurarEnvioScanner(form, input, () => {
    ejecuciones++
    return new Promise((resolve) => {
      terminar = resolve
    })
  })
  input.value = '17480378'
  input.emitir('keydown', { key: 'Enter' })
  await siguienteTurno()
  input.emitir('keydown', { key: 'Enter' })
  form.emitir('submit')
  await siguienteTurno()
  assert.equal(ejecuciones, 1)
  terminar()
  await siguienteTurno()
  input.value = '01748037'
  input.emitir('keydown', { key: 'Enter' })
  await siguienteTurno()
  assert.equal(ejecuciones, 2)
  terminar()
})

test('ignora Enter repetido, composición y teclas que no son terminadores', async () => {
  const form = elemento()
  const input = elemento()
  let ejecuciones = 0
  configurarEnvioScanner(form, input, () => ejecuciones++)
  assert.equal(
    input.emitir('keydown', { key: 'Enter', repeat: true }).defaultPrevented,
    true
  )
  assert.equal(
    input.emitir('keydown', { key: 'Enter', isComposing: true }).defaultPrevented,
    false
  )
  assert.equal(input.emitir('keydown', { key: '8' }).defaultPrevented, false)
  await siguienteTurno()
  assert.equal(ejecuciones, 0)
})

test('submit manual usa la misma ruta y conserva el cero inicial', async () => {
  const form = elemento()
  const input = elemento()
  const valores = []
  configurarEnvioScanner(form, input, (dni) => valores.push(dni))
  input.value = '01748037\t'
  form.emitir('submit')
  await siguienteTurno()
  assert.deepEqual(valores, ['01748037'])
})

test('un input deshabilitado no genera operaciones', async () => {
  const form = elemento()
  const input = elemento()
  let ejecuciones = 0
  configurarEnvioScanner(form, input, () => ejecuciones++)
  input.disabled = true
  form.emitir('submit')
  await siguienteTurno()
  assert.equal(ejecuciones, 0)
  input.disabled = false
  input.emitir('keydown', { key: 'Enter' })
  input.disabled = true
  await siguienteTurno()
  assert.equal(ejecuciones, 0)
})

test('permite escanear tras guardar localmente sin esperar la sincronización anterior', async () => {
  const form = elemento()
  const input = elemento()
  const operaciones = []
  configurarEnvioScanner(form, input, (codigo, liberar) => {
    let terminar
    const sincronizacion = new Promise((resolve) => {
      terminar = resolve
    })
    operaciones.push({ codigo, liberar, terminar })
    return sincronizacion
  })
  input.value = 'TICKET-1'
  input.emitir('keydown', { key: 'Enter' })
  await siguienteTurno()
  operaciones[0].liberar()
  input.value = 'TICKET-2'
  input.emitir('keydown', { key: 'Enter' })
  await siguienteTurno()
  assert.equal(operaciones.length, 2)
  // La finalización de la primera sincronización no debe desbloquear la
  // segunda operación, que todavía está guardando localmente.
  operaciones[0].terminar()
  await siguienteTurno()
  form.emitir('submit')
  await siguienteTurno()
  assert.deepEqual(
    operaciones.map(({ codigo }) => codigo),
    ['TICKET-1', 'TICKET-2']
  )
  operaciones[1].terminar()
})

function asignacionSimulada(
  buscar = async (dni) => ({ dni, nombre: 'Ana', campania: 'Actual' })
) {
  const form = elemento()
  const input = elemento()
  const mensajes = []
  let busquedas = 0
  let habilitaciones = 0
  input.select = () => {}
  const inicio = main.indexOf('configurarEnvioScanner(formCosechador,')
  const fin = main.indexOf('// ASIGNAR TICKET', inicio)
  assert.ok(inicio >= 0 && fin > inicio)
  runInNewContext(main.slice(inicio, fin), {
    configurarEnvioScanner,
    esDniValido,
    formCosechador: form,
    dniCosechadorInput: input,
    cosechador: null,
    limpiarResultado: () => {},
    mostrarResultado: (mensaje) => mensajes.push(mensaje),
    buscarCosechador: (dni) => {
      busquedas++
      return buscar(dni)
    },
    nombreCosechadorVisible: (nombre) => nombre,
    nombreCosechador: {},
    campaniaCosechador: {},
    infoCosechador: { classList: { remove() {} } },
    desactivarTecladoManual: () => {},
    habilitarTicket: () => habilitaciones++,
    deshabilitarTicket: () => {}
  })
  return {
    form,
    input,
    mensajes,
    busquedas: () => busquedas,
    habilitaciones: () => habilitaciones
  }
}

for (const valor of [
  '17480378',
  '17480378\r',
  '17480378\n',
  '17480378\t',
  '01748037'
]) {
  test(`ASIGNAR TICKETS continúa sin error con ${JSON.stringify(valor)} y Enter`, async () => {
    const vista = asignacionSimulada()
    vista.input.value = valor
    vista.input.emitir('keydown', { key: 'Enter' })
    vista.form.emitir('submit')
    await siguienteTurno()
    assert.deepEqual(vista.mensajes, [])
    assert.equal(vista.busquedas(), 1)
    assert.equal(vista.habilitaciones(), 1)
  })
}

test('ASIGNAR TICKETS no valida los siete dígitos anteriores al último input', async () => {
  const vista = asignacionSimulada()
  vista.input.value = '1748037'
  vista.input.emitir('keydown', { key: 'Enter' })
  vista.input.value = '17480378'
  await siguienteTurno()
  assert.deepEqual(vista.mensajes, [])
  assert.equal(vista.habilitaciones(), 1)
})

test('ASIGNAR TICKETS mantiene la validación y permite corregir un DNI inválido', async () => {
  const vista = asignacionSimulada()
  vista.input.value = '1748037'
  vista.input.emitir('keydown', { key: 'Enter' })
  await siguienteTurno()
  assert.deepEqual(vista.mensajes, ['El DNI debe contener 8 dígitos.'])
  assert.equal(vista.busquedas(), 0)
  vista.input.value = '17480378'
  vista.input.emitir('keydown', { key: 'Enter' })
  await siguienteTurno()
  assert.equal(vista.busquedas(), 1)
})

test('ASIGNAR TICKETS rechaza nueve dígitos y letras antes de buscar', async () => {
  for (const dni of ['174803789', '1748A378']) {
    const vista = asignacionSimulada()
    vista.input.value = dni
    vista.input.emitir('keydown', { key: 'Enter' })
    await siguienteTurno()
    assert.deepEqual(vista.mensajes, ['El DNI debe contener 8 dígitos.'])
    assert.equal(vista.busquedas(), 0)
  }
})

test('ASIGNAR TICKETS permite reintentar después de un error de búsqueda', async () => {
  const vista = asignacionSimulada(async () => {
    throw new Error('Error local')
  })
  vista.input.value = '17480378'
  vista.form.emitir('submit')
  await siguienteTurno()
  assert.deepEqual(vista.mensajes, ['Error local'])
  vista.form.emitir('submit')
  await siguienteTurno()
  assert.equal(vista.busquedas(), 2)
})

test('los seis inputs de scanner comparten la ruta Enter/submit', () => {
  for (const [form, input] of [
    ['formLogin', 'dniOperadorInput'],
    ['formCosechador', 'dniCosechadorInput'],
    ['formTicket', 'codigoTicketInput'],
    ['formJabero', 'dniJaberoInput'],
    ['formIniciarLectura', 'dniJaberoLectura'],
    ['formLecturaTicket', 'ticketLectura']
  ]) {
    assert.ok(main.includes(`configurarEnvioScanner(${form}, ${input},`), input)
    assert.ok(!main.includes(`${form}.addEventListener('submit'`), form)
  }
})

test('el login no muestra el logo SCC', () => {
  const login = html.slice(
    html.indexOf('<section id="vista-login"'),
    html.indexOf('<section id="vista-menu"')
  )
  assert.doesNotMatch(login, /marca-scc|marca-scc__simbolo/)
  assert.match(login, /Sistema de Control de Cosecha/)
})

test('los inputs DNI no truncan escaneos inválidos a ocho dígitos', () => {
  for (const id of [
    'dni-operador',
    'dni-cosechador',
    'dni-jabero',
    'dni-jabero-lectura'
  ]) {
    const input = html.match(new RegExp(`<input\\s+id="${id}"[\\s\\S]*?/>`))?.[0]
    assert.ok(input, id)
    assert.doesNotMatch(input, /maxlength=/)
  }
})
