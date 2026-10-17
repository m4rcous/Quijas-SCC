import { AccesoDenegado } from '../../../../../src/contexts/identity-access/index.js'
import {
  SesionExpirada,
  CredencialesInvalidas,
  ServicioNoDisponible
} from '../../ports/errores.js'
import { crearAdministracionAdapter } from './administracionAdapter.js'
import { crearGestionAdapters } from './gestionAdapters.js'
import { crearCosechaAdapter } from './cosechaAdapter.js'
import { crearReportesAdapter } from './reportesAdapter.js'
import { exportacionCsv } from '../exportacionCsv.js'
import { crearSuscripcionAdapter } from './suscripcionAdapter.js'
import { crearCutoverAdministrativoAdapter } from './cutoverAdministrativoAdapter.js'
import { crearEstructuraAgricolaAdapters } from './estructuraAgricolaAdapter.js'
import { ConflictoVersionComercial } from '../../../../../src/contexts/platform/index.js'

export function crearPuertosSupabase(cliente) {
  const verificar = async () => {
    let respuesta
    try {
      respuesta = await cliente.auth.getUser()
    } catch {
      throw new ServicioNoDisponible()
    }
    const { data, error } = respuesta
    if (error?.name === 'AuthSessionMissingError') return null
    if (error) {
      if ([401, 403].includes(error.status)) throw new SesionExpirada()
      throw new ServicioNoDisponible()
    }
    return data?.user ? { sujeto: data.user.id } : null
  }
  async function rpc(nombre, parametros) {
    let respuesta
    try {
      respuesta = await cliente.rpc(nombre, parametros)
    } catch {
      throw new ServicioNoDisponible()
    }
    if (respuesta.error) {
      const e = respuesta.error
      if (e.code === '40001') throw new ConflictoVersionComercial(e.message)
      if (e.status === 401 || ['PGRST301', 'PGRST303'].includes(e.code))
        throw new SesionExpirada()
      if (e.code === '42501') {
        if (!(await verificar())) throw new SesionExpirada()
        throw new AccesoDenegado(e.message)
      }
      if (
        ['P0001', '23505', '23503', '23514', '22007', '22008', '22P02'].includes(e.code)
      ) {
        const mensaje =
          e.code === '23505'
            ? 'Código, DNI o nombre duplicado, o ya existe una campaña activa para este cultivo.'
            : ['23503', '23514'].includes(e.code)
              ? 'La relación o los datos no son válidos para esta empresa.'
              : e.code === 'P0001'
                ? e.message
                : 'Revise las fechas y los datos indicados.'
        throw new Error(mensaje)
      }
      throw new ServicioNoDisponible()
    }
    return respuesta.data
  }
  return Object.freeze({
    harvestAdmin: crearCosechaAdapter(rpc),
    comercial: crearSuscripcionAdapter(rpc),
    cutoverAdministrativo: crearCutoverAdministrativoAdapter(rpc),
    reportesHarvest: crearReportesAdapter(rpc),
    exportacion: exportacionCsv,
    ...crearGestionAdapters(rpc),
    ...crearEstructuraAgricolaAdapters(rpc),
    administracion: crearAdministracionAdapter({
      consultar: rpc,
      async invocar(nombre, body) {
        let respuesta
        try {
          respuesta = await cliente.functions.invoke(nombre, { body })
        } catch {
          throw new ServicioNoDisponible()
        }
        const { data, error } = respuesta
        if (error) {
          if (error.context?.status === 401) throw new SesionExpirada()
          if (error.context?.status === 403)
            throw new AccesoDenegado('Autorización de administración revocada.')
          throw new Error(
            'No se pudo completar el alta. Reintente con la misma solicitud.'
          )
        }
        return data
      }
    }),
    identity: Object.freeze({
      obtenerSesion: verificar,
      async iniciarSesion({ email, password }) {
        let respuesta
        try {
          respuesta = await cliente.auth.signInWithPassword({ email, password })
        } catch {
          throw new ServicioNoDisponible()
        }
        if (respuesta.error) {
          if (!respuesta.error.status || respuesta.error.status >= 500)
            throw new ServicioNoDisponible()
          throw new CredencialesInvalidas()
        }
      },
      async cerrarSesion() {
        let respuesta
        try {
          respuesta = await cliente.auth.signOut({ scope: 'local' })
        } catch {
          throw new ServicioNoDisponible()
        }
        const { error } = respuesta
        if (error) throw new ServicioNoDisponible()
      },
      observarSesion(listener) {
        let activa = true
        const { data } = cliente.auth.onAuthStateChange((evento) => {
          if (evento === 'INITIAL_SESSION') return
          // No ejecutar llamadas Auth dentro del lock del callback del SDK.
          queueMicrotask(() => {
            if (activa)
              listener({
                tipo: evento === 'SIGNED_OUT' ? 'cerrada' : 'actualizada',
                evento
              })
          })
        })
        return () => {
          activa = false
          data.subscription.unsubscribe()
        }
      }
    }),
    acceso: Object.freeze({
      obtenerIdentidad: () => rpc('iam_obtener_identidad'),
      resolverContexto: (tenantId) =>
        rpc('iam_resolver_tenant_context', { p_tenant_id: tenantId })
    }),
    entitlements: Object.freeze({
      puedeUsarModulo: async (tenantId, modulo) =>
        (await rpc('platform_puede_usar_modulo', {
          p_tenant_id: tenantId,
          p_modulo: modulo
        })) === true
    })
  })
}
