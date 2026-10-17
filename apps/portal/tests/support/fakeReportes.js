import { AccesoDenegado } from '../../../../src/contexts/identity-access/index.js'
export function fakeReportes(ports, { vacio = false } = {}) {
  const archivos = [],
    ahora = '2026-10-14T15:00:00Z'
  const exigir = async (t, camp) => {
    const c = await ports.acceso.resolverContexto(t)
    if (!c.permisos.includes('reports.view'))
      throw new AccesoDenegado('Sin permiso reports.view.')
    if (!(await ports.entitlements.puedeUsarModulo(t, 'HARVEST')))
      throw new AccesoDenegado('Módulo deshabilitado.')
    if (camp && ![t + '-camp', t + '-cerrada'].includes(camp))
      throw new AccesoDenegado('Campaña de otra empresa.')
  }
  const resumen = {
    total_jabas: vacio ? 0 : 43,
    total_cosechadores: vacio ? 0 : 2,
    total_lotes: vacio ? 0 : 2,
    total_sesiones: vacio ? 0 : 3,
    dias_con_produccion: vacio ? 0 : 2,
    ultima_lectura: vacio ? null : ahora
  }
  ports.reportesHarvest = {
    async campanias(t) {
      await exigir(t)
      return [
        {
          id: t + '-camp',
          codigo: t + '-2026',
          nombre: 'Campaña ' + t,
          estado: 'ACTIVA'
        },
        {
          id: t + '-cerrada',
          codigo: t + '-2025',
          nombre: 'Cerrada ' + t,
          estado: 'CERRADA'
        }
      ]
    },
    async validar(t, c) {
      await exigir(t, c)
      ports.calls.push(['validarReporte', t, c])
      return true
    },
    async consultar(t, f) {
      await exigir(t, f.campaniaId)
      ports.calls.push(['consultarReporte', t, { ...f }])
      const datos = {
        ok: true,
        campania: { id: f.campaniaId, nombre: 'Campaña ' + t },
        zona_horaria: 'America/Lima'
      }
      if (['DASHBOARD', 'RESUMEN'].includes(f.tipo)) datos.resumen = { ...resumen }
      if (f.tipo === 'DASHBOARD')
        datos.hoy = { fecha: '2026-10-14', total_jabas: vacio ? 0 : 23 }
      if (f.tipo === 'RANKING') {
        datos.periodo = f.periodo
        datos.ranking = vacio
          ? []
          : [
              {
                posicion: 1,
                cosechador_dni: '12345678',
                cosechador: 'Ana ' + t,
                total_jabas: 23,
                ultima_lectura: ahora
              },
              {
                posicion: 2,
                cosechador_dni: '87654321',
                cosechador: 'Bruno ' + t,
                total_jabas: 20,
                ultima_lectura: ahora
              }
            ]
      }
      if (f.tipo === 'DIARIA')
        datos.produccion = vacio
          ? []
          : [
              {
                fecha: '2026-10-14',
                total_jabas: 23,
                total_cosechadores: 1,
                total_sesiones: 2
              },
              {
                fecha: '2026-10-13',
                total_jabas: 20,
                total_cosechadores: 1,
                total_sesiones: 1
              }
            ]
      if (f.tipo === 'LOTES')
        datos.produccion = vacio
          ? []
          : [
              {
                lote_id: '2',
                lote_codigo: 'L2',
                lote_nombre: 'Sur',
                variedad: 'Roja',
                total_jabas: 23,
                total_cosechadores: 1,
                total_sesiones: 2,
                ultima_lectura: ahora
              },
              {
                lote_id: '1',
                lote_codigo: 'L1',
                lote_nombre: 'Norte',
                variedad: 'Verde',
                total_jabas: 20,
                total_cosechadores: 1,
                total_sesiones: 1,
                ultima_lectura: ahora
              }
            ]
      return {
        tenantId: t,
        campaniaId: f.campaniaId,
        tipo: f.tipo,
        actualizadoEn: ahora,
        datos
      }
    }
  }
  ports.exportacion = {
    guardar(a) {
      archivos.push(a)
    }
  }
  return { archivos }
}
