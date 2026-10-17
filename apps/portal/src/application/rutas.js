export const RUTAS_PORTAL = Object.freeze(
  [
    {
      path: '/',
      nombre: 'Inicio',
      marca: '01',
      permiso: null,
      modulo: null,
      descripcion:
        'Su espacio de gestión de GesGROW. Seleccione una sección para comenzar.'
    },
    {
      path: '/campanias',
      nombre: 'Campañas',
      marca: '02',
      permiso: 'campaign.manage',
      modulo: 'CAMPAIGN',
      descripcion: 'Espacio de gestión de campañas y sus recursos operativos.'
    },
    {
      path: '/personal',
      nombre: 'Personal',
      marca: '03',
      permiso: 'workforce.manage',
      modulo: 'WORKFORCE',
      descripcion:
        'Espacio de gestión de trabajadores, separado de las cuentas de acceso.'
    },
    {
      path: '/cosecha',
      nombre: 'Cosecha',
      marca: '04',
      permisos: ['harvest.view', 'harvest.manage'],
      modulo: 'HARVEST',
      descripcion: 'Espacio de consulta y gestión de la cosecha de su empresa.'
    },
    {
      path: '/reportes',
      nombre: 'Reportes',
      marca: '05',
      permiso: 'reports.view',
      modulo: 'HARVEST',
      descripcion: 'Espacio para consultar la producción y los reportes de cosecha.'
    },
    {
      path: '/estructura',
      nombre: 'Estructura agrícola',
      marca: '07',
      permiso: 'farm.manage',
      modulo: 'FARM_STRUCTURE',
      descripcion: 'Fundos, sectores y parcelas físicas de la empresa.'
    },
    {
      path: '/configuracion',
      nombre: 'Configuración',
      marca: '06',
      permiso: 'company.manage',
      modulo: null,
      descripcion: 'Espacio de configuración de la empresa y su equipo de gestión.'
    }
  ].map((r) =>
    Object.freeze({
      ...r,
      ...(r.permisos ? { permisos: Object.freeze(r.permisos) } : {})
    })
  )
)

export function evaluarRuta(path, contexto, modulos) {
  if (path === '/cosecha/generar') {
    const base = evaluarRuta('/cosecha', contexto, modulos)
    return base.estado === 'permitida' && !contexto.permite('harvest.manage')
      ? {
          estado: 'denegada',
          mensaje: 'Se requiere harvest.manage para generar tickets.'
        }
      : base
  }
  const configuracion =
    /^\/configuracion\/(empresa|usuarios|invitaciones|roles|modulos|suscripcion)$/.test(
      path
    ) || /^\/configuracion\/usuarios\/[a-zA-Z0-9-]+$/.test(path)
  const ruta = RUTAS_PORTAL.find(
    (r) =>
      r.path ===
      (configuracion
        ? '/configuracion'
        : /^\/campanias\/([a-zA-Z0-9-]+)$/.test(path)
          ? '/campanias'
          : /^\/personal\/([a-zA-Z0-9-]+)$/.test(path)
            ? '/personal'
            : /^\/cosecha\/(lotes|tickets|asignaciones|registros)(\/[^/]+)?$/.test(path)
              ? '/cosecha'
              : /^\/reportes\/(resumen|ranking|diaria|lotes)$/.test(path)
                ? '/reportes'
                : /^\/estructura\/(fundos|sectores|parcelas)$/.test(path)
                  ? '/estructura'
                  : path)
  )
  if (!ruta)
    return { estado: 'no-encontrada', mensaje: 'La página solicitada no existe.' }
  if (!contexto)
    return { estado: 'denegada', mensaje: 'Seleccione una empresa autorizada.' }
  if (
    (ruta.permiso && !contexto.permite(ruta.permiso)) ||
    (ruta.permisos && !ruta.permisos.some((p) => contexto.permite(p)))
  )
    return {
      estado: 'denegada',
      mensaje: 'No tiene permiso para acceder a esta sección.'
    }
  if (ruta.modulo && !modulos.includes(ruta.modulo))
    return {
      estado: 'denegada',
      mensaje: 'Esta empresa no tiene el módulo requerido habilitado.'
    }
  return { estado: 'permitida', ruta }
}

export function navegacionPermitida(contexto, modulos) {
  return Object.freeze(
    RUTAS_PORTAL.filter(
      (r) => evaluarRuta(r.path, contexto, modulos).estado === 'permitida'
    )
  )
}
