import { openDB } from 'idb'
import { evaluarDescarteOperacion } from './cola.js'

const DB_NAME = 'scc'
const DB_VERSION = 3

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, _newVersion, transaction) {
    if (!db.objectStoreNames.contains('meta')) {
      db.createObjectStore('meta')
    }

    if (!db.objectStoreNames.contains('operadores')) {
      db.createObjectStore('operadores', { keyPath: 'dni' })
    }

    if (!db.objectStoreNames.contains('trabajadores')) {
      db.createObjectStore('trabajadores', { keyPath: 'dni' })
    }

    if (!db.objectStoreNames.contains('lotes')) {
      db.createObjectStore('lotes', { keyPath: 'lote_id' })
    }

    if (!db.objectStoreNames.contains('tickets')) {
      db.createObjectStore('tickets', { keyPath: 'codigo_ticket' })
    }

    if (!db.objectStoreNames.contains('cola')) {
      const cola = db.createObjectStore('cola', { keyPath: 'id' })
      cola.createIndex('estado', 'estado')
      cola.createIndex('creado_en', 'creado_en')
    }

    if (!db.objectStoreNames.contains('sesiones')) {
      const sesiones = db.createObjectStore('sesiones', { keyPath: 'id' })
      sesiones.createIndex('estado', 'estado')
    }

    if (!db.objectStoreNames.contains('lecturas')) {
      const lecturas = db.createObjectStore('lecturas', { keyPath: 'id' })
      lecturas.createIndex('sesion_id', 'sesion_id')
      lecturas.createIndex('estado_sync', 'estado_sync')
    }
    if (oldVersion < 3) {
      const sesiones = transaction.objectStore('sesiones')
      if (!sesiones.indexNames.contains('dni_operador')) {
        sesiones.createIndex('dni_operador', 'dni_operador')
      }
    }
  }
})

// ============================================================
// OPERADORES
// ============================================================

export async function guardarOperador(operador) {
  const db = await dbPromise

  await db.put('operadores', operador)
}

export async function obtenerOperador(dni) {
  const db = await dbPromise

  return db.get('operadores', dni)
}

// ============================================================
// GUARDAR CACHÉ COMPLETO
// ============================================================

export async function guardarCache(cache) {
  const db = await dbPromise

  const tx = db.transaction(['meta', 'trabajadores', 'lotes', 'tickets', 'cola'], 'readwrite')

  await tx.objectStore('meta').put(cache.campania, 'campania_activa')

  await tx.objectStore('meta').put(cache.sincronizado_en, 'ultima_sync')

  const trabajadoresStore = tx.objectStore('trabajadores')

  const lotesStore = tx.objectStore('lotes')

  const ticketsStore = tx.objectStore('tickets')
  const ticketsLocales = await ticketsStore.getAll()
  const ticketsLocalesPorCodigo = new Map(
    ticketsLocales.map((ticket) => [ticket.codigo_ticket, ticket])
  )
  const ticketsPendientes = ticketsLocales.filter(
    (ticket) => ticket.estado_sync !== 'SINCRONIZADO'
  )
  const trabajadoresLocales = await trabajadoresStore.getAll()
  const rolesLocales = trabajadoresLocales.filter((trabajador) =>
    ['PENDIENTE', 'ERROR', 'SINCRONIZADO'].includes(trabajador.estado_sync_jabero)
  )
  const operacionesLocales = await tx.objectStore('cola').getAll()
  const dnisCosechadoresPendientes = new Set(
    operacionesLocales
      .filter(
        (operacion) =>
          operacion.tipo === 'ASIGNAR_TICKET' &&
          ['PENDIENTE', 'ERROR'].includes(operacion.estado) &&
          operacion.payload?.dniCosechador
      )
      .map((operacion) => operacion.payload.dniCosechador)
  )
  const cosechadoresProvisionales = trabajadoresLocales.filter(
    (trabajador) =>
      dnisCosechadoresPendientes.has(trabajador.dni) &&
      trabajador.roles?.includes('COSECHADOR')
  )

  await trabajadoresStore.clear()
  await lotesStore.clear()
  await ticketsStore.clear()

  for (const trabajador of cache.trabajadores) {
    await trabajadoresStore.put(trabajador)
  }
  for (const local of cosechadoresProvisionales) {
    const actual = await trabajadoresStore.get(local.dni)
    if (!actual) {
      await trabajadoresStore.put(local)
      continue
    }

    actual.roles = [...new Set([...(actual.roles ?? []), 'COSECHADOR'])]
    if (!String(actual.nombre ?? '').trim()) {
      actual.nombre =
        String(local.nombre ?? '').trim() || `DNI ${String(local.dni ?? '').trim()}`
    }
    if (!String(actual.nombre ?? '').startsWith('DNI ')) {
      delete actual.provisional_local
    } else if (local.provisional_local) {
      actual.provisional_local = true
    }
    await trabajadoresStore.put(actual)
  }
  for (const local of rolesLocales) {
    const actual = await trabajadoresStore.get(local.dni)
    if (actual) {
      if (local.estado_sync_jabero === 'SINCRONIZADO') continue
      if (local.estado_sync_jabero === 'PENDIENTE') {
        actual.roles = [...new Set([...(actual.roles ?? []), 'JABERO'])]
      } else {
        actual.roles = (actual.roles ?? []).filter((rol) => rol !== 'JABERO')
      }
      actual.estado_sync_jabero = local.estado_sync_jabero
      actual.operacion_jabero_id = local.operacion_jabero_id
      await trabajadoresStore.put(actual)
    }
  }

  for (const lote of cache.lotes) {
    await lotesStore.put(lote)
  }

  for (const ticket of cache.tickets) {
    const ticketLocal = ticketsLocalesPorCodigo.get(ticket.codigo_ticket)
    await ticketsStore.put({
      ...ticket,
      fecha_asignacion:
        ticket.fecha_asignacion ?? ticketLocal?.fecha_asignacion ?? null,
      estado_sync: 'SINCRONIZADO'
    })
  }

  for (const ticket of ticketsPendientes) {
    await ticketsStore.put(ticket)
  }

  await tx.done
}

// ============================================================
// CONSULTAS LOCALES
// ============================================================

export async function obtenerTrabajador(dni) {
  const db = await dbPromise

  return db.get('trabajadores', dni)
}

export async function obtenerTrabajadores() {
  const db = await dbPromise

  return db.getAll('trabajadores')
}

export async function agregarRolTrabajador(dni, rol, operacionId = null) {
  const db = await dbPromise
  const trabajador = await db.get('trabajadores', dni)

  if (!trabajador) {
    throw new Error('El trabajador no está disponible en los datos locales.')
  }

  trabajador.roles ??= []

  if (!trabajador.roles.includes(rol)) {
    trabajador.roles.push(rol)
  }
  if (rol === 'JABERO' && operacionId) {
    trabajador.estado_sync_jabero = 'PENDIENTE'
    trabajador.operacion_jabero_id = operacionId
  }

  await db.put('trabajadores', trabajador)

  return trabajador
}

export async function marcarJabero(dni, estado, operacionId) {
  const db = await dbPromise
  const trabajador = await db.get('trabajadores', dni)
  if (!trabajador || trabajador.operacion_jabero_id !== operacionId) return
  trabajador.estado_sync_jabero = estado
  if (estado === 'ERROR') {
    trabajador.roles = (trabajador.roles ?? []).filter((rol) => rol !== 'JABERO')
  } else {
    trabajador.roles = [...new Set([...(trabajador.roles ?? []), 'JABERO'])]
  }
  await db.put('trabajadores', trabajador)
}

export async function obtenerTicket(codigo) {
  const db = await dbPromise

  return db.get('tickets', codigo)
}

export async function obtenerTickets() {
  const db = await dbPromise

  return db.getAll('tickets')
}

export async function guardarTicketLocal({
  codigoTicket,
  cosechadorDni,
  cosechador,
  operacionId,
  fechaAsignacion = new Date().toISOString()
}) {
  const db = await dbPromise

  await db.put('tickets', {
    codigo_ticket: codigoTicket,
    cosechador_dni: cosechadorDni,
    cosechador,
    operacion_id: operacionId,
    estado_sync: 'PENDIENTE',
    fecha_asignacion: fechaAsignacion,
    actualizado_en: new Date().toISOString()
  })
}

export async function marcarTicketSincronizado(codigoTicket) {
  const db = await dbPromise
  const ticket = await db.get('tickets', codigoTicket)

  if (!ticket) {
    return
  }

  ticket.estado_sync = 'SINCRONIZADO'
  ticket.actualizado_en = new Date().toISOString()

  await db.put('tickets', ticket)
}

export async function marcarTicketError(codigoTicket, error) {
  const db = await dbPromise
  const ticket = await db.get('tickets', codigoTicket)

  if (!ticket) {
    return
  }

  ticket.estado_sync = 'ERROR'
  ticket.error = error
  ticket.actualizado_en = new Date().toISOString()

  await db.put('tickets', ticket)
}

export async function eliminarTicketLocal(codigoTicket, operacionId) {
  const db = await dbPromise
  const ticket = await db.get('tickets', codigoTicket)
  if (ticket?.operacion_id === operacionId) await db.delete('tickets', codigoTicket)
}

export async function marcarTicketPendiente(codigoTicket) {
  const db = await dbPromise
  const ticket = await db.get('tickets', codigoTicket)
  if (!ticket) return
  ticket.estado_sync = 'PENDIENTE'
  ticket.error = null
  await db.put('tickets', ticket)
}

export async function obtenerLotes() {
  const db = await dbPromise

  return db.getAll('lotes')
}

export async function obtenerCampaniaActiva() {
  const db = await dbPromise

  return db.get('meta', 'campania_activa')
}

// SESIONES Y LECTURAS LOCALES

export async function guardarSesionLocal(sesion) {
  const db = await dbPromise
  await db.put('sesiones', sesion)
}

export async function obtenerSesionLocal(id) {
  const db = await dbPromise
  return db.get('sesiones', id)
}

async function recuperarDniOperadorSesiones(db, sesiones) {
  const sesionesSinOperador = sesiones.filter((sesion) => !sesion.dni_operador)
  if (!sesionesSinOperador.length) return sesiones

  const operaciones = await db.getAll('cola')
  const operadorPorSesion = new Map(
    operaciones
      .filter(
        (operacion) =>
          operacion.tipo === 'INICIAR_SESION' &&
          operacion.payload?.sesionId &&
          operacion.payload?.dniOperador
      )
      .map((operacion) => [operacion.payload.sesionId, operacion.payload.dniOperador])
  )

  for (const sesion of sesionesSinOperador) {
    const dniOperador = operadorPorSesion.get(sesion.id ?? sesion.sesion_id)
    if (!dniOperador) continue
    sesion.dni_operador = dniOperador
    await db.put('sesiones', sesion)
  }

  return sesiones
}

export async function obtenerSesionesActivas(dniOperador) {
  const db = await dbPromise
  const sesiones = await db.getAllFromIndex('sesiones', 'estado', 'ACTIVA')
  await recuperarDniOperadorSesiones(db, sesiones)
  return sesiones.filter((sesion) => sesion.dni_operador === dniOperador)
}

export async function obtenerSesionesOperador(dniOperador) {
  const db = await dbPromise
  const sesiones = await db.getAll('sesiones')
  await recuperarDniOperadorSesiones(db, sesiones)
  return sesiones.filter((sesion) => sesion.dni_operador === dniOperador)
}

export async function obtenerSesionActivaJabero(dniJabero) {
  const db = await dbPromise
  const sesiones = await db.getAllFromIndex('sesiones', 'estado', 'ACTIVA')
  return sesiones.find((sesion) => sesion.dni_jabero === dniJabero)
}

export async function cerrarSesionLocal(id) {
  const db = await dbPromise
  const sesion = await db.get('sesiones', id)

  if (!sesion) {
    return
  }

  sesion.estado = 'CERRADA'
  sesion.fecha_fin = new Date().toISOString()
  await db.put('sesiones', sesion)
}

export async function guardarLecturaLocal(lectura) {
  const db = await dbPromise
  await db.put('lecturas', lectura)
}

export async function marcarLecturaSincronizada(id) {
  const db = await dbPromise
  const lectura = await db.get('lecturas', id)

  if (!lectura) {
    return
  }

  lectura.estado_sync = 'SINCRONIZADO'
  await db.put('lecturas', lectura)
}

export async function contarLecturasSesion(sesionId) {
  const db = await dbPromise
  return db.countFromIndex('lecturas', 'sesion_id', sesionId)
}

export async function obtenerLecturasSesion(sesionId) {
  const db = await dbPromise
  return db.getAllFromIndex('lecturas', 'sesion_id', sesionId)
}

export async function contarLecturasCosechador(sesionId, dni) {
  const db = await dbPromise
  const lecturas = await db.getAllFromIndex('lecturas', 'sesion_id', sesionId)
  return lecturas.filter((lectura) => lectura.cosechador_dni === dni).length
}

export async function obtenerUltimaLecturaSesion(sesionId) {
  const db = await dbPromise
  const lecturas = await db.getAllFromIndex('lecturas', 'sesion_id', sesionId)
  return lecturas
    .sort((a, b) => (a.fecha_hora ?? '').localeCompare(b.fecha_hora ?? ''))
    .at(-1)
}

// ============================================================
// COLA DE SINCRONIZACIÓN
// ============================================================

export async function agregarOperacion(tipo, payload) {
  const db = await dbPromise
  const tx = db.transaction(['meta', 'cola'], 'readwrite')
  const operacion = await crearOperacionEnTx(tx, tipo, payload)
  await tx.done
  return operacion
}

async function crearOperacionEnTx(tx, tipo, payload) {
  const metaStore = tx.objectStore('meta')
  const ultimoCreadoEn = await metaStore.get('ultimo_creado_en_ms')
  const creadoEnMs = Math.max(Date.now(), (ultimoCreadoEn ?? 0) + 1)

  const operacion = {
    id: crypto.randomUUID(),

    tipo,

    payload,

    estado: 'PENDIENTE',

    intentos: 0,

    error: null,

    creado_en: new Date(creadoEnMs).toISOString()
  }

  await metaStore.put(creadoEnMs, 'ultimo_creado_en_ms')
  await tx.objectStore('cola').put(operacion)
  return operacion
}

export async function guardarAsignacionOffline({
  codigoTicket,
  cosechadorDni,
  cosechador,
  dniOperador,
  fechaAsignacion = new Date().toISOString()
}) {
  const db = await dbPromise
  const tx = db.transaction(['meta', 'cola', 'tickets', 'trabajadores'], 'readwrite')
  if (await tx.objectStore('tickets').get(codigoTicket)) {
    throw new Error('El ticket ya fue asignado.')
  }
  const trabajadoresStore = tx.objectStore('trabajadores')
  const trabajadorActual = await trabajadoresStore.get(cosechadorDni)
  const yaEraCosechador = trabajadorActual?.roles?.includes('COSECHADOR') === true
  const nombreVisible =
    String(cosechador ?? '').trim() || `DNI ${String(cosechadorDni ?? '').trim()}`

  await trabajadoresStore.put({
    ...(trabajadorActual ?? {}),
    dni: cosechadorDni,
    nombre: String(trabajadorActual?.nombre ?? '').trim() || nombreVisible,
    roles: [...new Set([...(trabajadorActual?.roles ?? []), 'COSECHADOR'])],
    activo: trabajadorActual?.activo ?? true,
    provisional_local: yaEraCosechador
      ? trabajadorActual?.provisional_local === true
      : true
  })

  const operacion = await crearOperacionEnTx(tx, 'ASIGNAR_TICKET', {
    dniOperador,
    dniCosechador: cosechadorDni,
    codigoTicket
  })
  await tx.objectStore('tickets').put({
    codigo_ticket: codigoTicket,
    cosechador_dni: cosechadorDni,
    cosechador,
    operacion_id: operacion.id,
    estado_sync: 'PENDIENTE',
    fecha_asignacion: fechaAsignacion,
    actualizado_en: new Date().toISOString()
  })
  await tx.done
  return operacion
}

export async function registrarJaberoOffline(dniOperador, dniTrabajador) {
  const db = await dbPromise
  const tx = db.transaction(['meta', 'cola', 'trabajadores'], 'readwrite')
  const trabajador = await tx.objectStore('trabajadores').get(dniTrabajador)
  if (
    !trabajador ||
    trabajador.roles?.includes('JABERO') ||
    trabajador.estado_sync_jabero === 'ERROR'
  ) {
    throw new Error(
      'El jabero no está disponible para registrar. Revise su estado de sincronización.'
    )
  }
  const operacion = await crearOperacionEnTx(tx, 'REGISTRAR_JABERO', {
    dniOperador,
    dniTrabajador
  })
  trabajador.roles = [...(trabajador.roles ?? []), 'JABERO']
  trabajador.estado_sync_jabero = 'PENDIENTE'
  trabajador.operacion_jabero_id = operacion.id
  await tx.objectStore('trabajadores').put(trabajador)
  await tx.done
  return operacion
}

export async function iniciarSesionOffline(sesion, dniOperador) {
  const db = await dbPromise
  const tx = db.transaction(['meta', 'cola', 'sesiones'], 'readwrite')
  const activas = await tx.objectStore('sesiones').index('estado').getAll('ACTIVA')
  if (activas.some((actual) => actual.dni_jabero === sesion.dni_jabero)) {
    throw new Error('El jabero ya tiene una sesión activa. Continúe esa sesión.')
  }
  const operacion = await crearOperacionEnTx(tx, 'INICIAR_SESION', {
    dniOperador,
    dniJabero: sesion.dni_jabero,
    loteId: sesion.lote_id,
    sesionId: sesion.id
  })
  await tx.objectStore('sesiones').put(sesion)
  await tx.done
  return operacion
}

export async function registrarLecturaOffline(lectura, dniOperador) {
  const db = await dbPromise
  const tx = db.transaction(['meta', 'cola', 'lecturas', 'sesiones'], 'readwrite')
  const sesion = await tx.objectStore('sesiones').get(lectura.sesion_id)
  if (!sesion || sesion.estado !== 'ACTIVA') {
    throw new Error('La sesión de lectura ya no está activa.')
  }
  const operacion = await crearOperacionEnTx(tx, 'REGISTRAR_JABA', {
    dniOperador,
    sesionId: lectura.sesion_id,
    codigoTicket: lectura.codigo_ticket,
    lecturaId: lectura.id,
    fechaHora: lectura.fecha_hora
  })
  await tx.objectStore('lecturas').put(lectura)
  await tx.done
  return operacion
}

export async function finalizarSesionOffline(sesionId, dniOperador) {
  const db = await dbPromise
  const tx = db.transaction(['meta', 'cola', 'sesiones'], 'readwrite')
  const sesion = await tx.objectStore('sesiones').get(sesionId)
  if (!sesion || sesion.estado !== 'ACTIVA') {
    throw new Error('La sesión ya fue finalizada.')
  }
  const operacion = await crearOperacionEnTx(tx, 'CERRAR_SESION', {
    dniOperador,
    sesionId
  })
  sesion.estado = 'CERRADA'
  sesion.fecha_fin = new Date().toISOString()
  await tx.objectStore('sesiones').put(sesion)
  await tx.done
  return operacion
}

export async function obtenerOperacionesPendientes() {
  const db = await dbPromise

  return db.getAllFromIndex('cola', 'estado', 'PENDIENTE')
}

export async function existeTicketPendiente(codigoTicket) {
  const db = await dbPromise
  const operaciones = await db.getAll('cola')

  return operaciones.some(
    (operacion) =>
      operacion.tipo === 'ASIGNAR_TICKET' &&
      operacion.estado !== 'ERROR' &&
      operacion.payload.codigoTicket === codigoTicket
  )
}

export async function actualizarOperacion(operacion) {
  const db = await dbPromise

  await db.put('cola', operacion)
}

export async function eliminarOperacion(id) {
  const db = await dbPromise

  await db.delete('cola', id)
}

export async function contarPendientes() {
  const db = await dbPromise

  const pendientes = await db.getAllFromIndex('cola', 'estado', 'PENDIENTE')

  return pendientes.length
}

export async function contarErrores() {
  const db = await dbPromise
  const errores = await db.getAllFromIndex('cola', 'estado', 'ERROR')

  return errores.length
}

export async function obtenerColaCompleta() {
  const db = await dbPromise

  return db.getAll('cola')
}

export async function marcarOperacionSincronizada(id) {
  const db = await dbPromise

  const operacion = await db.get('cola', id)

  if (!operacion) {
    return
  }

  operacion.estado = 'SINCRONIZADA'
  operacion.error = null
  operacion.sincronizado_en = new Date().toISOString()

  await db.put('cola', operacion)
}

export async function marcarOperacionError(id, error) {
  const db = await dbPromise

  const operacion = await db.get('cola', id)

  if (!operacion) {
    return
  }

  operacion.estado = 'ERROR'
  operacion.error = error
  operacion.intentos = (operacion.intentos ?? 0) + 1

  await db.put('cola', operacion)
}

export async function marcarOperacionTemporal(id, error) {
  const db = await dbPromise
  const operacion = await db.get('cola', id)
  if (!operacion) return
  operacion.estado = 'PENDIENTE'
  operacion.error = error
  operacion.intentos = (operacion.intentos ?? 0) + 1
  await db.put('cola', operacion)
}

export async function reintentarOperacion(id) {
  const db = await dbPromise
  const operacion = await db.get('cola', id)
  if (!operacion || operacion.estado !== 'ERROR') return false
  operacion.estado = 'PENDIENTE'
  operacion.error = null
  await db.put('cola', operacion)
  if (operacion.tipo === 'ASIGNAR_TICKET') {
    await marcarTicketPendiente(operacion.payload.codigoTicket)
  }
  if (operacion.tipo === 'REGISTRAR_JABERO') {
    await marcarJabero(operacion.payload.dniTrabajador, 'PENDIENTE', id)
  }
  return true
}

export async function descartarOperacion(id) {
  const db = await dbPromise
  const operaciones = await db.getAll('cola')
  const operacion = operaciones.find((item) => item.id === id)
  if (!evaluarDescarteOperacion(operacion, operaciones).permitido) return false
  if (operacion.tipo === 'ASIGNAR_TICKET') {
    await eliminarTicketLocal(operacion.payload.codigoTicket, id)
  } else {
    const trabajador = await db.get('trabajadores', operacion.payload.dniTrabajador)
    if (trabajador?.operacion_jabero_id === id) {
      delete trabajador.estado_sync_jabero
      delete trabajador.operacion_jabero_id
      await db.put('trabajadores', trabajador)
    }
  }
  await db.delete('cola', id)
  return true
}

export async function limpiarOperacionesSincronizadas(dias = 30) {
  const db = await dbPromise
  const limite = Date.now() - dias * 86400000
  const tx = db.transaction(['cola', 'sesiones'], 'readwrite')
  const activas = new Set(
    (await tx.objectStore('sesiones').index('estado').getAll('ACTIVA')).map(
      (sesion) => sesion.id
    )
  )
  const cola = tx.objectStore('cola')
  let eliminadas = 0
  for (const operacion of await cola.getAll()) {
    if (
      operacion.estado === 'SINCRONIZADA' &&
      Date.parse(operacion.sincronizado_en) < limite &&
      !(operacion.tipo === 'INICIAR_SESION' && activas.has(operacion.payload.sesionId))
    ) {
      await cola.delete(operacion.id)
      eliminadas += 1
    }
  }
  await tx.done
  return eliminadas
}

export async function reintentarErrores() {
  const db = await dbPromise

  const operaciones = await db.getAll('cola')

  for (const operacion of operaciones) {
    if (operacion.estado === 'ERROR') {
      await reintentarOperacion(operacion.id)
    }
  }
}
