import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { crearPortal } from '../src/application/crearPortal.js'
import { Portal } from '../src/presentation/Portal.jsx'
import { fakePorts } from './support/fakePorts.js'
import { fakeHarvestAdmin } from './support/fakeHarvestAdmin.js'
function montar(path, options = {}) {
  const ports = fakePorts({
      autenticado: true,
      permisos: { A: ['harvest.view', 'harvest.manage'] },
      ...options
    }),
    datos = fakeHarvestAdmin(ports),
    portal = crearPortal(ports)
  render(
    <MemoryRouter initialEntries={[path]}>
      <Portal portal={portal} />
    </MemoryRouter>
  )
  return { ports, datos, portal }
}
describe('Cosecha administrativa del Portal', () => {
  it('genera mediante intención y muestra lote final incompleto confirmado por servidor', async () => {
    const { ports } = montar('/cosecha/generar'),
      user = userEvent.setup()
    await user.selectOptions(
      await screen.findByLabelText('Campaña para generación'),
      'A-camp'
    )
    await user.type(screen.getByLabelText('Cantidad total de tickets'), '43')
    await user.type(screen.getByLabelText('Tamaño del lote'), '10')
    await user.click(
      screen.getByRole('button', { name: 'Generar tickets', exact: true })
    )
    await screen.findByText('43 tickets · 5 lotes')
    expect(screen.getByText(/3 tickets$/, { selector: 'li' })).toBeInTheDocument()
    expect(ports.calls.find((c) => c[0] === 'generarHarvest')[2].lotes).toBeUndefined()
    expect(
      screen.getByRole('button', { name: 'Generar tickets', exact: true })
    ).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: /Imprimir|Reimprimir/ })
    ).not.toBeInTheDocument()
  })
  it('listado, filtros y detalle enlazan ticket, lote, asignación, trabajador y RegistroCosecha', async () => {
    montar('/cosecha/tickets')
    const user = userEvent.setup()
    await user.selectOptions(
      await screen.findByLabelText('Estado de consumo'),
      'UTILIZADO'
    )
    await user.click(await screen.findByRole('link', { name: 'Ver Ticket TK-A-USADO' }))
    await screen.findByRole('heading', { name: 'Ticket TK-A-USADO' })
    expect(screen.getAllByText('Trabajador A · 12345678').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('link', { name: 'Ver RegistroCosecha' }))
    await screen.findByRole('heading', { name: 'Registro de cosecha' })
    expect(screen.getByText('Versión 1')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Editar|Registrar cosecha/ })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Ver asignación de origen' }))
    await screen.findByRole('heading', { name: 'Asignación de lote' })
    expect(screen.getByText(/no se permite reasignar/)).toBeInTheDocument()
  })
  it('una respuesta perdida permite reintento explícito con la misma intención sin duplicar lotes', async () => {
    const { ports, datos } = montar('/cosecha/generar'),
      user = userEvent.setup(),
      original = ports.harvestAdmin.generar
    let fallo = true
    ports.harvestAdmin.generar = async (...args) => {
      const r = await original(...args)
      if (fallo) {
        fallo = false
        throw new Error('Respuesta perdida.')
      }
      return r
    }
    await user.selectOptions(
      await screen.findByLabelText('Campaña para generación'),
      'A-camp'
    )
    await user.type(screen.getByLabelText('Cantidad total de tickets'), '43')
    await user.type(screen.getByLabelText('Tamaño del lote'), '10')
    await user.click(
      screen.getByRole('button', { name: 'Generar tickets', exact: true })
    )
    await screen.findByText('Respuesta perdida.')
    expect(screen.getByLabelText('Cantidad total de tickets')).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Reintentar generación' }))
    await screen.findByText('43 tickets · 5 lotes')
    expect(Object.keys(datos.recibos)).toHaveLength(1)
    expect(datos.lotes.A).toHaveLength(6)
    const solicitudes = ports.calls.filter((c) => c[0] === 'generarHarvest')
    expect(solicitudes[0][2]).toEqual(solicitudes[1][2])
  })
  it('ticket disponible no tiene registro y lote muestra progreso derivado', async () => {
    montar('/cosecha/tickets/TK-A-LIBRE')
    await screen.findByRole('heading', { name: 'Ticket TK-A-LIBRE' })
    expect(
      screen.getByText('Este ticket todavía no tiene RegistroCosecha.')
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveValue(1)
    expect(
      screen.queryByRole('link', { name: 'Ver RegistroCosecha' })
    ).not.toBeInTheDocument()
  })
  it('consulta no muestra generar y URL directa exige harvest.manage', async () => {
    montar('/cosecha/generar', { permisos: { A: ['harvest.view'] } })
    await screen.findByRole('heading', { name: 'Acceso restringido' })
    expect(screen.getByText(/Se requiere harvest.manage/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Cantidad total de tickets')).not.toBeInTheDocument()
  })
  it('búsqueda y cambio de empresa eliminan resultados anteriores', async () => {
    montar('/cosecha/tickets', {
      empresas: ['A', 'B'],
      permisos: { A: ['harvest.view'], B: ['harvest.view'] }
    })
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Empresa A/ }))
    await user.type(
      await screen.findByLabelText('Buscar código de Ticket'),
      'TK-A-LIBRE'
    )
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Ver Ticket TK-A-USADO' })
      ).not.toBeInTheDocument()
    )
    await user.selectOptions(screen.getByLabelText('Empresa activa'), 'B')
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    await user.click(screen.getByRole('button', { name: 'Operación agrícola' }))
    await user.click(screen.getByRole('button', { name: 'Cosecha', exact: true }))
    await user.click(await screen.findByRole('link', { name: 'Tickets', exact: true }))
    await screen.findByRole('link', { name: 'Ver Ticket TK-B-LIBRE' })
    expect(screen.queryByText('TK-A-LIBRE')).not.toBeInTheDocument()
  })
})
