import assert from 'node:assert/strict'
import test from 'node:test'
import { crearPortal } from '../src/application/crearPortal.js'
import { crearEstructuraAgricolaAdapters } from '../src/infrastructure/supabase/estructuraAgricolaAdapter.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeFarm } from './support/fakeFarm.js'
const permisos = {
    A: ['farm.manage', 'campaign.manage'],
    B: ['farm.manage', 'campaign.manage']
  },
  modulos = { A: ['CAMPAIGN', 'FARM_STRUCTURE'], B: ['CAMPAIGN', 'FARM_STRUCTURE'] }
async function crear(options = {}) {
  const ports = fakePorts({
      autenticado: true,
      permisos: structuredClone(permisos),
      modulos: structuredClone(modulos),
      ...options
    }),
    datos = fakeFarm(ports),
    app = crearPortal(ports)
  await app.restaurar()
  if (options.empresas?.length > 1) await app.seleccionarEmpresa('A')
  return { ports, datos, app }
}
test('Farm usa TenantContext e intenciones, descarta ownership de payload y permite ruta sólo por permiso+módulo', async () => {
  const { app, ports } = await crear()
  assert.equal(await app.abrirRuta('/estructura/parcelas'), true)
  await app.estructuraAgricola.guardar('fundos', {
    codigo: ' f2 ',
    nombre: ' Nuevo ',
    activo: true,
    tenantId: 'B',
    padreId: 'B-f'
  })
  assert.deepEqual(
    ports.calls.find((x) => x[0] === 'farmGuardar'),
    [
      'farmGuardar',
      'A',
      'fundos',
      { codigo: 'F2', nombre: 'Nuevo', activo: true, id: null, padreId: null }
    ]
  )
  await app.estructuraAgricola.desactivar('fundos', 'A-f')
  await app.estructuraAgricola.activar('fundos', 'A-f')
  await assert.rejects(
    app.estructuraAgricola.desactivar('fundos', 'B-f'),
    /otra empresa/
  )
  const sinPermiso = await crear({ permisos: { A: ['company.manage'] } })
  assert.equal(await sinPermiso.app.abrirRuta('/estructura'), false)
  await assert.rejects(sinPermiso.app.estructuraAgricola.listar('fundos'), /permiso/)
  const sinModulo = await crear({ modulos: { A: ['CAMPAIGN'] } })
  await assert.rejects(sinModulo.app.estructuraAgricola.listar('fundos'), /módulo/i)
})
test('Campaign vincula referencias públicas sin requerir administración física, sin alterar asignaciones Harvest', async () => {
  const { app, datos } = await crear({ permisos: { A: ['campaign.manage'] } })
  assert.equal((await app.parcelasCampania.opciones('')).length, 1)
  assert.deepEqual(await app.parcelasCampania.listar('A-camp', 'A-lote'), [])
  await app.parcelasCampania.vincular('A-camp', 'A-lote', 'A-p')
  assert.equal(datos.links.A['A-lote'][0].vinculoActivo, true)
  await app.parcelasCampania.desvincular('A-camp', 'A-lote', 'A-p')
  assert.equal(datos.links.A['A-lote'][0].vinculoActivo, false)
  await assert.rejects(
    app.parcelasCampania.vincular('B-camp', 'A-lote', 'A-p'),
    /otra empresa/
  )
  await assert.rejects(app.estructuraAgricola.listar('parcelas'), /permiso/)
})
test('revocar entitlement o sesión impide nuevas consultas/escrituras físicas', async () => {
  const { app, ports } = await crear()
  await app.abrirRuta('/estructura')
  ports.modulos.A = []
  await assert.rejects(app.estructuraAgricola.desactivar('fundos', 'A-f'), /módulo/i)
  assert.equal(app.estadoActual().ruta.estado, 'denegada')
  ports.expirar()
  await assert.rejects(app.estructuraAgricola.listar('fundos'), /sesión/i)
})
test('cambio de Tenant limpia estructura y descarta respuesta tardía incluso A→B→A', async () => {
  const { app, ports } = await crear({ empresas: ['A', 'B'] })
  let iniciar, resolver
  const iniciada = new Promise((r) => (iniciar = r)),
    original = ports.estructuraAgricola.listar
  ports.estructuraAgricola.listar = async (...a) => {
    const r = await original(...a)
    iniciar()
    await new Promise((r) => (resolver = r))
    return r
  }
  const pendiente = app.estructuraAgricola.listar('fundos')
  await iniciada
  await app.seleccionarEmpresa('B')
  await app.seleccionarEmpresa('A')
  resolver()
  await assert.rejects(pendiente, { name: 'SolicitudObsoleta' })
  ports.estructuraAgricola.listar = original
  await app.seleccionarEmpresa('B')
  assert.equal((await app.estructuraAgricola.listar('fundos')).filas[0].id, 'B-f')
})
test('adapter neutral usa sólo fachadas autorizadas, sin CRUD genérico de tablas', async () => {
  const calls = [],
    p = crearEstructuraAgricolaAdapters(async (...a) => calls.push(a))
  await p.estructuraAgricola.guardar('A', 'sectores', {
    id: null,
    codigo: 'S',
    nombre: 'N',
    activo: true,
    padreId: 'F'
  })
  await p.parcelasCampania.vincular('A', 'C', 'L', 'P')
  await p.parcelasCampania.desvincular('A', 'C', 'L', 'P')
  assert.equal(calls[0][0], 'farm_admin_guardar')
  assert.equal(calls[0][1].p_tenant_id, 'A')
  assert.equal(calls[1][0], 'campaign_admin_vincular_parcela')
  assert.equal(calls[1][1].p_vincular, true)
  assert.equal(calls[2][1].p_vincular, false)
})
