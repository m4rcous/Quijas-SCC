import { AccesoDenegado } from '../../../../src/contexts/identity-access/index.js'
export function fakeFarm(ports) {
  const rows = {},
    links = {},
    copy = structuredClone
  for (const t of ports.empresas) {
    rows[t] = { fundos: [], sectores: [], parcelas: [] }
    links[t] = {}
    for (const [tipo, id, padreId] of [
      ['fundos', t + '-f', null],
      ['sectores', t + '-s', t + '-f'],
      ['parcelas', t + '-p', t + '-s']
    ])
      rows[t][tipo].push({
        id,
        tenantId: t,
        codigo: tipo[0].toUpperCase() + '-' + t,
        nombre: 'Nombre ' + tipo + ' ' + t,
        activo: true,
        habilitado: true,
        padreId
      })
  }
  const guard = (t, permiso) => {
    if (
      !ports.empresas.includes(t) ||
      !ports.permisos[t]?.includes(permiso) ||
      !ports.modulos[t]?.includes('FARM_STRUCTURE')
    )
      throw new AccesoDenegado('Gestión física denegada.')
  }
  const get = (t, k, id) => {
    const r = rows[t][k].find((x) => x.id === id)
    if (!r) throw new AccesoDenegado('Recurso de otra empresa.')
    return r
  }
  ports.estructuraAgricola = {
    async listar(t, k, f) {
      guard(t, 'farm.manage')
      const a = rows[t][k].filter(
        (x) =>
          (x.codigo + ' ' + x.nombre)
            .toLowerCase()
            .includes(f.busqueda.toLowerCase()) &&
          (f.activo === null || f.activo === x.activo) &&
          (!f.padreId || f.padreId === x.padreId)
      )
      return copy({ filas: a.slice(f.offset, f.offset + 50), total: a.length })
    },
    async guardar(t, k, d) {
      guard(t, 'farm.manage')
      ports.calls.push(['farmGuardar', t, k, d])
      const r = d.id
        ? get(t, k, d.id)
        : { id: t + '-' + k + '-' + rows[t][k].length, tenantId: t }
      Object.assign(r, d, { id: r.id, habilitado: d.activo })
      if (!d.id) rows[t][k].push(r)
      return copy(r)
    },
    async estado(t, k, id, activo) {
      guard(t, 'farm.manage')
      Object.assign(get(t, k, id), { activo, habilitado: activo })
      return copy(get(t, k, id))
    }
  }
  const consultar = (t, c, l) => {
    guard(t, 'campaign.manage')
    if (c !== t + '-camp' || l !== t + '-lote')
      throw new AccesoDenegado('Lote de otra empresa.')
    return links[t][l] ?? []
  }
  ports.parcelasCampania = {
    async opciones(t, q) {
      guard(t, 'campaign.manage')
      return copy(
        rows[t].parcelas.filter(
          (x) => x.habilitado && (x.codigo + ' ' + x.nombre).includes(q)
        )
      )
    },
    async listar(t, c, l) {
      return copy(consultar(t, c, l))
    },
    async vincular(t, c, l, p) {
      const a = consultar(t, c, l),
        r = get(t, 'parcelas', p),
        existente = a.find((x) => x.id === p)
      if (existente) existente.vinculoActivo = true
      else a.push({ ...r, vinculoActivo: true })
      links[t][l] = a
      return copy(a)
    },
    async desvincular(t, c, l, p) {
      const r = consultar(t, c, l).find((x) => x.id === p)
      if (!r) throw new AccesoDenegado('Vínculo de otra empresa.')
      r.vinculoActivo = false
      return copy(links[t][l])
    }
  }
  return { rows, links }
}
