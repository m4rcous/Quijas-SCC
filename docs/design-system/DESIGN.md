# GesGROW — DESIGN.md

> **AI design specification**
>
> Este documento es la referencia compacta que deben utilizar herramientas de IA de diseño como Google Stitch, Figma AI u otros agentes generativos para crear interfaces coherentes con GesGROW.
>
> No sustituye la documentación completa del Design System. Resume las decisiones visuales, de interacción y de producto que una IA debe respetar al generar nuevas pantallas.

---

## 1. Producto

**Nombre:** GesGROW

**Categoría:** plataforma agri-tech para gestión y operación agrícola.

**Superficies principales:**
- Portal Web de Gestión
- Aplicación de Campo para PDA/móvil

**Expansión futura esperada:**
- Harvest / Cosecha
- Campaign Management
- Workforce
- Farm Structure
- Inventario
- Maquinaria
- Riego
- Calidad
- Costos
- Trazabilidad
- Mantenimiento
- Logística
- Analítica avanzada

GesGROW no debe diseñarse como una aplicación exclusiva de cosecha. El lenguaje visual debe poder crecer hacia una suite agrícola modular.

---

## 2. Personalidad de marca

GesGROW debe transmitir simultáneamente:

- tecnología;
- agricultura;
- innovación;
- cercanía;
- modernidad;
- confianza;
- robustez;
- calidad premium.

### Idea central

> **GesGROW debe sentirse como una plataforma agri-tech premium: moderna, elegante, útil y claramente agrícola.**

La agricultura debe percibirse visualmente y no depender únicamente del contenido textual.

### Impresión deseada

Al abrir GesGROW por primera vez, el usuario debería pensar:

> “Esto parece una herramienta agrícola profesional, moderna y de alto valor.”

---

## 3. Dirección estética

Combinar:

- software SaaS moderno de alta calidad;
- identidad agrícola evidente;
- precisión operativa;
- acabados premium;
- simplicidad de uso;
- claridad de información.

La interfaz debe sentirse diseñada específicamente para agricultura.

### Referencia conceptual

No copiar productos existentes.

Buscar un nivel de acabado equivalente a software digital moderno y premium, pero con más calidez, identidad agrícola y lenguaje operacional.

### Regla

> **Agrícola sí. Decorativo no.**

La agricultura puede expresarse mediante:

- paleta verde;
- amarillo cosecha;
- iconografía específica;
- fotografía contextual cuando tenga sentido;
- formas o patrones inspirados sutilmente en cultivos, hojas, parcelas o líneas agrícolas;
- terminología y visualización de datos productivos.

Evitar convertir hojas, plantas o ilustraciones en decoración repetitiva.

---

## 4. Principios globales

### 4.1. Simple de usar, rico en diseño

GesGROW debe ser fácil de entender sin sentirse visualmente básico.

> **Simple no significa pobre.**

La estructura debe ser clara, pero los detalles deben sentirse cuidados.

---

### 4.2. Claridad antes que decoración

Toda decisión visual debe ayudar a entender:

- dónde estoy;
- qué información importa;
- qué puedo hacer;
- qué acaba de ocurrir;
- cuál es el siguiente paso.

---

### 4.3. Datos primero

GesGROW es una plataforma operativa y analítica.

Dar prioridad a:

- métricas;
- tablas;
- tendencias;
- rankings;
- estados;
- filtros;
- comparaciones;
- producción;
- rendimiento.

---

### 4.4. Una identidad, dos modos de uso

Portal y Aplicación de Campo deben sentirse como productos hermanos.

Comparten:
- marca;
- paleta;
- tipografía;
- iconografía;
- lenguaje;
- estados;
- accesibilidad.

No comparten necesariamente:
- densidad;
- tamaño de controles;
- navegación;
- scroll;
- layout;
- comportamiento responsive.

---

### 4.5. Diseñar estados reales

No generar únicamente happy paths.

Considerar cuando corresponda:

- default;
- hover;
- focus;
- pressed;
- selected;
- loading;
- success;
- warning;
- error;
- disabled;
- empty;
- offline;
- pending;
- read-only;
- permission denied.

---

## 5. Paleta de marca

La identidad conserva el verde agrícola actual y el amarillo cosecha.

### Verde principal

```css
--color-brand-950: #102A1D;
--color-brand-900: #173F2B;
--color-brand-800: #1F5A3A;
--color-brand-700: #26734A;
--color-brand-600: #2F8A57;
--color-brand-500: #3A9C66;
--color-brand-200: #CFE6D7;
--color-brand-100: #E8F4EC;
--color-brand-050: #F4FAF6;
```

Usar para:
- acciones primarias;
- selección;
- estados activos;
- focus;
- navegación activa;
- indicadores positivos;
- highlights de marca.

---

### Amarillo cosecha

```css
--color-harvest-700: #B77D00;
--color-harvest-600: #D39700;
--color-harvest-500: #F2B705;
--color-harvest-400: #F7C535;
--color-harvest-300: #FFD45A;
--color-harvest-100: #FFF4C8;
```

Usar como:
- acento;
- métricas destacadas;
- badges;
- atención;
- elementos asociados a cosecha o productividad.

No convertirlo en color primario de navegación.

---

### Neutros light

```css
--color-ink-950: #152019;
--color-ink-900: #1D2921;
--color-ink-700: #44534A;
--color-ink-600: #5E6C63;
--color-ink-500: #6F7C74;
--color-line-300: #D5DDD8;
--color-line-200: #E3E8E5;
--color-surface-150: #EDF1EE;
--color-surface-100: #F2F5F3;
--color-surface-050: #F8FAF9;
--color-white: #FFFFFF;
```

Los neutros deben sentirse ligeramente cálidos, no azulados.

---

### Estados semánticos

```css
--color-success-bg: #E8F4EC;
--color-success-fg: #1F6B43;

--color-warning-bg: #FFF4C8;
--color-warning-fg: #8A6100;

--color-error-bg: #FDE8E6;
--color-error-fg: #B42318;

--color-info-bg: #E8F0FA;
--color-info-fg: #245A92;

--color-disabled-bg: #EEF1EF;
--color-disabled-fg: #98A39C;
```

Nunca comunicar estados únicamente mediante color.

---

## 6. Dark mode

### Portal
Debe soportar:
- light mode;
- dark mode.

Dark mode debe diseñarse como tema real.

Evitar:
- fondo negro puro;
- texto blanco puro en grandes superficies;
- inversión automática de colores;
- gráficos ilegibles;
- verdes excesivamente luminosos.

Preferir:
- superficies oscuras con matiz verde/neutro;
- contraste cómodo;
- bordes sutiles;
- brand colors recalibrados;
- visualizaciones de datos preparadas para ambos temas.

### Aplicación de Campo
Solo light mode por ahora.

La visibilidad bajo sol tiene prioridad.

---

## 7. Tipografía

Familia principal:

```css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Inter debe utilizarse en:
- navegación;
- formularios;
- tablas;
- métricas;
- dashboards;
- PDA.

Características buscadas:
- moderna;
- utilitaria;
- números claros;
- alta legibilidad;
- buena densidad en interfaces complejas.

---

## 8. Escala tipográfica base

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-md: 0.9375rem;  /* 15px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.125rem;  /* 34px */
--font-size-metric: 2.5rem; /* 40px */
```

### Portal
Puede utilizar tamaños más compactos en tablas, filtros y navegación.

### Field
Mantener texto operativo grande y legible.

No reducir texto operativo por debajo de 16px.

---

## 9. Espaciado

Sistema base de 4px.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

Usar ritmo visual consistente.

Portal:
- densidad equilibrada;
- evitar excesivos espacios vacíos;
- evitar tablas demasiado aireadas.

Field:
- controles grandes;
- espacios suficientes para uso táctil;
- minimizar altura total del flujo.

---

## 10. Radios

```css
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 18px;
--radius-xl: 22px;
--radius-round: 999px;
```

El diseño puede ser redondeado, pero no infantil.

Portal:
- usar radio moderado;
- cards y paneles más contenidos.

Field:
- permitir radios algo más amplios en controles táctiles.

---

## 11. Sombras y elevación

```css
--shadow-sm: 0 3px 10px rgba(21, 32, 25, 0.06);
--shadow-md: 0 4px 14px rgba(21, 32, 25, 0.08);
--shadow-lg: 0 10px 28px rgba(21, 32, 25, 0.12);
```

Preferir:
- bordes sutiles;
- elevación ligera;
- sombras suaves.

Evitar:
- sombras negras fuertes;
- profundidad excesiva;
- cards flotando sin necesidad.

---

## 12. Glass

Permitido principalmente en Portal.

Usar de forma sutil en:
- sidebar;
- overlays;
- paneles flotantes;
- headers especiales;
- command palettes si existieran.

Características:
- transparencia moderada;
- blur ligero;
- borde semitransparente;
- sombra mínima.

### Regla

> **Glass es un detalle, no la identidad.**

No usar glassmorphism exagerado.

---

## 13. Motion

```css
--motion-fast: 120ms;
--motion-base: 160ms;
--motion-slow: 220ms;
```

El motion debe sentirse:
- suave;
- preciso;
- premium;
- funcional.

Permitido:
- hover;
- pressed;
- focus;
- apertura de panel;
- expansión de sidebar;
- aparición de filtros;
- cambio de estado;
- feedback breve.

Evitar:
- rebotes;
- elasticidad exagerada;
- parallax;
- animaciones largas;
- movimiento puramente decorativo.

---

# PORTAL WEB

## 14. Rol del Portal

El Portal es la superficie administrativa y analítica de GesGROW.

Debe priorizar:
- gestión;
- planificación;
- configuración;
- reporting;
- análisis;
- tablas;
- formularios;
- permisos;
- contexto de empresa;
- múltiples módulos.

Viewport prioritario:
1. desktop;
2. laptop;
3. tablet;
4. mobile.

Densidad:
**media / alta, pero respirable.**

---

## 15. Portal — Layout general

Estructura recomendada:

```text
┌───────────────────────────────────────────────┐
│ Sidebar │ Header / context / actions          │
│         ├─────────────────────────────────────┤
│         │                                     │
│         │ Page content                        │
│         │                                     │
│         │                                     │
└───────────────────────────────────────────────┘
```

El contenido debe usar anchos y grids consistentes.

Evitar una gran card contenedora para toda la página.

Preferir:
- background general;
- paneles cuando exista agrupación semántica;
- secciones claras.

---

## 16. Portal — Sidebar

La navegación principal en desktop es un sidebar.

### Apariencia
- claro;
- moderno;
- premium;
- toque glass;
- bordes suaves;
- profundidad mínima.

### Comportamiento deseado

```text
sin hover / sin focus relevante
→ sidebar compacto
→ iconos visibles

hover / navegación por teclado / interacción
→ sidebar expandido
→ icono + label
```

La expansión debe:
- ser rápida;
- no sentirse invasiva;
- mantener contexto;
- no provocar saltos visuales importantes en contenido.

El item activo debe ser muy evidente.

### Importante
Hover no es una dependencia funcional.

En tablet/mobile:
- usar drawer o equivalente;
- proporcionar control explícito.

---

## 17. Portal — Header

Puede contener:
- breadcrumbs;
- título;
- campaña activa;
- empresa activa;
- acciones de página;
- theme switcher;
- perfil;
- notificaciones relevantes.

No sobrecargarlo.

La empresa/Tenant activo debe ser identificable.

---

## 18. Portal — Dashboard

El dashboard debe sentirse analítico y premium.

Puede utilizar:
- KPIs;
- gráficos;
- ranking;
- actividad reciente;
- progreso;
- tendencias;
- distribución.

Prioridad:
1. información accionable;
2. comparación;
3. tendencia;
4. detalle.

Evitar llenar la pantalla de MetricCards iguales.

Usar jerarquías distintas según importancia.

---

## 19. Portal — Cards

No convertir cada bloque en card.

Usarlas cuando exista:
- agrupación;
- separación de contexto;
- KPI;
- panel de información;
- visualización.

Características:
- borde ligero;
- superficie limpia;
- sombra mínima;
- spacing consistente.

Evitar:
- enormes cards vacías;
- cards anidadas;
- una card por cada label.

---

## 20. Portal — Botones

Alturas habituales:
- compact: 36–40px;
- default: 40–44px;
- prominent: 44–48px.

Acción primaria:
- verde brand;
- texto blanco;
- fuerte contraste.

Acciones secundarias:
- superficie neutra;
- border;
- ghost cuando corresponda.

Destructivo:
- rojo solo si la acción realmente es destructiva.

No usar botones gigantes de PDA en Portal.

---

## 21. Portal — Formularios

Los formularios deben sentirse:
- claros;
- compactos;
- ordenados;
- legibles.

Usar:
- labels visibles;
- helper text cuando ayude;
- validación contextual;
- grupos semánticos;
- 1–2 columnas en desktop cuando tenga sentido.

Evitar:
- formularios kilométricos sin agrupación;
- placeholders usados como único label;
- inputs demasiado altos;
- modales para formularios complejos si una página o panel es mejor.

---

## 22. Portal — Tablas

Las tablas son componentes centrales.

Características deseadas:
- headers claros;
- sticky header cuando la altura lo justifique;
- sorting visible;
- filtros externos;
- búsqueda;
- estados;
- paginación o virtualización si se necesita;
- números alineados a la derecha;
- nombres alineados a la izquierda;
- densidad equilibrada;
- row hover;
- selección clara.

Las filas pueden abrir:
- detalle;
- drawer;
- página secundaria.

Evitar:
- tablas excesivamente decoradas;
- bordes verticales innecesarios;
- scroll horizontal evitable.

---

## 23. Portal — Filtros

Los filtros frecuentes deben ser fáciles de acceder.

Patrón recomendado:

```text
[ búsqueda ] [ campaña ] [ periodo ] [ estado ] [ más filtros ]
```

Filtros activos deben ser visibles.

Filtros complejos pueden usar:
- popover;
- drawer;
- panel lateral.

---

## 24. Portal — Dark mode

Debe mantener:
- identidad verde;
- contraste;
- jerarquía;
- estados semánticos;
- legibilidad en tablas;
- legibilidad en gráficos.

No volver la interfaz completamente negra.

Las superficies deben poder diferenciarse sin usar sombras fuertes.

---

# APLICACIÓN DE CAMPO

## 25. Rol de Field App

La Aplicación de Campo está optimizada para operación real.

Dispositivo principal:
- PDA Android;
- PWA;
- vertical;
- lector de códigos tipo keyboard wedge;
- exteriores;
- conectividad irregular.

Prioridades:
1. velocidad;
2. claridad;
3. resistencia a errores;
4. uso táctil;
5. continuidad offline.

---

## 26. Field — Idea central

> **La Aplicación de Campo debe sentirse como una herramienta física digitalizada.**

Inspiración conceptual:
- control remoto moderno;
- terminal industrial refinada;
- instrumento de operación.

Características:
- botones grandes;
- acciones claras;
- pocas decisiones;
- respuesta inmediata;
- alto contraste.

---

## 27. Field — Navegación

No usar sidebar permanente.

Preferir:
- home de acciones;
- navegación contextual;
- bottom sheets;
- navegación secundaria simple.

Home:
- grid de dos columnas;
- tiles grandes;
- iconos claros;
- títulos cortos.

---

## 28. Field — Tamaños táctiles

```css
--touch-target-min: 48px;
--control-height: 56px;
--scan-input-height: 64px;
--icon-button-size: 48px;
```

No reducir controles para “hacer que todo entre”.

Primero:
- reducir copy;
- compactar espacios;
- reorganizar contenido.

---

## 29. Field — Scroll

Flujos operativos:
**objetivo = 0 scroll.**

Scroll permitido en:
- tablas;
- listas;
- históricos;
- consultas;
- reportes.

---

## 30. Field — ScanInput

Componente crítico.

Anatomía conceptual:

```text
[ estado/icono ][ Escanee DNI o ticket ][ teclado ]
```

Debe soportar:
- focus visible;
- estado listo;
- procesando;
- validado;
- error;
- disabled;
- teclado manual.

El input de escaneo debe dominar visualmente la pantalla operativa.

---

## 31. Field — Flujo secuencial

Patrón:

```text
PASO 1
Identificar persona
[ ScanInput ]

↓ validado

PASO 2
Escanear ticket
[ ScanInput ]
```

Reglas:
- el paso futuro no compite visualmente;
- completado muestra check;
- siguiente control recibe foco;
- el siguiente paso siempre es evidente.

---

## 32. Field — Feedback

Después de una acción:
- éxito breve;
- error directo;
- siguiente paso claro.

Ejemplo:

```text
✓ +1 jaba — Juan Pérez
```

Ejemplo error:

```text
Ticket ya utilizado
Escanee otro ticket.
```

Evitar lenguaje técnico.

---

## 33. Field — Offline

No mostrar “En línea” permanentemente.

Mostrar conectividad solo cuando importe.

Estados:

```text
Sin conexión
Los registros se guardarán en este PDA.
```

```text
3 registros pendientes
```

```text
1 registro necesita atención
[ Revisar ]
```

---

# VISUALIZACIÓN DE DATOS

## 34. Importancia

La analítica tiene prioridad alta en GesGROW.

El sistema debe estar preparado para:
- dashboards;
- reportes;
- comparaciones;
- productividad;
- rankings;
- rendimiento;
- histórico.

---

## 35. Gráficos

Preferir:
- barras;
- líneas;
- área moderada;
- barras apiladas cuando la composición importe;
- ranking horizontal;
- sparklines para contexto rápido.

Usar pie/donut solo cuando:
- existen pocas categorías;
- la proporción es realmente relevante.

Evitar:
- 3D;
- sombras decorativas;
- demasiados colores;
- gradients agresivos;
- charts difíciles de interpretar.

---

## 36. Paleta de charts

El verde de marca debe dominar.

El amarillo cosecha puede funcionar como:
- highlight;
- comparación;
- segunda serie importante.

Agregar colores secundarios únicamente cuando sea necesario para distinguir series.

Todos los colores deben:
- funcionar en light;
- funcionar en dark;
- mantener contraste;
- ser distinguibles sin depender exclusivamente del color.

---

## 37. Gráfico + tabla

Cuando el contenido sea importante para operación o accesibilidad:

```text
gráfico
+
tabla con los mismos datos
```

La visualización nunca debe ser la única forma de acceder a información crítica.

---

## 38. KPIs

Las métricas principales deben incluir:
- label;
- valor;
- unidad;
- contexto temporal;
- comparación si aplica.

Ejemplo:

```text
Producción hoy
1,284 jabas
+8.4% vs ayer
```

No usar flecha verde automáticamente para cualquier incremento. El significado depende de la métrica.

---

# ICONOGRAFÍA

## 39. Estilo

Usar una única familia coherente.

Características:
- lineal o semi-sólida;
- 1.75–2px;
- formas simples;
- esquinas ligeramente suaves;
- moderna.

Tamaños orientativos:
- Portal navigation: 18–22px;
- Portal actions: 18–20px;
- Field navigation: 20–24px;
- Field home: 28–36px.

---

## 40. Iconografía agrícola

Puede existir iconografía específica para:
- fundo;
- sector;
- parcela;
- cultivo;
- campaña;
- cosecha;
- jaba/caja;
- ticket;
- trabajador;
- maquinaria;
- inventario;
- riego;
- calidad.

Debe sentirse parte de la misma familia gráfica.

No utilizar emojis como iconos finales.

---

# COMPONENTES

## 41. Componentes base

La IA debe reutilizar conceptos compartidos:

- AppShell
- Sidebar
- AppHeader
- Breadcrumbs
- Button
- IconButton
- Input
- Select
- SearchInput
- FilterBar
- FilterChip
- Badge
- StatusBadge
- Card
- MetricCard
- DataTable
- EmptyState
- FeedbackMessage
- Alert
- Dialog
- Drawer
- BottomSheet
- Tabs
- Pagination
- Skeleton
- Tooltip
- Popover

Field específicos:
- HomeActionTile
- ScanInput
- KeyboardToggleButton
- StepCard
- SessionStatusCard
- StatusBanner
- IndustrialTable

Data:
- KPI
- ChartCard
- RankingList
- TrendIndicator
- PeriodSelector
- ChartLegend

---

## 42. Component variants

Un mismo componente puede variar por contexto.

Ejemplo:

```text
Button
├── portal
│   ├── compact
│   ├── default
│   └── prominent
└── field
    ├── default
    └── scan-flow
```

No duplicar componentes sin necesidad.

---

# ACCESIBILIDAD

## 43. Requisitos

Toda interfaz debe incluir:

- focus visible;
- labels correctos;
- contraste suficiente;
- navegación por teclado en Portal;
- targets táctiles adecuados;
- estados no dependientes solo del color;
- iconos con nombre accesible cuando corresponda;
- tablas semánticas;
- gráficos con alternativa textual/tabular;
- errores asociados al control correspondiente.

Focus sugerido:

```css
outline: 3px solid rgba(38, 115, 74, 0.22);
outline-offset: 2px;
```

---

# MICROCOPY

## 44. Voz

GesGROW habla de forma:

- profesional;
- directa;
- cercana;
- breve;
- útil.

Correcto:

```text
Escanee el DNI del cosechador
```

```text
No hay registros para este periodo.
```

```text
Ticket ya utilizado
Escanee otro ticket.
```

Evitar:

```text
Operación inválida.
```

```text
Error 400.
```

```text
Se produjo una excepción inesperada.
```

---

# RESPONSIVE

## 45. Portal

Prioridad:
- desktop;
- laptop;
- tablet;
- mobile.

La interfaz debe adaptarse, no simplemente encogerse.

Sidebar:
- desktop → compacto/expandible;
- tablet/mobile → drawer.

Tablas:
- ocultar columnas secundarias;
- permitir detalle bajo demanda;
- evitar scroll horizontal cuando sea posible.

---

## 46. Field

Target principal:

```text
360px – 480px
```

PDA vertical.

Secundarios:
- móvil grande;
- tablet.

No diseñar Field como una versión pequeña del Portal.

---

# REGLAS PARA IA

## 47. Al generar una pantalla GesGROW

La IA debe:

1. identificar si pertenece a Portal o Field;
2. aplicar la densidad correcta;
3. reutilizar la paleta oficial;
4. usar Inter;
5. conservar identidad agrícola;
6. aplicar jerarquía clara;
7. reutilizar componentes definidos;
8. diseñar estados vacíos;
9. diseñar loading;
10. diseñar error;
11. considerar permisos;
12. considerar responsive;
13. considerar accesibilidad;
14. evitar ruido visual;
15. utilizar motion solo cuando ayude.

---

## 48. Al generar Portal

Debe:
- utilizar sidebar;
- usar densidad equilibrada;
- permitir light/dark;
- incluir tablas ricas;
- usar filtros compactos;
- dar alta prioridad a visualización de datos;
- mantener Tenant/campaña/contexto visible cuando sea relevante;
- usar microinteracciones premium;
- mantener superficies refinadas;
- aplicar glass solo con sutileza.

---

## 49. Al generar Field

Debe:
- usar viewport PDA vertical;
- priorizar controles grandes;
- evitar scroll operativo;
- destacar ScanInput;
- contemplar lector físico;
- contemplar teclado manual;
- contemplar offline;
- evitar sidebar;
- mantener máximo contraste;
- mostrar siguiente paso claramente;
- evitar dashboards densos.

---

# DO / DON'T

## 50. Do

- identidad verde agrícola;
- amarillo como acento;
- UI premium;
- iconografía coherente;
- motion breve;
- sidebar refinado;
- tablas de alta calidad;
- filtros claros;
- charts legibles;
- agricultura visible;
- estados completos;
- composición limpia;
- superficies con profundidad sutil;
- responsive real;
- accesibilidad.

---

## 51. Don't

- plantilla SaaS genérica;
- UI plana y sin personalidad;
- exceso de cards;
- glassmorphism exagerado;
- gradients decorativos;
- sidebar negro por defecto;
- saturación de verde;
- hojas decorativas por todos lados;
- emojis;
- iconos mezclados;
- charts 3D;
- botones enormes en Portal;
- controles pequeños en Field;
- dark mode en Field;
- scroll innecesario en operaciones;
- dashboards densos en PDA;
- texto técnico al usuario;
- animaciones largas;
- múltiples acciones primarias competidoras.

---

# PANTALLAS DE REFERENCIA

## 52. Portal — Login

Debe transmitir marca y calidad desde el primer acceso.

Incluir:
- marca GesGROW;
- formulario claro;
- email;
- contraseña;
- acceso;
- posible elemento gráfico agrícola sutil;
- espacio equilibrado.

No convertirlo en landing page.

---

## 53. Portal — Dashboard

Debe incluir cuando corresponda:
- campaña seleccionada;
- producción total;
- producción hoy;
- cosechadores;
- lotes;
- sesiones;
- última actividad;
- producción diaria;
- ranking.

Debe sentirse analítico, no como colección de cards.

---

## 54. Portal — Campaign

Debe manejar:
- lista;
- filtros;
- estado;
- detalle;
- acciones;
- lotes operativos;
- parcelas asociadas;
- personal/participación.

Usar jerarquía entre información general y operación.

---

## 55. Portal — Workforce

Debe priorizar:
- búsqueda;
- estado;
- DNI;
- rol/participación;
- detalle;
- actividad.

---

## 56. Portal — Harvest

Debe soportar:
- lotes de tickets;
- tickets;
- asignaciones;
- registros;
- estados;
- consumo;
- generación.

La UI debe reflejar que un lote de tickets y un ticket individual no son lo mismo.

---

## 57. Portal — Reports

Debe dar gran importancia a:
- filtros;
- periodo;
- campaña;
- ranking;
- producción diaria;
- lotes;
- CSV;
- gráfico + tabla.

---

## 58. Portal — Farm Structure

Representar claramente:

```text
Fundo
→ Sector
→ Parcela
```

Usar breadcrumbs, jerarquía, tree/list o paneles relacionados cuando ayude.

No confundir Parcela física con Lote operativo de campaña.

---

## 59. Field — Home

Grid de dos columnas.

Acciones:
- Asignación de tickets;
- Registro de jaberos;
- Lectura de jabas;
- Consultas.

Tiles:
- grandes;
- simples;
- icono destacado;
- título breve.

---

## 60. Field — Asignación

Flujo:
1. escanear cosechador;
2. validar;
3. escanear ticket;
4. mostrar lote asignado;
5. confirmar éxito;
6. preparar siguiente operación.

---

## 61. Field — Jaberos

Flujo:
1. escanear DNI;
2. validar persona;
3. registrar jornada;
4. mostrar feedback;
5. reset.

---

## 62. Field — Lectura

Debe mostrar:
- sesión;
- jabero;
- contexto operativo;
- ScanInput;
- última lectura;
- total;
- cosechador actual;
- finalizar.

La lectura repetitiva debe ser extremadamente rápida.

---

# LOGO

## 63. Uso de marca

El logo definitivo de GesGROW será definido por separado.

Mientras no exista:
- reservar espacio consistente;
- usar wordmark `GesGROW`;
- no inventar un logo final;
- no reutilizar SCC como marca principal.

Cuando el logo exista, el Design System debe integrarlo sin cambiar la estructura de interacción.

---

# CALIDAD

## 64. Criterio de aprobación

Una pantalla generada por IA solo es válida si:

- se reconoce como GesGROW;
- se siente premium;
- se siente agrícola;
- tiene jerarquía clara;
- no parece template genérico;
- usa la densidad correcta;
- utiliza componentes coherentes;
- cubre estados reales;
- es accesible;
- se adapta a su dispositivo;
- respeta el contexto Portal o Field.

---

## 65. Preguntas finales de control

Antes de aceptar un diseño, verificar:

### Global
- ¿Se siente como una plataforma agrícola profesional?
- ¿Se siente moderna y costosa/bien construida?
- ¿Tiene personalidad propia?
- ¿La agricultura es visible sin ser decorativa?
- ¿La acción y la información importante se entienden rápido?

### Portal
- ¿La densidad es equilibrada?
- ¿El sidebar se integra sin dominar?
- ¿Las tablas son agradables de leer?
- ¿Los dashboards priorizan significado?
- ¿Light y dark pueden mantener la misma calidad?

### Field
- ¿Se puede operar bajo sol?
- ¿Los controles son suficientemente grandes?
- ¿El scanner domina el flujo?
- ¿Puede usarse sin Internet?
- ¿La operación habitual cabe sin scroll?
- ¿El siguiente paso siempre es evidente?

---

## 66. Principio final

> **GesGROW combina operaciones agrícolas reales con una experiencia digital premium.**

No sacrificar funcionalidad por estética.

No sacrificar calidad visual por funcionalidad.

Cada interfaz debe sentirse diseñada para el entorno agrícola, construida con rigor tecnológico y suficientemente refinada para representar un producto de alto valor.
