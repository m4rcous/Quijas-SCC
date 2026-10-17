import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Portal } from '../src/presentation/Portal.jsx'
import { crearPortal } from '../src/application/crearPortal.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeAdministracion } from './support/fakeAdministracion.js'

function montar(path, options = {}) {
  const ports = fakePorts({ autenticado: true, ...options }),
    datos = fakeAdministracion(ports),
    portal = crearPortal(ports)
  render(
    <MemoryRouter initialEntries={[path]}>
      <Portal portal={portal} />
    </MemoryRouter>
  )
  return { ports, datos, portal }
}
describe('Configuración del Portal con Application real', () => {
  it('edita sólo nombre de empresa y mantiene código/identificadores fuera del formulario', async () => {
    const { datos } = montar('/configuracion/empresa'),
      user = userEvent.setup()
    const nombre = await screen.findByLabelText('Nombre de la empresa')
    expect(screen.queryByLabelText('Código')).not.toBeInTheDocument()
    await user.clear(nombre)
    await user.type(nombre, 'Nueva empresa')
    await user.click(screen.getByRole('button', { name: 'Guardar empresa' }))
    await waitFor(() => expect(datos.empresas.A.nombre).toBe('Nueva empresa'))
    await screen.findByLabelText('Nombre de la empresa')
    expect(datos.empresas.A.codigo).toBe('A')
  })
  it('lista, busca y abre usuario sin trabajador; catálogo muestra trabajadores sin cuenta', async () => {
    montar('/configuracion/usuarios')
    const user = userEvent.setup()
    expect(await screen.findByText('Sin asociación')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Buscar por nombre o correo'), 'nadie')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await screen.findByText('No hay usuarios que coincidan.')
    await user.clear(screen.getByLabelText('Buscar por nombre o correo'))
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(
      await screen.findByRole('link', { name: 'Ver accesos de Persona A' })
    )
    const trabajador = await screen.findByLabelText(/Trabajador asociado/)
    expect(trabajador).toHaveValue('')
    expect(screen.getByRole('option', { name: /Trabajador A/ })).toBeInTheDocument()
    expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument()
  })
  it('asigna/retira roles, asocia trabajador, suspende y reactiva sólo la membresía', async () => {
    const { datos } = montar('/configuracion/usuarios/persona-A'),
      user = userEvent.setup()
    const trabajador = await screen.findByLabelText(/Trabajador asociado/)
    await user.selectOptions(trabajador, 'A-worker')
    await user.click(screen.getByRole('checkbox', { name: /GESTOR/ }))
    await user.click(screen.getByRole('checkbox', { name: /CONSULTA/ }))
    await user.click(screen.getByRole('button', { name: 'Guardar membresía' }))
    await waitFor(() => expect(datos.usuarios.A[0].roles).toEqual(['A-gestor']))
    await screen.findByLabelText('Estado de la membresía')
    expect(datos.usuarios.A[0].trabajadorId).toBe('A-worker')
    expect(
      screen.getByText('campaign.manage', { selector: 'code' })
    ).toBeInTheDocument()
    await user.selectOptions(
      screen.getByLabelText('Estado de la membresía'),
      'suspendida'
    )
    await user.click(screen.getByRole('button', { name: 'Guardar membresía' }))
    await screen.findByText('Sin permisos efectivos')
    expect(datos.usuarios.A[0].cuentaActiva).toBe(true)
    await user.selectOptions(screen.getByLabelText('Estado de la membresía'), 'activa')
    await user.selectOptions(screen.getByLabelText(/Trabajador asociado/), '')
    await user.click(screen.getByRole('button', { name: 'Guardar membresía' }))
    await waitFor(() => expect(datos.usuarios.A[0].activo).toBe(true))
    expect(datos.usuarios.A[0].trabajadorId).toBe(null)
  })
  it('invita sin solicitar contraseña y abre el detalle de la membresía creada', async () => {
    const { ports } = montar('/configuracion/invitaciones'),
      user = userEvent.setup()
    await user.type(await screen.findByLabelText('Nombre'), 'Nueva gestión')
    await user.type(screen.getByLabelText('Correo electrónico'), 'nueva@example.test')
    await user.click(screen.getByRole('checkbox', { name: /CONSULTA/ }))
    expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Invitar o vincular' }))
    await screen.findByRole('heading', { name: 'Accesos de Nueva gestión' })
    const solicitud = ports.calls.find((c) => c[0] === 'invitacion')
    expect(solicitud[1]).toBe('A')
    expect(solicitud[2].trabajadorId).toBe(null)
    expect(solicitud[2].roles).toEqual(['A-consulta'])
    expect(solicitud[2].password).toBeUndefined()
  })
  it('roles y módulos son consulta; company.manage no permite modificar contratación', async () => {
    montar('/configuracion/roles', {
      permisos: { A: ['company.manage'] },
      modulos: { A: ['HARVEST'] }
    })
    const user = userEvent.setup()
    await screen.findByRole('heading', { name: 'ADMIN_EMPRESA' })
    expect(screen.getByText('company.manage', { selector: 'code' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Crear rol/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Módulos', exact: true }))
    await screen.findByText('HARVEST: Habilitado')
    expect(screen.getByText('WORKFORCE: No habilitado')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Habilitar|Cambiar plan/ })
    ).not.toBeInTheDocument()
  })
  it('ruta directa exige company.manage; ningún listado se consulta sin permiso', async () => {
    const { ports } = montar('/configuracion/usuarios', {
      permisos: { A: ['harvest.view'] }
    })
    await screen.findByRole('heading', { name: 'Acceso restringido' })
    expect(ports.calls.some((c) => c[0] === 'listar')).toBe(false)
  })
  it('detalle ajeno muestra rechazo sin perder el Tenant autorizado ni repetir consultas', async () => {
    const { ports, portal } = montar('/configuracion/usuarios/persona-B')
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario ajeno.')
    expect(portal.estadoActual().contexto.tenantId).toBe('A')
    expect(ports.calls.filter((c) => c[0] === 'detalle')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
  it('cambiar empresa descarta formularios y consultas anteriores', async () => {
    const { datos } = montar('/configuracion/usuarios/persona-A', {
        empresas: ['A', 'B'],
        permisos: { A: ['company.manage'], B: ['company.manage'] }
      }),
      user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Empresa A/ }))
    await user.clear(await screen.findByLabelText('Nombre en esta empresa'))
    await user.type(
      screen.getByLabelText('Nombre en esta empresa'),
      'Cambios sin guardar'
    )
    await user.selectOptions(screen.getByLabelText('Empresa activa'), 'B')
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    expect(screen.queryByDisplayValue('Cambios sin guardar')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Plataforma' }))
    await user.click(screen.getByRole('button', { name: 'Configuración', exact: true }))
    await user.click(
      await screen.findByRole('link', { name: 'Usuarios y accesos', exact: true })
    )
    await screen.findByRole('link', { name: 'Ver accesos de Persona B' })
    expect(screen.queryByText('Persona A')).not.toBeInTheDocument()
    expect(datos.usuarios.A[0].nombre).toBe('Persona A')
  })
  it('invitado define contraseña y entra con membresía validada, sin tokens en React', async () => {
    const ports = fakePorts({ autenticado: true })
    let pendiente = true,
      password
    ports.identity.tieneInvitacion = () => pendiente
    ports.identity.completarInvitacion = async (p) => {
      password = p
      pendiente = false
    }
    const portal = crearPortal(ports),
      user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/aceptar-invitacion']}>
        <Portal portal={portal} />
      </MemoryRouter>
    )
    await user.type(
      await screen.findByLabelText('Nueva contraseña'),
      'contraseña-nueva'
    )
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'contraseña-nueva')
    await user.click(screen.getByRole('button', { name: 'Activar cuenta' }))
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    expect(password).toBe('contraseña-nueva')
    expect(JSON.stringify(portal.estadoActual())).not.toContain('contraseña-nueva')
  })
})
