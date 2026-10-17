import assert from 'node:assert/strict'
import test from 'node:test'
import { crearPortal } from '../src/application/crearPortal.js'
import { crearGestionAdapters } from '../src/infrastructure/supabase/gestionAdapters.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeGestion } from './support/fakeGestion.js'
const datosC = {
  codigo: ' NUEVA ',
  nombre: ' Campaña nueva ',
  cultivoId: 'arandano',
  fechaInicio: '2026-01-01',
  estado: 'CERRADA'
}
async function crear(opciones = {}) {
  const ports = fakePorts({ autenticado: true, ...opciones }),
    datos = fakeGestion(ports),
    app = crearPortal(ports)
  await app.restaurar()
  if (opciones.empresas?.length > 1) await app.seleccionarEmpresa('A')
  return { ports, datos, app }
}
test('APIs públicas de Campaign y Workforce limpian payload; no admiten ownership ni estado en edición', async () => {
  const { app, ports, datos } = await crear()
  await app.campanias.crear({ ...datosC, tenantId: 'B', id: 'falso' })
  assert.equal(ports.calls.find((c) => c[0] === 'crearCamp')[1], 'A')
  await app.campanias.editar('A-camp', { ...datosC, estado: 'CERRADA' })
  assert.equal(datos.campaigns.A[0].estado, 'ACTIVA')
  await app.personal.editar('A-worker', {
    dni: '12345678',
    nombres: ' Nombre ',
    apellidos: ' Apellido ',
    activo: false,
    tenantId: 'B',
    usuarioId: 'falso'
  })
  assert.equal(datos.workers.A[0].activo, true)
  assert.deepEqual(ports.calls.find((c) => c[0] === 'editarWorker')[3], {
    dni: '12345678',
    nombres: 'Nombre',
    apellidos: 'Apellido'
  })
  await assert.rejects(app.personal.asignarRol('A-worker', 'A-camp', 'JABERO'), /PDA/)
  await assert.rejects(
    app.campanias.crear({ ...datosC, fechaFin: '2025-01-01' }),
    /anterior/
  )
})
test('cada llamada revalida permiso y módulo; permisos Campaign y Workforce permanecen separados', async () => {
  const { app, ports } = await crear({ permisos: { A: ['campaign.manage'] } })
  assert.equal(await app.abrirRuta('/campanias/nueva'), true)
  await assert.rejects(app.personal.listar(), /permiso/)
  assert.equal(
    ports.calls.some((c) => c[0] === 'workforce'),
    false
  )
  const otro = await crear({ permisos: { A: ['workforce.manage'] } })
  await assert.rejects(otro.app.campanias.listar(), /permiso/)
  const mod = await crear({ modulos: { A: ['CAMPAIGN'] } })
  await assert.rejects(
    mod.app.personal.crear({ dni: '77778888', nombres: 'N', apellidos: 'A' }),
    /módulo/i
  )
  assert.equal(
    mod.ports.calls.some((c) => c[0] === 'crearWorker'),
    false
  )
})
test('revocación de módulo después de cargar una ruta impide escritura y bloquea contenido', async () => {
  const { app, ports } = await crear()
  await app.abrirRuta('/campanias/A-camp')
  ports.modulos.A = []
  await assert.rejects(app.campanias.activar('A-camp'), /módulo/i)
  assert.equal(app.estadoActual().ruta.estado, 'denegada')
})
test('cambio entre Tenants descarta consulta anterior y rechaza referencias cruzadas', async () => {
  const { app, ports } = await crear({
    empresas: ['A', 'B'],
    permisos: {
      A: ['campaign.manage', 'workforce.manage'],
      B: ['campaign.manage', 'workforce.manage']
    },
    modulos: { A: ['CAMPAIGN', 'WORKFORCE'], B: ['CAMPAIGN', 'WORKFORCE'] }
  })
  let resolver, inicio
  const iniciada = new Promise((r) => (inicio = r)),
    original = ports.campaign.listar
  ports.campaign.listar = async (...args) => {
    const d = await original(...args)
    inicio()
    await new Promise((r) => (resolver = r))
    return d
  }
  const pendiente = app.campanias.listar()
  await iniciada
  await app.seleccionarEmpresa('B')
  await app.seleccionarEmpresa('A')
  resolver()
  await assert.rejects(pendiente, { name: 'SolicitudObsoleta' })
  ports.campaign.listar = original
  await app.seleccionarEmpresa('B')
  assert.equal((await app.campanias.listar()).campanias[0].id, 'B-camp')
  await assert.rejects(app.personal.obtener('A-worker'), /otra empresa/)
  assert.equal(app.estadoActual().contexto.tenantId, 'B')
})
test('adapters separan comandos semánticos de edición y sólo usan RPC autorizados', async () => {
  const calls = [],
    p = crearGestionAdapters(async (...a) => {
      calls.push(a)
      return {}
    })
  await p.campaign.editar('A', 'c', { ...datosC, tenantId: 'B', estado: 'CERRADA' })
  assert.equal(calls[0][0], 'campaign_admin_editar')
  assert.equal(calls[0][1].p_estado, undefined)
  assert.equal(calls[0][1].p_tenant_id, 'A')
  await p.campaign.cerrar('A', 'c', null)
  await p.workforce.desactivar('A', 'w')
  assert.equal(calls[1][0], 'campaign_admin_cerrar')
  assert.equal(calls[2][0], 'workforce_admin_desactivar')
})
