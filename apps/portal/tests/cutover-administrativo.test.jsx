import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { crearPortal } from '../src/application/crearPortal.js'
import { Portal } from '../src/presentation/Portal.jsx'
import { ServicioNoDisponible } from '../src/ports/errores.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeGestion } from './support/fakeGestion.js'
import { fakeCutover } from './support/fakeCutover.js'
function montar(path = '/campanias/A-camp', options = {}) {
  const ports = fakePorts({ autenticado: true, ...options }),
    datos = fakeGestion(ports),
    cortes = fakeCutover(ports)
  const portal = crearPortal(ports)
  render(
    <MemoryRouter initialEntries={[path]}>
      <Portal portal={portal} />
    </MemoryRouter>
  )
  return { ports, datos, cortes }
}
describe('Retirada administrativa progresiva de Sheets', () => {
  it('consulta transición, exige conciliación explícita y muestra autoridad Portal confirmada en servidor', async () => {
    const { ports } = montar(),
      user = userEvent.setup()
    await user.type(
      await screen.findByLabelText('Motivo del cutover'),
      'Pendientes conciliados'
    )
    await user.click(
      screen.getByRole('button', { name: 'Migrar administración al Portal' })
    )
    expect(ports.calls.some((c) => c[0] === 'activarAdmin')).toBe(false)
    await user.click(screen.getByLabelText(/He revisado y conciliado/))
    await user.click(
      screen.getByRole('button', { name: 'Migrar administración al Portal' })
    )
    await screen.findByText(/Portal: autoridad de escritura/)
    expect(
      screen.queryByRole('button', { name: 'Migrar administración al Portal' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/El histórico y los reportes de consulta/)
    ).toBeInTheDocument()
  })
  it('fallo incierto reintenta mismo ID sin iniciar otro corte', async () => {
    const { ports } = montar(),
      user = userEvent.setup(),
      original = ports.cutoverAdministrativo.activar
    let falla = true
    ports.cutoverAdministrativo.activar = async (...a) => {
      const r = await original(...a)
      if (falla) {
        falla = false
        throw new ServicioNoDisponible()
      }
      return r
    }
    await user.type(await screen.findByLabelText('Motivo del cutover'), 'Conciliado')
    await user.click(screen.getByLabelText(/He revisado y conciliado/))
    await user.click(
      screen.getByRole('button', { name: 'Migrar administración al Portal' })
    )
    await user.click(
      await screen.findByRole('button', { name: 'Reintentar mismo cutover' })
    )
    await screen.findByText(/Portal: autoridad de escritura/)
    expect(ports.calls.filter((c) => c[0] === 'activarAdmin')[0]).toEqual(
      ports.calls.filter((c) => c[0] === 'activarAdmin')[1]
    )
  })
  it('alta/edición/estado de lote operativo cubre gap sin introducir estructura física', async () => {
    const { datos } = montar(),
      user = userEvent.setup()
    await user.type(await screen.findByLabelText('Código de lote nuevo'), 'NUEVO')
    await user.type(screen.getByLabelText('Nombre de lote nuevo'), 'Norte')
    await user.click(screen.getByLabelText('Nueva asociación: Variedad A'))
    await user.click(screen.getByRole('button', { name: 'Crear lote operativo' }))
    await screen.findByLabelText('Nombre de lote NUEVO')
    await user.clear(screen.getByLabelText('Nombre de lote NUEVO'))
    await user.type(screen.getByLabelText('Nombre de lote NUEVO'), 'Editado')
    await user.click(screen.getByLabelText('Lote activo NUEVO'))
    await user.click(screen.getByRole('button', { name: 'Guardar lote NUEVO' }))
    await waitFor(() =>
      expect(datos.lots.A.find((l) => l.codigo === 'NUEVO')).toMatchObject({
        nombre: 'Editado',
        activo: false
      })
    )
  })
  it('JABERO usa intención de jornada y retiro; no CRUD de rol ni fecha enviada por cliente', async () => {
    const { ports, datos } = montar('/personal/A-worker'),
      user = userEvent.setup()
    await user.selectOptions(
      await screen.findByLabelText('Campaña para participación'),
      'A-camp'
    )
    await user.selectOptions(screen.getByLabelText('Rol operativo'), 'JABERO')
    await user.click(screen.getByRole('button', { name: 'Habilitar jabero para hoy' }))
    await user.click(
      await screen.findByRole('button', { name: 'Habilitar jornada de hoy en C-A' })
    )
    await user.click(
      await screen.findByRole('button', { name: 'Retirar JABERO en C-A' })
    )
    await waitFor(() => expect(datos.participations.A[0].activo).toBe(false))
    expect(ports.calls.filter((c) => c[0] === 'jornadaJabero')).toHaveLength(2)
    expect(screen.queryByLabelText(/Fecha de jornada/)).not.toBeInTheDocument()
  })
  it('sin company.manage no ofrece cutover y al cambiar Tenant no conserva formulario anterior', async () => {
    const { ports } = montar('/campanias/A-camp', {
      permisos: { A: ['campaign.manage'] }
    })
    await screen.findByRole('button', { name: 'Guardar campaña' })
    expect(
      screen.queryByRole('button', { name: 'Migrar administración al Portal' })
    ).not.toBeInTheDocument()
    expect(ports.calls.some((c) => c[0] === 'activarAdmin')).toBe(false)
  })
})
