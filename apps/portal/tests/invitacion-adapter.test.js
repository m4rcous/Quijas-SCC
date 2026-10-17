import assert from 'node:assert/strict'
import test from 'node:test'
import { crearInvitacionAdapter } from '../src/infrastructure/supabase/invitacionAdapter.js'
import { crearPuertosSupabase } from '../src/infrastructure/supabase/adapters.js'
import { SesionExpirada, ServicioNoDisponible } from '../src/ports/errores.js'
import { AccesoDenegado } from '../../../src/contexts/identity-access/index.js'

test('enlace de invitación se verifica sólo en adapter y limpia tokens de URL antes de React', async () => {
  const calls = [],
    cliente = {
      auth: {
        verifyOtp: async (d) => {
          calls.push(d)
          return {}
        },
        getUser: async () => ({ data: { user: { id: 'u' } } }),
        updateUser: async (d) => {
          calls.push(d)
          return {}
        }
      }
    }
  const adapter = crearInvitacionAdapter(
    cliente,
    'https://portal.test/aceptar-invitacion?type=invite&token_hash=secreto',
    (path) => calls.push(path)
  )
  assert.deepEqual(calls, ['/aceptar-invitacion'])
  assert.equal(adapter.tieneInvitacion(), true)
  assert.equal(await adapter.completarInvitacion('contraseña-nueva'), undefined)
  assert.deepEqual(calls.slice(1), [
    { token_hash: 'secreto', type: 'invite' },
    { password: 'contraseña-nueva' },
    '/'
  ])
  assert.equal(adapter.tieneInvitacion(), false)
  assert.doesNotMatch(JSON.stringify(adapter), /secreto/)
})
test('enlace Auth por fragmento se restaura y un fallo de contraseña no reutiliza token de un solo uso', async () => {
  let verificaciones = 0,
    cambios = 0
  const cliente = {
    auth: {
      setSession: async (d) => {
        verificaciones++
        assert.deepEqual(d, { access_token: 'access', refresh_token: 'refresh' })
        return {}
      },
      getUser: async () => ({ data: { user: { id: 'u' } } }),
      updateUser: async () => ({
        error: ++cambios === 1 ? new Error('Política del proveedor') : null
      })
    }
  }
  const adapter = crearInvitacionAdapter(
    cliente,
    'https://portal.test/aceptar-invitacion#type=invite&access_token=access&refresh_token=refresh',
    () => {}
  )
  await assert.rejects(adapter.completarInvitacion('débil'), /política de contraseñas/)
  await adapter.completarInvitacion('más-fuerte-123')
  assert.equal(verificaciones, 1)
  assert.equal(cambios, 2)
})
test('enlace expirado o cuenta no verificada no permiten cambiar contraseña; errores no exponen tokens', async () => {
  for (const fallo of ['token', 'usuario']) {
    let cambios = 0
    const adapter = crearInvitacionAdapter(
      {
        auth: {
          verifyOtp: async () => ({
            error: fallo === 'token' ? new Error('token-super-secreto') : null
          }),
          getUser: async () => ({ data: { user: null } }),
          updateUser: async () => {
            cambios++
            return {}
          }
        }
      },
      'https://portal.test/aceptar-invitacion?type=invite&token_hash=token-super-secreto',
      () => {}
    )
    await assert.rejects(
      adapter.completarInvitacion('password'),
      (error) => !error.message.includes('token-super-secreto')
    )
    assert.equal(cambios, 0)
  }
  const invalido = crearInvitacionAdapter(
    {},
    'https://portal.test/?type=invite&token_hash=otro',
    () => {}
  )
  assert.equal(invalido.tieneInvitacion(), false)
})
test('adapter de administración usa RPC específicos y backend de invitación sin credenciales privilegiadas', async () => {
  const calls = [],
    cliente = {
      rpc: async (name, args) => {
        calls.push([name, args])
        return { data: {} }
      },
      functions: {
        invoke: async (name, args) => {
          calls.push([name, args])
          return { data: { usuarioId: 'u' } }
        }
      }
    }
  const { administracion: a } = crearPuertosSupabase(cliente)
  await a.guardarMembresia('A', {
    usuarioId: 'u',
    nombre: 'Nombre',
    activo: false,
    roles: [],
    trabajadorId: null,
    tenantId: 'B',
    secreto: 'ignorar'
  })
  assert.deepEqual(calls[0], [
    'iam_admin_guardar_membresia',
    {
      p_tenant_id: 'A',
      p_usuario_id: 'u',
      p_nombre: 'Nombre',
      p_activo: false,
      p_roles: [],
      p_trabajador_id: null
    }
  ])
  await a.invitarUsuario('A', {
    operacionId: 'op',
    email: 'u@example.test',
    nombre: 'U',
    roles: [],
    trabajadorId: null,
    serviceKey: 'ignorar'
  })
  assert.deepEqual(calls[1], [
    'invitar-usuario',
    {
      body: {
        operacionId: 'op',
        tenantId: 'A',
        email: 'u@example.test',
        nombre: 'U',
        roles: [],
        trabajadorId: null
      }
    }
  ])
  for (const [status, tipo] of [
    [401, SesionExpirada],
    [403, AccesoDenegado]
  ]) {
    cliente.functions.invoke = async () => ({ error: { context: { status } } })
    await assert.rejects(a.invitarUsuario('A', {}), tipo)
  }
  cliente.functions.invoke = async () => {
    throw new Error('red')
  }
  await assert.rejects(a.invitarUsuario('A', {}), ServicioNoDisponible)
})
