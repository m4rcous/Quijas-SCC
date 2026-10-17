# GesGROW — Field App Design Specification

> Documento específico para el diseño e implementación de la **Aplicación de Campo de GesGROW**.
>
> Este archivo complementa `README.md`, `DESIGN.md`, `foundations.md`, `components.md` y `data-viz.md`.
>
> Define cómo debe verse, sentirse y comportarse la experiencia operativa en PDA/móvil, preservando la velocidad, claridad y robustez que requiere el trabajo agrícola en campo.

---

# 1. Propósito de la Aplicación de Campo

La Aplicación de Campo de GesGROW es la superficie operativa móvil para registrar y ejecutar actividades agrícolas en tiempo real.

Su objetivo es permitir que el trabajo continúe de forma rápida y confiable incluso cuando:

- la conectividad es irregular;
- se opera bajo luz natural intensa;
- se utiliza un PDA con lector físico;
- la interacción es repetitiva;
- existe presión de tiempo;
- el operador necesita trabajar con una sola mano;
- el dispositivo tiene una pantalla pequeña.

Actualmente soporta principalmente:

- asignación de tickets a cosechadores;
- registro de jaberos;
- lectura de tickets/jabas;
- sesiones operativas;
- consultas rápidas;
- operación offline;
- sincronización posterior.

A futuro puede extenderse a:

- inventario;
- maquinaria;
- riego;
- calidad;
- mantenimiento;
- logística;
- otras tareas operativas de campo.

---

# 2. Idea central

> **La Aplicación de Campo debe sentirse como una herramienta física digitalizada.**

Debe recordar a un instrumento operativo moderno:

- rápido;
- robusto;
- directo;
- legible;
- confiable;
- fácil de aprender;
- difícil de usar mal.

La experiencia no debe sentirse como un portal administrativo comprimido en una pantalla pequeña.

---

# 3. Personalidad específica de Field

La Aplicación de Campo debe sentirse:

- agrícola;
- moderna;
- robusta;
- utilitaria;
- táctil;
- clara;
- inmediata;
- confiable;
- profesional;
- resistente a errores.

Comparte la identidad premium de GesGROW, pero prioriza la operación por encima del refinamiento visual ornamental.

---

# 4. Contexto de uso

## 4.1. Dispositivo principal

- PDA Android;
- PWA instalada;
- navegador Chromium/Chrome;
- orientación vertical;
- lector físico de códigos de barras;
- lector configurado como keyboard wedge;
- posible teclado virtual manual.

---

## 4.2. Entorno

- campo;
- exteriores;
- luz solar;
- polvo y movimiento;
- operación repetitiva;
- uso con una mano;
- interrupciones;
- conectividad intermitente;
- jornadas largas.

---

## 4.3. Consecuencias de diseño

Priorizar:

- contraste alto;
- controles grandes;
- foco visible;
- flujos cortos;
- pocas decisiones;
- feedback inmediato;
- botones separados;
- copy breve;
- estado de conectividad claro solo cuando importe;
- continuidad offline;
- recuperación rápida ante errores.

---

# 5. Jerarquía operativa

Toda pantalla operativa debe responder rápidamente:

1. **¿Qué tengo que hacer ahora?**
2. **¿Qué debo escanear?**
3. **¿Qué acaba de pasar?**
4. **¿Qué hago después?**

Estas cuatro preguntas tienen prioridad sobre cualquier decoración.

---

# 6. Principios de diseño de Field

## 6.1. Operar primero

La acción principal debe comprenderse en menos de 2 segundos.

---

## 6.2. Una pantalla, una intención principal

No mezclar en el mismo plano:

- operación repetitiva;
- consultas densas;
- configuración;
- reportes complejos.

---

## 6.3. Cero scroll en operación

El flujo habitual debe caber en la pantalla siempre que sea razonablemente posible.

Si no cabe:

1. reducir copy;
2. compactar cards;
3. reducir gaps;
4. reorganizar bloques;
5. mover información secundaria.

No resolverlo reduciendo excesivamente targets táctiles.

---

## 6.4. Scroll solo para información

Permitido en:

- tablas;
- históricos;
- listas;
- resultados;
- consultas;
- reportes.

---

## 6.5. Lo técnico se oculta si todo va bien

No mostrar permanentemente:

```text
En línea
Sincronizado
Servidor disponible
```

Mostrar conectividad cuando exista:

- offline;
- registros pendientes;
- error de sincronización;
- acción que requiera conexión.

---

## 6.6. El siguiente paso siempre debe ser evidente

Después de una acción válida:

- mover foco;
- activar el siguiente control;
- mostrar feedback;
- ocultar opciones irrelevantes.

---

## 6.7. Diseñar para luz intensa

Evitar:

- grises demasiado claros;
- texto fino;
- transparencias débiles;
- controles con contraste bajo;
- fondos glass.

Field no utiliza glass como recurso visual principal.

---

# 7. Relación con el Portal

Field y Portal comparten:

- marca GesGROW;
- verde principal;
- amarillo cosecha;
- Inter;
- iconografía;
- estados semánticos;
- microcopy;
- lenguaje de accesibilidad.

Pero Field utiliza:

- controles más grandes;
- menos densidad;
- navegación contextual;
- light mode;
- feedback más inmediato;
- menos información simultánea;
- interacción optimizada para scanner/touch.

---

# 8. Tema

La Aplicación de Campo utiliza únicamente:

```text
Light Mode
```

por ahora.

No implementar dark mode en Field.

Motivos:

- visibilidad bajo luz natural;
- alto contraste;
- previsibilidad;
- menor complejidad operativa;
- consistencia en PDA.

---

# 9. Paleta

Utilizar los tokens globales de GesGROW.

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

### Amarillo cosecha

```css
--color-harvest-700: #B77D00;
--color-harvest-600: #D39700;
--color-harvest-500: #F2B705;
--color-harvest-400: #F7C535;
--color-harvest-300: #FFD45A;
--color-harvest-100: #FFF4C8;
```

### Neutros

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

---

# 10. Reglas de color

## Acción primaria

```css
background: var(--color-brand-700);
color: #FFFFFF;
```

## Acción secundaria

```css
background: var(--color-surface-150);
color: var(--color-ink-950);
border: 1px solid var(--color-line-300);
```

## Estado activo

```css
background: var(--color-brand-100);
color: var(--color-brand-800);
```

## Fondo general

```css
background: var(--color-surface-100);
```

## Tarjetas

```css
background: var(--color-white);
border: 1px solid var(--color-line-200);
```

---

# 11. Estados semánticos

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

Los estados nunca deben depender únicamente del color.

Añadir:

- icono;
- texto;
- label;
- forma;
- contexto.

---

# 12. Tipografía

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

Field debe favorecer:

- peso medio/semibold;
- números legibles;
- bajo riesgo de error de lectura;
- tamaño generoso.

---

# 13. Escala tipográfica

```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-md: 0.9375rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.125rem;
--font-size-metric: 2.5rem;
```

---

# 14. Tipografía operativa

## H1

```css
font-size: 1.875rem;
font-weight: 750;
line-height: 1.1;
```

## H2

```css
font-size: 1.5rem;
font-weight: 700;
line-height: 1.15;
```

## Body operativo

```css
font-size: 1.125rem;
font-weight: 500;
line-height: 1.45;
```

## Label

```css
font-size: 0.9375rem;
font-weight: 650;
```

## Metric

```css
font-size: 2.5rem;
font-weight: 750;
line-height: 1;
```

No usar texto operativo por debajo de 16px.

---

# 15. Espaciado

Base de 4px.

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

En PDA:

- padding horizontal: 16–20px;
- gaps entre bloques: 12–16px;
- padding interno de cards: 12–16px.

Evitar grandes espacios vacíos.

---

# 16. Radios

```css
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 18px;
--radius-xl: 22px;
--radius-round: 999px;
```

Uso recomendado:

```text
inputs       14px
botones      14–18px
cards        18–22px
chips        999px
```

---

# 17. Sombras

```css
--shadow-sm: 0 3px 10px rgba(21, 32, 25, 0.06);
--shadow-md: 0 4px 14px rgba(21, 32, 25, 0.08);
--shadow-lg: 0 10px 28px rgba(21, 32, 25, 0.12);
```

Field debe usar:

- shadow-sm;
- bordes;
- separación por superficie.

No crear profundidad excesiva.

---

# 18. Motion

```css
--motion-fast: 120ms;
--motion-base: 160ms;
--motion-slow: 220ms;
```

Permitido:

- pressed;
- focus;
- éxito breve;
- cambio de paso;
- apertura de bottom sheet;
- estado.

Evitar:

- animaciones largas;
- rebotes;
- transiciones que retrasen scanner;
- motion decorativo.

---

# 19. Tamaños táctiles

```css
--touch-target-min: 48px;
--control-height: 56px;
--scan-input-height: 64px;
--icon-button-size: 48px;
```

Todo elemento accionable debe tener al menos 48px de área efectiva.

---

# 20. App Shell

## 20.1. Header principal

Debe ser compacto.

Puede incluir:

- volver;
- título;
- operador;
- contexto operativo;
- menú contextual;
- alertas excepcionales.

No debe consumir demasiado espacio vertical.

---

## 20.2. Footer

No usar navegación inferior permanente por defecto.

Solo introducirla si un flujo futuro demuestra que mejora la operación.

---

# 21. Home

## 21.1. Layout

Grid de dos columnas.

```css
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 12px;
```

---

## 21.2. HomeActionTile

Debe incluir:

- icono;
- título;
- badge opcional;
- toda la tarjeta clickeable.

Ejemplo:

```text
┌────────────┐ ┌────────────┐
│   icono    │ │   icono    │
│ Asignar    │ │ Jaberos    │
│ tickets    │ │            │
└────────────┘ └────────────┘

┌────────────┐ ┌────────────┐
│   icono    │ │   icono    │
│ Lectura    │ │ Consultas  │
│ de jabas   │ │            │
└────────────┘ └────────────┘
```

No incluir descripciones largas.

---

# 22. Navegación contextual

Cada módulo puede tener un menú contextual.

Ejemplo:

### Asignación
- Operar
- Asignados hoy
- Buscar asignación

### Jaberos
- Registrar
- Jaberos de campaña
- Buscar

### Lectura
- Escanear
- Cosechadores y jabas
- Sesiones

Patrón preferido:

```text
Bottom Sheet
```

No usar sidebar.

---

# 23. Bottom Sheet

Usar para:

- navegación contextual;
- filtros;
- detalle rápido;
- acciones secundarias.

Debe tener:

- handle opcional;
- título;
- cierre claro;
- altura adaptable;
- targets grandes.

No usarlo para flujos largos.

---

# 24. Botón primario

```css
.btn-primary {
  min-height: 56px;
  background: var(--color-brand-700);
  color: #FFFFFF;
  border-radius: var(--radius-md);
  font-weight: 700;
  border: none;
}
```

Debe dominar visualmente la pantalla cuando exista una acción principal.

---

# 25. Botón secundario

```css
.btn-secondary {
  min-height: 52px;
  background: var(--color-surface-150);
  color: var(--color-ink-950);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-line-300);
}
```

---

# 26. Botón destructivo

```css
.btn-danger {
  background: var(--color-error-fg);
  color: #FFFFFF;
}
```

Usar solo cuando exista riesgo real.

No usar rojo automáticamente para:

- cerrar sesión;
- finalizar lectura;
- completar jornada.

Si la acción es normal, puede usar variante secundaria o warning.

---

# 27. IconButton

```text
48 × 48px
```

Debe incluir:

- icono claro;
- estado pressed;
- focus;
- aria-label.

---

# 28. Input estándar

```css
height: 56px;
border: 1.5px solid var(--color-line-300);
border-radius: var(--radius-md);
padding: 0 16px;
font-size: 18px;
```

Focus:

```css
border-color: var(--color-brand-700);
outline: 3px solid rgba(38, 115, 74, 0.18);
```

---

# 29. ScanInput

Componente crítico de Field.

## 29.1. Anatomía

```text
[ estado/icono ][ Escanee DNI o ticket          ][ teclado ]
```

---

## 29.2. Especificación

- alto: 64px;
- texto grande;
- placeholder directo;
- foco visible;
- botón teclado independiente;
- editable;
- sin scroll horizontal;
- `inputmode="none"` por defecto cuando el scanner está activo.

---

## 29.3. Estados

- ready;
- focus;
- processing;
- valid;
- error;
- disabled;
- manual-input.

---

## 29.4. Validado

Mostrar identidad reconocida inmediatamente.

Ejemplo:

```text
✓ Juan Pérez
DNI 70123456
```

---

# 30. Scanner físico

El lector debe considerarse una entrada primaria.

Reglas:

- no exigir tocar el input antes de cada escaneo;
- mantener focus automáticamente;
- preparar el siguiente campo;
- evitar modales que roben focus;
- manejar escaneos rápidos consecutivos;
- no bloquear el flujo con confirmaciones innecesarias.

---

# 31. Teclado manual

Estado inicial:

```html
inputmode="none"
```

Botón teclado:

- activa modo manual;
- DNI → `numeric`;
- ticket → `text`;
- vuelve a scanner al completar/cancelar.

Debe existir feedback visual claro cuando el teclado manual está activo.

---

# 32. Flujo secuencial

Patrón:

```text
PASO 1
Identificar persona
[ ScanInput ]

↓ válido

PASO 2
Escanear ticket
[ ScanInput ]
```

Reglas:

- paso futuro atenuado;
- paso activo evidente;
- paso completado con check;
- foco automático;
- no mostrar controles irrelevantes.

---

# 33. StepCard

Debe contener:

- indicador de paso;
- título;
- instrucción corta;
- control;
- feedback.

Estados:

- pending;
- active;
- completed;
- error;
- disabled.

---

# 34. Tarjetas operativas

```css
background: #FFFFFF;
border-radius: 20px;
padding: 16px;
border: 1px solid var(--color-line-200);
box-shadow: var(--shadow-sm);
```

No usar más cards de las necesarias.

---

# 35. SessionStatusCard

Debe mostrar:

- estado de sesión;
- jabero;
- campaña/lote si corresponde;
- variedad si aplica;
- hora de inicio;
- total actual.

Debe ser compacta.

---

# 36. MetricCard

Ejemplo:

```text
┌──────────────────┐
│ Total sesión     │
│ 28               │
└──────────────────┘
```

Reglas:

- máximo 2 métricas principales simultáneas;
- número grande;
- label corto;
- unidad clara.

---

# 37. FeedbackMessage

## Éxito

```text
✓ +1 jaba — Juan Pérez
```

## Error

Debe decir:

1. qué pasó;
2. qué hacer.

Ejemplo:

```text
Ticket ya utilizado
Escanee otro ticket.
```

## Warning

```text
Sin conexión
Puede continuar trabajando.
```

---

# 38. Feedback inmediato

Después de cada escaneo válido:

- feedback visual;
- feedback textual;
- sonido/haptic solo si existe soporte y está bien definido;
- foco al siguiente paso.

No dejar al usuario preguntándose si se registró.

---

# 39. Conectividad

## Normal

Oculta.

## Offline

Banner compacto:

```text
Sin conexión · los registros se guardarán localmente
```

## Pendientes

```text
3 registros pendientes
```

## Error

```text
1 registro necesita atención
[ Revisar ]
```

---

# 40. Sincronización

La sincronización debe ser invisible cuando funciona.

Solo mostrar:

- pendientes;
- errores;
- bloqueo real;
- necesidad de intervención.

No usar una pantalla de “sincronizando…” para cada operación local.

---

# 41. Offline-first

La UI debe reflejar el modelo:

```text
acción
→ guardado local
→ feedback inmediato
→ sincronización posterior
```

No debe parecer que una operación falló solo porque el servidor no respondió en ese momento si ya se guardó localmente.

---

# 42. Estados provisionales

Cuando un dato existe solo localmente:

- puede marcarse como pendiente;
- no debe confundirse con error;
- debe mantener trazabilidad.

Ejemplo:

```text
Pendiente de sincronización
```

---

# 43. Error de sincronización

Pantalla de atención:

Debe listar:

- operación;
- hora;
- entidad;
- mensaje;
- estado;
- acción permitida.

Acciones posibles:

- reintentar;
- revisar;
- descartar solo si es seguro.

No exponer SQL/RPC/stack trace.

---

# 44. Tablas industriales

Uso:

- asignaciones;
- jaberos;
- producción;
- sesiones;
- consultas.

Apariencia:

```css
row-height: 48px;
font-size: 14px–16px;
```

Características:

- header sticky;
- divisores claros;
- nombres a izquierda;
- números a derecha;
- pocas columnas.

---

# 45. Prioridad de columnas

En PDA mostrar solo datos esenciales.

Ejemplo asignación:

| Cosechador | Lote/Ticket | Hora |
|---|---|---|

Ejemplo producción:

| Cosechador | Jabas | Última |
|---|---:|---|

El detalle puede abrir:

- bottom sheet;
- pantalla secundaria;
- fila expandida.

---

# 46. Búsqueda y filtros

Patrón:

```text
[ Buscar…                     ][ filtro ]
[ Todos ][ Activos ][ Con jabas ]
```

Reglas:

- búsqueda visible si el volumen lo justifica;
- chips para filtros frecuentes;
- filtros complejos en bottom sheet.

---

# 47. FilterChip

Estados:

- default;
- selected;
- disabled.

Debe tener targets táctiles adecuados.

---

# 48. Empty State

Nunca dejar una tabla vacía sin explicación.

Ejemplos:

```text
No hay tickets asignados hoy.
```

```text
No hay jaberos registrados en esta campaña.
```

```text
Aún no hay jabas registradas en esta sesión.
```

No usar ilustraciones grandes en estados vacíos operativos.

---

# 49. Confirmaciones

Usar solo cuando la acción tenga impacto real.

Ejemplos:

- finalizar sesión;
- abandonar una operación con cambios;
- descartar una cola problemática.

Evitar:

- confirmación por cada escaneo;
- confirmación de acciones reversibles;
- confirmaciones repetitivas.

---

# 50. Loading

## Acción corta

Usar texto/botón:

```text
Validando…
Guardando…
Sincronizando…
```

## Tabla

Skeleton simple.

Evitar spinner de pantalla completa salvo carga inicial crítica.

---

# 51. Disabled

Debe ser evidente.

```css
opacity: 1;
background: var(--color-disabled-bg);
color: var(--color-disabled-fg);
border-color: var(--color-line-200);
```

No depender solo de opacidad.

---

# 52. Login / acceso operativo

La experiencia puede tener dos contextos según flujo:

- acceso de cuenta GesGROW;
- autorización operativa legacy por DNI mientras exista.

No deben mezclarse visualmente.

---

## 52.1. Login de cuenta

Debe incluir:

- marca GesGROW;
- email;
- contraseña;
- ingresar.

---

## 52.2. Autorización por DNI

Si continúa existiendo como flujo operativo:

- DNI dominante;
- ScanInput;
- teclado manual;
- nombre reconocido;
- feedback inmediato.

Debe estar marcado como contexto de operación, no como cuenta IAM.

---

# 53. Home de Field

Contenido principal actual:

- Asignación de tickets;
- Registro de jaberos;
- Lectura de jabas;
- Consultas.

No usar tarjetas verticales full-width si caben dos por fila.

---

# 54. Asignación de tickets

La UI debe reflejar la regla actual:

> Escanear un ticket de un lote asigna el lote completo al cosechador.

No presentar la operación como si se asignara únicamente un sticker aislado.

---

## 54.1. Flujo

1. escanear cosechador;
2. mostrar trabajador;
3. habilitar escaneo de ticket;
4. escanear ticket;
5. resolver lote;
6. asignar lote;
7. mostrar éxito;
8. preparar siguiente operación.

---

## 54.2. Feedback

Ejemplo:

```text
Lote asignado
Juan Pérez
10 tickets disponibles
```

No mostrar únicamente:

```text
Ticket asignado
```

si la semántica real es lote completo.

---

# 55. Asignaciones — consulta

Opciones:

- Operar;
- Asignados hoy;
- Buscar.

Tabla sugerida:

| Cosechador | Lote | Tickets | Hora |
|---|---|---:|---|

---

# 56. Registro de jaberos

## Flujo

1. escanear DNI;
2. validar trabajador;
3. comprobar aptitud/participación;
4. registrar jornada;
5. mostrar éxito;
6. reset.

---

## Feedback

```text
Jabero registrado
María Torres
```

---

# 57. Jaberos — consulta

Opciones:

- Registrar;
- Jaberos activos;
- Buscar.

Tabla:

| Jabero | DNI | Estado |
|---|---|---|

---

# 58. Lectura de jabas

Es uno de los flujos de mayor frecuencia.

Debe ser extremadamente rápido.

---

## 58.1. Vista operativa

Debe incluir:

- sesión activa;
- jabero;
- contexto;
- ScanInput;
- última lectura;
- total sesión;
- cosechador actual;
- finalizar.

---

## 58.2. Consumo único

La UI debe asumir:

> cada Ticket físico solo puede producir un RegistroCosecha válido.

Si se vuelve a escanear:

```text
Ticket ya utilizado
Escanee otro ticket.
```

No sugerir que se puede registrar nuevamente.

---

## 58.3. Worker derivado

El cosechador debe derivarse de la asignación del lote.

No pedir seleccionar manualmente cosechador para cada lectura si el sistema ya puede resolverlo.

---

# 59. Lectura — feedback

Éxito:

```text
✓ +1 jaba
Juan Pérez
Total: 28
```

Debe desaparecer o compactarse automáticamente para preparar siguiente lectura.

---

# 60. Lectura — consultas

Menú:

- Escanear;
- Cosechadores y jabas;
- Sesiones.

Producción:

| Cosechador | Jabas | Última lectura |
|---|---:|---|

---

# 61. Sesión activa

Debe ser visible sin ocupar demasiado alto.

Mostrar:

- jabero;
- campaña;
- estado;
- total;
- hora.

No repetir datos secundarios si ya aparecen en otro bloque.

---

# 62. Finalizar sesión

No tratarla automáticamente como acción destructiva.

Puede usar:

- secondary;
- warning;
- confirmation dialog.

La confirmación debe indicar impacto real.

Ejemplo:

```text
Finalizar sesión

Ya no podrá registrar nuevas jabas en esta sesión.

[ Volver ] [ Finalizar ]
```

---

# 63. Consultas

Las pantallas de consulta pueden tener más información que las operativas.

Permitido:

- scroll;
- tablas;
- filtros;
- búsqueda;
- detalle.

Mantener targets grandes.

---

# 64. Campaign context

Cuando sea necesario mostrar campaña:

```text
Palta Hass 2026
```

Debe ser contexto, no un elemento dominante.

La selección de campaña no debe interrumpir constantemente la operación.

---

# 65. Farm Structure en Field

Field no necesita exponer toda la administración de:

```text
Fundo
Sector
Parcela
```

salvo que un flujo operativo futuro lo requiera.

Si se muestra, debe ser como contexto resumido.

Ejemplo:

```text
Fundo Quijas · Sector Norte
```

No convertir Field en gestor de Farm Structure.

---

# 66. Harvest domain language

Usar terminología coherente:

```text
Lote de tickets
Ticket
Asignación
Registro de cosecha
Jaba
Sesión
Cosechador
Jabero
```

Evitar usar “lote” sin contexto cuando pueda confundirse con parcela o lote operativo agrícola.

---

# 67. Iconografía

Estilo:

- lineal/semi-sólido;
- 1.75–2px;
- formas simples;
- alto contraste.

Tamaños:

```text
navigation     20–24px
home tile      28–36px
icon buttons   20–24px
```

---

# 68. Iconografía agrícola

Puede incluir:

- caja/jaba;
- ticket;
- trabajador;
- scanner;
- cultivo;
- lote;
- sesión;
- parcela;
- cosecha.

No usar emojis como iconos finales.

---

# 69. Recursos visuales

Field debe evitar:

- fotografías;
- ilustraciones grandes;
- fondos complejos;
- hero images.

La operación debe dominar.

---

# 70. Responsive

Target principal:

```text
360px – 480px
```

Orientación:

```text
vertical
```

Secundarios:

- móviles grandes;
- tablets.

---

# 71. Breakpoints orientativos

```text
< 360px       → soporte mínimo
360–480px     → PDA principal
481–767px     → móvil grande
≥ 768px       → tablet
```

Field sigue siendo una experiencia táctil incluso en tablet.

---

# 72. PDA

Reglas:

- padding 16px;
- home 2 columnas;
- botones full-width en acción principal;
- controles 48–64px;
- tablas reducidas;
- evitar scroll horizontal.

---

# 73. Tablet

Puede aumentar:

- ancho de tabla;
- columnas visibles;
- espacio lateral;
- paneles secundarios.

No convertir automáticamente el layout en Portal.

---

# 74. Accesibilidad

Requisitos:

- texto operativo ≥ 16px;
- control táctil ≥ 48px;
- botón operativo 52–56px;
- ScanInput 64px;
- focus visible;
- contraste alto;
- labels;
- error asociado;
- estados no solo por color.

---

# 75. Focus

```css
outline: 3px solid rgba(38, 115, 74, 0.22);
outline-offset: 2px;
```

El scanner debe recuperar focus correctamente después de una acción.

---

# 76. Microcopy

Voz:

- directa;
- profesional;
- breve;
- útil;
- cercana.

Correcto:

```text
Escanee el DNI del cosechador
```

```text
Lote ya asignado
Escanee otro ticket.
```

```text
Sin conexión
Puede continuar trabajando.
```

Evitar:

```text
Operación inválida.
```

```text
Error 400.
```

```text
Se ha producido una excepción inesperada.
```

---

# 77. Jerarquía de mensajes

## Nivel 1 — Acción

Qué debe hacer.

## Nivel 2 — Estado

Qué acaba de ocurrir.

## Nivel 3 — Contexto

Persona, campaña, lote, sesión.

## Nivel 4 — Metadatos

Hora, identificadores, detalles.

---

# 78. Do

- controles grandes;
- alto contraste;
- home 2 columnas;
- scanner dominante;
- foco automático;
- feedback inmediato;
- navegación contextual;
- bottom sheets;
- tablas compactas;
- filtros simples;
- estado de sesión claro;
- copy breve;
- offline-first;
- identidad GesGROW;
- color verde consistente.

---

# 79. Don't

- sidebar;
- dark mode;
- glassmorphism;
- dashboards densos;
- hero sections;
- cards de marketing;
- gradientes decorativos;
- texto pequeño;
- muchas acciones primarias;
- scroll operativo innecesario;
- confirmaciones por cada escaneo;
- navegación dependiente de hover;
- iconos pequeños;
- estados técnicos;
- selección manual que el sistema puede derivar;
- lenguaje de Portal copiado a Field.

---

# 80. Componentes Field oficiales

La implementación debe reutilizar:

- `FieldAppHeader`
- `ContextMenuButton`
- `HomeActionTile`
- `PrimaryButton`
- `SecondaryButton`
- `DangerButton`
- `IconButton`
- `ScanInput`
- `KeyboardToggleButton`
- `StepCard`
- `SessionStatusCard`
- `MetricCard`
- `StatusBanner`
- `FeedbackMessage`
- `FilterBar`
- `FilterChip`
- `IndustrialTable`
- `EmptyState`
- `BottomSheet`
- `ConfirmationDialog`
- `SyncStatus`
- `PendingOperationBadge`

Los nombres finales pueden ajustarse en código, pero los conceptos deben permanecer consistentes.

---

# 81. Estados de componentes

Todo componente interactivo debe contemplar:

```text
default
focus
pressed
disabled
loading
success
warning
error
```

Y cuando aplique:

```text
offline
pending
synced
rejected
```

---

# 82. Checklist de pantalla operativa

- [ ] Acción principal entendible en menos de 2 segundos
- [ ] Flujo normal sin scroll
- [ ] Input principal visible
- [ ] Targets ≥ 48px
- [ ] Focus visible
- [ ] Scanner preparado
- [ ] Teclado manual accesible
- [ ] Disabled claro
- [ ] Éxito breve
- [ ] Error indica qué hacer
- [ ] Siguiente paso evidente
- [ ] Conectividad oculta si todo funciona
- [ ] Sin texto técnico
- [ ] Paleta oficial
- [ ] Componentes reutilizados
- [ ] Funciona offline cuando el flujo lo requiere

---

# 83. Checklist de consulta

- [ ] Búsqueda visible
- [ ] Filtros claros
- [ ] Header sticky si aplica
- [ ] Solo columnas esenciales
- [ ] Números alineados
- [ ] Estado vacío
- [ ] Filas tocables
- [ ] Detalle bajo demanda
- [ ] Sin scroll horizontal innecesario
- [ ] Targets táctiles correctos
- [ ] Loading/error definidos

---

# 84. Checklist de accesibilidad de campo

- [ ] Contraste alto
- [ ] Legible bajo sol
- [ ] Texto ≥ 16px en contenido operativo
- [ ] Targets grandes
- [ ] Estados no dependen solo de color
- [ ] Inputs accesibles
- [ ] Focus visible
- [ ] Error legible
- [ ] Controles alejados de bordes críticos
- [ ] Teclado virtual no interrumpe scanner
- [ ] Feedback no depende solo de sonido

---

# 85. Checklist de offline

- [ ] Operación puede guardarse localmente
- [ ] Feedback local inmediato
- [ ] Pendientes diferenciados de error
- [ ] Sincronización invisible cuando funciona
- [ ] Error visible cuando requiere intervención
- [ ] Reintento disponible
- [ ] Rechazo mantiene trazabilidad
- [ ] Usuario entiende si puede continuar
- [ ] No se pierde focus innecesariamente

---

# 86. Checklist de Asignación

- [ ] Cosechador validado
- [ ] Ticket escaneado
- [ ] Lote resuelto
- [ ] UI comunica asignación de lote
- [ ] Lote ya asignado se rechaza
- [ ] Siguiente operación preparada
- [ ] Offline preservado
- [ ] Feedback muestra trabajador

---

# 87. Checklist de Jaberos

- [ ] DNI validado
- [ ] Trabajador visible
- [ ] Aptitud/participación validada
- [ ] Registro exitoso claro
- [ ] Duplicado tratado correctamente
- [ ] Reset automático
- [ ] Consulta disponible

---

# 88. Checklist de Lectura

- [ ] Sesión visible
- [ ] Jabero visible
- [ ] ScanInput dominante
- [ ] Ticket consumido una sola vez
- [ ] Cosechador derivado
- [ ] Total actualizado
- [ ] Feedback inmediato
- [ ] Segundo escaneo duplicado rechazado
- [ ] Offline no bloquea operación
- [ ] Finalizar sesión separado de escanear

---

# 89. Evolución futura

Field debe poder crecer sin perder su lenguaje operativo.

Futuros módulos pueden incorporar patrones como:

```text
Escanear activo
→ validar
→ registrar estado
→ feedback
```

o:

```text
Seleccionar tarea
→ identificar recurso
→ ejecutar
→ confirmar
```

No crear un Design System nuevo por módulo.

Reutilizar:

- Scanner;
- StepCard;
- SessionStatus;
- Feedback;
- Offline;
- tablas compactas;
- navegación contextual.

---

# 90. Criterio de aprobación

Una nueva pantalla Field debe responder sí a:

1. ¿La acción principal se entiende inmediatamente?
2. ¿Puede operarse bajo luz fuerte?
3. ¿Los controles son fáciles de tocar?
4. ¿Evita scroll innecesario?
5. ¿El scanner funciona sin fricción?
6. ¿El siguiente paso es evidente?
7. ¿El error explica qué hacer?
8. ¿Puede continuar offline cuando corresponde?
9. ¿Usa tokens de GesGROW?
10. ¿Se siente hermana del Portal sin parecer Portal móvil?
11. ¿La identidad agrícola está presente?
12. ¿La interacción se siente robusta?
13. ¿El operador puede repetir la tarea muchas veces sin fatiga visual?

---

# 91. Principio final

> **Field debe hacer que la operación agrícola se sienta inmediata, segura y predecible.**

GesGROW Field combina:

```text
identidad agrícola
+
robustez
+
scanner
+
offline
+
claridad
+
feedback inmediato
```

La prioridad máxima es que el operador siempre pueda responder:

> **¿Qué debo escanear?**  
> **¿Qué acaba de pasar?**  
> **¿Qué hago ahora?**

Si una pantalla no responde esas preguntas con claridad, todavía no está terminada.
