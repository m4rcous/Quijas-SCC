export function crearAdministracionAdapter({ consultar, invocar }) {
  return Object.freeze({
    obtenerEmpresa: (tenant) =>
      consultar('iam_obtener_empresa', { p_tenant_id: tenant }),
    guardarEmpresa: (tenant, nombre) =>
      consultar('iam_guardar_empresa', { p_tenant_id: tenant, p_nombre: nombre }),
    listarUsuarios: (tenant, busqueda, offset) =>
      consultar('iam_admin_listar_usuarios', {
        p_tenant_id: tenant,
        p_busqueda: busqueda,
        p_offset: offset
      }),
    obtenerUsuario: (tenant, id) =>
      consultar('iam_admin_obtener_usuario', { p_tenant_id: tenant, p_usuario_id: id }),
    catalogoAccesos: (tenant) =>
      consultar('iam_admin_catalogo_accesos', { p_tenant_id: tenant }),
    guardarMembresia: (tenant, d) =>
      consultar('iam_admin_guardar_membresia', {
        p_tenant_id: tenant,
        p_usuario_id: d.usuarioId,
        p_activo: d.activo,
        p_roles: d.roles,
        p_trabajador_id: d.trabajadorId,
        p_nombre: d.nombre
      }),
    listarInvitaciones: (tenant) =>
      consultar('iam_listar_invitaciones', { p_tenant_id: tenant }),
    invitarUsuario: (tenant, d) =>
      invocar('invitar-usuario', {
        operacionId: d.operacionId,
        tenantId: tenant,
        email: d.email,
        nombre: d.nombre,
        roles: d.roles,
        trabajadorId: d.trabajadorId
      })
  })
}
