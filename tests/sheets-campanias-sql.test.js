import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test, { before, after } from 'node:test'
import { PGlite } from '@electric-sql/pglite'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const db = new PGlite()
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const B = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const USER_A = '10000000-0000-4000-8000-000000000001'
const USER_B = '10000000-0000-4000-8000-000000000002'
const USER_REPORT = '10000000-0000-4000-8000-000000000003'
const USER_BOTH = '10000000-0000-4000-8000-000000000004'
const shared = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const VA = '11111111-1111-4111-8111-111111111111'
let VB, LB, workerA, workerB, roleB
const call = async (name, args = []) => {
  const types = args.map(([, type], i) => `$${i + 1}::${type}`).join(',')
  return (
    await db.query(
      `select public.${name}(${types}) resultado`,
      args.map(([value]) => value)
    )
  ).rows[0].resultado
}
const list = (name, campania) => call(name + '_hoja', [[campania, 'uuid']])
const login = (id) =>
  db.query("select set_config('request.jwt.claim.sub',$1,false)", [id])
const worker = (
  campania,
  dni,
  nombres = 'Ana',
  apellidos = 'Pérez',
  activo = true,
  id = null
) =>
  call('admin_guardar_trabajador_hoja', [
    [campania, 'uuid'],
    [id, 'uuid'],
    [dni, 'varchar'],
    [nombres, 'varchar'],
    [apellidos, 'varchar'],
    [activo, 'boolean']
  ])
const variety = (campania, nombre, id = null) =>
  call('admin_guardar_variedad_hoja', [
    [campania, 'uuid'],
    [id, 'uuid'],
    [nombre, 'varchar'],
    [true, 'boolean']
  ])

before(async () => {
  await db.exec(read('./fixtures/provisionales.sql'))
  await db.exec(`create schema auth;
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create table integraciones_api(id uuid primary key default gen_random_uuid(),auth_user_id uuid unique,nombre text,
      activo boolean default true,puede_gestionar_maestros boolean default false,puede_consultar_reportes boolean default false);`)
  // Los RPC de trabajadores no tienen dependencia de auth.users.
  const trabajadores = read('../supabase/migrations/20260930_admin_trabajadores.sql')
  await db.exec(
    trabajadores.slice(
      trabajadores.indexOf(
        'create or replace function public.admin_guardar_trabajador('
      )
    )
  )
  for (const name of [
    '20260930_admin_campanias.sql',
    '20261001_admin_roles_campania.sql',
    '20261001_consistencia_acceso_app.sql',
    '202610030100_acceso_diario_jaberos.sql'
  ])
    await db.exec(read('../supabase/migrations/' + name))
  await db.exec(read('./fixtures/multicultivo.sql'))
  for (const name of [
    '20260930_admin_variedades.sql',
    '20260928_iniciar_sesion_lectura_pda.sql',
    '20260929_idempotencia_cola_pda.sql',
    '202610020100_jabero_provisional.sql',
    '202610010230_cosechador_provisional_asignar_ticket.sql',
    '20260930_admin_lotes.sql',
    '20260930_resumen_campania.sql',
    '202610020200_restaurar_produccion_diaria.sql',
    '202610030200_ranking_por_periodo.sql',
    '20260930_admin_reportes_sheets.sql',
    '202610030300_admin_ranking_por_periodo.sql',
    '202610110100_lotes_variedades.sql',
    '202610110200_produccion_lote_variedad.sql',
    '202610110300_cultivos_campanias.sql',
    '202610110400_rpc_por_campania.sql'
  ])
    await db.exec(read('../supabase/migrations/' + name))
  await db.query(
    "insert into campanias(id,codigo,nombre,fecha_inicio,estado,cultivo_id) values($1,'MAND-2026','Mandarina',current_date,'ACTIVA','a1000000-0000-4000-8000-000000000002')",
    [B]
  )
  await db.query(
    "insert into trabajador_campania_rol(trabajador_id,campania_id,rol,activo) values($1,$2,'SUPERVISORA',true)",
    [shared, B]
  )
  await db.exec(read('../supabase/migrations/202610110500_sheets_por_campania.sql'))
  for (const [id, maestros, reportes, campañas] of [
    [USER_A, true, true, [A]],
    [USER_B, true, true, [B]],
    [USER_REPORT, false, true, [A]],
    [USER_BOTH, true, true, [A, B]]
  ]) {
    await db.query(
      'insert into integraciones_api(auth_user_id,nombre,puede_gestionar_maestros,puede_consultar_reportes) values($1,$2,$3,$4)',
      [id, id, maestros, reportes]
    )
    for (const campania of campañas)
      await db.query(
        'insert into integracion_campania(integracion_id,campania_id) select id,$1 from integraciones_api where auth_user_id=$2',
        [campania, id]
      )
  }
  await login(USER_A)
})
after(() => db.close())

test('la integración solo ve su campaña y no puede usar los RPC globales para saltar el alcance', async () => {
  assert.deepEqual(
    (await list('admin_listar_campanias', A)).campanias.map((c) => c.id),
    [A]
  )
  await assert.rejects(list('admin_listar_campanias', B), /no tiene permiso/)
  await assert.rejects(call('admin_listar_campanias'), /requiere contexto/)
  await assert.rejects(call('admin_listar_trabajadores'), /requiere contexto/)
  await assert.rejects(call('admin_obtener_produccion_lotes'), /requiere contexto/)
  assert.equal(
    (await list('admin_contexto_archivo', A)).campania.cultivo_nombre,
    'Arándanos'
  )
})

test('el archivo modifica su campaña fija y rechaza actualizar o crear otra campaña', async () => {
  const params = (id, codigo) => [
    [A, 'uuid'],
    [id, 'uuid'],
    [codigo, 'varchar'],
    ['Arándanos 2026', 'varchar'],
    ['2026-10-01', 'date'],
    [null, 'date'],
    ['ACTIVA', 'estado_campania']
  ]
  await assert.rejects(
    call('admin_guardar_campania_hoja', params(B, 'MAND-2026')),
    /otra campaña/
  )
  await assert.rejects(
    call('admin_guardar_campania_hoja', params(null, 'NUEVA')),
    /solo administra/
  )
  assert.equal(
    (await call('admin_guardar_campania_hoja', params(A, 'CAMP-ARA-2026'))).campania.id,
    A
  )
})

test('variedades con el mismo nombre pertenecen a cultivos distintos y los maestros se filtran', async () => {
  await login(USER_B)
  VB = (await variety(B, 'Ventura')).variedad.id
  assert.notEqual(VB, VA)
  assert.equal((await variety(B, 'Ventura')).variedad.id, VB)
  assert.deepEqual(
    (await list('admin_listar_variedades', B)).variedades.map((v) => v.id),
    [VB]
  )
  await assert.rejects(variety(B, 'Otra', VA), /no pertenece al cultivo/)
  const lote = await call('admin_guardar_lote_variedades_hoja', [
    [B, 'uuid'],
    [null, 'uuid'],
    ['L1', 'varchar'],
    ['Sur', 'varchar'],
    [B, 'uuid'],
    [[VB], 'uuid[]'],
    [true, 'boolean']
  ])
  LB = lote.lote.id
  assert.deepEqual(
    (await list('admin_listar_lotes', B)).lotes.map((l) => l.id),
    [LB]
  )
  await assert.rejects(
    call('admin_guardar_lote_variedades_hoja', [
      [B, 'uuid'],
      [LB, 'uuid'],
      ['L1', 'varchar'],
      ['Sur', 'varchar'],
      [A, 'uuid'],
      [[VA], 'uuid[]'],
      [true, 'boolean']
    ]),
    /no pertenece/
  )
})

test('los trabajadores recién importados se conservan en su campaña antes de asignar roles', async () => {
  workerB = (await worker(B, '82000002')).trabajador.id
  await login(USER_A)
  workerA = (await worker(A, '82000001')).trabajador.id
  assert.deepEqual(
    (await list('admin_listar_trabajadores', A)).trabajadores.map((t) => t.id).sort(),
    [shared, workerA].sort()
  )
  await login(USER_B)
  assert.deepEqual(
    (await list('admin_listar_trabajadores', B)).trabajadores.map((t) => t.id).sort(),
    [shared, workerB].sort()
  )
  await assert.rejects(
    worker(B, '82000001', 'Ana', 'Pérez', true, workerA),
    /no pertenece/
  )
})

test('el supervisor compartido mantiene su UUID y una cuenta de campaña no desactiva su acceso en la otra', async () => {
  const importar = await worker(B, '47480378', 'Deysi', 'Regalado')
  assert.equal(importar.trabajador.id, shared)
  await assert.rejects(
    worker(B, '47480378', 'Deysi', 'Regalado', false, shared),
    /trabajador es compartido/
  )
  await assert.rejects(
    worker(B, '47480378', 'Otro', 'Regalado', true, shared),
    /trabajador es compartido/
  )
  assert.equal(
    (await db.query('select activo from usuarios_app where trabajador_id=$1', [shared]))
      .rows[0].activo,
    true
  )
})

test('los roles solo se guardan sobre trabajadores y registros de la campaña del archivo', async () => {
  const args = (id, trabajador, campaña) => [
    [B, 'uuid'],
    [id, 'uuid'],
    [trabajador, 'uuid'],
    [campaña, 'uuid'],
    ['COSECHADOR', 'rol_trabajador'],
    [true, 'boolean']
  ]
  roleB = (await call('admin_guardar_rol_campania_hoja', args(null, workerB, B)))
    .rol_campania.id
  await assert.rejects(
    call('admin_guardar_rol_campania_hoja', args(null, workerA, B)),
    /Agregue primero/
  )
  await assert.rejects(
    call('admin_guardar_rol_campania_hoja', args(roleB, workerB, A)),
    /no pertenece/
  )
  assert.ok(
    (await list('admin_listar_roles_campania', B)).roles.every(
      (r) => r.campania_id === B
    )
  )
})

test('retirar el rol del supervisor de una campaña mantiene su acceso en la otra', async () => {
  const rol = (
    await db.query(
      "select id from trabajador_campania_rol where trabajador_id=$1 and campania_id=$2 and rol='SUPERVISORA'",
      [shared, A]
    )
  ).rows[0].id
  await login(USER_A)
  const params = (activo) => [
    [A, 'uuid'],
    [rol, 'uuid'],
    [shared, 'uuid'],
    [A, 'uuid'],
    ['SUPERVISORA', 'rol_trabajador'],
    [activo, 'boolean']
  ]
  await call('admin_guardar_rol_campania_hoja', params(false))
  const operador = await call('validar_operador_campanias', [['47480378', 'varchar']])
  assert.deepEqual(
    operador.campanias.map((c) => c.id),
    [B]
  )
  await call('admin_guardar_rol_campania_hoja', params(true))
  await login(USER_B)
})

test('cada archivo obtiene producción de su campaña y conserva los reportes al cerrarla', async () => {
  const at = crypto.randomUUID(),
    sesion = crypto.randomUUID()
  await db.query(
    'insert into asignaciones_ticket(id,codigo_ticket,campania_id,cosechador_rol_id) values($1,$2,$3,$4)',
    [at, 'MAND-1', B, roleB]
  )
  await db.query(
    'insert into sesiones_lectura(id,lote_id,variedad_id,jabero_rol_id) select $1,$2,$3,id from trabajador_campania_rol where trabajador_id=$4 and campania_id=$5',
    [sesion, LB, VB, shared, B]
  )
  await db.query(
    'insert into lecturas_jaba(id,asignacion_ticket_id,sesion_id,fecha_hora) values($1,$2,$3,now())',
    [crypto.randomUUID(), at, sesion]
  )
  for (const name of [
    'admin_obtener_resumen_campania',
    'admin_obtener_produccion_diaria',
    'admin_obtener_produccion_lotes',
    'admin_obtener_ranking_cosechadores_periodo'
  ]) {
    const params = [[B, 'uuid']]
    if (name.endsWith('periodo')) params.push(['CAMPANIA', 'text'])
    if (!name.endsWith('lotes')) params.push(['America/Lima', 'text'])
    const resultado = await call(name + '_hoja', params)
    assert.equal(resultado.ok, true)
    assert.equal(
      name.endsWith('periodo')
        ? resultado.ranking[0].total_jabas
        : name.includes('resumen')
          ? resultado.resumen.total_jabas
          : resultado.produccion[0].total_jabas,
      1
    )
    await login(USER_A)
    await assert.rejects(call(name + '_hoja', params), /no tiene permiso/)
    await login(USER_B)
  }
  await db.query("update campanias set estado='CERRADA' where id=$1", [B])
  assert.equal(
    (await list('admin_obtener_produccion_lotes', B)).produccion[0].total_jabas,
    1
  )
})

test('lectura y gestión son permisos independientes, la revocación se aplica y no quedan contextos residuales', async () => {
  await login(USER_REPORT)
  assert.equal((await list('admin_obtener_produccion_lotes', A)).ok, true)
  await assert.rejects(list('admin_listar_trabajadores', A), /no tiene permiso/)
  assert.equal((await list('admin_contexto_archivo', A)).ok, true)
  await db.query(
    'update integracion_campania set activo=false where integracion_id=(select id from integraciones_api where auth_user_id=$1)',
    [USER_REPORT]
  )
  await assert.rejects(list('admin_obtener_produccion_lotes', A), /no tiene permiso/)
  const { rows } = await db.query(
    "select nullif(current_setting('scc.campania_id',true),'') campaña, nullif(current_setting('scc.hoja_campania_id',true),'') hoja, has_function_privilege('anon','admin_listar_lotes_hoja(uuid)','EXECUTE') anon, has_function_privilege('authenticated','autorizar_integracion_hoja(uuid,boolean)','EXECUTE') helper"
  )
  assert.deepEqual(rows[0], { campaña: null, hoja: null, anon: false, helper: false })
})

test('una identidad autorizada en ambas campañas puede consultar ambas sin duplicar el supervisor', async () => {
  await login(USER_BOTH)
  for (const campaña of [A, B])
    assert.ok(
      (await list('admin_listar_trabajadores', campaña)).trabajadores.some(
        (t) => t.id === shared
      )
    )
  assert.equal(
    (await db.query("select count(*)::int n from trabajadores where dni='47480378'"))
      .rows[0].n,
    1
  )
})

test('los permisos SQL reales conceden adaptadores a authenticated y rechazan anon', async () => {
  await login(USER_A)
  await db.exec('set role authenticated')
  try {
    assert.deepEqual(
      (await list('admin_listar_campanias', A)).campanias.map((c) => c.id),
      [A]
    )
    await assert.rejects(list('admin_listar_campanias', B), /no tiene permiso/)
  } finally {
    await db.exec('reset role')
  }
  await db.exec('set role anon')
  try {
    await assert.rejects(list('admin_listar_campanias', A), /permission denied/)
  } finally {
    await db.exec('reset role')
  }
})
