import { AccesoDenegado } from '../../../../src/contexts/identity-access/index.js'
export function fakeCutover(ports) {
  const cortes = {}
  async function guard(t, c) {
    const u = await ports.acceso.resolverContexto(t)
    if (!u.permisos.includes('company.manage'))
      throw new AccesoDenegado('Permiso requerido')
    if (c !== t + '-camp') throw new AccesoDenegado('Campaña de otra empresa')
  }
  ports.cutoverAdministrativo = {
    async consultar(t, c) {
      await guard(t, c)
      return structuredClone({
        tenantId: t,
        campaniaId: c,
        autoridad: cortes[c] ? 'PORTAL' : 'TRANSICION_SHEETS',
        corte: cortes[c] ?? null
      })
    },
    async activar(t, d) {
      await guard(t, d.campaniaId)
      ports.calls.push(['activarAdmin', t, d])
      if (cortes[d.campaniaId] && cortes[d.campaniaId].operacion_id !== d.operacionId)
        throw new Error('Cutover existente')
      cortes[d.campaniaId] = {
        operacion_id: d.operacionId,
        actor_usuario_id: 'U',
        activado_en: '2026-10-14T15:00:00Z',
        motivo: d.motivo
      }
      return ports.cutoverAdministrativo.consultar(t, d.campaniaId)
    }
  }
  return cortes
}
