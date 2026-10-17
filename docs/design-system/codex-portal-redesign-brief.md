# Brief para Codex — Redefinición visual controlada del Portal GesGROW

Implementa únicamente una **iteración controlada de redefinición visual del Portal GesGROW**.

Antes de modificar código, lee:

```text
docs/design-system/README.md
docs/design-system/DESIGN.md
docs/design-system/portal.md
docs/design-system/foundations.md
docs/design-system/components.md
docs/design-system/data-viz.md
```

`portal.md` contiene la dirección visual más reciente y prevalece sobre decisiones visuales antiguas que entren en conflicto.

## Objetivo

La nueva dirección debe abandonar la sensación de panel administrativo SaaS genérico y acercarse a una:

```text
suite agri-tech premium
+ modular
+ editorial
+ analítica
+ visiblemente agrícola
```

La identidad buscada incluye:

- Navigation Rail compacta;
- panel de navegación contextual;
- módulos agrupados por colecciones;
- Dashboard con composición editorial;
- hero agrícola;
- widgets de distintos tamaños;
- clima como patrón contextual;
- login fotográfico/editorial;
- página dedicada de Ranking;
- selección y comparación personalizada de cosechadores;
- light/dark mode;
- motion refinado.

## Alcance obligatorio

No rediseñes todavía todo el Portal.

Trabaja únicamente en:

```text
1. Login
2. App Shell / Navigation Rail
3. Dashboard Home
4. Ranking
```

Estas cuatro superficies se revisarán visualmente antes de extender el lenguaje al resto.

No cambies otras páginas salvo componentes compartidos estrictamente necesarios.

---

## 1. Preservar funcionalidad

Mantén intactos:

- rutas;
- sesión;
- Identity;
- TenantContext;
- permisos;
- entitlements;
- Campaign;
- Workforce;
- Farm Structure;
- Harvest;
- Platform;
- reportes existentes;
- adapters Supabase;
- RPC;
- migrations;
- PWA;
- IndexedDB;
- Apps Script.

No cambies reglas de negocio ni migres backend.

---

## 2. Nueva navegación

Sustituye visualmente el sidebar plano actual por:

```text
Navigation Rail
→ colección
→ panel contextual
→ módulo/ruta
```

Orientación desktop:

```text
rail: ~72px
panel contextual: ~290px
```

### Colecciones iniciales

Adapta las rutas reales existentes a una estructura equivalente a:

```text
Inicio

Operación agrícola
- Campañas
- Personal
- Cosecha
- Reportes

Estructura agrícola
- Fundos
- Sectores
- Parcelas

Plataforma
- Usuarios y accesos
- Suscripción
- Módulos
- Configuración
```

No inventes rutas.

### Entitlements

La navegación debe respetar los módulos efectivos, permisos y TenantContext actuales.

Un módulo no habilitado no debe aparecer como módulo operativo normal.

### Estados

Soporta:

```text
collapsed
hover-expanded
focus-expanded
pinned si aporta valor
mobile-drawer
```

No dependas exclusivamente de hover. Debe ser usable con teclado.

Cuando la rail esté colapsada, usa tooltips accesibles mediante hover y focus.

---

## 3. Apariencia de la rail

Debe sentirse:

- clara;
- muy redondeada;
- ligera;
- premium;
- con glass sutil;
- iconografía consistente.

No usar sidebar negro pesado ni glass exagerado.

Mantén el item activo y la jerarquía colección/módulo/ruta claramente visibles.

---

## 4. Dashboard Home

Recompón `/` usando un layout editorial/asimétrico.

No cambies los datos actuales.

Jerarquía preferida:

```text
Hero / bienvenida              WeatherCard
KPI / tendencia                Ranking breve
Métricas compactas
Producción diaria
Producción por lote            Última actividad
```

No es obligatorio respetar exactamente las celdas si los datos reales requieren otra proporción, pero evita una sucesión vertical de cards full-width.

---

## 5. Hero agrícola

Añade un hero al Dashboard capaz de mostrar:

- fecha;
- saludo;
- empresa;
- campaña;
- uno o dos indicadores breves;
- asset agrícola real o fallback.

No conviertas Home en landing page.

Si el repositorio no contiene una fotografía adecuada:

- prepara el contenedor;
- usa un fallback del Design System;
- informa qué asset final falta.

No descargues imágenes externas arbitrarias sin reportarlo.

---

## 6. WeatherCard

Crea el componente visual `WeatherCard` o equivalente.

Debe parecer un widget compacto de sistema, con gran radio y jerarquía mínima.

### Integridad

No inventes datos meteorológicos.

No integres una API de clima en esta fase.

Si no existe una fuente actual:

```text
Clima no configurado
```

u omite los valores preservando una experiencia honesta.

Reporta esta brecha al final.

---

## 7. Widgets y KPIs

Conserva los datos actuales:

- producción total;
- jabas hoy;
- cosechadores;
- lotes;
- sesiones;
- días;
- última actividad.

Distribúyelos en widgets de distinta escala.

No hagas todas las cards idénticas.

Usa tamaño, posición, tipografía y whitespace para crear jerarquía.

---

## 8. Producción diaria

Conserva el read model actual.

Refina el chart según `data-viz.md`.

Con datasets de 1–3 puntos:

- limita el ancho de barras;
- distribuye mejor el contenido;
- evita una barra enorme pegada al extremo.

Usa verde como serie principal y amarillo como acento/highlight cuando exista una razón útil.

Mantén la tabla accesible con exactamente los mismos datos.

Muestra fechas humanas en UI, no ISO innecesariamente.

---

## 9. Ranking — nueva superficie

Rediseña la página de Ranking existente como vista analítica propia.

Debe incluir visualmente:

```text
ranking general
+
selección de cosechadores
+
panel/bandeja de comparación
```

### Ranking general

Mostrar según contratos actuales:

- posición;
- trabajador;
- producción;
- última actividad;
- periodo;
- campaña.

Añade búsqueda y selección para comparar.

El top 3 puede tener énfasis sutil, sin gamificación.

---

## 10. Comparison Tray

Implementa un patrón visual equivalente a:

```text
Comparar

[ Juan Pérez × ]
[ Ana Torres × ]

[ Comparar 2 ]
```

Limita visualmente la comparación a aproximadamente 2–5 seleccionados.

Puede ser sticky, lateral o superior según el layout.

---

## 11. Comparación personalizada — regla crítica

La intención de producto es comparar cosechadores por:

```text
Día
Mes
Campaña
```

Antes de implementar cálculos, inspecciona los read models actuales.

### Si los contratos actuales ya entregan los datos necesarios

Puedes implementar la comparación reutilizándolos.

No dupliques lógica de dominio.

### Si los contratos NO entregan la granularidad necesaria

NO:

- inventes datos;
- hagas queries Supabase directas desde React;
- mezcles legacy/Harvest;
- reconstruyas producción cruda en frontend;
- agregues migrations o RPC en esta fase visual.

En ese caso:

1. implementa la UX y estados del comparador de forma honesta;
2. no muestres resultados falsos;
3. documenta exactamente qué read model/contrato falta;
4. deja la función avanzada pendiente de una fase funcional posterior.

---

## 12. Period Selector

Visualmente puede ser:

```text
[ Día ] [ Mes ] [ Campaña ]
```

Si los contratos actuales manejan `HOY / SEMANA / MES / CAMPANIA`, no cambies la semántica silenciosamente.

Usa labels humanas sin exponer enums técnicos.

---

## 13. Comparison Chart

Cuando existan datos válidos:

- line chart para evolución temporal;
- barras para comparación agregada;
- máximo 2–5 series;
- tabla equivalente;
- tooltips accesibles;
- light/dark.

No uses gráficos decorativos.

---

## 14. Login

Rediseña el login con composición editorial:

```text
fotografía agrícola
+
formulario
```

Permite:

- grandes radios;
- transición orgánica moderada entre paneles;
- headline breve;
- fotografía/asset agrícola.

Mantén exactamente el flujo funcional existente:

```text
email
contraseña
iniciar sesión
```

No inventes:

- registro público;
- Google login;
- free trial;
- remember me;
- recuperación de contraseña;

si no existen.

Mientras el logo definitivo esté pendiente, usa `GesGROW` como wordmark.

---

## 15. Light/Dark

Mantén ambos temas en Portal.

Cubre:

- rail;
- panel;
- Dashboard;
- hero;
- WeatherCard;
- Ranking;
- charts;
- Login si la arquitectura actual lo permite.

Dark mode no debe convertirse en un dashboard negro.

---

## 16. Motion

Orientación:

```text
rail hover/focus    160–220ms
panel expansion     180–240ms
widget hover        120–160ms
comparison tray     180–240ms
theme/state         120–180ms
```

Respeta `prefers-reduced-motion`.

No uses bounce/spring exagerado.

---

## 17. Responsive

Desktop es prioritario.

Navegación:

```text
desktop → rail + panel
tablet  → rail/drawer
mobile  → drawer
```

Dashboard mobile:

```text
Hero
Weather
KPIs
Charts
Ranking
Activity
```

No reduzcas simplemente el layout desktop.

---

## 18. Componentes candidatos

Refactoriza solo cuando aporte reutilización real.

Candidatos:

```text
NavigationRail
NavigationCollectionPanel
NavigationItem
PortalHero
WeatherCard
MetricWidget
TrendWidget
RankingPreview
ComparisonTray
ComparisonChart
PeriodSelector
UserMenu
```

Usa tokens existentes. No instales una UI library que sustituya el Design System.

---

## 19. Data integrity

No cambies:

- agregaciones;
- ranking;
- producción;
- counts;
- permisos;
- ownership;
- contratos.

La UI consume read models; no reconstruye negocio.

---

## 20. Accesibilidad

Mantén:

- navegación de rail por teclado;
- focus visible;
- tooltips también en focus;
- labels;
- aria;
- contraste;
- tablas semánticas;
- chart + table;
- reduced motion.

---

## 21. No propagar todavía

No extiendas la nueva dirección a Campañas, Personal, Cosecha, Farm Structure, Suscripción, etc. todavía.

Queremos aprobar primero:

```text
Login
Shell
Dashboard
Ranking
```

---

## 22. Validación

Ejecuta:

```text
tests Portal
build Portal
tests raíz relevantes
git diff --check
```

Añade tests de UI cuando exista interacción nueva:

- rail keyboard;
- expansión;
- mobile drawer;
- selección de ranking;
- Comparison Tray;
- theme.

No modifiques tests funcionales para ocultar regresiones.

---

## 23. Entrega

Al finalizar informa:

- estructura final de navegación;
- colecciones creadas;
- comportamiento rail/panel;
- Dashboard layout;
- hero y asset utilizado/faltante;
- WeatherCard y estado de datos;
- Login;
- Ranking;
- selección/comparación;
- qué comparación pudo implementarse con contratos actuales;
- qué contrato/read model falta si existe brecha;
- light/dark;
- responsive;
- accesibilidad;
- componentes creados;
- dependencias añadidas;
- tests/build;
- páginas no tocadas.

## Criterio final

La iteración es correcta si GesGROW se siente como una **suite agrícola contemporánea y premium**, no como un dashboard administrativo verde.

La nueva identidad debe surgir de:

```text
rail modular
+
colecciones
+
hero agrícola
+
widgets editoriales
+
datos
+
movimiento
```

sin sacrificar claridad, accesibilidad ni integridad funcional.
