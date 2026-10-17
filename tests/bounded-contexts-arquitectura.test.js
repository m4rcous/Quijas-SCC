import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { backend } from '../src/backend/backend.js'
import { operacionesBackendIdentityAccess } from '../src/contexts/identity-access/index.js'
import { operacionesBackendWorkforce } from '../src/contexts/workforce/index.js'
import { operacionesBackendCampaignManagement } from '../src/contexts/campaign-management/index.js'
import { operacionesBackendHarvest } from '../src/contexts/harvest/index.js'

const src = fileURLToPath(new URL('../src/', import.meta.url))
const sources = new Map(
  readdirSync(src, { recursive: true })
    .filter((file) => file.endsWith('.js'))
    .map((file) => [
      file.replaceAll('\\', '/'),
      readFileSync(path.join(src, file), 'utf8')
    ])
)
const contexts = [
  'identity-access',
  'workforce',
  'campaign-management',
  'harvest',
  'platform',
  'farm-structure'
]

function dependencies(file, source) {
  return [
    ...source.matchAll(
      /(?:\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?|\bimport\s*\(\s*)['"]([^'"]+)['"]/g
    )
  ].map((match) => {
    const specifier = match[1]
    if (!specifier.startsWith('.')) return specifier
    const target = path.posix.normalize(
      path.posix.join(path.posix.dirname(file), specifier)
    )
    return sources.has(target) ? target : target + '.js'
  })
}
const owner = (file) => (file.startsWith('contexts/') ? file.split('/')[1] : null)

test('seis BC incluyendo Farm Structure tienen comportamiento en sus tres capas', () => {
  assert.deepEqual(readdirSync(path.join(src, 'contexts')).sort(), [...contexts].sort())
  for (const context of contexts) {
    assert.ok(sources.has(`contexts/${context}/index.js`))
    for (const layer of ['application', 'domain', 'ports'])
      assert.ok(
        [...sources.keys()].some((file) =>
          file.startsWith(`contexts/${context}/${layer}/`)
        ),
        `${context}/${layer}`
      )
  }
})

test('ningún BC importa internos de otro BC: toda colaboración usa API pública o inyección', () => {
  for (const [file, source] of sources) {
    for (const dependency of dependencies(file, source)) {
      const context = owner(dependency)
      if (!context || owner(file) === context) continue
      assert.equal(
        dependency,
        `contexts/${context}/index.js`,
        `${file} → ${dependency}`
      )
    }
  }
})

test('BC y sus dependencias transitivas no alcanzan infraestructura, IndexedDB, UI o SDK', () => {
  const visited = new Set()
  function visit(file) {
    if (visited.has(file)) return
    visited.add(file)
    assert.ok(!/^(infrastructure|offline|modules)\//.test(file), file)
    const source = sources.get(file)
    assert.notEqual(source, undefined, file)
    assert.doesNotMatch(
      source,
      /@supabase\/|\bindexedDB\b|\bIDBObjectStore\b|\.objectStore\(|\bdocument\b|\bwindow\b|sessionStorage|PGRST\d+/,
      file
    )
    for (const dependency of dependencies(file, source)) visit(dependency)
  }
  for (const file of sources.keys()) if (owner(file)) visit(file)
})

test('domain es puro y no importa application, ports ni la composición global', () => {
  for (const [file, source] of sources) {
    if (!/^contexts\/[^/]+\/domain\//.test(file)) continue
    for (const dependency of dependencies(file, source)) {
      assert.ok(
        dependency.startsWith(`contexts/${owner(file)}/domain/`) ||
          dependency.startsWith('shared/'),
        `${file} → ${dependency}`
      )
    }
    assert.doesNotMatch(
      source,
      /\bbackend\b|sincronizarPendientes|casosDeUso|crypto\.randomUUID|\.transaction\(/,
      file
    )
  }
})

test('las políticas de roles laborales se mantienen en Workforce y shared sigue técnico', () => {
  for (const [file, source] of sources) {
    if (file.startsWith('contexts/harvest/'))
      assert.doesNotMatch(source, /\.roles\b|includes\(['"]JABERO['"]\)/, file)
    if (file.startsWith('shared/'))
      assert.doesNotMatch(
        source,
        /Trabajador|COSECHADOR|JABERO|Campania|LoteDeTickets/,
        file
      )
  }
})

test('los contratos públicos de backend cubren exactamente la fachada existente', () => {
  const operations = [
    ...operacionesBackendIdentityAccess,
    ...operacionesBackendWorkforce,
    ...operacionesBackendCampaignManagement,
    ...operacionesBackendHarvest
  ]
  assert.equal(new Set(operations).size, operations.length)
  assert.deepEqual([...operations].sort(), Object.keys(backend).sort())
  assert.ok(operacionesBackendHarvest.includes('obtenerResumenCampania'))
  assert.ok(!operacionesBackendCampaignManagement.includes('obtenerResumenCampania'))
})

test('la coordinación consume solo APIs públicas y los adapters están fuera de los contextos', () => {
  const coordinator = sources.get('application/crearCasosDeUso.js')
  for (const context of contexts.filter((c) => c !== 'farm-structure'))
    assert.ok(coordinator.includes(`../contexts/${context}/index.js`))
  assert.doesNotMatch(coordinator, /farm-structure/)
  for (const file of sources.keys()) {
    if (owner(file)) assert.ok(!/Adapter\.js$|\/adapters\//.test(file), file)
    if (file.startsWith('infrastructure/')) {
      for (const dependency of dependencies(file, sources.get(file))) {
        if (owner(dependency))
          assert.equal(dependency, `contexts/${owner(dependency)}/index.js`)
      }
    }
  }
})

test('Farm Structure es independiente de Harvest y Harvest no consulta estructura física', () => {
  for (const [file, source] of sources) {
    if (file.startsWith('contexts/farm-structure/'))
      assert.doesNotMatch(
        source,
        /contexts\/(harvest|campaign-management)|\.\.\/\.\.\/(harvest|campaign-management)/,
        file
      )
    if (file.startsWith('contexts/harvest/'))
      assert.doesNotMatch(source, /farm-structure/, file)
  }
})
