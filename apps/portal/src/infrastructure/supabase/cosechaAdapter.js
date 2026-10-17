export function crearCosechaAdapter(consultar) {
  return Object.freeze({
    filtros: (t, c) =>
      consultar('harvest_admin_filtros', { p_tenant_id: t, p_campania_id: c }),
    campanias: (t) => consultar('harvest_admin_campanias', { p_tenant_id: t }),
    generar: (t, d) =>
      consultar('harvest_admin_generar', {
        p_tenant_id: t,
        p_campania_id: d.campaniaId,
        p_operacion_id: d.operacionId,
        p_cantidad: d.cantidadTickets,
        p_tamanio: d.tamanioLote
      }),
    listar: (t, tipo, f) =>
      consultar('harvest_admin_listar', {
        p_tenant_id: t,
        p_tipo: tipo,
        p_campania_id: f.campaniaId,
        p_busqueda: f.busqueda,
        p_lote_id: f.loteId,
        p_trabajador_id: f.trabajadorId,
        p_estado: f.estado,
        p_offset: f.offset
      }),
    obtener: (t, tipo, id) =>
      consultar('harvest_admin_obtener', { p_tenant_id: t, p_tipo: tipo, p_clave: id })
  })
}
