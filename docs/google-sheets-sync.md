# Sincronización SCC con Google Sheets

PostgreSQL en Supabase es la fuente oficial. Google Sheets funciona como interfaz administrativa para los maestros TRABAJADORES, CAMPANIAS, VARIEDADES y LOTES.

Flujo: Administración → Google Sheets → Apps Script → Supabase Auth → RPC administrativa → PostgreSQL.

## Seguridad

Los cuatro maestros reutilizan la misma identidad técnica y el mismo control administrativo existente:

- cuenta dedicada de Supabase Auth;
- `auth.uid()`;
- `public.integraciones_api`;
- `activo = true`;
- `puede_gestionar_maestros = true`;
- `public.autorizar_integracion_gestion_maestros()`.

No se usa `service_role`, no se crean credenciales nuevas y las RPC administrativas no se conceden a `anon`. La integración conserva las mismas cuatro Script Properties: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_INTEGRATION_EMAIL` y `SUPABASE_INTEGRATION_PASSWORD`.

## TRABAJADORES

La hoja conserva el flujo ya probado: A:D son editables y E:H son columnas técnicas. Editar A:D marca la fila como PENDIENTE, limpia la observación y conserva ID Sistema y Última sincronización.

## CAMPANIAS

La hoja CAMPANIAS usa Código, Nombre, Fecha inicio, Fecha fin y Estado como campos editables. Estado usa ACTIVA/CERRADA. Las columnas técnicas son F:I. Editar A:E marca la fila PENDIENTE sin llamar Supabase desde `onEdit`.

`admin_guardar_campania` mantiene el UUID cuando existe ID Sistema y usa `codigo` como fallback únicamente porque `public.campanias.codigo` es UNIQUE. `admin_listar_campanias()` devuelve el maestro para reconstrucción de la hoja.

## VARIEDADES

La hoja VARIEDADES usa Nombre y Activo como campos editables y C:F como columnas técnicas. Activo usa Sí/No. Editar A:B marca la fila PENDIENTE y conserva su UUID.

`admin_guardar_variedad` mantiene el UUID cuando existe ID Sistema y usa `nombre` como fallback únicamente porque `public.variedades.nombre` es UNIQUE. No se implementa DELETE; una variedad se retira con `activo = false`.

## LOTES

El esquema confirmado de `public.lotes` usa UUID como identidad persistente y tiene la restricción real `UNIQUE (campania_id, codigo)`. Por tanto, `codigo` no es una identidad global. Cuando no existe ID Sistema, la identidad natural de fallback es exactamente `(campania_id, codigo)`.

La hoja LOTES usa:

| Columna | Campo | Uso |
| --- | --- | --- |
| A | Código | Editable |
| B | Nombre | Editable; vacío se persiste como NULL |
| C | Campaña | Editable; muestra `campanias.codigo` |
| D | Variedad | Editable; muestra `variedades.nombre` |
| E | Activo | Editable; dropdown Sí/No |
| F | Estado Sync | Técnica |
| G | Observación | Técnica |
| H | ID Sistema | Técnica |
| I | Última sincronización | Técnica |

F:I quedan protegidas. Editar A:E marca F = PENDIENTE, limpia G y conserva H:I. `onEdit` no llama a Supabase.

### Referencias visibles y UUID

La campaña visible se resuelve así: `CAMPANIAS.codigo → CAMPANIAS.ID Sistema → campania_id`.

La variedad visible se resuelve así: `VARIEDADES.nombre → VARIEDADES.ID Sistema → variedad_id`.

La fila referenciada debe estar SINCRONIZADA y tener un UUID válido. PostgreSQL persiste los UUID; los textos visibles no son identidad final.

### Campañas y variedades activas

Para crear un lote o cambiar su `campania_id`, la campaña destino debe estar ACTIVA. Para crear un lote o cambiar su `variedad_id`, la variedad destino debe estar activa.

Un lote histórico puede conservar una campaña que posteriormente quedó CERRADA y una variedad que posteriormente quedó inactiva. Si esos UUID no cambian, se permite editar los demás campos del lote. La validación se aplica a nuevas asignaciones, no a la mera conservación del histórico.

`admin_listar_lotes()` incluye lotes activos e inactivos, y también relaciones históricas con campañas cerradas o variedades inactivas.

### Dropdowns de LOTES

El dropdown de Campaña se construye a partir de CAMPANIAS sincronizadas y ACTIVA. El dropdown de Variedad se construye a partir de VARIEDADES sincronizadas y activas. Estas listas se releen desde los maestros; no se mantienen catálogos duplicados.

Las validaciones de Campaña y Variedad permiten conservar visualmente un valor histórico cargado desde PostgreSQL aunque ya no aparezca entre las opciones operativas. Esto evita borrar una relación histórica al reconstruir la hoja.

### Cambios de claves visibles

Si se cambia `campanias.codigo` o `variedades.nombre`, las FK de `public.lotes` siguen apuntando a los mismos UUID. LOTES puede mostrar temporalmente el texto anterior hasta ejecutar `SCC → Actualizar desde sistema`. No se implementan cascadas visuales en `onEdit`.

### Borrado

No se implementa DELETE para LOTES. Para retirar un lote se usa Activo = No, preservando su histórico.

## Sincronizar datos

`SCC → Sincronizar datos` procesa en este orden:

1. TRABAJADORES
2. CAMPANIAS
3. VARIEDADES
4. LOTES

Cada maestro procesa únicamente filas PENDIENTE y aísla los errores por fila. Un error de una fila no detiene las siguientes; un error general de un maestro no impide intentar los demás.

LOTES se ejecuta al final. En ese momento Apps Script vuelve a leer CAMPANIAS y VARIEDADES, de modo que una campaña o variedad sincronizada durante esa misma ejecución puede usarse inmediatamente en una fila LOTES.

Antes de procesar LOTES se obtiene una instantánea con `admin_listar_lotes()`. Esa instantánea permite distinguir una relación histórica sin cambios de una nueva asignación y aplicar correctamente las reglas ACTIVA/activo.

## Actualizar desde sistema

`SCC → Actualizar desde sistema` trabaja sobre la hoja activa:

- TRABAJADORES → `admin_listar_trabajadores()`;
- CAMPANIAS → `admin_listar_campanias()`;
- VARIEDADES → `admin_listar_variedades()`;
- LOTES → `admin_listar_lotes()`.

Si la hoja activa contiene cualquier fila PENDIENTE o ERROR, se aborta antes de reconstruir para no sobrescribir cambios locales.

Al reconstruir LOTES se escribe Código, Nombre, código visible de campaña, nombre visible de variedad, Sí/No, SINCRONIZADO, observación vacía, UUID real y timestamp actual. Después se recalculan los dropdowns.

## RPC de LOTES

`public.admin_guardar_lote(uuid, varchar, varchar, uuid, uuid, boolean)`:

- con `p_lote_id`, busca y actualiza exactamente ese UUID; si no existe devuelve `El lote indicado no existe`;
- sin `p_lote_id`, busca únicamente por `(p_campania_id, codigo)`; si existe actualiza y si no existe crea;
- nunca busca un lote únicamente por `codigo`;
- normaliza Código con `btrim`, Nombre vacío a NULL y valida los límites de 30/100 caracteres;
- traduce el conflicto de `UNIQUE(campania_id, codigo)` a `Ya existe otro lote con ese código en la campaña seleccionada`;
- devuelve siempre el UUID real y las referencias visibles resultantes.

`public.admin_listar_lotes()` hace join con CAMPANIAS y VARIEDADES, incluye históricos/inactivos y ordena por `campania_codigo ASC, codigo ASC`.

Ambas RPC llaman primero a `public.autorizar_integracion_gestion_maestros()`, revocan ejecución de PUBLIC/anon y conceden EXECUTE únicamente a authenticated. No se concede SELECT directo sobre `public.lotes`.

## Archivos de Apps Script

El proyecto administrativo usa `Code.gs`, `Config.gs`, `Menu.gs`, `Supabase.gs`, `Trabajadores.gs`, `TrabajadoresPure.gs`, `Campanias.gs`, `CampaniasPure.gs`, `Variedades.gs`, `VariedadesPure.gs`, `Lotes.gs` y `LotesPure.gs`.

Al abrir el Spreadsheet, `onOpen` crea el menú SCC y configura las cuatro hojas administrativas.

## Migraciones

`20260930_admin_lotes.sql` reutiliza `public.integraciones_api` y `public.autorizar_integracion_gestion_maestros()`; no los recrea. La migración solo crea las RPC administrativas de LOTES, configura sus permisos y solicita la recarga del schema de PostgREST.
