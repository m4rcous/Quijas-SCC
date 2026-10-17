import {
  crearAccesoAutenticado,
  AccesoDenegado
} from '../../../../src/contexts/identity-access/index.js'
import {
  crearEntitlements,
  ModuloNoHabilitado
} from '../../../../src/contexts/platform/index.js'
import { validarPuertosPortal } from '../ports/portal.js'
import {
  SesionExpirada,
  CredencialesInvalidas,
  ServicioNoDisponible
} from '../ports/errores.js'
import { evaluarRuta, navegacionPermitida } from './rutas.js'
import { crearConfiguracion } from './configuracion.js'
import { crearGestionPortal } from './gestion.js'
import { crearCosechaPortal } from './cosecha.js'
import { crearSuscripcionPortal } from './suscripcion.js'
import { crearCutoverAdministrativoPortal } from './cutoverAdministrativo.js'
import {
  crearEstructuraAgricolaPortal,
  crearParcelasCampaniaPortal
} from './estructuraAgricola.js'
import { crearReportesPortal } from './reportes.js'

export function crearPortal(puertos) {
  validarPuertosPortal(puertos)
  const { identity } = puertos
  const acceso = crearAccesoAutenticado(puertos)
  const capacidades = crearEntitlements(puertos)
  const listeners = new Set()
  let version = 0,
    seleccion = null,
    colaAuth = Promise.resolve(),
    revalidacionEnCurso = null,
    observar = null,
    iniciada = false,
    salidaSolicitada = false
  const limpio = () => ({
    usuario: null,
    empresas: Object.freeze([]),
    contexto: null,
    modulos: Object.freeze([]),
    navegacion: Object.freeze([]),
    ruta: null,
    mensaje: '',
    cargando: false,
    initializingSession: false,
    backgroundRevalidation: false
  })
  let estado = Object.freeze({
    ...limpio(),
    fase: 'restaurando',
    scope: 0,
    cargando: true,
    initializingSession: true
  })
  const emitir = (cambios) => {
    estado = Object.freeze({ ...estado, ...cambios })
    for (const listener of listeners) listener()
  }
  const actual = (v) => v === version
  const reset = (fase, mensaje = '', cargando = false, indicadores = {}) =>
    emitir({
      ...limpio(),
      fase,
      mensaje,
      cargando,
      scope: estado.scope + 1,
      ...indicadores
    })
  const authEnOrden = (accion) => {
    const tarea = colaAuth.then(accion, accion)
    colaAuth = tarea.catch(() => {})
    return tarea
  }
  const perfilPublico = (p) => {
    const tenants = new Set(p.membresias.filter((m) => m.activo).map((m) => m.tenantId))
    return {
      usuario: p.usuario,
      empresas: Object.freeze(
        p.empresas
          .filter((e) => tenants.has(e.id))
          .map((e) => Object.freeze({ id: e.id, nombre: e.nombre }))
      )
    }
  }
  function invalidarSesion(
    mensaje = 'Su sesión ha expirado. Inicie sesión nuevamente.'
  ) {
    version++
    seleccion = null
    reset('login', mensaje)
  }
  async function contextoValidado(tenantId, v) {
    const c = await acceso.seleccionarEmpresa(tenantId)
    if (!actual(v)) return null
    if (c.usuarioId !== estado.usuario?.id)
      throw new SesionExpirada('La sesión cambió. Inicie sesión nuevamente.')
    const modulos = Object.freeze(await capacidades.modulosHabilitados(c.tenantId))
    return actual(v)
      ? { contexto: c, modulos, navegacion: navegacionPermitida(c, modulos) }
      : null
  }
  async function cargarPerfil(v, anterior = {}) {
    const p = perfilPublico(await acceso.obtenerIdentidad())
    if (!actual(v)) return false
    emitir(p)
    if (!p.empresas.length) {
      seleccion = null
      emitir({
        fase: 'sin-empresas',
        cargando: false,
        initializingSession: false,
        backgroundRevalidation: false
      })
      return true
    }
    const hint =
      anterior.usuarioId === p.usuario.id &&
      p.empresas.some((e) => e.id === anterior.tenantId)
        ? anterior.tenantId
        : p.empresas.length === 1
          ? p.empresas[0].id
          : null
    if (!hint) {
      seleccion = null
      emitir({
        fase: 'seleccion',
        cargando: false,
        initializingSession: false,
        backgroundRevalidation: false
      })
      return true
    }
    const recursos = await contextoValidado(hint, v)
    if (!recursos) return false
    seleccion = recursos.contexto.tenantId
    emitir({
      ...recursos,
      fase: 'listo',
      cargando: false,
      initializingSession: false,
      backgroundRevalidation: false
    })
    return true
  }
  async function fallo(error, v, modo) {
    if (!actual(v)) return false
    if (error instanceof SesionExpirada) {
      invalidarSesion(error.message)
      return false
    }
    if (error instanceof CredencialesInvalidas) {
      seleccion = null
      reset('login', error.message)
      return false
    }
    if (error instanceof AccesoDenegado) {
      try {
        if (!(await identity.obtenerSesion())) {
          if (actual(v)) invalidarSesion()
          return false
        }
        if (!actual(v)) return false
        if (modo === 'seleccion' || modo === 'ruta') {
          const p = perfilPublico(await acceso.obtenerIdentidad())
          if (!actual(v)) return false
          seleccion = null
          reset(p.empresas.length ? 'seleccion' : 'sin-empresas', error.message)
          emitir(p)
          return false
        }
      } catch (e) {
        if (!actual(v)) return false
        if (e instanceof SesionExpirada) {
          invalidarSesion(e.message)
          return false
        }
        if (e instanceof ServicioNoDisponible) {
          reset('error', e.message)
          return false
        }
      }
      seleccion = null
      reset('sin-acceso', error.message)
      return false
    }
    reset('error', error.message || 'No se pudo validar el acceso al Portal.')
    return false
  }
  async function falloRevalidacion(error, v, tenant) {
    if (!actual(v) || seleccion !== tenant) return false
    if (error instanceof SesionExpirada) {
      invalidarSesion(error.message)
      return false
    }
    if (error instanceof CredencialesInvalidas) {
      seleccion = null
      reset('login', error.message)
      return false
    }
    if (!(error instanceof AccesoDenegado)) return false
    try {
      if (!(await identity.obtenerSesion())) {
        if (actual(v) && seleccion === tenant) invalidarSesion()
        return false
      }
      if (!actual(v) || seleccion !== tenant) return false
      const p = perfilPublico(await acceso.obtenerIdentidad())
      if (!actual(v) || seleccion !== tenant) return false
      if (p.usuario.id !== estado.usuario?.id) {
        invalidarSesion('La sesión cambió. Inicie sesión nuevamente.')
        return false
      }
      if (!p.empresas.some((empresa) => empresa.id === tenant)) {
        seleccion = null
        reset(
          p.empresas.length ? 'seleccion' : 'sin-empresas',
          error.message || 'Su acceso a la empresa activa ya no está disponible.'
        )
        emitir(p)
        return false
      }
      seleccion = null
      reset('sin-acceso', error.message)
      emitir(p)
      return false
    } catch (e) {
      if (!actual(v) || seleccion !== tenant) return false
      if (e instanceof SesionExpirada) invalidarSesion(e.message)
      return false
    }
  }
  async function restaurar() {
    const previo = { usuarioId: estado.usuario?.id, tenantId: seleccion }
    const v = ++version
    reset('restaurando', '', true, { initializingSession: true })
    return authEnOrden(async () => {
      if (!actual(v)) return false
      try {
        if (identity.tieneInvitacion?.()) {
          reset('invitacion')
          return true
        }
        if (!(await identity.obtenerSesion())) {
          if (actual(v)) {
            seleccion = null
            reset('login')
          }
          return false
        }
        return await cargarPerfil(v, previo)
      } catch (e) {
        return fallo(e, v, 'restaurar')
      }
    })
  }
  async function login({ email, password }) {
    const v = ++version
    salidaSolicitada = false
    seleccion = null
    reset('login', '', true)
    return authEnOrden(async () => {
      if (!actual(v)) return false
      try {
        await identity.iniciarSesion({ email, password })
        if (!actual(v)) return false
        return await cargarPerfil(v)
      } catch (e) {
        return fallo(e, v, 'login')
      }
    })
  }
  async function seleccionarEmpresa(tenantId) {
    const v = ++version
    seleccion = null
    reset('seleccion', '', true)
    try {
      const p = perfilPublico(await acceso.obtenerIdentidad())
      if (!actual(v)) return false
      emitir(p)
      const recursos = await contextoValidado(tenantId, v)
      if (!recursos) return false
      seleccion = recursos.contexto.tenantId
      emitir({ ...recursos, fase: 'listo', cargando: false })
      return true
    } catch (e) {
      return fallo(e, v, 'seleccion')
    }
  }
  async function abrirRuta(path) {
    if (estado.fase !== 'listo' || !seleccion) return false
    const v = ++version,
      tenant = seleccion
    emitir({
      contexto: null,
      modulos: Object.freeze([]),
      navegacion: Object.freeze([]),
      cargando: true,
      ruta: Object.freeze({ path, estado: 'cargando' })
    })
    try {
      const recursos = await contextoValidado(tenant, v)
      if (!recursos) return false
      const resultado = evaluarRuta(path, recursos.contexto, recursos.modulos)
      emitir({
        ...recursos,
        cargando: false,
        ruta: Object.freeze({ path, ...resultado })
      })
      return resultado.estado === 'permitida'
    } catch (e) {
      return fallo(e, v, 'ruta')
    }
  }
  async function logout() {
    const v = ++version
    salidaSolicitada = true
    seleccion = null
    reset('login', '', true)
    return authEnOrden(async () => {
      try {
        await acceso.cerrarSesion()
        if (actual(v)) reset('login')
        return true
      } catch (e) {
        if (actual(v))
          reset('salida-fallida', 'No se pudo cerrar la sesión. Reintente el cierre.')
        return false
      }
    })
  }
  function revalidar() {
    if (estado.fase !== 'listo' || !seleccion || !estado.contexto)
      return Promise.resolve(false)
    if (
      revalidacionEnCurso?.version === version &&
      revalidacionEnCurso?.tenant === seleccion
    )
      return revalidacionEnCurso.promise
    const v = version,
      tenant = seleccion,
      path = estado.ruta?.path ?? '/'
    emitir({ backgroundRevalidation: true })
    const tarea = (async () => {
      try {
        const p = perfilPublico(await acceso.obtenerIdentidad())
        if (!actual(v) || seleccion !== tenant) return false
        if (p.usuario.id !== estado.usuario?.id)
          throw new SesionExpirada('La sesión cambió. Inicie sesión nuevamente.')
        if (!p.empresas.some((empresa) => empresa.id === tenant)) {
          seleccion = null
          reset(
            p.empresas.length ? 'seleccion' : 'sin-empresas',
            'Su acceso a la empresa activa ya no está disponible.'
          )
          emitir(p)
          return false
        }
        const recursos = await contextoValidado(tenant, v)
        if (!recursos || seleccion !== tenant) return false
        const resultado = evaluarRuta(path, recursos.contexto, recursos.modulos)
        emitir({
          ...p,
          ...recursos,
          fase: 'listo',
          cargando: false,
          initializingSession: false,
          backgroundRevalidation: false,
          ruta: Object.freeze({ path, ...resultado })
        })
        return resultado.estado === 'permitida'
      } catch (e) {
        return falloRevalidacion(e, v, tenant)
      } finally {
        if (
          actual(v) &&
          seleccion === tenant &&
          estado.fase === 'listo' &&
          estado.backgroundRevalidation
        )
          emitir({ backgroundRevalidation: false })
      }
    })()
    revalidacionEnCurso = { version: v, tenant, promise: tarea }
    void tarea.finally(() => {
      if (revalidacionEnCurso?.promise === tarea) revalidacionEnCurso = null
    })
    return tarea
  }
  async function completarInvitacion({ password }) {
    const v = ++version
    reset('invitacion', '', true)
    try {
      if (!password || password.length < 8)
        throw new Error('Use una contraseña de al menos 8 caracteres.')
      await identity.completarInvitacion(password)
      if (!actual(v)) return false
      return await cargarPerfil(v)
    } catch (e) {
      if (actual(v)) reset('invitacion', e.message)
      return false
    }
  }
  const scopesAdministracion = new WeakMap()
  const autorizarScope = async (permiso, tenant) => {
    if (!Array.isArray(permiso)) return acceso.autorizar(permiso, tenant)
    const c = await acceso.seleccionarEmpresa(tenant)
    if (!permiso.some((p) => c.permite(p)))
      throw new AccesoDenegado('Permiso de consulta Harvest requerido.')
    return c
  }
  const scopePara = (permiso, modulo = null) => ({
    vigente: (c) =>
      estado.fase === 'listo' &&
      seleccion === c.tenantId &&
      estado.usuario?.id === c.usuarioId &&
      scopesAdministracion.get(c) === estado.scope,
    async onError(e) {
      if (e instanceof SesionExpirada) invalidarSesion(e.message)
      else if (e instanceof ModuloNoHabilitado) await revalidar()
      else if (e instanceof AccesoDenegado) {
        // Un recurso ajeno no invalida toda la sesión. Revalidar el permiso
        // sin remontar la vista evita repetir automáticamente la consulta.
        const v = version,
          tenant = seleccion
        try {
          await autorizarScope(permiso, tenant)
          if (modulo && !(await capacidades.puedeUsarModulo(tenant, modulo)))
            await revalidar()
        } catch (error) {
          await fallo(error, v, 'ruta')
        }
      }
    },
    tenantContext: {
      async obtener() {
        const tenant = seleccion,
          scope = estado.scope,
          v = version
        if (estado.fase !== 'listo' || !tenant)
          throw new AccesoDenegado('Seleccione una empresa autorizada.')
        try {
          const c = await autorizarScope(permiso, tenant)
          if (scope !== estado.scope || tenant !== seleccion)
            throw new AccesoDenegado('La empresa cambió.')
          scopesAdministracion.set(c, scope)
          return c
        } catch (e) {
          if (e instanceof SesionExpirada) invalidarSesion(e.message)
          else if (e instanceof AccesoDenegado && scope === estado.scope)
            await fallo(e, v, 'ruta')
          throw e
        }
      }
    }
  })
  const configuracion = puertos.administracion
    ? crearConfiguracion({
        administracion: puertos.administracion,
        entitlements: puertos.entitlements,
        ...scopePara('company.manage')
      })
    : null
  const campanias = crearGestionPortal({
    puerto: puertos.campaign,
    scope: scopePara('campaign.manage', 'CAMPAIGN'),
    entitlements: puertos.entitlements,
    tipo: 'campaign'
  })
  const personal = crearGestionPortal({
    puerto: puertos.workforce,
    scope: scopePara('workforce.manage', 'WORKFORCE'),
    entitlements: puertos.entitlements,
    tipo: 'workforce'
  })
  const cosecha = crearCosechaPortal({
    puerto: puertos.harvestAdmin,
    scopePara,
    entitlements: puertos.entitlements
  })
  return Object.freeze({
    estructuraAgricola: crearEstructuraAgricolaPortal({
      puerto: puertos.estructuraAgricola,
      entitlements: puertos.entitlements,
      scope: scopePara('farm.manage', 'FARM_STRUCTURE')
    }),
    parcelasCampania: crearParcelasCampaniaPortal({
      puerto: puertos.parcelasCampania,
      entitlements: puertos.entitlements,
      scope: scopePara('campaign.manage', 'FARM_STRUCTURE')
    }),
    cutoverAdministrativo: crearCutoverAdministrativoPortal({
      puerto: puertos.cutoverAdministrativo,
      scope: scopePara('company.manage')
    }),
    suscripcion: crearSuscripcionPortal({
      comercial: puertos.comercial,
      scope: scopePara('company.manage')
    }),
    reportes: crearReportesPortal({
      puerto: puertos.reportesHarvest,
      scope: scopePara('reports.view', 'HARVEST'),
      entitlements: puertos.entitlements,
      exportacion: puertos.exportacion
    }),
    configuracion,
    campanias,
    personal,
    cosecha,
    completarInvitacion,
    estadoActual: () => estado,
    suscribir: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    restaurar,
    login,
    logout,
    seleccionarEmpresa,
    abrirRuta,
    revalidar,
    invalidarSesion,
    iniciar() {
      if (iniciada) return Promise.resolve(false)
      iniciada = true
      observar = identity.observarSesion?.((evento) => {
        if (evento.tipo === 'cerrada')
          invalidarSesion('Su sesión ha finalizado. Inicie sesión nuevamente.')
        else if (!salidaSolicitada && estado.fase === 'listo' && estado.contexto)
          void revalidar()
        else if (!salidaSolicitada && !estado.cargando) void restaurar()
      })
      return restaurar()
    },
    detener() {
      version++
      observar?.()
      observar = null
      iniciada = false
    }
  })
}
