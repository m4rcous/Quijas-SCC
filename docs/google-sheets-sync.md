# Sincronización SCC con Google Sheets

La fuente de verdad es PostgreSQL en Supabase. La hoja `TRABAJADORES` sirve como interfaz administrativa y se comunica así:

`Administración → Google Sheets → Apps Script → Supabase Auth → RPC administrativa → PostgreSQL`

Apps Script usa una cuenta dedicada de Supabase Auth para la integración SCC ↔ Google Sheets. No debe usarse una cuenta personal, el DNI de un operador ni una `service_role` key.

## Autorización

La migración `supabase/migrations/20260930_admin_trabajadores.sql` crea `public.integraciones_api`. Cada identidad autorizada se identifica por `auth_user_id`, que referencia `auth.users(id)`, y solo puede administrar maestros cuando `activo = true` y `puede_gestionar_maestros = true`.

Las RPC `admin_guardar_trabajador` y `admin_listar_trabajadores` solo conceden `EXECUTE` a `authenticated`. Además, ambas llaman a `autorizar_integracion_gestion_maestros()`, que obtiene `auth.uid()` del JWT y comprueba la autorización en `integraciones_api`. La tabla tiene RLS habilitado y no concede acceso directo a `anon` ni `authenticated`.

## Preparación manual en Supabase

1. Aplicar la migración por el flujo habitual del proyecto. No crea usuarios Auth.
2. En **Supabase Dashboard → Authentication → Users**, crear una cuenta dedicada, por ejemplo `scc-sheets@<dominio-controlado>`, con una contraseña aleatoria fuerte.
3. Copiar el UUID de ese usuario (`auth.users.id`).
4. Registrar la integración desde un contexto administrativo seguro de SQL:

```sql
insert into public.integraciones_api (
  auth_user_id,
  nombre,
  puede_gestionar_maestros,
  activo
) values (
  '<UUID_AUTH>',
  'Google Sheets SCC',
  true,
  true
);
```

No insertar usuarios manualmente en `auth.users`.

## Script Properties

En **Apps Script → Project Settings → Script Properties** configurar:

- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_PUBLISHABLE_KEY`: publishable/anon-compatible key pública del proyecto.
- `SUPABASE_INTEGRATION_EMAIL`: email de la cuenta dedicada.
- `SUPABASE_INTEGRATION_PASSWORD`: contraseña de la cuenta dedicada.

El email y la contraseña son credenciales privadas. No deben escribirse en celdas, logs ni código. El script obtiene un `access_token` mediante Supabase Auth y lo reutiliza temporalmente con `CacheService`; si una RPC responde `401`, elimina el token y se autentica una vez más.

## Instalación de Apps Script

1. Crear o abrir el Google Sheet administrativo.
2. Abrir **Extensiones → Apps Script**.
3. Copiar los archivos de `apps-script/`: `Code.gs`, `Config.gs`, `Menu.gs`, `Supabase.gs`, `Trabajadores.gs` y `TrabajadoresPure.gs`.
4. Guardar y recargar el Sheet para que `onOpen` cree el menú `SCC` y configure `TRABAJADORES`.

La hoja usa estas columnas:

| Columna | Campo | Uso |
| --- | --- | --- |
| A | DNI | Editable |
| B | Nombres | Editable |
| C | Apellidos | Editable |
| D | Activo | Editable; dropdown `Sí`/`No` |
| E | Estado Sync | Técnica |
| F | Observación | Técnica |
| G | ID Sistema | Técnica; UUID de `trabajadores.id` |
| H | Última sincronización | Técnica |

El script protege E:H como rango técnico. A:D son las columnas de edición administrativa.

## Estados y edición

`PENDIENTE` indica una fila local que debe enviarse. `SINCRONIZADO` indica que Supabase confirmó la fila. `ERROR` conserva una observación entendible para corregirla.

`onEdit(e)` solo actúa en `TRABAJADORES`, desde la fila 2 y cuando la edición toca A:D. Marca `Estado Sync = PENDIENTE` y limpia `Observación`; conserva `ID Sistema` y `Última sincronización`. No realiza llamadas de red.

## Sincronizar datos

`SCC → Sincronizar datos` procesa únicamente filas `PENDIENTE`. Valida DNI, nombres, apellidos, activo e ID Sistema antes de llamar `admin_guardar_trabajador`.

Si `ID Sistema` tiene UUID, la RPC actualiza exactamente ese trabajador y permite corregir su DNI siempre que no pertenezca a otra persona. Si no hay ID, busca por DNI: actualiza el registro existente o crea uno nuevo. En éxito guarda el UUID real, limpia la observación y registra la fecha/hora. Un error marca solo esa fila y no interrumpe las siguientes.

## Actualizar desde sistema

`SCC → Actualizar desde sistema` llama `admin_listar_trabajadores()` y reconstruye A:H usando PostgreSQL. Todos los registros quedan `SINCRONIZADO`, con su UUID real en `ID Sistema` y una nueva fecha/hora de sincronización.

Antes de reemplazar la hoja, el script busca filas `PENDIENTE` o `ERROR`. Si encuentra alguna, aborta con: `Hay cambios locales pendientes o con error. Sincronízalos o resuélvelos antes de actualizar desde el sistema.`

## Prueba inicial

1. Crear la identidad Auth y su fila en `integraciones_api`.
2. Configurar las cuatro Script Properties.
3. Usar `SCC → Actualizar desde sistema` para poblar `TRABAJADORES` e `ID Sistema`.
4. Editar una fila en A:D y confirmar que pasa a `PENDIENTE` sin perder G/H.
5. Usar `SCC → Sincronizar datos` y verificar que queda `SINCRONIZADO` con observación vacía.
6. Probar una fila nueva sin `ID Sistema`; al sincronizar debe recibir el UUID real del backend.
