# Portal GesGROW — Iteración visual controlada

Implementación del [brief](codex-portal-redesign-brief.md). Se leyeron completos
README, DESIGN, Portal, Foundations, Components y Data Viz; prevalece `portal.md`.

## Superficies y navegación

Sólo se rediseñan **Login, App Shell, Home (`/`) y Ranking
(`/reportes/ranking`)**. Se conservan las rutas y la autorización de Application.

| Colección           | Rutas existentes presentadas                                                           |
| ------------------- | -------------------------------------------------------------------------------------- |
| Inicio              | `/`                                                                                    |
| Operación agrícola  | Campañas, Personal, Cosecha y Reportes                                                 |
| Estructura agrícola | Fundos, Sectores y Parcelas bajo `/estructura`                                         |
| Plataforma          | Configuración, Usuarios y accesos, Suscripción, Módulos, Empresa, Invitaciones y Roles |

Las colecciones se construyen exclusivamente desde `estado.navegacion`. Una
colección sin rutas efectivas se omite. Los subenlaces mantienen las protecciones
del módulo padre; no se introducen permisos ni rutas nuevas.

Rail de **72 px** y panel contextual de **290 px**, con superficie glass sutil,
grandes radios e indicadores separados de colección, módulo y ruta actuales.
El panel se superpone sin desplazar el contenido. Admite colapsado, expansión por
hover, expansión por foco, fijación explícita y drawer. Tab, flechas, Home/End y
Escape permiten operar por teclado. Los tooltips también responden al foco.
Por debajo de 1024 px se usa un drawer con cierre explícito/overlay/Escape,
contención y restauración del foco, fondo inerte y bloqueo del scroll de fondo.
Correo y cierre de sesión permanecen dentro del UserMenu existente.

Inicio es un enlace directo a `/`, sin panel secundario. Se retiraron los textos
«Su espacio de gestión» y «Gestión conectada al campo» del panel. Las subopciones
empiezan cerradas y se despliegan hacia abajo al pasar por su módulo; también
se abren con clic, Enter o Espacio. Escape cierra primero el desplegable y luego
el panel. Configuración actúa como desplegable de sus rutas; Campañas conserva
el enlace directo a la lista real `/campanias`.
Sólo un módulo puede estar desplegado. Al pasar a otro, se abre el nuevo y se
cierra el anterior en el mismo cambio de estado. El espacio entre opciones forma
parte del área del módulo: cruzarlo no cierra prematuramente Cosecha antes de
alcanzar Reportes. Se reinician al abandonar el grupo sin foco interno, cambiar
colección/ruta o cerrar explícitamente.

## Home y Login

Home combina hero + clima (8/4 columnas), producción principal + ranking breve
(6/6), cuatro métricas compactas, producción diaria y lote + actividad (8/4).
El selector de campaña y las acciones de actualización/CSV quedan debajo del
hero y del clima, antes de las métricas, sin encabezado adicional sobre el hero.
Conserva producción total, jabas hoy, cosechadores, lotes, sesiones, días con
producción y última actividad de los reportes actuales. No calcula tendencias,
metas, comparaciones entre periodos ni agregados adicionales.

Los paneles reutilizan `DASHBOARD`, `RANKING`, `DIARIA` y `LOTES`. Ranking breve
muestra hasta cinco filas, con enlace al ranking completo. Las tablas de diaria
y lotes conservan sus valores. Fechas humanas, barras desde cero, verde como
serie principal y amarillo para el último día cuando hay más de un valor.
Para 1–3 puntos las barras se distribuyen y tienen ancho limitado. Home añade
tooltips de diaria disponibles también por foco y conserva la tabla equivalente.
Actualizar Home vuelve a consultar también sus widgets. El CSV de Home conserva
el resumen autorizado existente.

El hero muestra fecha de Lima, saludo, empresa, campaña, estado e indicador de
jabas de hoy cuando están disponibles. Sin acceso a reportes, Home conserva las
áreas autorizadas y explica la ausencia del dashboard sin consultar producción.
Se conservan carga, vacío, error/reintento y rechazo de campañas ajenas.

Login tiene una composición editorial dividida, grandes radios y wordmark
**GesGROW**. Mantiene exclusivamente correo, contraseña e iniciar sesión y el
mismo flujo funcional (incluida limpieza de contraseña y bloqueo durante envío).
Las demás fases de acceso conservan su presentación anterior.

**Asset:** no se encontró fotografía agrícola adecuada en el repositorio.
`AgriculturalVisual` es un fallback SVG local de parcelas y líneas de cultivo,
derivado de las pautas geométricas del Design System. Se usa en Login y hero.
Queda pendiente una fotografía aprobada de cultivos/parcelas, preferiblemente
aérea, para sustituir este asset dentro de los contenedores existentes. No se
descargaron imágenes externas ni se generó un logo definitivo.

**Clima:** `WeatherCard` muestra «Clima no configurado». No presenta temperatura,
humedad, viento ni localización inventados. Falta una fuente meteorológica
configurada; no se integra ninguna API en esta fase.

El fondo usa la imagen aportada por el usuario, `weather-sky-periods.png`, con
sus tres variantes: día (06:00–15:59), tarde (16:00–18:59) y noche (19:00–05:59),
según `America/Lima`, independientemente del tema del portal. Se actualiza cada
minuto y al recuperar la pestaña. CSS encuadra cada sección del archivo original
sin sus márgenes blancos; la variante de tarde lleva una capa oscura para
mantener el contraste del texto. El fondo expresa la franja horaria, no una
condición meteorológica observada.

## Ranking y comparación

Ranking es una superficie propia con campaña, periodo, búsqueda por nombre/DNI,
posición original, producción y última actividad. Énfasis sutil para posiciones
1–3, sin recalcular ranking ni desempates. Usa la búsqueda existente de
Application. La exportación recibe el **mismo snapshot autorizado** que alimenta
la tabla filtrada, sin fabricar snapshots ni volver a consultar antes de exportar.

La selección mediante checkboxes admite **2–5 cosechadores**. Comparison Tray
muestra chips removibles, contador accesible, límite explícito, acción Comparar y
limpieza. Conserva las filas autorizadas seleccionadas entre búsquedas; cambiar
campaña, periodo, Tenant o actualizar datos limpia la selección y los resultados.
La comparación requiere acción explícita y lleva el foco al resultado.

La comparación implementada son **totales agregados por cosechador**, con barras
horizontales, identificación numérica de series, valores, tooltips por hover/foco
y tabla equivalente. Máximo cinco series, usando la paleta de Data Viz.
Los totales y las últimas lecturas proceden de filas de `RANKING`, sin sumar
registros, combinar fuentes ni aplicar nuevas reglas de negocio.

Se preserva la semántica actual, definida por el servidor en `America/Lima`:

| Label   | Contrato   | Significado conservado                        |
| ------- | ---------- | --------------------------------------------- |
| Hoy     | `HOY`      | Jornada actual                                |
| Semana  | `SEMANA`   | Desde el inicio de la semana actual hasta hoy |
| Mes     | `MES`      | Desde el inicio del mes actual hasta hoy      |
| Campaña | `CAMPANIA` | Campaña completa                              |

No se rebautiza «Hoy» como un selector de cualquier día, ni «Mes» como un rango
mensual arbitrario. No se introducen filtros de fecha inexistentes.

### Brecha funcional exacta

`crearReportesPortal.consultar({ campaniaId, tipo: 'RANKING', periodo })` devuelve
por trabajador `posicion`, `cosechador_dni`, `cosechador`, `total_jabas` y
`ultima_lectura`, además del contexto de campaña/periodo. `DIARIA` devuelve una
serie **global de campaña**, con `fecha`, `total_jabas`, `total_cosechadores` y
`total_sesiones`; no una serie por trabajador.

Falta un **read model autorizado de producción temporal por cosechador**, que
entregue contexto Tenant/campaña, trabajadores identificables, periodo/rango
efectivo y zona horaria, fecha/granularidad de cada punto y `total_jabas` por
trabajador y punto. Deberá definir expresamente fechas sin actividad frente a
valores ausentes y soportar el conjunto seleccionado bajo los permisos actuales.
Para elegir días o meses históricos arbitrarios también falta un contrato de
rango/fecha; los enums actuales sólo cubren los periodos indicados arriba.

La UI comunica que la evolución diaria individual aún no está disponible. No se
incluyen líneas decorativas ni resultados falsos. Este contrato queda para una
fase funcional posterior; no se añadieron puertos, RPC, consultas directas,
migraciones ni agregaciones de producción en React.

## Temas, responsive y accesibilidad

Ambos temas cubren rail, panel, Login, hero, clima, métricas, Ranking y charts.
Se conserva Claro/Oscuro/Sistema y persistencia existentes. Tokens adicionales:
anchos rail/panel y series 3–5 de Data Viz con variantes oscuras; no se alteran
tokens de densidad ni estilos de las páginas internas.

En tablet se redistribuyen hero, clima, producción y métricas. En móvil el orden
es hero, clima, KPIs, charts, ranking y actividad. Ranking apila sus paneles y
lleva la última actividad a la celda del trabajador, conservando información.
Las tablas siguen siendo semánticas y navegables; las visualizaciones conservan
sus tablas. Focus visible, labels, estados seleccionados, anuncios de selección,
resultados sin dependencia exclusiva del color y reduced motion.

Motion usa los tokens existentes: 120–160 ms en estados/widgets, 160–220 ms en
navegación y 220 ms en entrada de panel/chips. Sin rebotes. Se respeta
`prefers-reduced-motion`.

## Componentes y límites

Se añaden `NavigationRail`, `AgriculturalVisual`, `PortalHero`, `WeatherCard`,
`MetricWidget`, `Dashboard`, `RankingPreview`, `ReportActions`, `Ranking`,
`PeriodSelector`, `ComparisonTray` y `ComparisonChart`. El panel contextual y
los enlaces se componen dentro de NavigationRail. Se reutilizan Icon, ChartCard,
DataTable, EmptyState, Skeleton, ThemeSwitcher, UserMenu y los renderers de
reportes. `redesign.css` acota las reglas nuevas a estas superficies.

**Dependencias añadidas al proyecto: ninguna.**

No se rediseñaron Campañas, Personal, Cosecha, Estructura agrícola, Configuración,
Usuarios, Suscripción, Módulos, resumen, producción diaria ni producción por lote
como páginas propias. Sólo comparten el Shell autorizado; Reportes expone sus
renderers existentes para reutilizarlos en Home. Dominio, Application, contratos,
adapters, backend, migraciones, IndexedDB, PWA y Apps Script no se editaron en
esta iteración. Los cambios previos del workspace se conservaron.

## Validación

- Tests de aplicación/arquitectura Portal: **70**.
- Tests de presentación Portal: **84** (incluidas nuevas interacciones y datasets
  diarios de 1 y 3 puntos).
- Tests relevantes de raíz: **115**, incluidos contratos/proyecciones de
  reportes, autorización, arquitectura, ranking, diaria, lotes y resumen.
- Build de producción Portal y `git diff --check`.
- Comando final del Portal: `npm test -- --maxWorkers=2`. La ejecución sin límite
  de workers, simultánea con la revisión en Chrome, agotó tiempos de carga de UI
  en este entorno. No se elevaron los timeouts ni se quitaron comprobaciones.
- Chrome headless con fixture local: Login, Home y Ranking, claro/oscuro, anchos
  **360, 390, 768, 1024 y 1440 px**; 30 combinaciones sin desbordamiento horizontal
  ni errores JavaScript. Se comprueban también anchos rail/panel, teclado,
  drawer y comparación. Capturas inspeccionadas en desktop y móvil.

Las pruebas UI anteriores sólo se adaptan a abrir la colección antes de buscar
su enlace y a pulsar el nuevo selector de periodo; sus comprobaciones funcionales
de permisos, Tenant, datos y exportación se mantienen.

Revisión local con el servidor de Portal:

```text
/tests/visual.html?single&login
/tests/visual.html?single
/tests/visual.html?single&ruta=/reportes/ranking
```

`single` sólo evita el selector de empresa en la fixture de pruebas. No forma
parte del build de producción ni del flujo real de acceso.
