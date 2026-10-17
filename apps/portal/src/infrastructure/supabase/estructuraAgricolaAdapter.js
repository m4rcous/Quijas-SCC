export function crearEstructuraAgricolaAdapters(consultar) {
  const datos = (t, k) => ({ p_tenant_id: t, p_tipo: k })
  const vinculo = (t, c, l) => ({ p_tenant_id: t, p_campania_id: c, p_lote_id: l })
  return {
    estructuraAgricola: Object.freeze({
      listar: (t, k, f) =>
        consultar('farm_admin_listar', {
          ...datos(t, k),
          p_busqueda: f.busqueda,
          p_activo: f.activo,
          p_padre_id: f.padreId,
          p_offset: f.offset
        }),
      guardar: (t, k, d) =>
        consultar('farm_admin_guardar', {
          ...datos(t, k),
          p_id: d.id,
          p_codigo: d.codigo,
          p_nombre: d.nombre,
          p_activo: d.activo,
          p_padre_id: d.padreId
        }),
      estado: (t, k, id, activo) =>
        consultar('farm_admin_estado', { ...datos(t, k), p_id: id, p_activo: activo })
    }),
    parcelasCampania: Object.freeze({
      opciones: (t, q) =>
        consultar('farm_parcelas_seleccionables', { p_tenant_id: t, p_busqueda: q }),
      listar: (t, c, l) => consultar('campaign_admin_parcelas_lote', vinculo(t, c, l)),
      vincular: (t, c, l, p) =>
        consultar('campaign_admin_vincular_parcela', {
          ...vinculo(t, c, l),
          p_parcela_id: p,
          p_vincular: true
        }),
      desvincular: (t, c, l, p) =>
        consultar('campaign_admin_vincular_parcela', {
          ...vinculo(t, c, l),
          p_parcela_id: p,
          p_vincular: false
        })
    })
  }
}
