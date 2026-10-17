import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ThemeSwitcher, UserMenu } from '../src/presentation/Ui.jsx'
import { Portal } from '../src/presentation/Portal.jsx'
import { crearPortal } from '../src/application/crearPortal.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeReportes } from './support/fakeReportes.js'

afterEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
  vi.unstubAllGlobals()
})

describe('Interacción y accesibilidad del rediseño', () => {
  it('UserMenu abre por teclado, recupera el foco con Escape y conserva el cierre de sesión', async () => {
    const logout = vi.fn(),
      user = userEvent.setup()
    render(
      <>
        <UserMenu
          usuario={{ nombre: 'Ana Gestión', email: 'ana@example.test' }}
          onLogout={logout}
        />
        <button>Otra acción</button>
      </>
    )
    const trigger = screen.getByRole('button', { name: 'Menú de usuario' })
    await user.tab()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('region', { name: 'Cuenta de usuario' })).toHaveTextContent(
      'ana@example.test'
    )
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
    expect(
      screen.queryByRole('region', { name: 'Cuenta de usuario' })
    ).not.toBeInTheDocument()
    await user.keyboard('{Enter}')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Otra acción' })).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(logout).toHaveBeenCalledTimes(1)
  })
  it('persiste la preferencia y sigue los cambios del sistema únicamente en modo Sistema', async () => {
    let listener
    const media = {
      matches: false,
      addEventListener: (_, fn) => {
        listener = fn
      },
      removeEventListener: vi.fn()
    }
    vi.stubGlobal('matchMedia', () => media)
    const user = userEvent.setup()
    const view = render(<ThemeSwitcher />)
    expect(document.documentElement.dataset.theme).toBe('light')
    media.matches = true
    act(() => listener())
    expect(document.documentElement.dataset.theme).toBe('dark')
    await user.selectOptions(screen.getByLabelText('Tema'), 'light')
    act(() => listener())
    expect(document.documentElement.dataset.theme).toBe('light')
    view.unmount()
    render(<ThemeSwitcher />)
    expect(screen.getByLabelText('Tema')).toHaveValue('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('el tema funciona aunque el navegador no permita persistir preferencias', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(<ThemeSwitcher />)
    await userEvent.setup().selectOptions(screen.getByLabelText('Tema'), 'dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('el drawer contiene el foco, cierra con Escape y devuelve el foco al botón de apertura', async () => {
    const portal = crearPortal(fakePorts({ autenticado: true }))
    render(
      <MemoryRouter>
        <Portal portal={portal} />
      </MemoryRouter>
    )
    await screen.findByRole('heading', { name: 'Bienvenido a GesGROW' })
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: 'Menú', exact: true })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Menú del Portal' })
    const first = within(dialog).getByRole('button', { name: 'Cerrar menú' })
    expect(first).toHaveFocus()
    await user.tab({ shift: true })
    expect(
      within(dialog).getByRole('button', { name: 'Reportes', exact: true })
    ).toHaveFocus()
    await user.tab()
    expect(first).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('los paneles del dashboard usan reportes existentes y descartan respuestas de la empresa anterior', async () => {
    const ports = fakePorts({
      autenticado: true,
      empresas: ['A', 'B'],
      permisos: { A: ['reports.view'], B: ['reports.view'] }
    })
    fakeReportes(ports)
    const original = ports.reportesHarvest.consultar
    let release, started
    const waiting = new Promise((resolve) => {
      started = resolve
    })
    ports.reportesHarvest.consultar = async (tenant, filters) => {
      const result = await original(tenant, filters)
      if (tenant === 'A' && filters.tipo === 'DIARIA') {
        started()
        await new Promise((resolve) => {
          release = resolve
        })
      }
      return result
    }
    render(
      <MemoryRouter>
        <Portal portal={crearPortal(ports)} />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Empresa A/ }))
    await waiting
    await screen.findByRole('table', { name: 'Ranking de cosechadores' })
    await user.selectOptions(screen.getByLabelText('Empresa activa'), 'B')
    await screen.findByRole('table', { name: 'Producción diaria' })
    await act(async () => release())
    await waitFor(() => expect(screen.queryByText('Ana A')).not.toBeInTheDocument())
    expect(
      within(screen.getByRole('table', { name: 'Ranking de cosechadores' })).getByText(
        'Ana B'
      )
    ).toBeInTheDocument()
    for (const type of ['DASHBOARD', 'DIARIA', 'RANKING', 'LOTES']) {
      expect(
        ports.calls.some(
          (c) => c[0] === 'consultarReporte' && c[1] === 'B' && c[2].tipo === type
        )
      ).toBe(true)
    }
  })
})
