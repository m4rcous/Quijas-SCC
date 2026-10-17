export function crearGestionAdapters(consultar) {
  const camp = (nombre, t, args = {}) =>
    consultar('campaign_admin_' + nombre, { p_tenant_id: t, ...args })
  const work = (nombre, t, args = {}) =>
    consultar('workforce_admin_' + nombre, { p_tenant_id: t, ...args })
  const datosCamp = (d) => ({
    p_codigo: d.codigo,
    p_nombre: d.nombre,
    p_cultivo_id: d.cultivoId,
    p_fecha_inicio: d.fechaInicio,
    p_fecha_fin: d.fechaFin
  })
  const datosWork = (d) => ({
    p_dni: d.dni,
    p_nombres: d.nombres,
    p_apellidos: d.apellidos
  })
  return {
    campaign: Object.freeze({
      listar: (t, f) =>
        camp('listar', t, {
          p_busqueda: f.busqueda,
          p_estado: f.estado,
          p_cultivo_id: f.cultivoId,
          p_offset: f.offset
        }),
      obtener: (t, id) => camp('obtener', t, { p_id: id }),
      crear: (t, d) => camp('crear', t, { ...datosCamp(d), p_estado: d.estado }),
      editar: (t, id, d) => camp('editar', t, { p_id: id, ...datosCamp(d) }),
      activar: (t, id) => camp('activar', t, { p_id: id }),
      cerrar: (t, id, fecha) => camp('cerrar', t, { p_id: id, p_fecha_fin: fecha }),
      cultivos: (t) => camp('cultivos', t),
      variedades: (t, id) => camp('variedades', t, { p_campania_id: id }),
      guardarVariedad: (t, c, d) =>
        camp('guardar_variedad', t, {
          p_campania_id: c,
          p_id: d.id,
          p_nombre: d.nombre,
          p_activo: d.activo
        }),
      lotes: (t, c) => camp('lotes', t, { p_campania_id: c }),
      guardarLote: (t, c, d) =>
        camp('guardar_lote', t, {
          p_campania_id: c,
          p_id: d.id,
          p_codigo: d.codigo,
          p_nombre: d.nombre,
          p_activo: d.activo,
          p_variedad_ids: d.variedadIds
        }),
      configurarVariedadesLote: (t, c, l, ids) =>
        camp('configurar_variedades_lote', t, {
          p_campania_id: c,
          p_lote_id: l,
          p_variedad_ids: ids
        })
    }),
    workforce: Object.freeze({
      listar: (t, f) =>
        work('listar', t, {
          p_busqueda: f.busqueda,
          p_activo: f.activo,
          p_offset: f.offset
        }),
      obtener: (t, id) => work('obtener', t, { p_id: id }),
      crear: (t, d) => work('crear', t, datosWork(d)),
      editar: (t, id, d) => work('editar', t, { p_id: id, ...datosWork(d) }),
      activar: (t, id) => work('activar', t, { p_id: id }),
      desactivar: (t, id) => work('desactivar', t, { p_id: id }),
      catalogo: (t) => work('catalogo', t),
      participaciones: (t, id) => work('participaciones', t, { p_trabajador_id: id }),
      habilitarJaberoDelDia: (t, id, c) =>
        work('jornada_jabero', t, {
          p_trabajador_id: id,
          p_campania_id: c,
          p_habilitar: true
        }),
      retirarJabero: (t, id, c) =>
        work('jornada_jabero', t, {
          p_trabajador_id: id,
          p_campania_id: c,
          p_habilitar: false
        }),
      asignarRol: (t, id, c, rol) =>
        work('asignar_rol', t, { p_trabajador_id: id, p_campania_id: c, p_rol: rol }),
      retirarRol: (t, id, c, rol) =>
        work('retirar_rol', t, { p_trabajador_id: id, p_campania_id: c, p_rol: rol })
    })
  }
}
