# GesGROW — Data Visualization

> Especificación de visualización de datos para GesGROW.
>
> Este documento define cómo representar métricas, tendencias, comparaciones, rankings y distribuciones dentro del Portal Web de Gestión y, de forma más limitada, en la Aplicación de Campo. La versión actual incorpora la **paleta analítica V2** para comparaciones multiserie.
>
> Complementa `README.md`, `DESIGN.md`, `portal.md`, `field-app.md`, `foundations.md` y `components.md`.

---

# 1. Objetivo

La visualización de datos en GesGROW debe permitir que una persona comprenda rápidamente:

- qué está ocurriendo;
- cómo está evolucionando la operación;
- qué cambió;
- dónde existe una desviación;
- quién o qué está rindiendo mejor;
- qué necesita atención.

La prioridad es:

> **interpretación rápida antes que decoración.**

GesGROW maneja información agrícola, operativa y administrativa. Por ello, los gráficos deben construirse como herramientas de lectura y decisión, no como elementos visuales ornamentales.

---

# 2. Rol de Data Viz dentro de GesGROW

La analítica tiene una importancia alta en el Portal.

Debe soportar:

- producción;
- cosecha;
- rendimiento;
- campañas;
- lotes;
- trabajadores;
- sesiones;
- estructura agrícola;
- inventario futuro;
- maquinaria futura;
- riego futuro;
- calidad futura;
- costos futuros;
- trazabilidad;
- comparaciones históricas.

Field puede mostrar métricas y visualizaciones simples, pero nunca debe convertirse en un dashboard denso.

---

# 3. Principios

## 3.1. El gráfico debe responder una pregunta

Antes de crear una visualización, definir la pregunta.

Ejemplos:

```text
¿Cuánto se produjo hoy?
¿Cómo evolucionó la producción durante la campaña?
¿Quiénes son los cosechadores con mayor producción?
¿Qué lote produjo más?
¿Dónde cayó el rendimiento?
¿Qué porcentaje de tickets ya fue consumido?
```

Si la pregunta puede responderse mejor con un número o una tabla, no crear un gráfico.

---

## 3.2. Una visualización, una idea principal

No mezclar múltiples objetivos en un solo chart.

Incorrecto:

```text
producción + trabajadores + lotes + rendimiento + tendencia
```

en una sola visualización.

Preferir varios bloques simples.

---

## 3.3. Comparación antes que decoración

Un dato aislado tiene menos valor que un dato contextualizado.

Ejemplo:

```text
1,284 jabas
```

es útil.

Pero:

```text
1,284 jabas
+8.4% vs ayer
```

es más interpretable.

Siempre que exista una comparación válida, mostrarla.

---

## 3.4. El significado domina al color

No asumir:

```text
verde = subió = bueno
rojo = bajó = malo
```

Ejemplo:

- más producción puede ser positivo;
- más errores puede ser negativo;
- más tiempo promedio puede ser negativo;
- menor desperdicio puede ser positivo.

La semántica depende de la métrica.

---

## 3.5. Accesibilidad obligatoria

Toda visualización crítica debe poder comprenderse sin depender exclusivamente del color.

Debe considerar:

- labels;
- tooltips;
- contraste;
- patrones o símbolos cuando sea necesario;
- tabla alternativa para datos críticos;
- orden lógico;
- nombres de series;
- texto auxiliar.

---

# 4. Jerarquía analítica

GesGROW debe organizar la información en niveles.

## Nivel 1 — KPI

Responde:

```text
¿Qué está pasando?
```

Ejemplo:

```text
Producción hoy
1,284 jabas
```

---

## Nivel 2 — Tendencia

Responde:

```text
¿Cómo está evolucionando?
```

Ejemplo:

```text
Producción diaria
```

---

## Nivel 3 — Comparación

Responde:

```text
¿Quién o qué rinde mejor?
```

Ejemplo:

```text
Ranking de cosechadores
```

---

## Nivel 4 — Diagnóstico

Responde:

```text
¿Por qué ocurrió?
```

Ejemplo:

```text
Producción por lote
```

---

## Nivel 5 — Detalle

Responde:

```text
¿Qué registros forman este resultado?
```

Ejemplo:

```text
Tabla de registros de cosecha
```

---

# 5. Estructura recomendada de dashboard

Patrón:

```text
Contexto
↓
KPIs principales
↓
Tendencia
↓
Comparación / ranking
↓
Distribución
↓
Detalle / actividad
```

No todos los dashboards deben incluir todas las capas.

---

# 6. KPIs

## 6.1. Anatomía

```text
Label
Valor
Unidad
Comparación
Periodo/contexto
```

Ejemplo:

```text
Producción hoy
1,284
jabas
+8.4% vs ayer
```

---

## 6.2. Qué debe mostrar

Solo información relevante.

Ejemplos válidos:

- producción total;
- producción hoy;
- cosechadores activos;
- lotes operativos;
- sesiones;
- días de campaña;
- promedio por cosechador;
- tickets disponibles;
- porcentaje consumido.

---

## 6.3. Formato numérico

Usar:

```css
font-variant-numeric: tabular-nums;
```

Formatear valores:

```text
1,284
24.8 ha
86 %
S/ 12,500
2 h 34 min
```

No mostrar decimales innecesarios.

---

# 7. KPI Grid

Portal:

- 3–5 KPIs principales;
- no más de 6 salvo necesidad real;
- tamaño distinto según importancia;
- evitar 8 tarjetas iguales.

Ejemplo:

```text
┌─────────────┬─────────────┬─────────────┐
│ Producción  │ Hoy         │ Cosechadores│
│ 24,830      │ 1,284       │ 42          │
└─────────────┴─────────────┴─────────────┘
```

Un KPI puede ocupar más espacio si es claramente prioritario.

---

# 8. Trend Indicator

Estados:

```text
positive
negative
neutral
unknown
```

Debe incluir:

- icono;
- valor;
- contexto.

Ejemplos:

```text
↑ 8.4% vs ayer
↓ 3.1% vs semana anterior
— sin cambio
```

No usar color como único indicador.

---

# 9. Color en visualización — Palette V2

La visualización ya no debe depender únicamente de verde + amarillo.

La identidad sigue siendo verde, pero las comparaciones requieren un vocabulario cromático más amplio.

## 9.1. Series principales

```css
--chart-1: #3A9C66; /* Grow Green */
--chart-2: #2FAFB0; /* Water Aqua */
--chart-3: #C69A2D; /* Harvest Gold */
--chart-4: #C96F45; /* Soil Terracotta */
--chart-5: #7767C7; /* Berry Violet */
--chart-6: #4F7CAC; /* Sky Blue */
```

Secuencia recomendada:

```text
1 serie
→ green

2 series
→ green + aqua

3 series
→ green + aqua + gold

4 series
→ + terracotta

5 series
→ + violet

6 series
→ + blue
```

Evitar usar más de 6 series simultáneas salvo necesidad analítica real.

## 9.2. Comparación de cosechadores

Dentro de una comparación, la asignación de color debe permanecer estable aunque cambie el orden del ranking.

Ejemplo:

```text
Keyla Rojas      ● green
Juan Pérez       ● aqua
María Torres     ● gold
Luis Quispe      ● terracotta
Ana Flores       ● violet
```

No cambiar colores al ordenar, filtrar o hacer hover.

## 9.3. Serie única

Para una única serie:

```text
usar green
```

El amarillo no debe parecer la serie principal solo porque exista un único dato.

## 9.4. Producción reciente

`Harvest Gold` puede destacar el dato más reciente cuando exista una comparación temporal real.

Con un único punto/barra, mantener green.

# 10. Paleta semántica de charts

```css
--chart-success: #2F8A57;
--chart-warning: #A67C22;
--chart-error: #C4473A;
--chart-info: #4F7CAC;
```

Los colores semánticos representan significado, no categorías arbitrarias.

No usar rojo como una serie normal si puede interpretarse como error.

# 11. Dark Mode Charts

```css
--chart-1-dark: #69BB88;
--chart-2-dark: #52C0C0;
--chart-3-dark: #DDB557;
--chart-4-dark: #D98965;
--chart-5-dark: #9184D4;
--chart-6-dark: #6E93BC;

--chart-grid-dark: rgba(223, 231, 226, 0.10);
--chart-axis-dark: #AAB7AF;
--chart-label-dark: #F2F6F3;
```

En dark mode:
- evitar tonos excesivamente saturados;
- mantener contraste;
- no usar el fondo negro puro;
- preservar la identidad cromática entre light/dark.
# 12. Gridlines

Usar gridlines solo si ayudan a leer valores.

Preferir:

- horizontales;
- pocas;
- suaves;
- sin bordes pesados.

Evitar cuadrícula completa tipo hoja de cálculo.

---

# 13. Ejes

Deben:

- tener labels legibles;
- evitar demasiados ticks;
- usar abreviaciones cuando corresponda;
- mantener unidades claras.

Ejemplo:

```text
0
500
1k
1.5k
```

si el contexto lo permite.

No usar abreviación si puede inducir error.

---

# 14. Labels

Las labels deben priorizar interpretación.

Correcto:

```text
Lote 07
1,284
```

Evitar:

```text
dataset_07
1284.0000
```

---

# 15. Tooltips

Deben incluir contexto útil.

Ejemplo:

```text
14 oct 2026

Producción
1,284 jabas

Cosechadores
42
```

No repetir datos innecesarios.

---

# 16. Leyendas

Usar cuando:

- existen varias series;
- el significado no es evidente.

No usar legend si existe una sola serie clara.

La leyenda debe:

- mostrar color;
- label;
- valor opcional;
- respetar el orden de las series.

---

# 17. Línea

Usar para:

- evolución temporal;
- tendencias;
- rendimiento;
- acumulados.

Ejemplos:

- producción diaria;
- producción acumulada;
- rendimiento por día;
- incidencias por fecha.

No usar línea para categorías sin orden.

---

# 18. Área

Usar con moderación para:

- acumulados;
- volumen temporal;
- una sola serie principal.

No apilar múltiples áreas si reduce legibilidad.

---

# 19. Barras verticales

Usar para:

- comparación por periodo;
- producción diaria;
- categorías discretas;
- pocos elementos.

Ejemplo:

```text
Lun Mar Mié Jue Vie Sáb Dom
```

---

# 20. Barras horizontales

Preferidas para:

- ranking;
- nombres largos;
- trabajadores;
- lotes;
- parcelas;
- categorías con labels extensas.

Ejemplo:

```text
Juan Pérez        ███████████ 92
Ana Torres        ██████████  88
Luis Quispe       █████████   84
```

---

# 21. Barras apiladas

Usar cuando:

- importa total + composición;
- pocas categorías;
- colores distinguibles.

Ejemplo:

```text
tickets disponibles / asignados / consumidos
```

No usar más de 4–5 segmentos por barra.

---

# 22. 100% Stacked Bar

Usar para:

- proporción;
- distribución relativa;
- estados de un conjunto.

Ejemplo:

```text
Disponible 35%
Asignado 40%
Consumido 25%
```

---

# 23. Pie / Donut

Uso restringido.

Permitido cuando:

- 2–5 categorías;
- la relación parte/todo es importante;
- no se necesita comparar valores muy similares.

Ejemplo válido:

```text
Distribución de estados de tickets
```

Evitar:

- más de 5 categorías;
- categorías con valores cercanos;
- datos temporales.

---

# 24. Scatter Plot

Solo si existe necesidad analítica real.

Ejemplos futuros:

- rendimiento vs tiempo;
- productividad vs antigüedad;
- consumo de agua vs producción.

No introducirlo por estética.

---

# 25. Heatmap

Puede ser útil en:

- producción por día/hora;
- actividad por jornada;
- rendimiento por sector;
- incidencias por fecha.

Debe tener:

- leyenda;
- contraste;
- valores o tooltip;
- accesibilidad.

---

# 26. Sparkline

Uso:

- tendencia compacta dentro de KPI;
- filas;
- resumen.

Debe ser secundaria.

No reemplazar gráfico principal.

---

# 27. Ranking

## 27.1. Orden

Mostrar:

- posición;
- persona/entidad;
- valor;
- unidad;
- variación opcional.

## 27.2. Top 3

Puede existir énfasis sutil mediante:

- peso;
- posición;
- superficie brand-soft;
- numeración.

No usar medallas, coronas o gamificación infantil.

## 27.3. Ranking completo

En listas largas usar:

- tabla;
- búsqueda;
- orden;
- filtros;
- barra horizontal opcional.

## 27.4. Selección para comparar

Para comparación personalizada, asignar colores en orden de selección:

```text
1 → green
2 → aqua
3 → gold
4 → terracotta
5 → violet
```

El color permanece asociado al trabajador durante toda la comparación.

No utilizar rojo como quinta serie.

## 27.5. Comparison Tray

La selección puede mostrarse como:

```text
Comparar

● Keyla Rojas ×
● Juan Pérez ×
● María Torres ×
```

Máximo recomendado:

```text
2–5 cosechadores
```
# 28. Ranking de personal

Debe priorizar:

- nombre;
- producción;
- posición;
- periodo.

Ejemplo:

```text
#1 Juan Pérez
92 jabas

#2 Ana Torres
88 jabas
```

No mostrar información personal innecesaria.

---

# 29. Producción diaria

Visualización recomendada:

```text
Bar chart
```

Eje X:

```text
fecha
```

Eje Y:

```text
jabas
```

Complementar con tabla:

| Fecha | Jabas | Cosechadores | Sesiones |
|---|---:|---:|---:|

---

# 30. Producción acumulada

Visualización recomendada:

```text
Line chart
```

Puede compararse con:

- campaña anterior;
- objetivo;
- periodo anterior.

Solo si la comparación es válida.

---

# 31. Producción por lote operativo

Preferir:

```text
Horizontal bar chart
```

porque los nombres pueden ser largos.

Mostrar:

- lote;
- producción;
- porcentaje;
- estado.

---

# 32. Producción por parcela

Cuando Farm Structure tenga datos válidos de atribución:

```text
Horizontal bar
Treemap limitado
Table
```

No atribuir retrospectivamente producción a parcelas si el dominio no lo garantiza.

---

# 33. Harvest — tickets

Métricas posibles:

```text
Total
Disponibles
Asignados
Consumidos
```

Visualización útil:

```text
stacked bar
```

Paleta semántica recomendada:

```text
Disponible  → aqua
Asignado    → gold
Consumido   → green
Rechazado   → red
```

Esta es una excepción válida porque los colores representan estados del dominio y no categorías arbitrarias.

No usar el rojo para estados no críticos.
# 34. Harvest — consumo

Puede usar:

- progress bar;
- stacked bar;
- KPI;
- tabla.

No usar gauge semicircular salvo necesidad muy clara.

---

# 35. Sesiones

Métricas:

- sesiones abiertas;
- sesiones cerradas;
- duración;
- total procesado.

Visualizaciones:

- timeline;
- bar;
- tabla.

---

# 36. Workforce

Visualizaciones posibles:

- personal activo;
- participación;
- producción por trabajador;
- distribución por rol operativo.

No usar gráficos de personas cuando una tabla sea más clara.

---

# 37. Campaign

Métricas:

- días transcurridos;
- producción;
- lotes activos;
- cosechadores;
- sesiones;
- progreso.

Evitar inventar “progreso de campaña” si no existe objetivo o hito de dominio.

---

# 38. Farm Structure

Data viz debe representar jerarquía cuando aporte valor.

Ejemplos futuros:

- producción por fundo;
- producción por sector;
- rendimiento por parcela.

No usar mapas geográficos si no existen datos GIS reales.

---

# 39. Comparación temporal

Comparaciones válidas:

```text
Hoy vs ayer
Semana actual vs semana anterior
Mes actual vs mes anterior
Campaña actual vs campaña anterior
```

Solo si:

- periodos son comparables;
- contexto es equivalente;
- filtros coinciden.

---

# 40. Comparación entre campañas

Debe indicar claramente:

- campaña A;
- campaña B;
- periodo comparable;
- unidades;
- contexto.

No mezclar campañas de cultivos distintos sin señalización.

---

# 41. Baselines y objetivos

Si existe un objetivo real:

```text
Meta: 1,500 jabas
Actual: 1,284
```

puede representarse con:

- reference line;
- progress bar;
- KPI.

No inventar targets.

---

# 42. Reference Lines

Usar para:

- meta;
- promedio;
- umbral;
- objetivo;
- límite.

Debe tener label.

Ejemplo:

```text
Meta diaria — 1,500
```

---

# 43. Anotaciones

Usar para eventos importantes:

- inicio de campaña;
- cambio operativo;
- cierre;
- incidencia;
- cambio de turno.

No saturar el chart con anotaciones.

---

# 44. Period Selector

Opciones estándar:

```text
HOY
SEMANA
MES
CAMPAÑA
```

Puede añadirse:

```text
PERSONALIZADO
```

si existe selector de rango.

Debe conservarse entre gráfico y tabla.

---

# 45. Filtros globales

En reportes:

```text
Campaña
Periodo
Lote
Trabajador
Estado
```

No todos deben estar visibles siempre.

Priorizar filtros frecuentes.

---

# 46. Filtros activos

Mostrar claramente:

```text
Campaña: Palta 2026
Periodo: Semana
Lote: L07
```

Las visualizaciones deben reflejar exactamente esos filtros.

---

# 47. Exportación

El CSV debe representar:

> **exactamente las filas filtradas que el usuario está viendo como dataset autorizado.**

La exportación no debe ignorar filtros.

La UI debe indicar:

```text
Exportar CSV
```

como acción secundaria.

---

# 48. Gráfico y tabla

Para reportes principales:

```text
Chart
+
Accessible Table
```

Ambos deben usar la misma fuente de datos.

No recalcular resultados por separado en frontend.

---

# 49. Consistencia de datos

Portal no debe combinar legacy + Harvest por su cuenta.

Las visualizaciones deben consumir:

```text
read models / proyecciones backend
```

ya consolidadas.

La lógica de combinación debe mantenerse fuera de React.

---

# 50. Estados vacíos

Un gráfico vacío debe explicar por qué.

Ejemplo:

```text
No hay producción para este periodo.
```

Puede agregar:

```text
Pruebe seleccionando otro rango de fechas.
```

No mostrar ejes vacíos sin contexto.

---

# 51. Loading

Preferir skeleton o placeholder de chart.

No renderizar gráfico “vacío” mientras carga.

---

# 52. Error

Debe mostrar:

```text
No se pudo cargar la producción diaria.

[ Reintentar ]
```

No dejar un canvas roto.

---

# 53. Partial Data

Si los datos son parciales:

- indicarlo;
- explicar rango;
- no ocultarlo.

Ejemplo:

```text
Datos disponibles desde el 1 oct 2026.
```

---

# 54. Legacy Data

Cuando exista fuente legacy:

- no usar estilo visual distinto si la métrica es unificada;
- sí mostrar contexto si el usuario necesita saber que existe transición.

No duplicar series:

```text
Legacy
Harvest
```

si la pregunta del usuario es “producción total” y backend ya entrega total unificado.

---

# 55. Read-only historical data

El histórico puede usar los mismos charts.

Debe señalarse si:

- no es editable;
- pertenece a campaña cerrada;
- proviene de sistema legacy.

---

# 56. Data Freshness

Cuando sea relevante, mostrar:

```text
Actualizado hace 2 min
```

o:

```text
Última actividad 08:42
```

No mostrar timestamps técnicos.

---

# 57. Tiempo real

No asumir realtime.

Si el producto no refresca automáticamente:

- no sugerirlo visualmente;
- ofrecer refresh cuando sea útil;
- indicar última actualización.

---

# 58. Locale

Usar formatos compatibles con contexto local.

Ejemplos:

```text
14 oct 2026
1,284 jabas
24.8 ha
S/ 12,500
```

Evitar formatos ambiguos como:

```text
10/11/12
```

---

# 59. Escalas

Preferir escalas lineales.

Usar log solo si existe necesidad analítica avanzada y se explica.

No truncar eje de barras de forma engañosa.

---

# 60. Barras — origen

Para magnitudes, el eje de barras debe comenzar en cero salvo caso excepcional claramente justificado.

---

# 61. Líneas — escala

Puede no comenzar en cero si mejora lectura, pero:

- debe ser evidente;
- no debe exagerar variaciones;
- debe existir contexto.

---

# 62. Orden de categorías

Ordenar por:

- valor;
- secuencia natural;
- negocio;
- tiempo.

No alfabetizar automáticamente si otro orden comunica mejor.

---

# 63. Número de series

Ideal:

```text
1–3
```

Máximo recomendable:

```text
5
```

Si hay más:

- filtro;
- small multiples;
- tabla;
- selección.

---

# 64. Small Multiples

Usar para comparar varias series de forma limpia.

Ejemplo:

```text
Producción por lote
```

con mini charts separados.

Solo si realmente mejora comparación.

---

# 65. Highlight

Una serie seleccionada puede usar:

- color brand;
- opacidad alta;
- stroke mayor.

El resto:

- neutral;
- menor saturación.

---

# 66. Hover

Portal puede mostrar:

- tooltip;
- highlight;
- crosshair;
- selección.

Pero la información esencial debe seguir disponible por teclado/focus.

---

# 67. Focus en charts

Los puntos o barras interactivos deben:

- poder enfocarse cuando sea relevante;
- mostrar tooltip equivalente;
- tener label accesible.

---

# 68. Touch

En tablet/mobile:

- aumentar área de interacción;
- evitar tooltips demasiado pequeños;
- permitir tap;
- no depender de precisión de mouse.

---

# 69. Field Data Viz

Field solo debe usar visualizaciones muy simples.

Permitido:

- KPI;
- progress;
- ranking corto;
- barras simples;
- mini tendencia;
- totals.

Evitar:

- dashboards complejos;
- múltiples series;
- heatmaps;
- charts densos;
- interacciones avanzadas.

---

# 70. Field — métricas prioritarias

Ejemplos:

```text
Total sesión
28 jabas
```

```text
Juan Pérez
7 jabas
```

```text
3 pendientes
```

No llenar la pantalla con analytics.

---

# 71. Field — ranking

Si existe:

- top 3 o top 5;
- texto grande;
- pocas columnas;
- sin gráficos complejos.

---

# 72. Chart Card

Anatomía:

```text
Title
Subtitle / context
Controls
Chart
Legend
Footer / insight optional
```

El chart debe ocupar la mayor parte de la card.

Evitar header excesivamente alto.

---

# 73. Chart Card Actions

Acciones válidas:

- cambiar periodo;
- exportar;
- ver detalle;
- expandir;
- filtrar.

No incluir acciones irrelevantes.

---

# 74. Chart Title

Debe describir la métrica.

Correcto:

```text
Producción diaria
```

Evitar:

```text
Gráfico de producción diaria
```

---

# 75. Subtitle

Puede aclarar:

```text
Palta Hass 2026 · Semana actual
```

No repetir filtros visibles innecesariamente.

---

# 76. Insight Text

Puede incluir una observación breve:

```text
El martes registró la mayor producción de la semana.
```

Solo si deriva directamente de los datos.

No inventar conclusiones.

---

# 77. Drill-down

Permitido:

```text
Dashboard
→ gráfico
→ detalle
→ tabla
→ entidad
```

Ejemplo:

```text
Producción por lote
→ Lote 07
→ tickets / cosechadores / registros
```

Debe preservar filtros y contexto.

---

# 78. Cross-filtering

Puede implementarse en el futuro.

Ejemplo:

```text
clic en Lote 07
→ filtra ranking
→ filtra tabla
```

Debe ser evidente y reversible.

No introducir comportamiento invisible.

---

# 79. Comparison Cards

Útiles cuando un gráfico completo sería excesivo.

Ejemplo:

```text
Hoy
1,284

Ayer
1,184

+8.4%
```

---

# 80. Progress

Usar cuando existe:

- total conocido;
- meta;
- capacidad;
- conjunto completo.

Ejemplo:

```text
Tickets consumidos
34 / 40
85%
```

No usar progress si no existe denominador real.

---

# 81. Gauge

Evitar en general.

Solo usar si:

- existe rango natural;
- la posición dentro del rango es importante.

Preferir progress bar o KPI.

---

# 82. Treemap

Uso limitado.

Puede ser útil para:

- participación relativa por fundo/sector;
- composición con muchas categorías.

No usar si las diferencias son pequeñas o labels importantes.

---

# 83. Waterfall

Uso futuro posible para:

- costos;
- variación financiera;
- balance.

No usar para cosecha si no aporta.

---

# 84. Box Plot

Uso futuro posible para analítica avanzada:

- distribución de rendimiento;
- tiempos;
- calidad.

No usar en pantallas generales.

---

# 85. Histogram

Puede usarse para:

- distribución de productividad;
- peso;
- tiempos;
- calidad.

Solo cuando el usuario comprenda la métrica.

---

# 86. Data Table como Data Viz

Una tabla bien diseñada también es una visualización.

Debe usarse cuando:

- precisión importa;
- existen muchas dimensiones;
- se necesita ordenar;
- se necesita buscar;
- se necesita exportar.

No sustituir tablas por gráficos cuando el usuario necesita valores exactos.

---

# 87. Conditional Formatting

Permitido con moderación.

Ejemplo:

```text
Rendimiento bajo
```

Puede usar:

- icono;
- background soft;
- label.

No colorear toda la tabla intensamente.

---

# 88. In-cell Bars

Útiles en tablas para:

- rendimiento;
- progreso;
- comparación.

Ejemplo:

```text
Juan Pérez   █████████░ 92
```

Deben seguir mostrando el número.

---

# 89. Mini Trend in Table

Puede usarse para:

- tendencias compactas;
- comparación rápida.

Debe ser secundaria.

---

# 90. Sorting de métricas

Por defecto:

- ranking → mayor a menor;
- tiempo → cronológico;
- categorías → valor o negocio;
- estados → orden semántico.

---

# 91. Missing Values

No convertir `null` en `0`.

Mostrar:

```text
—
Sin datos
No disponible
```

según contexto.

Cero es un valor real.

---

# 92. Estimated Values

Si existieran valores estimados:

- marcarlos;
- diferenciarlos;
- explicar origen.

No mezclarlos silenciosamente con valores confirmados.

---

# 93. Pending Values

En Field/offline puede existir dato pendiente.

No incluirlo en KPI confirmado salvo que el producto defina explícitamente:

```text
confirmado + pendiente
```

Si se muestra:

```text
28 confirmadas
3 pendientes
```

---

# 94. Rejected Data

Registros rechazados no deben sumarse a producción válida.

Pueden aparecer en diagnóstico de sincronización, no en métricas productivas.

---

# 95. Audit Data

Los eventos de auditoría deben mostrarse con:

- timeline;
- table;
- actor;
- timestamp;
- evento;
- antes/después.

No necesitan charts salvo análisis futuro.

---

# 96. Subscription Analytics

Futuro posible:

- uso de módulos;
- adopción;
- consumo.

No confundir con facturación si no existe todavía.

---

# 97. Colors by Module

No asignar:

```text
Harvest = verde
Workforce = azul
Campaign = naranja
Farm = morado
```

como identidad fija.

GesGROW mantiene una identidad unificada.

Los módulos pueden diferenciarse con:

- iconos;
- labels;
- contexto.

---

# 98. Multi-tenant Context

Toda visualización debe respetar el TenantContext.

Nunca mezclar datos de empresas.

Al cambiar empresa:

- limpiar charts;
- mostrar loading;
- descartar respuestas tardías;
- cargar nuevo contexto.

---

# 99. Campaign Context

Si un chart depende de campaña:

- mostrar campaña;
- evitar mezcla accidental;
- permitir histórico cuando corresponda.

---

# 100. Ownership y permisos

Si el usuario no tiene acceso:

- no mostrar datos;
- no renderizar chart con placeholders engañosos;
- mostrar permiso insuficiente cuando corresponda.

---

# 101. CSV y gráfico

CSV y visualización deben compartir:

- mismo read model;
- mismos filtros;
- mismo contexto;
- misma autorización.

---

# 102. Performance

Para datasets grandes:

- agregación en backend;
- pagination para tabla;
- limitar puntos;
- downsampling si es necesario;
- no cargar miles de registros crudos solo para graficar.

---

# 103. Downsampling

Para series temporales grandes:

- preservar tendencia;
- preservar extremos;
- no alterar significado.

Debe documentarse si se usa.

---

# 104. Animation

Charts pueden animar:

- entrada;
- actualización;
- highlight.

Duración:

```text
120–220ms
```

No hacer animaciones largas.

Respetar reduced motion.

---

# 105. Transiciones de filtro

Cuando cambia filtro:

- mantener estructura;
- actualizar datos;
- usar transición breve;
- evitar desmontaje visual agresivo.

---

# 106. Placeholder de chart

Durante carga:

```text
skeleton del chart
```

No mostrar valores viejos sin indicar que están cambiando.

---

# 107. Empty, Loading y Error consistency

Todos los charts deben soportar:

```text
loading
ready
empty
error
partial
```

---

# 108. Labeling de unidades

La unidad debe estar en:

- eje;
- título;
- KPI;
- tooltip;
- tabla.

No repetirla en exceso.

---

# 109. Porcentajes

Mostrar:

```text
86%
```

o:

```text
86.4%
```

solo si la precisión es útil.

Evitar:

```text
86.428571%
```

---

# 110. Decimal Precision

Regla general:

```text
conteos             0 decimales
hectáreas            1–2
porcentajes          0–1
dinero               2 cuando corresponda
duraciones           formato humano
```

---

# 111. Time Series Granularity

Elegir según periodo.

```text
HOY        → hora o bloque
SEMANA     → día
MES        → día / semana
CAMPAÑA    → día / semana según duración
```

No graficar cientos de puntos si una agregación comunica mejor.

---

# 112. Long Campaigns

Para campañas extensas:

- permitir agregación semanal;
- zoom opcional;
- filtros;
- rangos.

No mostrar 300 labels en eje X.

---

# 113. Ranking Ties

Si dos trabajadores tienen el mismo valor:

- usar misma posición si la regla de negocio lo define;
- o desempate explícito.

No inventar desempate visual.

---

# 114. Highlight Top Performer

Puede resaltarse con:

- brand soft;
- peso;
- posición.

No usar gamificación excesiva.

---

# 115. Alerts from Data

Si una métrica cruza umbral real:

```text
Producción por debajo del objetivo
```

puede mostrarse warning.

No generar alertas basadas en reglas inventadas en frontend.

---

# 116. Data Quality

Si la información tiene problemas:

- marcarlo;
- no ocultarlo.

Ejemplo:

```text
2 registros excluidos por error de sincronización.
```

Solo si es relevante para interpretar la métrica.

---

# 117. Insights

Los insights automáticos deben basarse en datos verificables.

Correcto:

```text
La producción de hoy es 8.4% mayor que ayer.
```

Incorrecto:

```text
El equipo está trabajando mucho mejor.
```

si no hay evidencia suficiente.

---

# 118. Portal Dashboard Pattern

Ejemplo conceptual:

```text
Campaña [ Palta Hass 2026 ▼ ]      Periodo [ Hoy ▼ ]

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Producción hoy │ │ Cosechadores   │ │ Sesiones       │
│ 1,284 jabas    │ │ 42             │ │ 6              │
└────────────────┘ └────────────────┘ └────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Producción diaria                                       │
│ [ bar / line chart ]                                    │
└─────────────────────────────────────────────────────────┘

┌────────────────────────────┐ ┌──────────────────────────┐
│ Ranking                    │ │ Producción por lote      │
│ 1 Juan Pérez       92      │ │ L07 █████████ 420        │
│ 2 Ana Torres       88      │ │ L03 ███████   350        │
│ 3 Luis Quispe      84      │ │ L05 █████     270        │
└────────────────────────────┘ └──────────────────────────┘
```

---

# 119. Report Page Pattern

```text
Reportes / Producción diaria

Campaña [ ... ]
Periodo [ HOY | SEMANA | MES | CAMPAÑA ]
Filtros [ ... ]                         [ Exportar CSV ]

┌──────────────────────────────────────────────┐
│ Producción diaria                            │
│ [ chart ]                                    │
└──────────────────────────────────────────────┘

Tabla
───────────────────────────────────────────────
Fecha          Jabas      Cosechadores Sesiones
14 oct         1,284      42           6
13 oct         1,184      40           5
```

---

# 120. Ranking Page Pattern

```text
Ranking de personal

Campaña [ ... ]
Periodo [ ... ]
Buscar [ ... ]

#   Cosechador        Jabas      Variación
1   Juan Pérez        92         +8
2   Ana Torres        88         +3
3   Luis Quispe       84         -2
```

Puede añadir barras horizontales como apoyo visual.

---

# 121. Harvest Progress Pattern

```text
Lote de tickets HT-0042

40 tickets

Consumidos
34 / 40

█████████████████░░░ 85%
```

Complementar:

```text
Disponible  4
Asignado    2
Consumido  34
```

---

# 122. Farm Structure Pattern

Cuando exista atribución válida:

```text
Producción por sector

Sector Norte     ███████████  4,820
Sector Sur       ████████     3,710
Sector Este      █████        2,240
```

No inferir datos desde vínculos históricos incompletos.

---

# 123. Future Inventory Pattern

Ejemplo futuro:

```text
Stock actual
Movimientos
Consumo
Reposición
```

Visualizaciones:

- KPI;
- line;
- bar;
- table.

No hace falta diseñarlas aún, pero el sistema debe soportarlas.

---

# 124. Future Machinery Pattern

Ejemplos:

- horas de uso;
- disponibilidad;
- mantenimientos;
- consumo.

Visualizaciones:

- timeline;
- KPI;
- bar;
- status.

---

# 125. Future Irrigation Pattern

Ejemplos:

- volumen;
- duración;
- frecuencia;
- sector.

Visualizaciones:

- line;
- bar;
- heatmap limitado.

---

# 126. Future Quality Pattern

Ejemplos:

- clasificación;
- rechazos;
- incidencias;
- tendencia.

Visualizaciones:

- stacked bar;
- histogram;
- table.

---

# 127. Do

- usar preguntas como punto de partida;
- priorizar KPIs relevantes;
- comparar cuando sea válido;
- usar verde como serie principal;
- usar amarillo como acento;
- mantener tablas accesibles;
- usar horizontal bar para rankings;
- mantener filtros visibles;
- indicar periodo y campaña;
- mostrar estados vacíos;
- respetar light/dark;
- mantener unidades;
- usar read models del backend;
- ser preciso.

---

# 128. Don't

- charts 3D;
- gauges decorativos;
- pies con muchas categorías;
- demasiadas series;
- arcoíris;
- gradients agresivos;
- colores arbitrarios por módulo;
- ejes engañosos;
- valores sin unidad;
- gráficos sin pregunta;
- dashboards llenos de mini charts;
- ranking gamificado infantil;
- mezclar legacy y Harvest en frontend;
- asumir realtime;
- mostrar `null` como cero;
- inventar metas;
- inventar insights;
- usar chart donde tabla es mejor.

---

# 129. Checklist de Chart

- [ ] Responde una pregunta clara
- [ ] Tipo de chart apropiado
- [ ] Título claro
- [ ] Periodo visible
- [ ] Contexto de campaña visible
- [ ] Unidad visible
- [ ] Color accesible
- [ ] No depende solo de color
- [ ] Tooltip útil
- [ ] Empty state
- [ ] Loading
- [ ] Error
- [ ] Dark mode
- [ ] Responsive
- [ ] Reduced motion
- [ ] Tabla alternativa si es crítico
- [ ] Datos provienen del read model correcto

---

# 130. Checklist de KPI

- [ ] Label claro
- [ ] Valor formateado
- [ ] Unidad
- [ ] Periodo
- [ ] Comparación si existe
- [ ] Semántica correcta
- [ ] No usa color de forma engañosa
- [ ] Números tabulares
- [ ] No tiene precisión innecesaria

---

# 131. Checklist de Reporte

- [ ] Campaña
- [ ] Periodo
- [ ] Filtros
- [ ] Chart
- [ ] Tabla
- [ ] Sorting
- [ ] Búsqueda cuando aplica
- [ ] Export CSV
- [ ] Mismos filtros en chart/table/export
- [ ] Permisos
- [ ] Empty/loading/error
- [ ] Light/dark
- [ ] Responsive

---

# 132. Checklist de Ranking

- [ ] Posición
- [ ] Entidad
- [ ] Valor
- [ ] Unidad
- [ ] Periodo
- [ ] Orden correcto
- [ ] Empates definidos
- [ ] Variación opcional
- [ ] Sin gamificación excesiva
- [ ] Accesible
- [ ] Responsive

---

# 133. Checklist de accesibilidad

- [ ] Contraste suficiente
- [ ] Labels visibles
- [ ] Tooltips accesibles
- [ ] Focus en elementos interactivos
- [ ] Tabla alternativa para datos críticos
- [ ] Color no es único indicador
- [ ] Series distinguibles
- [ ] Ejes legibles
- [ ] Reduced motion
- [ ] No se usan animaciones como única señal

---

# 134. Tokens sugeridos — Palette V2

```css
:root {
  --chart-1: #3A9C66;
  --chart-2: #2FAFB0;
  --chart-3: #C69A2D;
  --chart-4: #C96F45;
  --chart-5: #7767C7;
  --chart-6: #4F7CAC;

  --chart-success: #2F8A57;
  --chart-warning: #A67C22;
  --chart-error: #C4473A;
  --chart-info: #4F7CAC;

  --chart-grid-light: rgba(21, 32, 25, 0.08);
  --chart-axis-light: #748078;
  --chart-label-light: #46534B;

  --chart-1-dark: #69BB88;
  --chart-2-dark: #52C0C0;
  --chart-3-dark: #DDB557;
  --chart-4-dark: #D98965;
  --chart-5-dark: #9184D4;
  --chart-6-dark: #6E93BC;

  --chart-grid-dark: rgba(223, 231, 226, 0.10);
  --chart-axis-dark: #AAB7AF;
  --chart-label-dark: #F2F6F3;
}
```
# 135. Gobernanza de Data Viz

Antes de introducir un nuevo chart:

1. definir la pregunta;
2. comprobar si KPI o tabla bastan;
3. revisar si ya existe patrón equivalente;
4. validar light/dark;
5. validar accesibilidad;
6. validar responsive;
7. comprobar que los datos vienen de una proyección autorizada;
8. evitar lógica de dominio en frontend;
9. documentar unidad y periodo;
10. evitar crear un color nuevo sin necesidad.

---

# 136. Fuente de verdad

Las visualizaciones deben consumir datos ya preparados por Application/Backend.

La UI no debe:

- unir datasets de dominio;
- reconstruir reglas de negocio;
- mezclar legacy y nuevo modelo;
- recalcular ownership;
- inferir permisos;
- inventar periodos.

Debe limitarse a:

```text
recibir
→ filtrar según contrato
→ ordenar
→ presentar
```

---

# 137. Relación con Components

`components.md` define:

- MetricCard;
- ChartCard;
- ChartLegend;
- RankingList;
- PeriodSelector;
- DataTable;
- TrendIndicator;
- ProgressIndicator.

`data-viz.md` define cómo deben utilizarse esos componentes para comunicar datos.

---

# 138. Relación con Foundations

Los charts deben usar:

- color tokens;
- typography tokens;
- spacing;
- motion;
- dark mode;
- focus;
- breakpoints.

No usar valores visuales arbitrarios si ya existe token.

---

# 139. Relación con Portal

Portal es la superficie principal de analítica.

Debe ofrecer:

- dashboards;
- reportes;
- filtros;
- comparaciones;
- exportación;
- drill-down.

---

# 140. Relación con Field

Field solo muestra datos cuando ayudan a operar.

Principio:

> **Field informa para continuar la tarea; Portal analiza para comprender la operación.**

---

# 141. Principio final

> **La visualización de datos de GesGROW debe convertir actividad agrícola compleja en información clara, confiable y accionable.**

Una buena visualización de GesGROW no busca impresionar por cantidad de gráficos.

Busca que el usuario pueda responder rápidamente:

> **¿Qué está pasando?**  
> **¿Cómo está cambiando?**  
> **¿Dónde debo mirar?**  
> **¿Qué necesito hacer?**

Ese es el criterio final de aprobación.
