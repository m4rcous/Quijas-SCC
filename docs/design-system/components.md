# GesGROW — Components

> Especificación de componentes reutilizables del Design System de GesGROW.
>
> Este documento define anatomía, variantes, estados, comportamiento y reglas de uso para componentes compartidos entre:
>
> - Portal Web de Gestión;
> - Aplicación de Campo;
> - futuros módulos y superficies.
>
> Los componentes deben construirse sobre los tokens definidos en `foundations.md` y respetar las reglas específicas de `portal.md` y `field-app.md`.

---

# 1. Objetivo

Los componentes de GesGROW deben:

- verse consistentes;
- ser reutilizables;
- adaptarse a Portal y Field;
- mantener accesibilidad;
- evitar duplicación;
- soportar estados reales;
- ser escalables a futuros módulos;
- separar comportamiento de dominio cuando sea posible.

Regla principal:

> **Compartir el concepto, adaptar la variante al contexto.**

Ejemplo:

```text
Button
├── Portal
│   ├── compact
│   ├── default
│   └── prominent
└── Field
    ├── default
    └── operational
```

---

# 2. Arquitectura de componentes

Se recomienda agruparlos en:

```text
Foundational
Navigation
Form
Feedback
Data Display
Overlay
Portal-specific
Field-specific
Data Visualization
```

---

# 3. Convenciones

Cada componente debe documentar:

- propósito;
- anatomía;
- variantes;
- tamaños;
- estados;
- comportamiento;
- accesibilidad;
- Portal;
- Field;
- cuándo usar;
- cuándo no usar.

---

# 4. Estados mínimos

Todo componente interactivo debe contemplar, cuando aplique:

```text
default
hover
focus
pressed
selected
loading
disabled
success
warning
error
read-only
```

Field puede añadir:

```text
offline
pending
synced
rejected
```

---

# 5. Button

## 5.1. Propósito

Ejecutar una acción clara.

---

## 5.2. Variantes

```text
Primary
Secondary
Ghost
Danger
Link
```

---

## 5.3. Primary

Uso:

- guardar;
- crear;
- confirmar;
- continuar;
- generar;
- ejecutar acción principal.

Portal:

```text
40–44px
```

Field:

```text
56px
```

Estilo:

```css
background: var(--color-brand-primary);
color: var(--color-text-inverse);
border: none;
border-radius: var(--radius-md);
font-weight: 600–700;
```

---

## 5.4. Secondary

Uso:

- cancelar;
- volver;
- acción complementaria.

```css
background: var(--color-surface-subtle);
color: var(--color-text-primary);
border: 1px solid var(--color-border-default);
```

---

## 5.5. Ghost

Uso:

- toolbars;
- acciones secundarias;
- context menus;
- icon + label ligero.

No usar como acción principal si reduce claridad.

---

## 5.6. Danger

Uso:

- cancelar definitivamente;
- eliminar;
- desvincular con impacto;
- acciones irreversibles.

No usar por defecto para “finalizar”.

---

## 5.7. Loading

Debe:

- bloquear doble submit;
- conservar ancho;
- mostrar progreso;
- mantener label o reemplazarlo de forma comprensible.

Ejemplo:

```text
Guardando…
```

---

## 5.8. Disabled

Debe verse claramente no interactivo.

No depender solo de opacidad.

---

# 6. IconButton

## Propósito

Ejecutar acción compacta mediante icono.

Usos:

- editar;
- cerrar;
- más acciones;
- volver;
- teclado manual;
- filtros;
- refresh.

Portal:

```text
36–40px
```

Field:

```text
48px
```

Debe incluir:

- `aria-label`;
- tooltip en Portal cuando el significado no sea obvio;
- focus visible.

---

# 7. Link

## Uso

Para navegación textual.

Debe diferenciarse del texto normal mediante:

- color;
- underline en hover/focus;
- peso;
- icono opcional.

No usar link visual para acciones destructivas.

---

# 8. Input

## 8.1. Anatomía

```text
Label
[ input                           ]
Helper / Error
```

---

## 8.2. Estados

- default;
- hover;
- focus;
- filled;
- error;
- disabled;
- read-only.

---

## 8.3. Portal

Altura:

```text
40–44px
```

---

## 8.4. Field

Altura:

```text
56px
```

Texto:

```text
18px
```

---

# 9. Textarea

Uso:

- motivo;
- notas;
- descripción;
- contexto.

No usar para entradas cortas.

Debe:

- mostrar resize controlado;
- tener límite visible si aplica;
- usar helper text;
- conservar label.

---

# 10. Select

## Propósito

Elegir una opción de conjunto conocido.

Variantes:

```text
Basic Select
Searchable Select
Multi Select
```

Usar búsqueda cuando existan muchas opciones.

No usar multi-select si la tarea necesita selección única.

---

# 11. Combobox

Usar cuando:

- hay muchas entidades;
- se necesita búsqueda;
- usuario puede escribir;
- resultados son dinámicos.

Ejemplos:

- trabajador;
- campaña;
- parcela;
- lote.

Debe soportar teclado en Portal.

---

# 12. Checkbox

Uso:

- selección múltiple;
- preferencias;
- opciones independientes.

Estados:

- unchecked;
- checked;
- indeterminate;
- disabled.

Target mínimo:

```text
44px Portal
48px Field
```

El checkbox visual puede ser menor, pero el hit area no.

---

# 13. Radio

Uso:

- selección única;
- pocas opciones visibles.

Evitar para listas extensas.

---

# 14. Switch

Uso:

- activar/desactivar estado inmediato.

Ejemplos:

- tema;
- activo/inactivo;
- opción de configuración.

No usar para acciones que requieran confirmación compleja.

---

# 15. SearchInput

## Anatomía

```text
[ search icon ][ Buscar… ][ clear ]
```

Debe:

- permitir limpiar;
- tener placeholder contextual;
- responder rápidamente;
- integrarse con FilterBar.

Ejemplos:

```text
Buscar por nombre o DNI…
Buscar por código de ticket…
```

---

# 16. ScanInput

Componente exclusivo de Field.

## Anatomía

```text
[ estado ][ Escanee DNI o ticket ][ teclado ]
```

## Altura

```text
64px
```

## Estados

- ready;
- focus;
- processing;
- valid;
- error;
- disabled;
- manual.

## Reglas

- recuperar focus;
- no requerir tap por cada lectura;
- aceptar scanner keyboard wedge;
- permitir teclado manual;
- mostrar resultado reconocido cerca.

---

# 17. KeyboardToggleButton

Field-only.

Permite alternar:

```text
scanner
↔
entrada manual
```

Debe:

- tener icono claro;
- mostrar estado activo;
- no competir con acción principal.

---

# 18. Label

Debe ser:

- visible;
- legible;
- cercano al control;
- consistente.

Placeholder no sustituye label.

---

# 19. HelperText

Uso:

- formato;
- restricción;
- aclaración.

Ejemplo:

```text
El código debe ser único dentro de la empresa.
```

No usar para información crítica.

---

# 20. FormError

Debe:

- aparecer cerca del control;
- explicar qué ocurrió;
- sugerir solución;
- estar vinculado semánticamente.

Ejemplo:

```text
El DNI ya pertenece a otro trabajador.
```

---

# 21. FormSection

Agrupa campos relacionados.

Anatomía:

```text
Título
Descripción opcional
Campos
```

Ejemplo:

```text
Información general
Periodo
Cultivo
Configuración
```

---

# 22. FormActions

Patrón:

```text
[ Cancelar ] [ Guardar cambios ]
```

Portal:
- alineación derecha o sticky footer.

Field:
- primary full-width;
- secondary debajo o arriba según flujo.

---

# 23. FilterBar

## Propósito

Agrupar búsqueda y filtros principales.

Portal:

```text
[ Buscar ] [ Estado ] [ Campaña ] [ Periodo ] [ Más filtros ]
```

Field:

```text
[ Buscar                     ][ Filtro ]
[ chip ][ chip ][ chip ]
```

Debe ser responsive.

---

# 24. FilterChip

Estados:

- default;
- selected;
- disabled.

Debe:

- ser removible cuando represente filtro activo;
- usar target correcto;
- no usar color excesivo.

---

# 25. SegmentedControl

Uso:

- pocas opciones mutuamente exclusivas.

Ejemplo:

```text
HOY | SEMANA | MES | CAMPAÑA
```

Portal:
- muy útil para periodo.

Field:
- usar solo si cabe cómodamente.

---

# 26. Tabs

Uso:

- subsecciones de mismo contexto.

Ejemplo:

```text
Resumen
Lotes
Personal
Variedades
```

No usar más de 5–6 tabs visibles sin overflow.

---

# 27. Badge

## Propósito

Mostrar información compacta.

Ejemplos:

- rol;
- cantidad;
- etiqueta;
- módulo.

No usar para estados semánticos críticos si `StatusBadge` es más adecuado.

---

# 28. StatusBadge

Estados comunes:

```text
Activo
Inactivo
Pendiente
Cerrada
Suspendido
Consumido
Disponible
Programado
```

Debe combinar:

- label;
- color;
- icono opcional.

No depender solo de color.

---

# 29. Avatar

Uso:

- usuario;
- trabajador;
- perfil.

Variantes:

```text
image
initials
icon fallback
```

No es obligatorio usar foto para trabajadores.

---

# 30. Tooltip

Portal-first.

Uso:

- icon button;
- sidebar colapsado;
- explicación breve.

No usar para información esencial.

No debe depender de hover únicamente; debe aparecer también con focus.

---

# 31. Card

## Propósito

Agrupar contenido semánticamente.

Variantes:

```text
DefaultCard
MetricCard
InteractiveCard
StatusCard
ChartCard
```

No envolver toda la pantalla en cards.

---

# 32. DefaultCard

Portal:

```text
padding: 20px
radius: 18px
```

Field:

```text
padding: 16px
radius: 20px
```

Debe usar:

- surface;
- border sutil;
- shadow baja.

---

# 33. InteractiveCard

Puede actuar como enlace/acción.

Debe incluir:

- hover Portal;
- pressed;
- focus;
- cursor;
- aria correcto.

No usar si la interacción no es evidente.

---

# 34. HomeActionTile

Field-only.

Anatomía:

```text
Icono
Título
Badge opcional
```

Toda la tarjeta es accionable.

Debe sentirse:

- grande;
- simple;
- táctil.

---

# 35. MetricCard

## Propósito

Mostrar KPI principal.

Anatomía:

```text
Label
Valor
Unidad
Comparación opcional
```

Ejemplo:

```text
Producción hoy
1,284
jabas
+8.4% vs ayer
```

No usar demasiadas MetricCards iguales.

---

# 36. TrendIndicator

Uso:

- comparación temporal;
- variación;
- cambio.

Estados:

```text
positive
negative
neutral
```

El significado positivo/negativo depende de la métrica.

No asumir:

```text
↑ = bueno
↓ = malo
```

---

# 37. SessionStatusCard

Field-only.

Debe mostrar:

- sesión;
- jabero;
- estado;
- contexto;
- hora;
- total.

Debe ser compacta.

---

# 38. StepCard

Field-only.

Anatomía:

```text
Indicador
Título
Instrucción
Control
Feedback
```

Estados:

- pending;
- active;
- completed;
- error;
- disabled.

---

# 39. StatusBanner

Uso:

- offline;
- warning persistente;
- error;
- información importante.

Field:

```text
Sin conexión
Los registros se guardarán localmente.
```

Portal:

puede usarse para:

- migración legacy;
- permiso limitado;
- cambio programado.

---

# 40. Alert

Variantes:

```text
Info
Success
Warning
Error
```

Anatomía:

```text
Icono
Título opcional
Mensaje
Acción opcional
Cerrar opcional
```

No usar alert para cada éxito trivial.

---

# 41. FeedbackMessage

Field-focused.

Debe ser breve y legible.

Éxito:

```text
✓ +1 jaba — Juan Pérez
```

Error:

```text
Ticket ya utilizado
Escanee otro ticket.
```

---

# 42. Toast

Uso:

- confirmación breve;
- acción secundaria completada;
- información no bloqueante.

Portal:
- estándar.

Field:
- usar con cuidado; no esconder feedback operativo crítico.

---

# 43. EmptyState

Anatomía:

```text
Icono o ilustración opcional
Título
Descripción
Acción opcional
```

Ejemplo:

```text
No hay campañas todavía

Cree la primera campaña para comenzar.

[ Crear campaña ]
```

Field:
- más breve;
- sin ilustraciones grandes.

---

# 44. Skeleton

Uso:

- listas;
- cards;
- tablas;
- detalles.

Debe parecerse a la estructura real.

Evitar skeletons exageradamente animados.

---

# 45. Spinner

Uso limitado.

Preferir:

- estado de botón;
- skeleton;
- progreso inline.

No usar spinner fullscreen para tareas pequeñas.

---

# 46. ProgressBar

Uso:

- carga determinística;
- generación;
- procesamiento;
- importación futura.

Debe mostrar valor si existe.

---

# 47. SyncStatus

Field-only.

Estados:

```text
synced
pending
offline
error
```

Normal:

```text
oculto
```

Solo aparecer cuando sea útil.

---

# 48. PendingOperationBadge

Field-only.

Ejemplo:

```text
3 pendientes
```

Debe abrir el detalle de sincronización si es accionable.

---

# 49. DataTable

Portal-first.

Debe soportar:

- header;
- sort;
- filters;
- row hover;
- pagination;
- loading;
- empty;
- actions;
- selection opcional;
- sticky header.

---

# 50. DataTable — anatomía

```text
Toolbar
Header
Rows
Footer / pagination
```

---

# 51. DataTable — row actions

Preferir:

```text
acción principal
+
overflow
```

Evitar 4 botones por fila.

---

# 52. DataTable — responsive

Tablet/mobile:

- ocultar columnas;
- priorizar campos;
- abrir detalle;
- evitar scroll horizontal si puede resolverse de otra forma.

---

# 53. IndustrialTable

Field-only.

Debe:

- usar pocas columnas;
- row height ≥ 48px;
- soportar sticky header;
- ser tocable;
- mantener alto contraste.

---

# 54. TableCellStatus

Componente conceptual.

Usar `StatusBadge` dentro de tabla cuando el estado sea importante.

No colorear toda la fila salvo caso crítico.

---

# 55. Pagination

Portal.

Anatomía:

```text
1–20 de 240        [ ‹ ] [ 1 ] [ 2 ] [ 3 ] [ › ]
```

Puede incluir:

- tamaño de página;
- total;
- navegación.

---

# 56. RankingList

Uso:

- productividad;
- rendimiento;
- posición.

Anatomía:

```text
Posición
Persona
Valor
Variación opcional
```

Ejemplo:

```text
1   Juan Pérez     92 jabas
2   Ana Torres     88 jabas
```

---

# 57. ListItem

Componente base.

Anatomía:

```text
Leading
Content
Trailing
```

Debe soportar:

- icon;
- avatar;
- title;
- subtitle;
- status;
- action.

---

# 58. DetailList

Uso:

- metadata;
- resumen de entidad.

Ejemplo:

```text
Código          CAM-2026-01
Estado          Activa
Cultivo         Palta
Inicio          01 ene 2026
```

Ideal para:
- details;
- drawers;
- side panels.

---

# 59. KeyValue

Versión compacta de DetailList.

Uso:

- métricas;
- resumen;
- metadata.

---

# 60. Breadcrumbs

Portal.

Ejemplo:

```text
Campañas / Palta 2026 / Lote 07
```

No usar en nivel raíz.

Debe soportar:

- truncation;
- keyboard;
- current page.

---

# 61. Sidebar

Portal-only.

Estados:

```text
collapsed
expanded
hover
focus
active
```

Debe:

- mantener iconos alineados;
- mostrar tooltip colapsado;
- expandir sin salto fuerte;
- no depender únicamente de hover;
- soportar drawer en mobile.

---

# 62. SidebarItem

Anatomía:

```text
Icono
Label
Badge opcional
```

Activo:

- surface brand-soft;
- indicador;
- peso mayor.

---

# 63. AppHeader

Puede tener variantes:

```text
PortalHeader
FieldAppHeader
```

---

# 64. PortalHeader

Puede incluir:

- breadcrumbs;
- tenant;
- theme;
- profile;
- actions.

No saturar.

---

# 65. FieldAppHeader

Debe ser compacto.

Puede incluir:

- back;
- title;
- operator;
- context menu;
- sync indicator solo cuando importa.

---

# 66. PageHeader

Portal.

Anatomía:

```text
Breadcrumb
Title + description
Actions
Secondary controls
```

Debe existir una sola acción principal prominente.

---

# 67. ContextMenuButton

Field.

Abre navegación contextual.

Debe ser fácil de tocar y no competir con scanner.

---

# 68. CommandMenu

Futuro Portal.

Puede servir para:

- búsqueda global;
- navegación;
- acciones rápidas.

No es requisito inicial.

---

# 69. DropdownMenu

Portal.

Uso:

- overflow;
- acciones;
- selector simple.

Debe soportar:

- teclado;
- escape;
- focus management.

---

# 70. Popover

Portal.

Uso:

- filtros;
- fecha;
- selección breve;
- detalles.

No usar para formularios complejos.

---

# 71. BottomSheet

Field-first.

Uso:

- filtros;
- navegación contextual;
- detalle;
- acción secundaria.

Debe:

- tener esquinas superiores;
- permitir swipe/cierre si es seguro;
- mantener targets grandes.

---

# 72. Drawer

Portal.

Uso:

- detalle;
- edición corta;
- filtros avanzados;
- contexto secundario.

Desktop:

```text
right-side drawer
```

Tablet/mobile:
- puede ocupar más ancho.

---

# 73. Dialog

Uso:

- confirmación;
- operación breve;
- decisión importante.

No usar para:

- formularios largos;
- tablas;
- navegación completa.

---

# 74. ConfirmationDialog

Anatomía:

```text
Título
Impacto
Acción secundaria
Acción confirmatoria
```

Ejemplo:

```text
Finalizar sesión

Ya no podrá registrar nuevas jabas en esta sesión.

[ Volver ] [ Finalizar ]
```

---

# 75. DestructiveConfirmation

Solo para acciones irreversibles.

Debe:

- usar lenguaje explícito;
- evitar ambigüedad;
- mostrar entidad afectada.

---

# 76. DatePicker

Portal.

Debe soportar:

- una fecha;
- rango;
- teclado;
- locale;
- clear.

No usar calendario complejo si un input de fecha simple basta.

---

# 77. PeriodSelector

Portal, data-viz.

Opciones frecuentes:

```text
HOY
SEMANA
MES
CAMPAÑA
```

Puede implementarse como segmented control.

---

# 78. ThemeSwitcher

Portal.

Opciones:

```text
Sistema
Claro
Oscuro
```

No existe en Field.

---

# 79. TenantSwitcher

Portal.

Debe:

- mostrar empresa actual;
- cambiar contexto;
- mostrar loading;
- no mezclar perfil usuario;
- limpiar datos anteriores.

---

# 80. CampaignSelector

Portal.

Uso contextual.

Debe:

- permitir activo/histórico;
- mostrar estado;
- no forzar campaña cuando una vista debe abarcar múltiples.

---

# 81. UserMenu

Portal.

Puede incluir:

- cuenta;
- preferencias;
- theme;
- cerrar sesión.

---

# 82. ProfileSummary

Uso:

- drawer;
- account;
- membership.

Debe distinguir:

```text
Usuario de sistema
≠
Trabajador agrícola
```

---

# 83. PermissionNotice

Portal.

Uso:

- read-only;
- falta de permiso;
- delegación requerida.

Ejemplo:

```text
Puede consultar esta suscripción, pero no modificarla.
```

---

# 84. LegacyNotice

Portal.

Uso:

- campaña gestionada aún por Sheets;
- modo transición.

Debe ser informativo, no alarmista.

Ejemplo:

```text
Esta campaña todavía utiliza la administración legacy de Sheets.
```

---

# 85. ScheduledChangeCard

Portal.

Uso:

- suscripción;
- cambios futuros.

Anatomía:

```text
Cambio
Fecha efectiva
Motivo
Actor
Estado
```

Debe distinguir claramente estado actual vs futuro.

---

# 86. AuditTimeline

Portal.

Uso:

- historial comercial;
- auditoría;
- actividad.

Anatomía:

```text
Fecha
Actor
Evento
Antes
Después
Motivo
```

Puede ser timeline o tabla según volumen.

---

# 87. ActivityFeed

Uso:

- dashboard;
- actividad reciente.

Debe priorizar eventos significativos.

No convertir logs técnicos en actividad de usuario.

---

# 88. HierarchyTree

Portal.

Uso:

```text
Fundo
→ Sector
→ Parcela
```

Debe soportar:

- expand/collapse;
- selección;
- active state;
- keyboard cuando aplique.

No usar si una tabla simple es más clara.

---

# 89. EntityLink

Componente conceptual para navegar a detalle.

Ejemplo:

```text
Juan Pérez →
Lote 07 →
Parcela P-07 →
```

Debe ser consistente.

---

# 90. ContextPill

Uso:

- campaña;
- lote;
- parcela;
- contexto activo.

No debe sustituir filtros complejos.

---

# 91. FileExportButton

Portal.

Uso:

- CSV;
- futuras exportaciones.

Debe:

- indicar formato;
- respetar filtros;
- no aparentar acción primaria.

---

# 92. ChartCard

Portal.

Anatomía:

```text
Title
Subtitle/context
Controls
Chart
Legend
Footer / insight optional
```

Debe evitar padding excesivo.

La especificación detallada vive en `data-viz.md`.

---

# 93. ChartLegend

Debe:

- mostrar serie;
- color;
- valor opcional;
- permitir toggle solo si aporta valor.

Nunca depender solo de color.

---

# 94. KPIGrid

Portal.

No es un componente único obligatorio; es un patrón de composición.

Debe:

- priorizar 3–5 métricas;
- variar tamaño según importancia;
- evitar 8 cards idénticas.

---

# 95. ProgressIndicator

Usar cuando existe progreso real.

Ejemplo:

```text
Tickets consumidos
34 / 40
```

Puede ser:

- barra;
- circular limitado;
- texto + barra.

---

# 96. ConsumptionStatus

Harvest-specific visual pattern.

Estados:

```text
Disponible
Asignado
Consumido
Rechazado
```

Debe usar semántica consistente.

---

# 97. TicketBatchSummary

Harvest Portal.

Anatomía:

```text
Identificador de lote
Total
Disponibles
Asignados
Consumidos
Estado
```

No confundir con parcela agrícola.

---

# 98. AssignmentSummary

Harvest.

Mostrar:

- lote de tickets;
- trabajador;
- fecha;
- actor;
- estado.

Field puede usar versión resumida.

---

# 99. HarvestRecordSummary

Mostrar:

- ticket;
- trabajador;
- sesión;
- fecha/hora;
- origen;
- estado.

---

# 100. FarmHierarchyBreadcrumb

Portal.

Ejemplo:

```text
Fundo Quijas / Sector Norte / Parcela P-07
```

No usar para lote operativo si no pertenece a esa jerarquía física.

---

# 101. WorkerIdentity

Componente conceptual.

Debe mostrar:

- nombre;
- DNI;
- estado;
- rol operativo si aplica.

Puede aparecer en:

- scans;
- tables;
- details.

---

# 102. ScannerFeedback

Field.

Variantes:

```text
recognized
success
duplicate
invalid
not-assigned
offline-saved
```

Debe desaparecer/compactarse sin bloquear siguiente lectura.

---

# 103. OfflineOperationRow

Field.

Para cola de sincronización.

Mostrar:

- tipo;
- entidad;
- hora;
- estado;
- acción.

Ejemplo:

```text
Registrar cosecha
Ticket TK-0812
08:42
Pendiente
```

---

# 104. SyncErrorDetail

Field.

Debe mostrar:

- operación;
- causa legible;
- dependencias;
- reintentar;
- descartar si es seguro.

No exponer stack trace.

---

# 105. Component Composition Rules

Preferir composición.

Ejemplo:

```text
Card
└── Metric
    ├── Label
    ├── Value
    └── TrendIndicator
```

No crear:

```text
ProductionTodayGreenCardComponent
```

si puede componerse con primitives existentes.

---

# 106. Naming Rules

Preferir nombres neutrales:

```text
Button
DataTable
StatusBadge
MetricCard
Drawer
```

Evitar:

```text
HarvestButton
CampaignCard
WorkerModal
```

salvo que el componente realmente encapsule comportamiento específico del dominio.

---

# 107. Component Ownership

Separar:

```text
shared/ui
portal/ui
field/ui
domain-specific
```

Conceptualmente:

```text
shared/ui
├── Button
├── Input
├── Badge
├── Card
└── Dialog

portal/ui
├── Sidebar
├── PageHeader
├── DataTable
└── Drawer

field/ui
├── ScanInput
├── StepCard
├── HomeActionTile
└── SyncStatus

harvest/ui
├── TicketBatchSummary
└── HarvestRecordSummary
```

---

# 108. No acoplar UI a infraestructura

Los componentes no deben saber sobre:

- Supabase;
- RPC;
- SQL;
- IndexedDB;
- JWT;
- HTTP específico.

Deben recibir:

```text
props
callbacks
view models
```

---

# 109. Error Handling Contract

Los componentes deben trabajar con errores neutrales.

Ejemplo:

```text
title
message
fieldErrors
retryable
```

No mostrar:

- SQLSTATE;
- stack trace;
- RPC names;
- provider internals.

---

# 110. Accessibility — General

Cada componente interactivo debe considerar:

- keyboard;
- focus;
- labels;
- aria;
- contrast;
- disabled;
- state announcement.

---

# 111. Accessibility — Loading

Loading debe comunicarse con:

- visual;
- `aria-busy`;
- label;
- live region cuando aplique.

---

# 112. Accessibility — Dialog

Debe:

- mover focus;
- atraparlo correctamente;
- cerrar con Escape si es seguro;
- devolver focus al origen.

---

# 113. Accessibility — Table

Debe:

- usar headers semánticos;
- anunciar sorting;
- no usar div-grid sin necesidad;
- soportar caption/contexto.

---

# 114. Accessibility — Field

Field debe priorizar:

- targets grandes;
- labels;
- feedback visible;
- focus;
- scanner reliability;
- error no dependiente de sonido.

---

# 115. Component Documentation Template

Cada componente nuevo debería documentarse así:

```md
# ComponentName

## Purpose
## Anatomy
## Variants
## Sizes
## States
## Portal behavior
## Field behavior
## Accessibility
## Do
## Don't
## Examples
```

---

# 116. Component Review Checklist

Antes de aprobar un componente:

- [ ] Usa tokens
- [ ] No contiene hex arbitrario
- [ ] No contiene spacing arbitrario
- [ ] Estados completos
- [ ] Focus visible
- [ ] Disabled legible
- [ ] Loading definido
- [ ] Error definido
- [ ] Responsive si aplica
- [ ] Portal/Field diferenciados cuando hace falta
- [ ] Nombre neutral al dominio si corresponde
- [ ] Accesibilidad revisada
- [ ] No depende de hover para función crítica
- [ ] No conoce infraestructura
- [ ] Puede reutilizarse

---

# 117. Portal Component Checklist

- [ ] Densidad correcta
- [ ] Hover
- [ ] Keyboard
- [ ] Light mode
- [ ] Dark mode
- [ ] Tooltip si icon-only
- [ ] Responsive
- [ ] No es demasiado táctil/grande
- [ ] Se integra con sidebar/shell

---

# 118. Field Component Checklist

- [ ] Target ≥ 48px
- [ ] Alto contraste
- [ ] Sin hover necesario
- [ ] Light-only
- [ ] Scanner compatible
- [ ] Offline si aplica
- [ ] Feedback inmediato
- [ ] No aumenta scroll innecesariamente
- [ ] Uso con una mano
- [ ] Focus recuperable

---

# 119. Lista oficial inicial de componentes

## Shared

- Button
- IconButton
- Link
- Input
- Textarea
- Select
- Combobox
- Checkbox
- Radio
- Switch
- Label
- HelperText
- FormError
- FormSection
- FormActions
- SearchInput
- FilterBar
- FilterChip
- SegmentedControl
- Tabs
- Badge
- StatusBadge
- Avatar
- Tooltip
- Card
- MetricCard
- Alert
- Toast
- EmptyState
- Skeleton
- Spinner
- ProgressBar
- ListItem
- DetailList
- KeyValue
- Dialog
- ConfirmationDialog

## Portal

- Sidebar
- SidebarItem
- PortalHeader
- PageHeader
- Breadcrumbs
- DataTable
- Pagination
- Drawer
- DropdownMenu
- Popover
- DatePicker
- PeriodSelector
- ThemeSwitcher
- TenantSwitcher
- CampaignSelector
- UserMenu
- PermissionNotice
- LegacyNotice
- ScheduledChangeCard
- AuditTimeline
- ActivityFeed
- HierarchyTree
- EntityLink
- ContextPill
- FileExportButton
- ChartCard
- ChartLegend
- RankingList

## Field

- FieldAppHeader
- ContextMenuButton
- HomeActionTile
- ScanInput
- KeyboardToggleButton
- StepCard
- SessionStatusCard
- StatusBanner
- FeedbackMessage
- IndustrialTable
- BottomSheet
- SyncStatus
- PendingOperationBadge
- ScannerFeedback
- OfflineOperationRow
- SyncErrorDetail

## Domain-specific compositional patterns

- WorkerIdentity
- TicketBatchSummary
- AssignmentSummary
- HarvestRecordSummary
- ConsumptionStatus
- FarmHierarchyBreadcrumb

---

# 120. Principio final

> **Los componentes de GesGROW deben sentirse como piezas de un mismo producto, no como elementos diseñados pantalla por pantalla.**

La consistencia debe venir de:

```text
tokens
+
composición
+
estados completos
+
accesibilidad
+
variantes Portal/Field
```

Un componente nuevo solo debe crearse cuando una necesidad real no pueda resolverse correctamente combinando los existentes.
