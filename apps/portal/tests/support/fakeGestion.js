import { AccesoDenegado } from '../../../../src/contexts/identity-access/index.js'
export function fakeGestion(ports) {
  const campaigns = {},
    workers = {},
    varieties = {},
    lots = {},
    participations = {}
  const cultivos = [
    { id: 'arandano', nombre: 'Arándanos', activo: true },
    { id: 'mandarina', nombre: 'Mandarina', activo: true }
  ]
  for (const t of ports.empresas) {
    campaigns[t] = [
      {
        id: t + '-camp',
        tenantId: t,
        codigo: 'C-' + t,
        nombre: 'Campaña ' + t,
        cultivoId: 'arandano',
        cultivo: 'Arándanos',
        fechaInicio: '2026-01-01',
        fechaFin: null,
        estado: 'ACTIVA'
      }
    ]
    workers[t] = [
      {
        id: t + '-worker',
        tenantId: t,
        dni: '12345678',
        nombres: 'Personal ' + t,
        apellidos: 'Agrícola',
        activo: true
      }
    ]
    varieties[t] = [{ id: t + '-var', nombre: 'Variedad ' + t, activo: true }]
    lots[t] = [
      {
        id: t + '-lote',
        codigo: 'L-' + t,
        nombre: 'Operativo ' + t,
        activo: true,
        variedadIds: [t + '-var']
      }
    ]
    participations[t] = []
  }
  const copy = structuredClone
  const guard = (t, tipo) => {
    ports.calls.push([tipo, t])
    if (
      !ports.permisos[t]?.includes(
        tipo === 'campaign' ? 'campaign.manage' : 'workforce.manage'
      ) ||
      !ports.modulos[t]?.includes(tipo === 'campaign' ? 'CAMPAIGN' : 'WORKFORCE')
    )
      throw new AccesoDenegado('Gestión denegada.')
  }
  const get = (lista, t, id) => {
    const row = lista[t].find((x) => x.id === id)
    if (!row) throw new AccesoDenegado('Recurso de otra empresa.')
    return row
  }
  ports.campaign = {
    async listar(t, f) {
      guard(t, 'campaign')
      const a = campaigns[t].filter(
        (c) =>
          (c.codigo + ' ' + c.nombre).includes(f.busqueda) &&
          (!f.estado || c.estado === f.estado) &&
          (!f.cultivoId || c.cultivoId === f.cultivoId)
      )
      return copy({ campanias: a.slice(f.offset, f.offset + 50), total: a.length })
    },
    async obtener(t, id) {
      guard(t, 'campaign')
      return copy(get(campaigns, t, id))
    },
    async cultivos(t) {
      guard(t, 'campaign')
      return copy(cultivos)
    },
    async crear(t, d) {
      guard(t, 'campaign')
      ports.calls.push(['crearCamp', t, d])
      const c = {
        id: t + '-nueva',
        tenantId: t,
        ...d,
        cultivo: cultivos.find((c) => c.id === d.cultivoId).nombre
      }
      campaigns[t].push(c)
      return copy(c)
    },
    async editar(t, id, d) {
      guard(t, 'campaign')
      ports.calls.push(['editarCamp', t, id, d])
      return copy(Object.assign(get(campaigns, t, id), d))
    },
    async activar(t, id) {
      guard(t, 'campaign')
      return copy(
        Object.assign(get(campaigns, t, id), { estado: 'ACTIVA', fechaFin: null })
      )
    },
    async cerrar(t, id, fecha) {
      guard(t, 'campaign')
      return copy(
        Object.assign(get(campaigns, t, id), {
          estado: 'CERRADA',
          fechaFin: fecha ?? '2026-10-14'
        })
      )
    },
    async variedades(t, c) {
      guard(t, 'campaign')
      get(campaigns, t, c)
      return copy(varieties[t])
    },
    async guardarVariedad(t, c, d) {
      guard(t, 'campaign')
      get(campaigns, t, c)
      if (d.id) Object.assign(get(varieties, t, d.id), d)
      else varieties[t].push({ ...d, id: t + '-var-nueva' })
      return copy(d)
    },
    async lotes(t, c) {
      guard(t, 'campaign')
      get(campaigns, t, c)
      return copy(lots[t])
    },
    async guardarLote(t, c, d) {
      guard(t, 'campaign')
      get(campaigns, t, c)
      ports.calls.push(['guardarLote', t, c, d])
      if (d.id) return copy(Object.assign(get(lots, t, d.id), d))
      const nuevo = { ...d, id: t + '-lote-nuevo' }
      lots[t].push(nuevo)
      return copy(nuevo)
    },
    async configurarVariedadesLote(t, c, l, ids) {
      guard(t, 'campaign')
      get(campaigns, t, c)
      get(lots, t, l).variedadIds = ids
      return copy(lots[t])
    }
  }
  ports.workforce = {
    async listar(t, f) {
      guard(t, 'workforce')
      const a = workers[t].filter(
        (w) =>
          (w.dni + ' ' + w.nombres + ' ' + w.apellidos).includes(f.busqueda) &&
          (f.activo === null || w.activo === f.activo)
      )
      return copy({ trabajadores: a.slice(f.offset, f.offset + 50), total: a.length })
    },
    async obtener(t, id) {
      guard(t, 'workforce')
      return copy(get(workers, t, id))
    },
    async crear(t, d) {
      guard(t, 'workforce')
      ports.calls.push(['crearWorker', t, d])
      if (workers[t].some((w) => w.dni === d.dni)) throw new Error('DNI duplicado.')
      const w = { id: t + '-nuevo', tenantId: t, activo: true, ...d }
      workers[t].push(w)
      return copy(w)
    },
    async editar(t, id, d) {
      guard(t, 'workforce')
      ports.calls.push(['editarWorker', t, id, d])
      return copy(Object.assign(get(workers, t, id), d))
    },
    async activar(t, id) {
      guard(t, 'workforce')
      return copy(Object.assign(get(workers, t, id), { activo: true }))
    },
    async desactivar(t, id) {
      guard(t, 'workforce')
      return copy(Object.assign(get(workers, t, id), { activo: false }))
    },
    async catalogo(t) {
      guard(t, 'workforce')
      return copy({ campanias: campaigns[t], roles: ['SUPERVISORA', 'COSECHADOR'] })
    },
    async participaciones(t, id) {
      guard(t, 'workforce')
      get(workers, t, id)
      return copy(participations[t].filter((p) => p.trabajadorId === id))
    },
    async habilitarJaberoDelDia(t, id, c) {
      guard(t, 'workforce')
      get(workers, t, id)
      get(campaigns, t, c)
      ports.calls.push(['jornadaJabero', t, id, c])
      let p = participations[t].find(
        (p) => p.trabajadorId === id && p.campaniaId === c && p.rol === 'JABERO'
      )
      if (!p) {
        p = {
          id: t + '-jabero',
          trabajadorId: id,
          campaniaId: c,
          campania: 'C-' + t,
          rol: 'JABERO',
          administrable: false
        }
        participations[t].push(p)
      }
      p.activo = true
      p.fechaJabero = '2026-10-14'
      return copy(participations[t])
    },
    async retirarJabero(t, id, c) {
      guard(t, 'workforce')
      get(workers, t, id)
      get(campaigns, t, c)
      const p = participations[t].find(
        (p) => p.trabajadorId === id && p.campaniaId === c && p.rol === 'JABERO'
      )
      p.activo = false
      return copy(participations[t])
    },
    async asignarRol(t, id, c, r) {
      guard(t, 'workforce')
      get(workers, t, id)
      const camp = get(campaigns, t, c),
        p = participations[t].find(
          (p) => p.trabajadorId === id && p.campaniaId === c && p.rol === r
        )
      if (p) p.activo = true
      else
        participations[t].push({
          id: crypto.randomUUID(),
          trabajadorId: id,
          campaniaId: c,
          campania: camp.codigo,
          rol: r,
          activo: true,
          administrable: true
        })
      return copy(participations[t])
    },
    async retirarRol(t, id, c, r) {
      guard(t, 'workforce')
      get(workers, t, id)
      participations[t].find(
        (p) => p.trabajadorId === id && p.campaniaId === c && p.rol === r
      ).activo = false
      return copy(participations[t])
    }
  }
  return { campaigns, workers, varieties, lots, participations }
}
