// Fixture exclusiva de desarrollo/pruebas, fuera de la entrada de producción.
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { Portal } from '../src/presentation/Portal.jsx'
import { crearPortal } from '../src/application/crearPortal.js'
import { fakePorts } from './support/fakePorts.js'
import { fakeAdministracion } from './support/fakeAdministracion.js'
import { fakeGestion } from './support/fakeGestion.js'
import { fakeHarvestAdmin } from './support/fakeHarvestAdmin.js'
import { fakeReportes } from './support/fakeReportes.js'
import { fakeComercial } from './support/fakeComercial.js'
import { fakeCutover } from './support/fakeCutover.js'
import { fakeFarm } from './support/fakeFarm.js'
import '@fontsource-variable/inter'
import '../src/presentation/styles.css'
const params = new URLSearchParams(location.search)
const puertos = fakePorts({
  empresas: params.has('single') ? ['A'] : ['A', 'B'],
  autenticado: !location.search.includes('login')
})
fakeAdministracion(puertos)
fakeGestion(puertos)
fakeHarvestAdmin(puertos)
fakeReportes(puertos)
fakeComercial(puertos)
fakeCutover(puertos)
puertos.permisos.A.push('harvest.manage', 'farm.manage')
puertos.modulos.A.push('FARM_STRUCTURE')
fakeFarm(puertos)
createRoot(document.getElementById('root')).render(
  <MemoryRouter
    initialEntries={[
      params.get('ruta') ?? (params.has('settings') ? '/configuracion/usuarios' : '/')
    ]}
  >
    <Portal portal={crearPortal(puertos)} />
  </MemoryRouter>
)
