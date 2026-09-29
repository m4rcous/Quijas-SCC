import { openDB } from 'idb'

const DB_NAME = 'scc'
const DB_VERSION = 2

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
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

  const tx = db.transaction(['meta', 'trabajadores', 'lotes', 'tickets'], 'readwrite')

  await tx.objectStore('meta').put(cache.campania, 'campania_activa')

  await tx.objectStore('meta').put(cache.sincronizado_en, 'ultima_sync')

  const trabajadoresStore = tx.objectStore('trabajadores')

  const lotesStore = tx.objectStore('lotes')

  const ticketsStore = tx.objectStore('tickets')
  const ticketsLocales = await ticketsStore.getAll()
  const ticketsPendientes = ticketsLocales.filter(
    (ticket) => ticket.estado_sync === 'PENDIENTE'
  )

  await trabajadoresStore.clear()
  await lotesStore.clear()
  await ticketsStore.clear()

  for (const trabajador of cache.trabajadores) {
    await trabajadoresStore.put(trabajador)
  }

  for (const lote of cache.lotes) {
    await lotesStore.put(lote)
  }

  for (const ticket of cache.tickets) {
    await ticketsStore.put({
      ...ticket,
      estado_sync: 'SINCRONIZADO'
    })
  }

  for (const ticket of ticketsPendientes) {
    const existente = await ticketsStore.get(ticket.codigo_ticket)

    if (!existente) {
      await ticketsStore.put(ticket)
    }
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

export async function agregarRolTrabajador(dni, rol) {
  const db = await dbPromise
  const trabajador = await db.get('trabajadores', dni)

  if (!trabajador) {
    throw new Error('El trabajador no está disponible en los datos locales.')
  }

  trabajador.roles ??= []

  if (!trabajador.roles.includes(rol)) {
    trabajador.roles.push(rol)
  }

  await db.put('trabajadores', trabajador)

  return trabajador
}

export async function obtenerTicket(codigo) {
  const db = await dbPromise

  return db.get('tickets', codigo)
}

export async function guardarTicketLocal({
  codigoTicket,
  cosechadorDni,
  cosechador,
  operacionId
}) {
  const db = await dbPromise

  await db.put('tickets', {
    codigo_ticket: codigoTicket,
    cosechador_dni: cosechadorDni,
    cosechador,
    operacion_id: operacionId,
    estado_sync: 'PENDIENTE',
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

export async function contarLecturasCosechador(sesionId, dni) {
  const db = await dbPromise
  const lecturas = await db.getAllFromIndex('lecturas', 'sesion_id', sesionId)
  return lecturas.filter((lectura) => lectura.cosechador_dni === dni).length
}

// ============================================================
// COLA DE SINCRONIZACIÓN
// ============================================================

export async function agregarOperacion(tipo, payload) {
  const db = await dbPromise
  const tx = db.transaction(['meta', 'cola'], 'readwrite')
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
  operacion.intentos += 1

  await db.put('cola', operacion)
}

export async function reintentarErrores() {
  const db = await dbPromise

  const operaciones = await db.getAll('cola')

  for (const operacion of operaciones) {
    if (operacion.estado === 'ERROR') {
      operacion.estado = 'PENDIENTE'
      operacion.error = null

      await db.put('cola', operacion)
    }
  }
}
