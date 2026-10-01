# Sincronización SCC con Google Sheets

PostgreSQL en Supabase es la fuente oficial. Google Sheets funciona como interfaz administrativa para los maestros TRABAJADORES, CAMPANIAS y VARIEDADES.

Flujo: Administración → Google Sheets → Apps Script → Supabase Auth → RPC administrativa → PostgreSQL.

## Seguridad

Ambos maestros reutilizan la misma identidad técnica y el mismo control administrativo existente:

- cuenta dedicada de Supabase Auth;
- auth.uid();
- public.integraciones_api;
- activo = true;
- puede_gestionar_maestros = true;
- public.autorizar_integracion_gestion_maestros().

No se usa service_role, no se crean credenciales nuevas y las RPC administrativas no se conceden a anon. La integración conserva las mismas cuatro Script Properties: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_INTEGRATION_EMAIL y SUPABASE_INTEGRATION_PASSWORD.

## TRABAJADORES

La hoja conserva el flujo ya probado:

| Columna | Campo | Uso |
| --- | --- | --- |
| A | DNI | Editable |
| B | Nombres | Editable |
| C | Apellidos | Editable |
| D | Activo | Editable |
| E | Estado Sync | Técnica |
| F | Observación | Técnica |
| G | ID Sistema | Técnica |
| H | Última sincronización | Técnica |

Editar A:D marca la fila como PENDIENTE, limpia la observación y conserva el ID y la última sincronización.

## CAMPANIAS

El esquema confirmado de public.campanias es:

- id uuid PRIMARY KEY DEFAULT gen_random_uuid();
- codigo varchar NOT NULL UNIQUE;
- nombre varchar NOT NULL;
- fecha_inicio date NOT NULL;
- fecha_fin date NULL;
- estado public.estado_campania NOT NULL DEFAULT ACTIVA;
- created_at timestamptz NOT NULL DEFAULT now();
- updated_at timestamptz NULL;
- CHECK de fecha_fin NULL o mayor/igual a fecha_inicio;
- trigger trg_campanias_updated_at antes de UPDATE.

El enum public.estado_campania contiene únicamente ACTIVA y CERRADA.

La migración supabase/migrations/20260930_admin_campanias.sql añade una regla explícita: como máximo una campaña puede estar ACTIVA. Se implementa mediante un índice UNIQUE parcial. Antes de crearlo, la migración cuenta las campañas activas existentes y aborta con un mensaje claro si hay más de una. No cierra campañas automáticamente.

La hoja CAMPANIAS usa:

| Columna | Campo | Uso |
| --- | --- | --- |
| A | Código | Editable |
| B | Nombre | Editable |
| C | Fecha inicio | Editable |
| D | Fecha fin | Editable |
| E | Estado | Editable; dropdown ACTIVA/CERRADA |
| F | Estado Sync | Técnica |
| G | Observación | Técnica |
| H | ID Sistema | Técnica |
| I | Última sincronización | Técnica |

Las columnas C:D se muestran como dd/MM/yyyy; F:I quedan protegidas. Editar A:E marca F = PENDIENTE, limpia G y conserva H:I. onEdit no llama a Supabase.

## Fechas de campañas

fecha_inicio y fecha_fin son DATE, por lo que no se serializan con UTC.

Al enviar una fecha de Google Sheets se usa SpreadsheetApp.getActive().getSpreadsheetTimeZone() y Utilities.formatDate(fecha, zonaHoraria, 'yyyy-MM-dd').

No se usa toISOString().slice(0, 10).

Al reconstruir una campaña desde PostgreSQL, el texto YYYY-MM-DD se conserva como fecha calendario y se convierte con Utilities.parseDate(texto, zonaHoraria, 'yyyy-MM-dd') usando la timezone del Spreadsheet. Luego la hoja aplica el formato visual dd/MM/yyyy. Así se evita desplazar el día por un parseo UTC intermedio.

## RPC de campañas

public.admin_guardar_campania recibe p_campania_id uuid, p_codigo varchar, p_nombre varchar, p_fecha_inicio date, p_fecha_fin date y p_estado public.estado_campania.

Si p_campania_id tiene valor, busca exactamente por id; si no existe, devuelve “La campaña indicada no existe”. Esto permite cambiar el código sin perder identidad.

Si no hay ID, usa codigo como fallback porque UNIQUE(codigo) está confirmado. Si el código existe, actualiza esa campaña; si no existe, crea una nueva. Siempre devuelve el UUID real.

La RPC valida campos obligatorios, fechas y estado. Los conflictos con la regla de una sola campaña activa se convierten en “Ya existe otra campaña activa”.

public.admin_listar_campanias() devuelve las campañas ordenadas por fecha_inicio DESC, codigo ASC.

Ambas RPC llaman primero a public.autorizar_integracion_gestion_maestros(). Se revoca EXECUTE de PUBLIC y anon, y solo se concede a authenticated. No se concede SELECT directo sobre public.campanias.

## VARIEDADES

El esquema real confirmado de public.variedades es:

- id uuid PRIMARY KEY DEFAULT gen_random_uuid();
- nombre varchar NOT NULL UNIQUE;
- activo boolean NOT NULL DEFAULT true;
- created_at timestamptz NOT NULL DEFAULT now();
- updated_at timestamptz NULL;
- trigger trg_variedades_updated_at antes de UPDATE, que ejecuta actualizar_updated_at();
- RLS habilitado, no forzado y sin policies.

La hoja VARIEDADES usa:

| Columna | Campo | Uso |
| --- | --- | --- |
| A | Nombre | Editable |
| B | Activo | Editable; dropdown S?/No |
| C | Estado Sync | T?cnica |
| D | Observaci?n | T?cnica |
| E | ID Sistema | T?cnica |
| F | ?ltima sincronizaci?n | T?cnica |

C:F quedan protegidas. Editar A:B marca C = PENDIENTE, limpia D y conserva E:F. onEdit no llama a Supabase.

public.admin_guardar_variedad recibe p_variedad_id uuid, p_nombre varchar y p_activo boolean. Si hay ID, busca y actualiza exactamente ese UUID. Si no hay ID, usa nombre como fallback ?nicamente porque UNIQUE(nombre) est? confirmado; si existe actualiza y, si no existe, crea. No se a?ade comparaci?n case-insensitive. Los conflictos se traducen a ?Ya existe otra variedad con ese nombre?.

public.admin_listar_variedades() incluye activas e inactivas y ordena por nombre ASC. Ambas RPC reutilizan public.autorizar_integracion_gestion_maestros(), se exponen solo a authenticated y no conceden SELECT directo sobre public.variedades.

No se implementa DELETE. Para retirar una variedad se usa activo = false.

### Relaci?n con LOTES

public.lotes.variedad_id referencia public.variedades.id. LOTES todav?a no se modifica. En esa fase, la hoja podr? mostrar el nombre mediante una selecci?n controlada, pero Apps Script/backend deber? resolver y persistir el UUID real en variedad_id; no se debe usar un nombre libre como identidad.

## Sincronizar datos

SCC → Sincronizar datos procesa primero TRABAJADORES y después CAMPANIAS.

Cada maestro procesa únicamente filas PENDIENTE. Los errores quedan aislados por fila y un error general de una hoja no impide intentar sincronizar la otra. Al finalizar se muestra un resumen por maestro con cantidad sincronizada y errores.

## Actualizar desde sistema

SCC → Actualizar desde sistema trabaja sobre la hoja actualmente activa:

- TRABAJADORES → admin_listar_trabajadores();
- CAMPANIAS → admin_listar_campanias().

Si la hoja contiene cualquier fila PENDIENTE o ERROR, la actualización se aborta antes de sobrescribir datos con el mensaje:

“Hay cambios locales pendientes o con error. Sincronízalos o resuélvelos antes de actualizar desde el sistema.”

## Archivos de Apps Script

Copiar al proyecto: Code.gs, Config.gs, Menu.gs, Supabase.gs, Trabajadores.gs, TrabajadoresPure.gs, Campanias.gs, CampaniasPure.gs, Variedades.gs y VariedadesPure.gs.

Al abrir el Spreadsheet, onOpen crea el menú SCC y configura las hojas administrativas soportadas.

## Migraciones y riesgo de datos existentes

20260930_admin_campanias.sql reutiliza public.integraciones_api y public.autorizar_integracion_gestion_maestros(); no los recrea.

Antes de aplicar la migración en un entorno real, debe haber como máximo una fila con estado ACTIVA. Si existen varias, la migración se detendrá y Administración deberá decidir manualmente cuáles cerrar antes de volver a ejecutarla.

## Migraci?n administrativa de VARIEDADES

20260930_admin_variedades.sql reutiliza public.integraciones_api y public.autorizar_integracion_gestion_maestros(); no los recrea. Crea admin_guardar_variedad(uuid, varchar, boolean), admin_listar_variedades(), revoca acceso a PUBLIC/anon, concede EXECUTE solo a authenticated y solicita recarga del schema de PostgREST.
