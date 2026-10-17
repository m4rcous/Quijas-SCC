import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Portal } from '../src/presentation/Portal.jsx'
import { crearPortal } from '../src/application/crearPortal.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeGestion } from './support/fakeGestion.js'
function montar(path, options = {}) {
  const ports = fakePorts({ autenticado: true, ...options }),
    datos = fakeGestion(ports),
    portal = crearPortal(ports)
  render(
    <MemoryRouter initialEntries={[path]}>
      <Portal portal={portal} />
    </MemoryRouter>
  )
  return { ports, datos, portal }
}
describe('Campaign y Workforce del Portal', () => {
  it('lista, filtra, crea y edita campaña; estado sólo mediante acciones semánticas', async () => {
    const { datos } = montar('/campanias'),
      user = userEvent.setup()
    await screen.findByRole('link', { name: 'Ver C-A' })
    await user.selectOptions(screen.getByLabelText('Estado'), 'CERRADA')
    await screen.findByText('No hay campañas que coincidan.')
    await user.click(screen.getByRole('link', { name: 'Crear campaña' }))
    await user.type(await screen.findByLabelText('Código de campaña'), 'NUEVA')
    await user.type(screen.getByLabelText('Nombre de campaña'), 'Nueva campaña')
    await user.type(screen.getByLabelText('Fecha de inicio'), '2026-01-01')
    await user.selectOptions(screen.getByLabelText('Estado inicial'), 'CERRADA')
    await user.click(screen.getByRole('button', { name: 'Crear campaña' }))
    await screen.findByRole('button', { name: 'Activar campaña' })
    expect(screen.queryByLabelText('Estado inicial')).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText('Nombre de campaña'))
    await user.type(screen.getByLabelText('Nombre de campaña'), 'Editada')
    await user.click(screen.getByRole('button', { name: 'Guardar campaña' }))
    await waitFor(() => expect(datos.campaigns.A[1].nombre).toBe('Editada'))
    await user.click(await screen.findByRole('button', { name: 'Activar campaña' }))
    await user.click(await screen.findByRole('button', { name: 'Cerrar campaña' }))
    await screen.findByRole('button', { name: 'Activar campaña' })
    expect(datos.campaigns.A[1].estado).toBe('CERRADA')
  })
  it('administra variedades y configuración del lote operativo sin inventar estructura física', async () => {
    const { datos } = montar('/campanias/A-camp'),
      user = userEvent.setup()
    await user.type(await screen.findByLabelText('Nueva variedad'), 'Nueva selección')
    await user.click(screen.getByRole('button', { name: 'Crear variedad' }))
    await screen.findByLabelText('Nombre de variedad Nueva selección')
    const grupo = screen.getByRole('group', { name: 'Variedades del lote L-A' })
    const { within } = await import('@testing-library/react')
    await user.click(within(grupo).getByRole('checkbox', { name: 'Nueva selección' }))
    await user.click(within(grupo).getByRole('checkbox', { name: 'Variedad A' }))
    await user.click(screen.getByRole('button', { name: 'Guardar variedades de L-A' }))
    await waitFor(() => expect(datos.lots.A[0].variedadIds).toEqual(['A-var-nueva']))
    expect(
      await screen.findByRole('heading', { name: 'Lotes operativos de campaña' })
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Fundo')).not.toBeInTheDocument()
  })
  it('crea, busca, edita, desactiva y reactiva trabajador sin cuenta', async () => {
    const { datos } = montar('/personal'),
      user = userEvent.setup()
    await user.type(
      await screen.findByLabelText('Buscar por DNI o nombre'),
      'sin resultado'
    )
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await screen.findByText('No hay trabajadores que coincidan.')
    await user.click(screen.getByRole('link', { name: 'Crear trabajador' }))
    await user.type(await screen.findByLabelText('DNI'), '77778888')
    await user.type(screen.getByLabelText('Nombres'), 'Nueva')
    await user.type(screen.getByLabelText('Apellidos'), 'Persona')
    expect(screen.queryByLabelText('Correo electrónico')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Crear trabajador' }))
    await screen.findByRole('button', { name: 'Desactivar trabajador' })
    await user.clear(screen.getByLabelText('Nombres'))
    await user.type(screen.getByLabelText('Nombres'), 'Editada')
    await user.click(screen.getByRole('button', { name: 'Guardar trabajador' }))
    await waitFor(() => expect(datos.workers.A[1].nombres).toBe('Editada'))
    await user.click(
      await screen.findByRole('button', { name: 'Desactivar trabajador' })
    )
    await user.click(await screen.findByRole('button', { name: 'Activar trabajador' }))
    await screen.findByRole('button', { name: 'Desactivar trabajador' })
    expect(datos.workers.A[1].activo).toBe(true)
  })
  it('gestiona participación y roles operativos; JABERO diario permanece de consulta', async () => {
    const { datos } = montar('/personal/A-worker'),
      user = userEvent.setup()
    await user.selectOptions(
      await screen.findByLabelText('Campaña para participación'),
      'A-camp'
    )
    expect(screen.queryByRole('option', { name: 'JABERO' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'ADMIN_EMPRESA' })
    ).not.toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Rol operativo'), 'COSECHADOR')
    await user.click(screen.getByRole('button', { name: 'Asignar rol operativo' }))
    await user.click(
      await screen.findByRole('button', { name: 'Retirar COSECHADOR en C-A' })
    )
    await screen.findByRole('button', { name: 'Reactivar COSECHADOR en C-A' })
    expect(datos.participations.A[0].activo).toBe(false)
  })
  it('rutas directas sin permiso o módulo no consultan datos de gestión', async () => {
    const { ports } = montar('/campanias/A-camp', {
      permisos: { A: ['workforce.manage'] }
    })
    await screen.findByRole('heading', { name: 'Acceso restringido' })
    expect(ports.calls.some((c) => c[0] === 'campaign')).toBe(false)
  })
  it('cambio de Tenant limpia formulario de personal y no expone la empresa anterior', async () => {
    const { datos } = montar('/personal/A-worker', {
        empresas: ['A', 'B'],
        permisos: { A: ['workforce.manage'], B: ['workforce.manage'] },
        modulos: { A: ['WORKFORCE'], B: ['WORKFORCE'] }
      }),
      user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Empresa A/ }))
    await user.clear(await screen.findByLabelText('Nombres'))
    await user.type(screen.getByLabelText('Nombres'), 'Sin guardar')
    await user.selectOptions(screen.getByLabelText('Empresa activa'), 'B')
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    expect(screen.queryByDisplayValue('Sin guardar')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Operación agrícola' }))
    await user.click(screen.getByRole('link', { name: 'Personal', exact: true }))
    await screen.findByText('Personal B Agrícola')
    expect(screen.queryByText('Personal A Agrícola')).not.toBeInTheDocument()
    expect(datos.workers.A[0].nombres).toBe('Personal A')
  })
})
