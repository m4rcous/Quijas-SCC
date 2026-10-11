let campaniaId = ''
export const obtenerContextoCampania = () => campaniaId
export const establecerContextoCampania = (id) => {
  campaniaId = id ?? ''
}

const claves = { trabajadores: 'dni', tickets: 'codigo_ticket' }
const particionados = new Set(['trabajadores', 'tickets', 'lotes'])

// Cada transacción captura su contexto; una respuesta tardía no escribe en
// la campaña que el usuario haya abierto mientras tanto.
export function conCampania(db, id = obtenerContextoCampania()) {
  const store = (original, nombre) => {
    if (!particionados.has(nombre)) return original
    const key = (valor) => (claves[nombre] ? [id, valor] : valor)
    return new Proxy(original, {
      get(target, prop) {
        if (prop === 'get' || prop === 'delete')
          return (valor) => target[prop](key(valor))
        if (prop === 'put' || prop === 'add')
          return (valor) => target[prop]({ ...valor, campania_id: id })
        if (prop === 'getAll')
          return async () =>
            (await target.getAll()).filter((fila) => (fila.campania_id ?? '') === id)
        if (prop === 'clear')
          return async () => {
            for (const fila of await target.getAll()) {
              if ((fila.campania_id ?? '') === id)
                await target.delete(
                  claves[nombre] ? [id, fila[claves[nombre]]] : fila.lote_id
                )
            }
          }
        const value = target[prop]
        return typeof value === 'function' ? value.bind(target) : value
      }
    })
  }
  return new Proxy(db, {
    get(target, prop) {
      if (prop === 'campaniaId') return id
      if (prop === 'conCampania') return (otroId) => conCampania(target, otroId)
      if (prop === 'transaction')
        return (...args) => {
          const tx = target.transaction(...args)
          return new Proxy(tx, {
            get(original, campo) {
              if (campo === 'campaniaId') return id
              if (campo === 'objectStore')
                return (nombre) => store(original.objectStore(nombre), nombre)
              const value = original[campo]
              return typeof value === 'function' ? value.bind(original) : value
            }
          })
        }
      if (['get', 'getAll', 'put', 'add', 'delete', 'clear'].includes(prop)) {
        return async (nombre, ...args) => {
          if (!particionados.has(nombre)) return target[prop](nombre, ...args)
          const tx = target.transaction(
            nombre,
            ['get', 'getAll'].includes(prop) ? 'readonly' : 'readwrite'
          )
          const result = await store(tx.objectStore(nombre), nombre)[prop](...args)
          await tx.done
          return result
        }
      }
      const value = target[prop]
      return typeof value === 'function' ? value.bind(target) : value
    }
  })
}

export async function migrarCampaniasLocales(db, tx) {
  const campania = await tx.objectStore('meta').get('campania_activa')
  const id = campania?.id ?? campania?.campania_id ?? ''
  for (const [nombre, campo] of Object.entries(claves)) {
    const original = tx.objectStore(nombre)
    if (Array.isArray(original.keyPath)) continue
    const filas = await original.getAll()
    db.deleteObjectStore(nombre)
    const nuevo = db.createObjectStore(nombre, { keyPath: ['campania_id', campo] })
    for (const fila of filas)
      await nuevo.put({ ...fila, campania_id: fila.campania_id ?? id })
  }
  for (const nombre of ['lotes', 'sesiones', 'lecturas']) {
    const original = tx.objectStore(nombre)
    for (const fila of await original.getAll()) {
      await original.put({ ...fila, campania_id: fila.campania_id ?? id })
    }
  }
  const cola = tx.objectStore('cola')
  for (const op of await cola.getAll()) {
    await cola.put({
      ...op,
      payload: { ...op.payload, campaniaId: op.payload.campaniaId ?? id }
    })
  }
  if (id) await tx.objectStore('meta').put(campania, `campania:${id}`)
}
