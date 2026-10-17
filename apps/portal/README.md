# Portal Web GesGROW — F7 / F8

Aplicación de gestión independiente de la PWA de campo ubicada en la raíz del
repositorio. Stack: React 19, Vite 8, React Router y JavaScript con contratos de
puertos explícitos. No se convierte la PWA a React ni se cambian sus dependencias.

## Ejecutar

F8 añade **Estructura agrícola** (`/estructura/fundos`, `/estructura/sectores`,
`/estructura/parcelas`) y vínculos opcionales desde lotes operativos de campaña.
Aplicar `202610141700_farm_structure.sql` después de F7.7. La gestión exige
`farm.manage` + `FARM_STRUCTURE`; la selección desde Campaign exige
`campaign.manage` + `CAMPAIGN` + `FARM_STRUCTURE`. La nueva capacidad se habilita
explícitamente por el ciclo comercial existente; no se altera la contratación
actual de SCC. Véase [modelo y despliegue F8](../../docs/farm-structure-f8.md).

Portal Web es la interfaz administrativa actual. No desarrollar nuevas
funcionalidades en Apps Script. F7.7 añade cutover administrativo explícito desde
el detalle de campaña, alta/edición de lotes operativos y jornada JABERO semántica
desde Personal. Aplicar `202610141600_portal_cutover_administrativo.sql` después
de F7.6; no migra campañas automáticamente. Véanse la [matriz y procedimiento](../../docs/portal-cutover-administrativo-f7.7.md).

Desde `scc/apps/portal`:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
# Editar .env.local con URL y publishable key del proyecto Supabase provisional.
npm.cmd run dev
```

El Portal usa `http://localhost:5174`; la PWA mantiene su servidor actual.
No poner una clave service_role en variables VITE ni archivos públicos.
El Portal muestra un error de configuración si no dispone de conexión.
El archivo `.env.local` es propio del Portal y queda excluido por `.gitignore`.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

Salida: `apps/portal/dist`. Publicarla en un **origen distinto** del campo.
Configurar fallback de las rutas del Portal a su `index.html` y configurar la
URL del Portal en el proveedor Identity. No servirla debajo del origen/scope
del service worker de campo, que actualmente controla `/`.

El Portal no tiene service worker, caché operativa ni IndexedDB. Usa una clave de
almacenamiento Auth propia y logout local. No utiliza el cliente singleton de
la PWA ni su login DNI. Depende en servidor de las migraciones Identity F6.2 y
Platform F6.3/F6.4 ya existentes; F7.1 no añade migraciones SQL.

## Estructura

```text
apps/portal/
  src/
    presentation/              Componentes React y CSS responsive
    application/               Sesión, selección, rutas y estado aislado
    ports/                     Contratos y errores independientes del proveedor
    infrastructure/supabase/   Adapter provisional Identity + RPC autorizados
    bootstrap.js               Composición reemplazable por adapters HTTP
    main.jsx                   Entrada React
  tests/                       Node + Vitest / React Testing Library
  package.json                 Scripts y dependencias propios
  package-lock.json            Instalación reproducible
```

Presentation recibe una API Application y snapshots de estado; no conoce SDK,
RPC o cliente Auth. Application reutiliza únicamente APIs públicas `index.js` de
Identity, Platform, Campaign, Workforce, Harvest y Farm Structure, e inyecta puertos. Las entidades
y reglas quedan en esos BC. Cambiar infraestructura a HTTP/Spring requiere
implementar los mismos puertos y sustituir la composición en `bootstrap.js`.

Configuración incluye empresa, usuarios, invitaciones, membresías, roles y consulta
de módulos. Campañas y Personal incorporan gestión real desde F7.3: altas, edición,
estados, variedades, configuración de lotes operativos y participación laboral.
Cosecha incorpora generación de tickets y consulta de lotes, tickets, asignaciones
y registros desde F7.4. Inicio incorpora dashboard y Reportes ofrece resumen,
ranking, producción diaria y por lote desde F7.5; la administración comercial
F6.4 se expone también bajo `/configuracion/suscripcion` desde F7.6. La consulta
requiere company.manage; las escrituras exigen además delegación subscription.manage.

Aplicar después de F7.5 `202610141500_portal_suscripcion.sql`. No crea tablas ni
cambia el contrato actual de SCC; añade consulta autorizada y una fachada de
intenciones con versión esperada que delega las reglas en F6.4. Consulte
[Suscripción F7.6](../../docs/portal-suscripcion-f7.6.md).

Aplicar después de F7.4 `202610141400_portal_reportes.sql`. Reutiliza las
proyecciones unificadas F5.6 y exige reports.view + HARVEST. Incluye CSV sobre
filas filtradas con revalidación de acceso. Consulte [Reportes F7.5](../../docs/portal-reportes-f7.5.md).

Aplicar después de F7.3 `202610141300_portal_harvest_admin.sql`. Añade harvest.manage
y generación atómica con recibos. No cambia la asignación/consumo en la PWA ni imprime
tickets. Consulte [Harvest F7.4](../../docs/portal-harvest-f7.4.md).

Aplicar después de F7.2 la migración `202610141200_portal_campaign_workforce.sql`.
Los contratos y reglas se detallan en [Campaign y Workforce F7.3](../../docs/portal-campaign-workforce-f7.3.md).

F7.2 añade una migración Identity y el backend confiable `invitar-usuario`.
Para habilitar las altas, aplicar la migración y configurar/desplegar la función
con su origen permitido y el redirect de Auth; consulte las instrucciones completas
en [Empresa y accesos F7.2](../../docs/portal-accesos-f7.2.md). No se necesitan
credenciales privilegiadas adicionales en el env del Portal.

Para inspeccionar UI local con datos ficticios, el servidor de desarrollo ofrece
`/tests/visual.html` (selector de empresas) y `/tests/visual.html?login` (acceso).
Son fixtures exclusivas de prueba, fuera de la entrada del build y sin backend.
La fixture usa contraseña `clave` y cualquier correo de prueba; nunca datos reales.

Consulte [el detalle arquitectónico y de autorización](../../docs/portal-web-f7.1.md).

## Iteración visual controlada del Portal

La dirección actual se aplica únicamente a **Login, App Shell, Dashboard Home y
Ranking**. El resto de las páginas conserva su presentación anterior y comparte
sólo el Shell. No se modifican reglas, contratos ni infraestructura.

El Shell organiza las rutas autorizadas en Inicio, Operación agrícola, Estructura
agrícola y Plataforma. Usa una rail de 72 px y un panel contextual de 290 px por
hover/foco o fijación, sin desplazar contenido. En tablet/móvil usa drawer con
teclado, Escape, contención/restauración de foco y fondo inerte.
Inicio navega directamente, sin repetir un panel con el mismo enlace. Las
subopciones de los módulos se despliegan hacia abajo por hover, clic o teclado;
Configuración es un desplegable y Campañas abre la lista de campañas.

Home combina hero agrícola, WeatherCard, producción principal, ranking breve,
métricas compactas, diaria, lotes y actividad. Login usa composición editorial.
Ambos emplean un fallback SVG geométrico local: falta la fotografía agrícola
final aprobada. WeatherCard informa «Clima no configurado», sin valores ficticios.

Ranking permite buscar y seleccionar 2–5 cosechadores, remover chips y comparar
los totales reales de Hoy, Semana, Mes o Campaña mediante barras y tabla. Se
conservan la semántica del periodo, las posiciones y la exportación del snapshot
filtrado existente. La evolución temporal por trabajador queda pendiente de un
read model autorizado; la UI explica esa limitación.

Los temas Claro/Oscuro/Sistema, Inter local, tokens, charts con tabla, focus
visible, responsive y reduced motion se conservan. No se añadieron dependencias.

Véase la [entrega detallada y las brechas de datos](../../docs/design-system/portal-redesign-implementation.md)
para componentes, contratos disponibles/faltantes, alcance y validación.

Fixtures exclusivas de desarrollo, sin backend ni inclusión en el build:

```text
/tests/visual.html?single&login
/tests/visual.html?single
/tests/visual.html?single&ruta=/reportes/ranking
```

Sin `single`, la fixture conserva el selector de empresas. El tema se cambia desde
el control visible. Las pruebas de interacción incluyen rail por teclado,
expansión/fijación, drawer, selección/bandeja de comparación, límites, cambio de
periodo/campaña/Tenant, CSV, temas y respuestas tardías.
