export function crearCutoverAdministrativoAdapter(consultar) {
  return Object.freeze({
    consultar: (t, c) =>
      consultar('platform_cutover_admin_consultar', {
        p_tenant_id: t,
        p_campania_id: c
      }),
    activar: (t, d) =>
      consultar('platform_cutover_admin_activar', {
        p_tenant_id: t,
        p_campania_id: d.campaniaId,
        p_operacion_id: d.operacionId,
        p_motivo: d.motivo,
        p_pendientes_revisados: d.pendientesRevisados
      })
  })
}
