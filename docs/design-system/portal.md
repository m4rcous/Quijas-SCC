# GesGROW — Portal Web Design Specification

> Dirección visual actualizada del Portal de GesGROW. Este documento prevalece sobre decisiones visuales anteriores de `portal.md` cuando entren en conflicto. Complementa `README.md`, `DESIGN.md`, `foundations.md`, `components.md` y `data-viz.md`.

## 1. Visión

GesGROW Portal debe sentirse como una **suite agri-tech premium, modular, editorial y analítica**. No debe parecer un panel administrativo SaaS genérico ni un ERP clásico con color verde.

La identidad debe surgir de la combinación de:

- navegación modular y jerárquica;
- fotografía agrícola selectiva;
- widgets de distinta jerarquía;
- datos y visualización;
- grandes radios y superficies suaves;
- glass sutil;
- motion breve y refinado;
- light y dark mode;
- una estética agrícola evidente sin decoración excesiva.

> **Agrícola, contemporáneo y premium; la información sigue siendo la protagonista.**

---

## 2. Principio de composición

No resolver todas las páginas como una sucesión de cards iguales.

Preferir composiciones basadas en:

```text
jerarquía
+ tamaño
+ contraste
+ ritmo
+ relación entre widgets
```

El Dashboard puede combinar hero, widgets compactos, charts amplios, ranking, actividad reciente y tablas. Los bloques no necesitan tener el mismo tamaño ni peso visual.

Evitar:

- dashboard lineal;
- grandes vacíos sin intención;
- grids mecánicos;
- una card para cada dato;
- copy técnico alrededor de gráficos;
- fotografías de stock genéricas.

---

## 3. App Shell

En desktop, el Portal usa una **Navigation Rail compacta** y un **panel contextual expandible**.

```text
┌───────┬──────────────────────────────────────────┐
│ Rail  │ Topbar / context                        │
│       ├──────────────────────────────────────────┤
│       │                                          │
│       │ Content                                  │
│       │                                          │
└───────┴──────────────────────────────────────────┘
```

La rail es el primer nivel de navegación; no es únicamente un sidebar angosto.

Tokens orientativos:

```css
--portal-rail-width: 72px;
--portal-navigation-panel-width: 290px;
```

---

## 4. Navigation Rail

Debe sentirse como una pieza de producto refinada:

- estrecha;
- muy redondeada;
- clara o translúcida;
- glass moderado;
- borde suave;
- profundidad mínima;
- iconos centrados;
- estado activo inequívoco.

En desktop amplio puede separarse ligeramente del borde del viewport para sentirse más flotante.

Estados:

```text
collapsed
hover-expanded
focus-expanded
pinned
mobile-drawer
```

Nunca depender exclusivamente de hover.

Cuando esté colapsada, los iconos deben tener tooltip accesible mediante hover y focus.

---

## 5. Navegación por colecciones

GesGROW es una suite modular. No listar todos los módulos contratados en una sola columna plana.

Agrupar por **colecciones funcionales**.

Estructura inicial sugerida:

```text
Inicio

Operación agrícola
├── Campañas
├── Personal
├── Cosecha
└── Reportes

Estructura agrícola
├── Fundos
├── Sectores
└── Parcelas

Plataforma
├── Usuarios y accesos
├── Suscripción
├── Módulos
└── Configuración
```

A futuro pueden aparecer colecciones como:

```text
Recursos
├── Inventario
├── Maquinaria
└── Mantenimiento

Producción
├── Riego
├── Calidad
└── Trazabilidad
```

La agrupación visual nunca sustituye permisos o entitlements reales.

---

## 6. Módulos adquiridos

Los módulos efectivos resueltos por Platform deben determinar qué opciones operativas aparecen.

Los módulos contratados pueden presentarse como una colección equivalente a **Mis módulos** o integrarse dentro de su colección funcional.

Un módulo no contratado no debe mostrarse como una opción operativa normal.

---

## 7. Panel contextual expandido

Al activar una colección, se abre un panel secundario con submódulos y rutas.

Ejemplo:

```text
Operación agrícola

Campañas
Personal
Cosecha
Reportes

────────────
Cosecha
Lotes de tickets
Tickets
Asignaciones
Registros
```

Debe sentirse como navegación jerárquica, no como megamenú de marketing.

La jerarquía debe distinguir visualmente:

```text
colección activa
módulo activo
subruta activa
```

---

## 8. Topbar

Debe ser ligera y funcional.

Puede contener:

- empresa activa;
- campaña activa cuando corresponda;
- theme switcher;
- notificaciones futuras;
- perfil.

No repetir el nombre de la página si `PageHeader` ya lo muestra.

Perfil recomendado:

```text
[ avatar ] Usuario ▼
```

Mover correo y “Cerrar sesión” dentro del menú de usuario.

---

## 9. Dashboard Home

El Home debe sentirse como una **vista de operación viva**, no como un reporte largo.

Composición recomendada:

```text
┌────────────────────────────────────┬──────────────┐
│ Hero / bienvenida                 │ Clima        │
│ imagen + saludo + campaña         │ widget       │
├──────────────────────┬─────────────┴──────────────┤
│ KPI / tendencia      │ Ranking breve             │
├──────────────────────┴────────────────────────────┤
│ Métricas compactas                                 │
├────────────────────────────────────────────────────┤
│ Producción diaria / comparación                    │
├───────────────────────────┬────────────────────────┤
│ Producción por lote       │ Última actividad       │
└───────────────────────────┴────────────────────────┘
```

El orden puede variar según datos disponibles, pero debe conservar jerarquía y composición asimétrica.

---

## 10. Hero de bienvenida

El Dashboard puede comenzar con un hero visual agrícola.

Debe mostrar, según disponibilidad:

- fecha;
- saludo;
- empresa;
- campaña activa;
- uno o dos indicadores breves;
- fotografía o textura agrícola real.

Ejemplo conceptual:

```text
Jueves, 15 de octubre

Buenos días,
Quijas

Campaña Arándano 2026
[ Activa ] [ 15 jabas hoy ]
```

La foto debe sentirse parte del producto, no un banner de marketing.

Preferir:

- cultivos desde arriba;
- líneas de siembra;
- parcelas;
- textura vegetal;
- paisajes agrícolas estructurados.

Evitar fotografías de stock cliché o agricultores posando.

---

## 11. WeatherCard

El clima puede acompañar el hero como widget contextual.

Estilo:

- compacto;
- gran radio;
- visualmente similar a un widget de sistema;
- información mínima;
- integrado con el hero.

Puede mostrar, cuando exista una fuente real:

```text
24°
Parcialmente nublado
Humedad 68%
Viento 12 km/h
```

### Regla de integridad

No inventar clima.

Si no existe una fuente meteorológica configurada:

```text
Clima no configurado
```

u ocultar el widget de datos sin presentar valores falsos.

La integración de una API meteorológica es una fase funcional independiente.

---

## 12. Widgets del Dashboard

Los widgets pueden tener tamaños diferentes:

```text
Small
Medium
Large
Wide
Tall
```

No hacer todas las cards idénticas.

Datos actuales que pueden distribuirse:

- producción total;
- jabas hoy;
- cosechadores con producción;
- lotes operativos;
- sesiones;
- días con producción;
- producción diaria;
- ranking;
- producción por lote;
- última actividad.

La jerarquía se construye con tamaño, posición, tipografía y ritmo, no con exceso de color.

---

## 13. Tendencia principal

Un widget grande puede combinar:

```text
métrica
+ comparación
+ tendencia
+ chart
```

Ejemplo:

```text
Producción
2,683
+4.5% vs periodo anterior

[ trend chart ]
```

Solo mostrar comparaciones válidas según el dominio.

---

## 14. Login

El Login evoluciona hacia una composición **editorial agrícola**.

Desktop:

```text
┌──────────────────────────┬──────────────────────────┐
│ Fotografía agrícola      │ Formulario               │
│                          │                          │
│ Mensaje breve de marca   │ GesGROW                  │
│                          │ Bienvenido               │
│                          │ Email                    │
│                          │ Contraseña               │
│                          │ [ Iniciar sesión ]       │
└──────────────────────────┴──────────────────────────┘
```

La imagen puede ocupar aproximadamente 45–55% del viewport.

Se permiten:

- esquinas amplias;
- recortes orgánicos moderados;
- intersecciones suaves entre imagen y formulario;
- overlay de contraste.

No inventar funcionalidades de autenticación como Google login, registro público, free trial o “remember me” si no existen.

Mientras el logo definitivo esté pendiente, usar `GesGROW` como wordmark.

---

## 15. Ranking — página dedicada

Ranking debe ser una superficie analítica propia, no un widget extendido.

Objetivos:

- visualizar todos los cosechadores;
- buscar;
- ordenar;
- filtrar por periodo;
- seleccionar trabajadores;
- comparar seleccionados;
- abrir detalle.

Desktop:

```text
┌───────────────────────────────────────────────────────┐
│ Ranking de cosechadores                              │
│ Campaña [▼] Periodo [ Día | Mes | Campaña ]          │
├─────────────────────────┬─────────────────────────────┤
│ Ranking general         │ Comparación                 │
│                         │                             │
│ #1 Juan  92             │ [ chart ]                   │
│ #2 Ana   88             │                             │
│ #3 Luis  84             │ seleccionados              │
│ ...                     │                             │
└─────────────────────────┴─────────────────────────────┘
```

---

## 16. Ranking general

Debe soportar:

- búsqueda visible;
- posición;
- trabajador;
- producción;
- última actividad;
- periodo;
- selección para comparar.

El top 3 puede tener énfasis sutil, sin gamificación infantil.

---

## 17. Comparison Tray

Al seleccionar trabajadores, mostrar una bandeja de comparación.

Ejemplo:

```text
Comparar

[ Juan Pérez × ]
[ Ana Torres × ]
[ Luis Quispe × ]

[ Comparar 3 ]
```

Limitar la comparación simultánea aproximadamente a 2–5 cosechadores.

Puede ubicarse:

- sticky abajo;
- en panel derecho;
- encima del gráfico.

---

## 18. Comparación personalizada

La intención de producto es comparar cosechadores por:

```text
Día
Mes
Campaña
```

Futuro posible:

```text
Rango personalizado
Lote
Variedad
```

### Regla de datos

La UI no debe inventar agregaciones.

Si el read model actual no ofrece la granularidad necesaria por trabajador y periodo, la comparación avanzada es una brecha funcional.

No reconstruir producción cruda ni combinar legacy/Harvest en React.

---

## 19. Gráfico de comparación

Cuando existan datos válidos:

- line chart para evolución temporal;
- barras para periodos agregados;
- máximo 2–5 series;
- colores distinguibles definidos por `data-viz.md`;
- tabla equivalente;
- tooltips accesibles;
- light/dark.

---

## 20. Period Selector

Visualmente puede usar:

```text
[ Día ] [ Mes ] [ Campaña ]
```

Si los contratos actuales usan otra semántica como `HOY / SEMANA / MES / CAMPANIA`, no cambiar el significado funcional silenciosamente. Presentar labels humanas sin exponer enums técnicos.

---

## 21. Charts

Los charts deben integrarse mejor con el producto:

- pocas gridlines;
- strokes limpios;
- tooltips refinados;
- labels claras;
- espacio suficiente para datos;
- bordes de cards más ligeros.

Para datasets de 1–3 puntos:

- limitar ancho de barras;
- distribuir visualmente;
- evitar una única barra enorme pegada al borde.

Verde es la serie principal. Amarillo se usa como acento o highlight cuando exista una razón útil.

---

## 22. Light Mode

Debe sentirse:

- aireado;
- cálido;
- sofisticado;
- agrícola;
- suave.

No completamente blanco; utilizar neutros cálidos y superficies diferenciadas.

---

## 23. Dark Mode

Mantener la misma personalidad:

- verde-neutros oscuros;
- hero;
- rail;
- widgets;
- charts;
- glass.

No convertirlo en un dashboard negro.

---

## 24. Glass

Puede utilizarse de forma controlada en:

- navigation rail;
- navigation panel;
- topbar flotante;
- controles sobre hero;
- WeatherCard;
- overlays.

No aplicar glass a todas las cards.

> **Glass es un material de apoyo, no la identidad completa.**

---

## 25. Radios

La dirección admite radios más generosos.

```text
small controls      10–14px
inputs/buttons      14–18px
cards               18–24px
hero/widgets        24–32px
rail                28–36px
```

---

## 26. Motion

Usar movimiento en:

- rail → panel;
- hover de widgets;
- tabs;
- Comparison Tray;
- charts;
- drawers;
- tema.

Orientación:

```text
micro       120–160ms
navigation  160–220ms
panels      200–260ms
```

Respetar `prefers-reduced-motion`.

---

## 27. Responsive — navegación

```text
desktop → rail + panel
laptop  → rail + panel/overlay
tablet  → rail o drawer
mobile  → drawer
```

No depender de hover en pantallas táctiles.

---

## 28. Responsive — Dashboard

Desktop:

```text
hero 8 cols
weather 4 cols
widgets compositivos
```

Tablet:

```text
hero full
weather + KPIs en 2 cols
```

Mobile:

```text
hero
weather
KPIs
charts
ranking
actividad
```

No encoger simplemente el layout desktop.

---

## 29. Page Header interno

Las páginas internas deben ser más sobrias que Home.

Ejemplo:

```text
Reportes / Ranking

Ranking de cosechadores
Compare producción por periodo.

[ Campaña ] [ Periodo ] [ Exportar ]
```

No repetir hero/fotografía en cada sección.

---

## 30. Tables

Mantener densidad media-alta.

Priorizar:

- headers sutiles;
- row hover;
- whitespace medido;
- badges mínimos;
- acciones compactas;
- sin scroll horizontal evitable.

La nueva estética no debe convertir cada fila en una card.

---

## 31. Fotografía

Permitida principalmente en:

- Login;
- Dashboard hero;
- onboarding futuro.

No usar dentro de tablas, formularios, configuración o dialogs.

---

## 32. Reglas de integridad

Los widgets visuales deben basarse en datos reales.

No inventar:

- clima;
- comparaciones;
- objetivos;
- tendencias;
- estados;
- alertas.

Si falta un contrato de datos, documentar la brecha en lugar de falsificar la experiencia.

---

## 33. Pantallas de validación prioritaria

Antes de propagar la nueva dirección al resto del Portal, validar:

```text
1. Login
2. App Shell + Navigation Rail
3. Dashboard Home
4. Ranking
```

Estas cuatro superficies fijan la identidad principal.

---

## 34. Checklist — Sidebar

- [ ] Rail compacta premium
- [ ] Iconos legibles
- [ ] Colecciones claras
- [ ] Panel contextual útil
- [ ] Módulos efectivos organizados
- [ ] Estado activo jerárquico
- [ ] Keyboard completo
- [ ] Touch con alternativa
- [ ] Motion refinado
- [ ] No parece ERP tradicional

---

## 35. Checklist — Dashboard

- [ ] Hero transmite agricultura
- [ ] Fotografía no domina los datos
- [ ] WeatherCard encaja
- [ ] KPIs tienen jerarquía
- [ ] Widgets no son todos iguales
- [ ] Tendencia principal clara
- [ ] Ranking visible
- [ ] Producción por lote visible
- [ ] Última actividad secundaria
- [ ] Light/dark coherentes

---

## 36. Checklist — Login

- [ ] Imagen agrícola de alta calidad
- [ ] Composición editorial
- [ ] Formulario directo
- [ ] Wordmark GesGROW
- [ ] Sin funciones de autenticación inventadas
- [ ] Responsive
- [ ] Se siente premium
- [ ] No parece landing genérica

---

## 37. Checklist — Ranking

- [ ] Todos los cosechadores consultables
- [ ] Búsqueda visible
- [ ] Campaña visible
- [ ] Periodo visible
- [ ] Top performers legibles
- [ ] Selección para comparar clara
- [ ] Comparison Tray usable
- [ ] Chart accesible
- [ ] Tabla equivalente
- [ ] Sin lógica de dominio duplicada en frontend
- [ ] Responsive

---

## 38. Principio final

> **GesGROW debe sentirse como una suite agrícola contemporánea, no como un panel administrativo que utiliza verde.**

La identidad surge de:

```text
navegación modular
+
fotografía agrícola selectiva
+
widgets editoriales
+
datos
+
movimiento
+
superficies refinadas
```

La agricultura debe estar presente. La información sigue siendo la protagonista.
