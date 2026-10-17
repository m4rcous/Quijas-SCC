import assert from 'node:assert/strict'
import test from 'node:test'
import { crearPortal } from '../src/application/crearPortal.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeCutover } from './support/fakeCutover.js'
import { fakeGestion } from './support/fakeGestion.js'
import { crearCutoverAdministrativoAdapter } from '../src/infrastructure/supabase/cutoverAdministrativoAdapter.js'
async function crear(options = {}) {
  const ports = fakePorts({ autenticado: true, ...options })
  fakeGestion(ports)
  fakeCutover(ports)
  const app = crearPortal(ports)
  await app.restaurar()
  if (options.empresas?.length > 1) await app.seleccionarEmpresa('A')
  return { ports, app }
}
const d = {
  campaniaId: 'A-camp',
  operacionId: 'OP',
  motivo: 'Conciliado',
  pendientesRevisados: true
}
test('cutover explícito valida revisión y deriva Tenant, sin aceptar autoridad desde UI', async () => {
  const { app, ports } = await crear()
  assert.equal(
    (await app.cutoverAdministrativo.consultar('A-camp')).autoridad,
    'TRANSICION_SHEETS'
  )
  await assert.rejects(
    app.cutoverAdministrativo.activar({ ...d, pendientesRevisados: false }),
    /revisión/
  )
  const r = await app.cutoverAdministrativo.activar({
    ...d,
    tenantId: 'B',
    actor: 'OTRO'
  })
  assert.equal(r.autoridad, 'PORTAL')
  assert.deepEqual(
    ports.calls.find((c) => c[0] === 'activarAdmin'),
    ['activarAdmin', 'A', d]
  )
  assert.deepEqual(await app.cutoverAdministrativo.activar(d), r)
  await assert.rejects(app.cutoverAdministrativo.consultar('B-camp'), /otra empresa/)
})
test('sin company.manage no hay cutover; cambio A→B→A descarta consulta tardía', async () => {
  const sin = await crear({ permisos: { A: ['campaign.manage'] } })
  await assert.rejects(sin.app.cutoverAdministrativo.consultar('A-camp'), /permiso/)
  const { app, ports } = await crear({
    empresas: ['A', 'B'],
    permisos: { A: ['company.manage'], B: ['company.manage'] }
  })
  let resolver, inicio
  const iniciada = new Promise((r) => (inicio = r)),
    original = ports.cutoverAdministrativo.consultar
  ports.cutoverAdministrativo.consultar = async (...a) => {
    const d = await original(...a)
    inicio()
    await new Promise((r) => (resolver = r))
    return d
  }
  const p = app.cutoverAdministrativo.consultar('A-camp')
  await iniciada
  await app.seleccionarEmpresa('B')
  await app.seleccionarEmpresa('A')
  resolver()
  await assert.rejects(p, { name: 'SolicitudObsoleta' })
})
test('gaps se exponen por APIs públicas de Campaign/Workforce, sin reescribir identidad de rol', async () => {
  const { app, ports } = await crear()
  await app.campanias.guardarLote('A-camp', {
    codigo: 'N1',
    nombre: 'Norte',
    activo: true,
    variedadIds: ['A-var'],
    tenantId: 'B'
  })
  assert.equal(ports.calls.find((c) => c[0] === 'guardarLote')[1], 'A')
  await app.personal.habilitarJaberoDelDia('A-worker', 'A-camp')
  assert.ok(
    (await app.personal.participaciones('A-worker')).some(
      (p) => p.rol === 'JABERO' && p.activo
    )
  )
  await app.personal.retirarJabero('A-worker', 'A-camp')
  assert.equal((await app.personal.participaciones('A-worker'))[0].activo, false)
  await assert.rejects(
    app.personal.asignarRol('A-worker', 'A-camp', 'JABERO'),
    /JABERO/
  )
})
test('adapter de cutover serializa sólo intención y no accede a tablas', async () => {
  const calls = [],
    p = crearCutoverAdministrativoAdapter(async (...a) => calls.push(a))
  await p.activar('A', d)
  assert.deepEqual(calls[0], [
    'platform_cutover_admin_activar',
    {
      p_tenant_id: 'A',
      p_campania_id: 'A-camp',
      p_operacion_id: 'OP',
      p_motivo: 'Conciliado',
      p_pendientes_revisados: true
    }
  ])
})
