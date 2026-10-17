import { describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Portal } from '../src/presentation/Portal.jsx'
import { NavigationRail } from '../src/presentation/Navigation.jsx'
import { crearPortal } from '../src/application/crearPortal.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeReportes } from './support/fakeReportes.js'
import { fakeGestion } from './support/fakeGestion.js'

function mount(path = '/reportes/ranking', options = {}, configure = () => {}) {
  const ports = fakePorts({ autenticado: true, ...options })
  const reportes = fakeReportes(ports)
  configure(ports)
  const portal = crearPortal(ports)
  render(
    <MemoryRouter initialEntries={[path]}>
      <Portal portal={portal} />
    </MemoryRouter>
  )
  return { ports, portal, ...reportes }
}
const ready = () => screen.findByRole('table', { name: 'Ranking de cosechadores' })
const tray = () => screen.getByRole('region', { name: 'Bandeja de comparación' })

describe('Widgets de Home', () => {
  it.each([1, 3])(
    'conserva tabla, fechas y valores exactos con %s puntos diarios',
    async (count) => {
      mount('/', {}, (ports) => {
        const original = ports.reportesHarvest.consultar
        ports.reportesHarvest.consultar = async (...args) => {
          const result = await original(...args)
          if (result.tipo === 'DIARIA') {
            result.datos.produccion = Array.from({ length: count }, (_, i) => ({
              fecha: `2026-10-${14 - i}`,
              total_jabas: 23 - i,
              total_cosechadores: 1,
              total_sesiones: 2
            }))
          }
          return result
        }
      })
      const table = await screen.findByRole('table', { name: 'Producción diaria' })
      expect(within(table).getAllByRole('row')).toHaveLength(count + 1)
      expect(screen.getAllByRole('meter')).toHaveLength(count)
      for (let i = 0; i < count; i++)
        expect(screen.getAllByRole('meter')[i]).toHaveAttribute('value', String(23 - i))
      expect(within(table).queryByText('2026-10-14')).not.toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Clima no configurado' })
      ).toBeInTheDocument()
    }
  )
})

describe('Navigation Rail y panel contextual', () => {
  const rutas = [
    { path: '/', nombre: 'Inicio' },
    { path: '/cosecha', nombre: 'Cosecha' },
    { path: '/reportes', nombre: 'Reportes' },
    { path: '/estructura', nombre: 'Estructura agrícola' },
    { path: '/configuracion', nombre: 'Configuración' }
  ]
  function navigation() {
    return render(
      <MemoryRouter initialEntries={['/reportes/ranking']}>
        <NavigationRail
          navegacion={rutas}
          path="/reportes/ranking"
          mobileOpen={false}
          onClose={() => {}}
        />
        <button>Fuera del menú</button>
      </MemoryRouter>
    )
  }
  it('abre por hover y foco, permite flechas y Escape, sin mover el contenido', async () => {
    navigation()
    const user = userEvent.setup(),
      operation = screen.getByRole('button', { name: 'Operación agrícola' }),
      rail = within(
        screen
          .getByRole('navigation', { name: 'Navegación principal' })
          .querySelector('.navigation-rail')
      )
    expect(operation).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('button', { name: 'Reportes', exact: true })
    ).not.toBeInTheDocument()
    await user.hover(operation)
    expect(operation).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.queryByRole('link', { name: 'Ranking de cosechadores' })
    ).not.toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Reportes', exact: true }))
    expect(
      screen.getByRole('link', { name: 'Ranking de cosechadores' })
    ).toHaveAttribute('aria-current', 'page')
    fireEvent.mouseLeave(operation.closest('aside'), {
      relatedTarget: screen.getByRole('button', { name: 'Fuera del menú' })
    })
    expect(operation).toHaveAttribute('aria-expanded', 'false')
    act(() => operation.focus())
    expect(operation).toHaveAttribute('aria-expanded', 'true')
    expect(operation).toHaveAttribute('aria-describedby')
    await user.keyboard('{ArrowDown}')
    const structure = rail.getByRole('button', { name: 'Estructura agrícola' })
    expect(structure).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(screen.getByRole('button', { name: 'Plataforma' })).toHaveFocus()
    act(() => structure.focus())
    const module = within(
      screen.getByRole('region', { name: 'Estructura agrícola' })
    ).getByRole('button', { name: 'Estructura agrícola' })
    act(() => module.focus())
    await user.keyboard('{Enter}')
    expect(screen.getByRole('link', { name: 'Fundos' })).toHaveAttribute(
      'href',
      '/estructura/fundos'
    )
    await user.keyboard('{Escape}{Escape}')
    expect(structure).toHaveFocus()
    expect(screen.queryByRole('link', { name: 'Fundos' })).not.toBeInTheDocument()
    await user.keyboard('{End}')
    expect(screen.getByRole('button', { name: 'Plataforma' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Fuera del menú' }))
    expect(screen.getByRole('button', { name: 'Plataforma' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })
  it('fija el panel y lo contrae explícitamente', async () => {
    navigation()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Fijar navegación' }))
    await user.click(screen.getByRole('button', { name: 'Fuera del menú' }))
    expect(
      screen.getByRole('button', { name: 'Reportes', exact: true })
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Contraer navegación' }))
    expect(
      screen.queryByRole('button', { name: 'Reportes', exact: true })
    ).not.toBeInTheDocument()
  })
  it('mantiene Cosecha al cruzar el espacio y la cierra al entrar en Reportes; sólo abre un módulo', async () => {
    navigation()
    const user = userEvent.setup()
    const operation = screen.getByRole('button', { name: 'Operación agrícola' })
    fireEvent.mouseEnter(operation)
    const harvest = screen.getByRole('button', { name: 'Cosecha', exact: true })
    const reports = screen.getByRole('button', { name: 'Reportes', exact: true })
    fireEvent.mouseEnter(harvest)
    const last = screen.getByRole('link', { name: 'Registros de cosecha' })
    const panel = screen.getByRole('region', { name: 'Operación agrícola' })
    fireEvent.mouseLeave(last.closest('.navigation-module'), {
      relatedTarget: reports.parentElement.parentElement
    })
    expect(harvest).toHaveAttribute('aria-expanded', 'true')
    expect(last).toBeVisible()
    fireEvent.mouseEnter(reports)
    expect(reports).toHaveAttribute('aria-expanded', 'true')
    expect(harvest).toHaveAttribute('aria-expanded', 'false')
    expect(last).not.toBeVisible()
    expect(screen.getByRole('link', { name: 'Ranking de cosechadores' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Fijar navegación' }))
    fireEvent.mouseEnter(harvest)
    fireEvent.mouseEnter(reports)
    fireEvent.mouseLeave(panel.querySelector('.navigation-modules'), {
      relatedTarget: screen.getByRole('button', { name: 'Fuera del menú' })
    })
    expect(operation).toHaveAttribute('aria-expanded', 'true')
    expect(harvest).toHaveAttribute('aria-expanded', 'false')
    expect(reports).toHaveAttribute('aria-expanded', 'false')
  })
  it('Inicio navega directamente y no abre un panel redundante ni textos de relleno', async () => {
    mount()
    await ready()
    const user = userEvent.setup(),
      home = screen.getByRole('link', { name: 'Inicio', exact: true })
    await user.hover(home)
    expect(screen.queryByRole('region', { name: 'Inicio' })).not.toBeInTheDocument()
    await user.click(home)
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    expect(home).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Su espacio de gestión')).not.toBeInTheDocument()
    expect(screen.queryByText('Gestión conectada al campo')).not.toBeInTheDocument()
  })
  it('Campañas abre la lista real y sale del dashboard', async () => {
    mount('/', {}, (ports) => fakeGestion(ports))
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    const user = userEvent.setup()
    await user.hover(screen.getByRole('button', { name: 'Operación agrícola' }))
    const campaign = screen.getByRole('link', { name: 'Campañas', exact: true })
    expect(campaign).toHaveAttribute('href', '/campanias')
    await user.click(campaign)
    await screen.findByRole('heading', { name: 'Campañas de la empresa' })
    expect(await screen.findByRole('link', { name: 'Ver C-A' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Bienvenido a GesGROW' })
    ).not.toBeInTheDocument()
  })
  it('usa las rutas efectivas: no crea colecciones ni subrutas de módulos deshabilitados', async () => {
    mount('/', {
      permisos: { A: ['reports.view', 'company.manage'] },
      modulos: { A: [] }
    })
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    expect(
      screen.queryByRole('button', { name: 'Operación agrícola' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Estructura agrícola' })
    ).not.toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Plataforma' }))
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Configuración', exact: true }))
    expect(screen.getByRole('link', { name: 'Usuarios y accesos' })).toHaveAttribute(
      'href',
      '/configuracion/usuarios'
    )
    expect(
      screen.queryByRole('link', { name: 'Ranking de cosechadores' })
    ).not.toBeInTheDocument()
  })
  it('drawer permite cambiar colección y cierra al navegar, devolviendo foco', async () => {
    mount('/')
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    const user = userEvent.setup(),
      trigger = screen.getByRole('button', { name: 'Menú', exact: true })
    await user.click(trigger)
    const drawer = screen.getByRole('dialog', { name: 'Menú del Portal' })
    await user.click(within(drawer).getByRole('button', { name: 'Operación agrícola' }))
    await user.click(
      within(drawer).getByRole('button', { name: 'Reportes', exact: true })
    )
    await user.click(
      within(drawer).getByRole('link', { name: 'Ranking de cosechadores' })
    )
    await ready()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})

describe('Ranking y comparación con totales del read model', () => {
  it('ranking vacío muestra estado honesto y no permite comparar', async () => {
    mount('/reportes/ranking', {}, (ports) => {
      const original = ports.reportesHarvest.consultar
      ports.reportesHarvest.consultar = async (...args) => {
        const result = await original(...args)
        if (result.tipo === 'RANKING') result.datos.ranking = []
        return result
      }
    })
    await screen.findByText('Sin datos para los filtros seleccionados.')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(within(tray()).getByRole('button', { name: /^Comparar/ })).toBeDisabled()
    expect(
      screen.queryByRole('table', { name: /Comparación de cosechadores/ })
    ).not.toBeInTheDocument()
  })
  it('selecciona por teclado, compara datos exactos en barras y tabla, quita y limpia', async () => {
    mount()
    await ready()
    const user = userEvent.setup(),
      ana = screen.getByRole('checkbox', { name: 'Comparar a Ana A' })
    expect(within(tray()).getByRole('button', { name: /^Comparar/ })).toBeDisabled()
    act(() => ana.focus())
    await user.keyboard(' ')
    await user.click(screen.getByRole('checkbox', { name: 'Comparar a Bruno A' }))
    await user.click(within(tray()).getByRole('button', { name: 'Comparar 2' }))
    const table = screen.getByRole('table', {
      name: 'Comparación de cosechadores · Campaña'
    })
    expect(within(table).getByText('23')).toBeInTheDocument()
    expect(within(table).getByText('20')).toBeInTheDocument()
    const result = screen.getByRole('region', { name: 'Resultado de comparación' })
    expect(result).toHaveFocus()
    expect(within(result).getByLabelText('Ana A: 23 jabas')).toHaveAttribute(
      'tabindex',
      '0'
    )
    expect(within(result).getAllByRole('tooltip')).toHaveLength(2)
    await user.click(within(tray()).getByRole('button', { name: 'Quitar a Ana A' }))
    expect(
      screen.queryByRole('table', { name: /Comparación de cosechadores/ })
    ).not.toBeInTheDocument()
    expect(ana).not.toBeChecked()
    await user.click(within(tray()).getByRole('button', { name: 'Limpiar selección' }))
    expect(within(tray()).getByText('0 de 5')).toBeInTheDocument()
  })
  it('conserva selección entre búsquedas y exporta exactamente el snapshot filtrado mostrado', async () => {
    const { archivos } = mount()
    await ready()
    const user = userEvent.setup()
    await user.click(screen.getByRole('checkbox', { name: 'Comparar a Ana A' }))
    await user.type(screen.getByLabelText('Buscar por nombre o DNI'), 'Bruno')
    await waitFor(() =>
      expect(
        screen.queryByRole('checkbox', { name: 'Comparar a Ana A' })
      ).not.toBeInTheDocument()
    )
    await user.click(
      await screen.findByRole('checkbox', { name: 'Comparar a Bruno A' })
    )
    expect(
      within(tray()).getByRole('button', { name: 'Quitar a Ana A' })
    ).toBeInTheDocument()
    await user.click(within(tray()).getByRole('button', { name: 'Comparar 2' }))
    expect(
      screen.getByRole('table', { name: /Comparación de cosechadores/ })
    ).toHaveTextContent('Ana A')
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    await waitFor(() => expect(archivos).toHaveLength(1))
    expect(archivos[0].contenido).toContain('Bruno A')
    expect(archivos[0].contenido).not.toContain('Ana A')
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(
      await screen.findByRole('checkbox', { name: 'Comparar a Ana A' })
    ).toBeChecked()
  })
  it('limita a cinco, permite sustituir una selección y nunca inventa resultados temporales', async () => {
    mount('/reportes/ranking', {}, (ports) => {
      const original = ports.reportesHarvest.consultar
      ports.reportesHarvest.consultar = async (...args) => {
        const result = await original(...args)
        if (result.tipo === 'RANKING')
          result.datos.ranking = Array.from({ length: 6 }, (_, i) => ({
            posicion: i + 1,
            cosechador_dni: String(i),
            cosechador: `Persona ${i}`,
            total_jabas: 30 - i,
            ultima_lectura: null
          }))
        return result
      }
    })
    await ready()
    const user = userEvent.setup()
    for (let i = 0; i < 5; i++)
      await user.click(
        screen.getByRole('checkbox', { name: `Comparar a Persona ${i}` })
      )
    expect(
      screen.getByRole('checkbox', { name: 'Comparar a Persona 5' })
    ).toBeDisabled()
    expect(screen.getByText(/Límite de 5/)).toBeInTheDocument()
    for (let i = 0; i < 5; i++)
      expect(within(tray()).getByText(`Persona ${i}`).closest('li')).toHaveClass(`series-${i + 1}`)
    await user.click(within(tray()).getByRole('button', { name: 'Quitar a Persona 0' }))
    await user.click(screen.getByRole('checkbox', { name: 'Comparar a Persona 5' }))
    await user.click(within(tray()).getByRole('button', { name: 'Comparar 5' }))
    // Removing green frees its slot; existing workers keep aqua/gold/soil/berry.
    for (let i = 1; i < 5; i++) {
      expect(within(tray()).getByText(`Persona ${i}`).closest('li')).toHaveClass(`series-${i + 1}`)
      expect(screen.getByLabelText(`Persona ${i}: ${30 - i} jabas`)).toHaveClass(`series-${i + 1}`)
    }
    expect(screen.getByLabelText('Persona 5: 25 jabas')).toHaveClass('series-1')
    expect(
      within(
        screen.getByRole('table', { name: /Comparación de cosechadores/ })
      ).getAllByRole('row')
    ).toHaveLength(6)
    expect(
      screen.getByText(/La evolución por día de cada cosechador aún no está disponible/)
    ).toBeInTheDocument()
  })
  it('conserva Hoy/Semana/Mes/Campaña y limpia selección al cambiar periodo, campaña o actualizar', async () => {
    const { ports } = mount()
    await ready()
    const user = userEvent.setup()
    for (const [enumValue, label] of [
      ['HOY', 'Hoy'],
      ['SEMANA', 'Semana'],
      ['MES', 'Mes'],
      ['CAMPANIA', 'Campaña']
    ]) {
      await user.click(screen.getByRole('checkbox', { name: 'Comparar a Ana A' }))
      await user.click(screen.getByRole('button', { name: label, exact: true }))
      await ready()
      expect(
        screen.getByRole('checkbox', { name: 'Comparar a Ana A' })
      ).not.toBeChecked()
      expect(
        ports.calls.filter((c) => c[0] === 'consultarReporte').at(-1)[2].periodo
      ).toBe(enumValue)
    }
    await user.click(screen.getByRole('checkbox', { name: 'Comparar a Ana A' }))
    await user.selectOptions(screen.getByLabelText('Campaña'), 'A-cerrada')
    await ready()
    expect(within(tray()).getByText('0 de 5')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Comparar a Ana A' }))
    await user.click(screen.getByRole('button', { name: 'Actualizar datos' }))
    await ready()
    expect(within(tray()).getByText('0 de 5')).toBeInTheDocument()
  })
  it('limpia comparación y descarta ranking tardío al cambiar Tenant', async () => {
    const { ports } = mount('/reportes/ranking', {
      empresas: ['A', 'B'],
      permisos: { A: ['reports.view'], B: ['reports.view'] }
    })
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Empresa A/ }))
    await ready()
    await user.click(screen.getByRole('checkbox', { name: 'Comparar a Ana A' }))
    const original = ports.reportesHarvest.consultar
    let release, start
    const started = new Promise((resolve) => {
      start = resolve
    })
    ports.reportesHarvest.consultar = async (...args) => {
      const result = await original(...args)
      if (args[0] === 'A') {
        start()
        await new Promise((resolve) => {
          release = resolve
        })
      }
      return result
    }
    await user.type(screen.getByLabelText('Buscar por nombre o DNI'), 'A')
    await started
    await user.selectOptions(screen.getByLabelText('Empresa activa'), 'B')
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    await act(async () => release())
    await user.click(screen.getByRole('button', { name: 'Operación agrícola' }))
    await user.click(screen.getByRole('button', { name: 'Reportes', exact: true }))
    await user.click(screen.getByRole('link', { name: 'Ranking de cosechadores' }))
    await ready()
    expect(within(tray()).getByText('0 de 5')).toBeInTheDocument()
    expect(screen.queryByText('Ana A')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Comparar a Ana B' })).not.toBeChecked()
  })
})
