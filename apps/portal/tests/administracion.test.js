import assert from 'node:assert/strict'
import test from 'node:test'
import { crearPortal } from '../src/application/crearPortal.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeAdministracion } from './support/fakeAdministracion.js'
import { SesionExpirada } from '../src/ports/errores.js'

async function crear(options = {}) {
  const ports = fakePorts({ autenticado: true, ...options }),
    datos = fakeAdministracion(ports),
    app = crearPortal(ports)
  await app.restaurar()
  if (options.empresas?.length > 1) await app.seleccionarEmpresa('A')
  return { app, ports, datos, servicio: app.configuracion }
}
test('configuración utiliza contexto revalidado, ignora Tenant y campos internos suministrados por UI', async () => {
  const { app, servicio, ports, datos } = await crear()
  const antes = ports.calls.filter((c) => c[0] === 'resolver').length
  await servicio.guardarEmpresa({
    nombre: ' Nuevo nombre ',
    tenantId: 'B',
    id: 'manipulado',
    codigo: 'NUEVO',
    estado: 'INACTIVA'
  })
  assert.equal(datos.empresas.A.nombre, 'Nuevo nombre')
  assert.equal(datos.empresas.A.codigo, 'A')
  await servicio.guardarMembresia({
    usuarioId: 'persona-A',
    roles: [],
    activo: false,
    trabajadorId: null,
    nombre: 'Nombre A',
    tenantId: 'B',
    cuentaActiva: false
  })
  assert.deepEqual(ports.calls.find((c) => c[0] === 'membresia')[2], {
    usuarioId: 'persona-A',
    roles: [],
    activo: false,
    trabajadorId: null,
    nombre: 'Nombre A'
  })
  assert.equal(datos.usuarios.A[0].cuentaActiva, true)
  assert.equal(ports.calls.filter((c) => c[0] === 'resolver').length, antes + 2)
  assert.equal(await app.abrirRuta('/configuracion/usuarios/persona-A'), true)
})
test('company.manage funciona sin módulos ni delegación comercial; rutas de configuración protegidas', async () => {
  const { app, servicio } = await crear({
    permisos: { A: ['company.manage'] },
    modulos: { A: [] }
  })
  assert.equal((await servicio.listarUsuarios()).total, 1)
  assert.deepEqual(await servicio.modulosHabilitados(), [])
  assert.equal(await app.abrirRuta('/configuracion/roles'), true)
  assert.equal(servicio.cambiarPlan, undefined)
  const denegado = await crear({ permisos: { A: ['harvest.view'] } })
  assert.equal(await denegado.app.abrirRuta('/configuracion/usuarios'), false)
  await assert.rejects(denegado.servicio.listarUsuarios(), /permiso/i)
  assert.equal(
    denegado.ports.calls.some((c) => c[0] === 'listar'),
    false
  )
})
test('altas limpian payload y no aceptan actor, secretos ni módulos desde Presentation', async () => {
  const { servicio, ports } = await crear()
  const r = await servicio.invitarUsuario({
    operacionId: 'op-1',
    nombre: ' Nueva ',
    email: ' NUEVA@EXAMPLE.TEST ',
    roles: ['A-consulta'],
    tenantId: 'B',
    actor: 'falso',
    password: 'secreto',
    modulos: ['HARVEST']
  })
  assert.equal(r.tenantId, 'A')
  assert.deepEqual(ports.calls.find((c) => c[0] === 'invitacion')[2], {
    operacionId: 'op-1',
    nombre: 'Nueva',
    email: 'nueva@example.test',
    roles: ['A-consulta'],
    trabajadorId: null
  })
})
test('cambio A→B→A descarta respuesta anterior y no comparte estado ni membresías', async () => {
  const { app, ports, servicio, datos } = await crear({
    empresas: ['A', 'B'],
    permisos: { A: ['company.manage'], B: ['company.manage'] }
  })
  let resolver, inicio
  const empezada = new Promise((r) => {
    inicio = r
  })
  const original = ports.administracion.listarUsuarios
  ports.administracion.listarUsuarios = async (...args) => {
    const resultado = await original(...args)
    inicio()
    await new Promise((r) => {
      resolver = r
    })
    return resultado
  }
  const pendiente = servicio.listarUsuarios()
  await empezada
  await app.seleccionarEmpresa('B')
  await app.seleccionarEmpresa('A')
  resolver()
  await assert.rejects(pendiente, { name: 'SolicitudObsoleta' })
  ports.administracion.listarUsuarios = original
  await servicio.guardarMembresia({
    usuarioId: 'persona-A',
    nombre: 'A suspendida',
    activo: false,
    roles: [],
    trabajadorId: null
  })
  await app.seleccionarEmpresa('B')
  assert.equal((await servicio.listarUsuarios()).usuarios[0].nombre, 'Persona B')
  assert.equal(datos.usuarios.B[0].activo, true)
})
test('sesión revocada durante escritura limpia Portal; permiso revocado se revalida antes de actuar', async () => {
  const { app, ports, servicio } = await crear()
  ports.administracion.guardarEmpresa = async () => {
    throw new SesionExpirada()
  }
  await assert.rejects(servicio.guardarEmpresa({ nombre: 'X' }), SesionExpirada)
  assert.equal(app.estadoActual().fase, 'login')
  assert.equal(app.estadoActual().contexto, null)
  const otro = await crear()
  otro.ports.permisos.A = []
  await assert.rejects(otro.servicio.guardarEmpresa({ nombre: 'X' }), /permiso/i)
  assert.equal(
    otro.ports.calls.some((c) => c[0] === 'guardarEmpresa'),
    false
  )
})
