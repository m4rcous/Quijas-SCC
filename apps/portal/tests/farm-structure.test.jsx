import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Portal } from '../src/presentation/Portal.jsx'
import { crearPortal } from '../src/application/crearPortal.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeFarm } from './support/fakeFarm.js'
import { fakeGestion } from './support/fakeGestion.js'
const permisos = {
    A: ['farm.manage', 'campaign.manage'],
    B: ['farm.manage', 'campaign.manage']
  },
  modulos = { A: ['FARM_STRUCTURE', 'CAMPAIGN'], B: ['FARM_STRUCTURE', 'CAMPAIGN'] }
function montar(path = '/estructura', options = {}) {
  const ports = fakePorts({
      autenticado: true,
      permisos: structuredClone(permisos),
      modulos: structuredClone(modulos),
      ...options
    }),
    datos = fakeFarm(ports)
  fakeGestion(ports)
  const portal = crearPortal(ports)
  render(
    <MemoryRouter initialEntries={[path]}>
      <Portal portal={portal} />
    </MemoryRouter>
  )
  return { ports, datos, portal }
}
describe('Estructura agrícola del Portal', () => {
  it('lista, busca, crea, edita y activa/desactiva Fundos sin borrar estructura', async () => {
    const { datos } = montar(),
      u = userEvent.setup()
    await screen.findByRole('button', { name: 'Editar F-A' })
    await u.type(screen.getByLabelText('Buscar por código o nombre'), 'inexistente')
    await screen.findByText('Sin estructura registrada para esta consulta.')
    await u.clear(screen.getByLabelText('Buscar por código o nombre'))
    await u.click(screen.getByRole('button', { name: 'Crear Fundo' }))
    await u.type(screen.getByLabelText('Código físico'), 'F2')
    await u.type(screen.getByLabelText('Nombre físico'), 'Nuevo fundo')
    await u.click(screen.getByRole('button', { name: 'Guardar estructura' }))
    await u.click(await screen.findByRole('button', { name: 'Editar F2' }))
    await u.clear(screen.getByLabelText('Nombre físico'))
    await u.type(screen.getByLabelText('Nombre físico'), 'Fundo editado')
    await u.click(screen.getByRole('button', { name: 'Guardar estructura' }))
    await screen.findByText('Fundo editado')
    await u.click(screen.getByRole('button', { name: 'Desactivar F2' }))
    await u.click(await screen.findByRole('button', { name: 'Activar F2' }))
    await screen.findByRole('button', { name: 'Desactivar F2' })
    expect(datos.rows.A.fundos[1].activo).toBe(true)
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument()
  })
  it('crea Sector con Fundo y Parcela con Sector; editar conserva el padre', async () => {
    const { datos } = montar('/estructura/sectores'),
      u = userEvent.setup()
    await u.click(await screen.findByRole('button', { name: 'Crear Sector' }))
    await u.type(screen.getByLabelText('Código físico'), 'S2')
    await u.type(screen.getByLabelText('Nombre físico'), 'Sector nuevo')
    await u.selectOptions(await screen.findByLabelText('Fundo padre'), 'A-f')
    await u.click(screen.getByRole('button', { name: 'Guardar estructura' }))
    await screen.findByRole('button', { name: 'Editar S2' })
    expect(datos.rows.A.sectores[1].padreId).toBe('A-f')
    await u.click(screen.getByRole('link', { name: 'Parcelas', exact: true }))
    await u.click(await screen.findByRole('button', { name: 'Crear Parcela' }))
    await u.type(screen.getByLabelText('Código físico'), 'P2')
    await u.type(screen.getByLabelText('Nombre físico'), 'Parcela nueva')
    await u.selectOptions(await screen.findByLabelText('Sector padre'), 'A-s')
    await u.click(screen.getByRole('button', { name: 'Guardar estructura' }))
    await u.click(await screen.findByRole('button', { name: 'Editar P2' }))
    expect(screen.queryByLabelText('Sector padre')).not.toBeInTheDocument()
    expect(datos.rows.A.parcelas[1].padreId).toBe('A-s')
  })
  it('lote legacy sin parcela sigue válido; vinculación y baja conservan la referencia', async () => {
    const { datos } = montar('/campanias/A-camp'),
      u = userEvent.setup()
    await screen.findByText('Sin parcelas vinculadas. Este lote sigue siendo válido.')
    await u.selectOptions(
      await screen.findByRole('combobox', { name: /^Parcela para L-A/ }),
      'A-p'
    )
    await u.click(screen.getByRole('button', { name: 'Vincular parcela a L-A' }))
    await u.click(await screen.findByRole('button', { name: 'Desvincular P-A' }))
    await screen.findByRole('button', { name: 'Volver a vincular P-A' })
    expect(datos.links.A['A-lote'][0].vinculoActivo).toBe(false)
  })
  it.each([
    ['permiso', { permisos: { A: ['company.manage'] } }],
    ['módulo', { modulos: { A: ['CAMPAIGN'] } }]
  ])('ruta directa exige %s y no carga datos físicos', async (_, options) => {
    montar('/estructura/parcelas', options)
    await screen.findByRole('heading', { name: 'Acceso restringido' })
    expect(
      screen.queryByLabelText('Buscar por código o nombre')
    ).not.toBeInTheDocument()
  })
  it('cambiar empresa desmonta formularios y datos anteriores', async () => {
    montar('/estructura', { empresas: ['A', 'B'] })
    const u = userEvent.setup()
    await u.click(await screen.findByRole('button', { name: /^Empresa A/ }))
    await u.click(await screen.findByRole('button', { name: 'Crear Fundo' }))
    await u.type(screen.getByLabelText('Nombre físico'), 'Borrador A')
    await u.selectOptions(screen.getByLabelText('Empresa activa'), 'B')
    await waitFor(() =>
      expect(screen.queryByDisplayValue('Borrador A')).not.toBeInTheDocument()
    )
    await u.click(screen.getByRole('button', { name: 'Estructura agrícola' }))
    await u.click(
      within(screen.getByRole('region', { name: 'Estructura agrícola' })).getByRole(
        'button',
        { name: 'Estructura agrícola', exact: true }
      )
    )
    await u.click(screen.getByRole('link', { name: 'Fundos', exact: true }))
    await screen.findByRole('button', { name: 'Editar F-B' })
    expect(screen.queryByText('Nombre fundos A')).not.toBeInTheDocument()
  })
})
