# GesGROW — Foundations

> Especificación de fundamentos visuales y tokens del Design System de GesGROW.
>
> Este documento define las bases compartidas por todas las superficies del producto. La versión actual incorpora la **paleta cromática V2** para ampliar el vocabulario visual sin perder la identidad verde de GesGROW:
>
> - Portal Web de Gestión;
> - Aplicación de Campo;
> - futuros módulos y clientes.
>
> Los fundamentos deben mantenerse estables y reutilizables. Las diferencias entre Portal y Field deben resolverse mediante variantes de densidad, interacción y layout, no creando identidades visuales separadas.

---

# 1. Objetivo

Los Foundations de GesGROW deben asegurar:

- coherencia visual;
- escalabilidad;
- accesibilidad;
- consistencia entre Portal y Field;
- soporte para light/dark en Portal;
- soporte para light-only en Field;
- implementación mediante design tokens;
- independencia respecto de un framework CSS específico.

La regla principal es:

> **Una identidad compartida, varias densidades y contextos de uso.**

---

# 2. Arquitectura de tokens

Se recomienda estructurar los tokens en tres niveles:

```text
Primitive tokens
    ↓
Semantic tokens
    ↓
Component tokens
```

Ejemplo:

```text
green.700
    ↓
color.action.primary
    ↓
button.primary.background
```

Los componentes no deberían depender directamente de hexadecimales cuando exista un token semántico equivalente.

---

# 3. Convención de nombres

Formato recomendado:

```text
category.role.variant.state
```

Ejemplos:

```text
color.brand.700
color.text.primary
color.surface.canvas
color.border.subtle
button.primary.background
input.border.focus
chart.series.primary
```

Para CSS:

```css
--color-brand-700
--color-text-primary
--color-surface-canvas
--button-primary-bg
```

---

# 4. Sistema cromático V2

GesGROW utiliza una paleta agrícola contemporánea formada por:

```text
Grow Green       → identidad principal
Harvest Gold     → cosecha / atención / actualidad
Water Aqua       → clima / ambiente / segunda serie
Sky Blue         → información / comparación
Soil Terracotta  → tierra / contraste cálido
Berry Violet     → analítica / comparación
Signal Red       → error / destructivo
```

### Regla global

> **El verde identifica a GesGROW; los colores secundarios amplían su lenguaje visual.**

No asignar permanentemente un color distinto a cada módulo.

## 4.1. Grow Green — Brand

```css
--green-950: #102A1D;
--green-900: #173F2B;
--green-800: #1F5A3A;
--green-700: #26734A;
--green-600: #2F8A57;
--green-500: #3A9C66;
--green-400: #68B286;
--green-300: #9CCDAF;
--green-200: #CFE6D7;
--green-100: #E8F4EC;
--green-050: #F4FAF6;
```

Uso:
- marca;
- primary actions;
- navegación activa;
- focus;
- selección;
- success cuando corresponda;
- primera serie de datos.

Evitar usar verde para cada card, borde, icono y serie simultáneamente.

## 4.2. Harvest Gold — Cosecha

```css
--harvest-700: #8D6A1F;
--harvest-600: #A67C22;
--harvest-500: #C69A2D;
--harvest-400: #DDB557;
--harvest-300: #E7C97D;
--harvest-200: #F1DEB0;
--harvest-100: #F8F0D8;
```

Los alias `--yellow-*` existentes permanecen solo por compatibilidad y deben resolver a esta familia Harvest.

Uso:
- cosecha;
- atención;
- dato reciente;
- highlights;
- acentos editoriales.

No usar como CTA principal global.

## 4.3. Water Aqua — Contexto ambiental

```css
--aqua-900: #0C5557;
--aqua-800: #12696B;
--aqua-700: #177F81;
--aqua-600: #239698;
--aqua-500: #2FAFB0;
--aqua-400: #52C0C0;
--aqua-300: #76CFCE;
--aqua-200: #AFE5E2;
--aqua-100: #DDF5F3;
--aqua-050: #F0FBFA;
```

Uso:
- clima;
- riego futuro;
- segunda serie analítica;
- superficies contextuales especiales.

## 4.4. Sky Blue — Información

```css
--sky-900: #263F5D;
--sky-800: #2F4E72;
--sky-700: #365F8A;
--sky-600: #426D9A;
--sky-500: #4F7CAC;
--sky-400: #6E93BC;
--sky-300: #8CAED1;
--sky-200: #BCD0E5;
--sky-100: #E5EFF8;
--sky-050: #F4F8FC;
```

Uso:
- información;
- estados informativos;
- series comparativas.

## 4.5. Soil Terracotta — Tierra

```css
--soil-900: #65311F;
--soil-800: #7D3D27;
--soil-700: #974A2E;
--soil-600: #AF5B38;
--soil-500: #C96F45;
--soil-400: #D98965;
--soil-300: #E3A083;
--soil-200: #EFC5B2;
--soil-100: #F8E9E2;
--soil-050: #FCF5F1;
```

Uso:
- comparaciones;
- contexto físico/tierra cuando exista semántica real;
- contraste cálido.

No usar como error.

## 4.6. Berry Violet — Analítica

```css
--berry-900: #3B316B;
--berry-800: #493D82;
--berry-700: #57499B;
--berry-600: #6657B1;
--berry-500: #7767C7;
--berry-400: #9184D4;
--berry-300: #AAA0DE;
--berry-200: #CFC8EC;
--berry-100: #EEEBFA;
--berry-050: #F7F5FD;
```

Uso:
- comparaciones;
- analítica;
- quinta serie.

## 4.7. Signal Red — Error

```css
--red-900: #6E211A;
--red-800: #842820;
--red-700: #9D3128;
--red-600: #B63930;
--red-500: #C4473A;
--red-400: #D66B61;
--red-300: #E6938B;
--red-200: #F2C1BC;
--red-100: #FBE9E7;
--red-050: #FEF5F4;
```

Uso:
- error;
- destructivo;
- conflicto crítico.

## 4.8. Warm Neutrals — Light

```css
--neutral-950: #17201A;
--neutral-900: #1F2A23;
--neutral-800: #2D3932;
--neutral-700: #46534B;
--neutral-600: #5D6A62;
--neutral-500: #748078;
--neutral-400: #99A39D;
--neutral-300: #BCC5BF;
--neutral-200: #DCE4DF;
--neutral-150: #E6ECE8;
--neutral-100: #EEF3F0;
--neutral-075: #F4F6F4;
--neutral-050: #F8FAF8;
--white: #FFFFFF;
```

El canvas debe ser más neutral que antes para permitir que los acentos respiren.

## 4.9. Dark Neutrals

```css
--dark-950: #090F0B;
--dark-900: #0D1410;
--dark-850: #101812;
--dark-800: #121A15;
--dark-750: #18221C;
--dark-700: #1E2A22;
--dark-600: #26332B;
--dark-500: #4B5A51;
--dark-400: #78867E;
--dark-300: #AAB7AF;
--dark-200: #CBD5CF;
--dark-100: #E2E9E5;
--dark-050: #F2F6F3;
```

El Portal en dark mode debe seguir sintiéndose verde-neutro, pero no monocromático.

# 5. Semantic Colors — Light Mode

```css
:root,
[data-theme="light"] {
  --color-brand-primary: var(--green-700);
  --color-brand-primary-hover: var(--green-800);
  --color-brand-primary-pressed: var(--green-900);
  --color-brand-soft: var(--green-100);
  --color-brand-softer: var(--green-050);

  --color-accent-harvest: var(--harvest-500);
  --color-accent-harvest-strong: var(--harvest-700);
  --color-accent-harvest-soft: var(--harvest-100);
  --color-accent-harvest-border: var(--harvest-300);
  --color-accent-harvest-text: #7A5A16;
  --color-accent-aqua: var(--aqua-500);
  --color-accent-sky: var(--sky-500);
  --color-accent-soil: var(--soil-500);
  --color-accent-berry: var(--berry-500);

  --color-text-primary: var(--neutral-950);
  --color-text-secondary: var(--neutral-700);
  --color-text-tertiary: var(--neutral-500);
  --color-text-inverse: var(--white);
  --color-text-disabled: var(--neutral-400);

  --color-surface-canvas: var(--neutral-075);
  --color-surface-page: var(--neutral-050);
  --color-surface-card: var(--white);
  --color-surface-subtle: var(--neutral-100);
  --color-surface-raised: var(--white);
  --color-surface-disabled: #EEF1EF;

  --color-border-subtle: var(--neutral-150);
  --color-border-default: var(--neutral-200);
  --color-border-strong: var(--neutral-300);
  --color-border-focus: var(--green-700);

  --color-overlay: rgba(16, 42, 29, 0.30);
}
```

# 6. Semantic Colors — Dark Mode

```css
[data-theme="dark"] {
  --color-brand-primary: #56B77A;
  --color-brand-primary-hover: #6AC68B;
  --color-brand-primary-pressed: #83D19D;
  --color-brand-soft: rgba(58, 156, 102, 0.18);
  --color-brand-softer: rgba(58, 156, 102, 0.10);

  --color-accent-harvest: #DDB557;
  --color-accent-harvest-strong: #F0D58A;
  --color-accent-harvest-soft: rgba(198, 154, 45, 0.14);
  --color-accent-harvest-border: rgba(221, 181, 87, 0.28);
  --color-accent-harvest-text: #F0D58A;
  --color-accent-aqua: #52C0C0;
  --color-accent-sky: #6E93BC;
  --color-accent-soil: #D98965;
  --color-accent-berry: #9184D4;

  --color-text-primary: var(--dark-050);
  --color-text-secondary: var(--dark-300);
  --color-text-tertiary: var(--dark-400);
  --color-text-inverse: var(--dark-950);
  --color-text-disabled: var(--dark-500);

  --color-surface-canvas: var(--dark-950);
  --color-surface-page: var(--dark-900);
  --color-surface-card: var(--dark-800);
  --color-surface-subtle: var(--dark-750);
  --color-surface-raised: var(--dark-700);
  --color-surface-disabled: var(--dark-750);

  --color-border-subtle: rgba(223, 231, 226, 0.08);
  --color-border-default: #26332B;
  --color-border-strong: rgba(223, 231, 226, 0.24);
  --color-border-focus: #6AC68B;

  --color-overlay: rgba(0, 0, 0, 0.58);
}
```

# 7. Semantic Status Colors

## 7.1. Success

```css
--success-bg: #E8F4EC;
--success-border: #BBDDC7;
--success-fg: #1F6B43;
--success-strong: #155232;
```

## 7.2. Warning

```css
--warning-bg: var(--color-accent-harvest-soft);
--warning-border: var(--color-accent-harvest-border);
--warning-fg: var(--color-accent-harvest-text);
--warning-strong: var(--color-accent-harvest-strong);
```

## 7.3. Error

```css
--error-bg: #FBE9E7;
--error-border: #F2C1BC;
--error-fg: #C4473A;
--error-strong: #842820;
```

## 7.4. Info

```css
--info-bg: #E5EFF8;
--info-border: #BCD0E5;
--info-fg: #365F8A;
--info-strong: #263F5D;
```

# 8. Reglas de color

```text
Green
→ brand / selección / éxito

Gold
→ cosecha / atención / reciente

Sky
→ información

Aqua
→ ambiente / clima / segunda serie

Soil
→ comparación cálida / físico

Berry
→ comparación analítica

Red
→ error real
```

No usar colores secundarios para convertir cada módulo en una marca distinta.

## 8.1. Contextual Gradients

Los gradientes se permiten solo en superficies especiales.

### Weather

```css
--gradient-weather-light:
  linear-gradient(135deg, #BDE6D4 0%, #42BFC0 52%, #F4E5B7 100%);

--gradient-weather-dark:
  linear-gradient(135deg, #17443D 0%, #1F7375 55%, #6A5B27 100%);
```

Usos válidos:
- WeatherCard;
- hero contextual;
- superficies especiales de alto nivel.

No usar gradientes en todas las cards.
# 9. Contraste

Objetivo mínimo:

- texto normal: WCAG AA;
- texto grande: WCAG AA;
- componentes interactivos: contraste suficiente contra el fondo;
- focus claramente distinguible.

En Field, priorizar contraste incluso por encima de sutileza visual.

---

# 10. Tipografía

## 10.1. Familia principal

```css
--font-family-sans:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Inter es la tipografía oficial de producto.

---

## 10.2. Fuente de datos numéricos

Usar Inter también para métricas.

Cuando sea útil:

```css
font-variant-numeric: tabular-nums;
```

Aplicar en:

- tablas;
- KPIs;
- rankings;
- cantidades;
- fechas;
- horas;
- valores monetarios futuros.

---

# 11. Escala tipográfica

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
--font-size-5xl: 2.5rem;    /* 40px */
--font-size-6xl: 3rem;      /* 48px */
```

---

# 12. Pesos tipográficos

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-heavy: 750;
```

Evitar pesos excesivamente finos.

---

# 13. Line Heights

```css
--line-height-tight: 1.10;
--line-height-snug: 1.25;
--line-height-normal: 1.50;
--line-height-relaxed: 1.65;
```

---

# 14. Tracking

```css
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.02em;
```

Usar tracking tight principalmente en títulos grandes y métricas.

---

# 15. Roles tipográficos globales

## Display

```css
font-size: var(--font-size-5xl);
font-weight: 750;
line-height: 1;
letter-spacing: -0.03em;
```

Uso limitado.

---

## Page Title

```css
font-size: var(--font-size-3xl);
font-weight: 700;
line-height: 1.15;
letter-spacing: -0.02em;
```

---

## Section Title

```css
font-size: var(--font-size-2xl);
font-weight: 700;
line-height: 1.2;
```

---

## Card Title

```css
font-size: var(--font-size-lg);
font-weight: 600;
line-height: 1.3;
```

---

## Body

```css
font-size: var(--font-size-base);
font-weight: 400;
line-height: 1.5;
```

---

## Label

```css
font-size: var(--font-size-sm);
font-weight: 600;
line-height: 1.3;
```

---

## Caption

```css
font-size: var(--font-size-sm);
font-weight: 400;
line-height: 1.4;
```

---

## Metric

```css
font-size: var(--font-size-5xl);
font-weight: 750;
line-height: 1;
letter-spacing: -0.03em;
font-variant-numeric: tabular-nums;
```

---

# 16. Escalas por superficie

## Portal

Puede usar:

```text
Body: 14–16px
Table: 14px
Label: 13–14px
Page title: 28–32px
```

---

## Field

Debe priorizar legibilidad:

```text
Body operativo: 18px
Body general: 16px
Input: 18px
Metric: 36–40px
```

No reducir texto operativo por debajo de 16px.

---

# 17. Spacing Scale

Base de 4px.

```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

Usar múltiplos de 4 siempre que sea posible.

---

# 18. Ritmo de espaciado

## Micro spacing

```text
4–8px
```

Para:

- icono + texto;
- pequeños labels;
- badges.

---

## Component spacing

```text
12–20px
```

Para:

- inputs;
- buttons;
- contenido de card;
- filas.

---

## Section spacing

```text
24–40px
```

Para:

- bloques;
- secciones;
- grupos de formulario.

---

## Page spacing

```text
32–64px
```

Solo en layouts que lo soporten.

Field debe ser más compacto verticalmente.

---

# 19. Grid

## Portal

Grid base recomendado:

```text
12 columnas
```

Con gutters:

```text
24px desktop
20px laptop
16px tablet
```

---

## Field

Grid principal:

```text
1 columna
```

Home:

```text
2 columnas
```

Gutter:

```text
12px
```

---

# 20. Page Widths

## Portal

Orientaciones:

```css
--content-max-standard: 1440px;
--content-max-form: 960px;
--content-max-narrow: 720px;
```

Páginas de datos pueden usar ancho completo disponible.

---

## Field

Usar ancho completo con:

```text
16–20px padding lateral
```

---

# 21. Breakpoints

```css
--breakpoint-xs: 360px;
--breakpoint-sm: 480px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

Interpretación:

```text
< 360px       soporte mínimo
360–479px     PDA / móvil
480–767px     móvil grande
768–1023px    tablet
1024–1279px   laptop
1280–1535px   desktop
≥ 1536px      desktop amplio
```

---

# 22. Density Tokens

GesGROW debe permitir al menos dos densidades.

## Portal Density

```css
--density-control-height: 42px;
--density-row-height: 44px;
--density-icon-button: 40px;
--density-card-padding: 20px;
```

---

## Field Density

```css
--density-control-height: 56px;
--density-row-height: 48px;
--density-icon-button: 48px;
--density-card-padding: 16px;
--density-scan-input-height: 64px;
```

No mezclar densidades sin intención.

---

# 23. Touch Targets

Mínimo:

```css
--touch-target-min: 48px;
```

En Portal desktop puede haber controles visuales menores, pero el área interactiva debe ser suficientemente clara.

En Field, 48px es requisito estricto.

---

# 24. Radii

```css
--radius-xs: 6px;
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 18px;
--radius-xl: 22px;
--radius-2xl: 28px;
--radius-round: 999px;
```

Uso:

```text
badges/chips       round
inputs             md
buttons            md
cards              lg
dialogs/drawers    xl
bottom sheets      xl/2xl
```

---

# 25. Borders

```css
--border-width-hairline: 1px;
--border-width-default: 1px;
--border-width-strong: 1.5px;
--border-width-focus: 2px;
```

Evitar bordes gruesos salvo casos funcionales.

---

# 26. Shadows

```css
--shadow-xs: 0 1px 3px rgba(21, 32, 25, 0.04);
--shadow-sm: 0 3px 10px rgba(21, 32, 25, 0.06);
--shadow-md: 0 4px 14px rgba(21, 32, 25, 0.08);
--shadow-lg: 0 10px 28px rgba(21, 32, 25, 0.12);
--shadow-xl: 0 18px 48px rgba(21, 32, 25, 0.16);
```

Dark mode debe depender más de contraste de superficie/borde que de sombra.

---

# 27. Elevation Levels

```text
0  canvas
1  card
2  sticky / toolbar
3  dropdown / popover
4  drawer / sidebar raised
5  dialog / modal
6  critical overlay
```

La elevación debe usarse con moderación.

---

# 28. Glass Tokens

Solo Portal.

Light:

```css
--glass-bg-light: rgba(255, 255, 255, 0.78);
--glass-border-light: rgba(255, 255, 255, 0.58);
--glass-blur: 16px;
```

Dark:

```css
--glass-bg-dark: rgba(20, 30, 24, 0.78);
--glass-border-dark: rgba(223, 231, 226, 0.10);
```

Regla:

> Glass es un detalle, no una superficie universal.

No usar glass en Field.

---

# 29. Motion

```css
--motion-instant: 80ms;
--motion-fast: 120ms;
--motion-base: 160ms;
--motion-slow: 220ms;
--motion-panel: 240ms;
```

---

# 30. Easing

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-enter: cubic-bezier(0, 0, 0.2, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
```

Evitar curvas elásticas.

---

# 31. Motion Principles

Motion debe:

- comunicar;
- orientar;
- confirmar;
- suavizar.

No debe:

- entretener;
- retrasar;
- distraer;
- bloquear operación.

Field debe ser más rápido que Portal.

---

# 32. Reduced Motion

Respetar:

```css
@media (prefers-reduced-motion: reduce)
```

Reducir o eliminar:

- expansión animada;
- desplazamientos;
- transiciones no esenciales.

---

# 33. Z-index Scale

```css
--z-base: 0;
--z-sticky: 100;
--z-dropdown: 200;
--z-popover: 300;
--z-sidebar: 400;
--z-drawer: 500;
--z-overlay: 600;
--z-dialog: 700;
--z-toast: 800;
--z-tooltip: 900;
```

Evitar valores arbitrarios como `99999`.

---

# 34. Iconografía

Características:

- lineal o semi-sólida;
- grosor 1.75–2px;
- esquinas suaves;
- lenguaje consistente;
- sin mezcla de familias.

---

# 35. Tamaños de iconos

```css
--icon-xs: 14px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
--icon-2xl: 36px;
```

Uso:

```text
Portal table/action      16–20px
Portal navigation        18–22px
Field navigation         20–24px
Field home               28–36px
```

---

# 36. Iconografía agrícola

Puede incluir símbolos para:

- cultivo;
- fundo;
- sector;
- parcela;
- cosecha;
- caja/jaba;
- ticket;
- scanner;
- trabajador;
- maquinaria;
- riego;
- calidad;
- inventario.

Deben derivarse del mismo estilo.

---

# 37. Focus Ring

Global:

```css
--focus-ring-color: rgba(38, 115, 74, 0.22);
--focus-ring-width: 3px;
--focus-ring-offset: 2px;
```

Ejemplo:

```css
outline: var(--focus-ring-width) solid var(--focus-ring-color);
outline-offset: var(--focus-ring-offset);
```

Nunca eliminar focus sin reemplazo visible.

---

# 38. Hover

Hover aplica principalmente al Portal.

Debe ser:

- ligero;
- visible;
- no dependiente de color solamente.

Ejemplos:

- background sutil;
- border;
- cambio de elevación;
- icon color.

Field no debe depender de hover.

---

# 39. Pressed / Active

Debe dar feedback rápido.

Puede usar:

- leve oscurecimiento;
- reducción visual mínima;
- cambio de superficie.

Evitar escalados exagerados.

---

# 40. Disabled

```css
--disabled-bg: #EEF1EF;
--disabled-fg: #98A39C;
--disabled-border: #E3E8E5;
```

No depender únicamente de `opacity`.

El estado disabled debe seguir siendo legible.

---

# 41. Selection

Seleccionado:

```css
background: var(--color-brand-soft);
color: var(--color-brand-primary);
border-color: var(--color-brand-primary);
```

Debe acompañarse de:

- check;
- indicator;
- icon;
- border;
- weight.

---

# 42. Surface Hierarchy

## Light

```text
Canvas       #F4F6F4
Page         #F8FAF8
Card         #FFFFFF
Subtle       #EEF3F0
Raised       #FFFFFF
```

## Dark

```text
Canvas       #090F0B
Page         #0D1410
Card         #121A15
Subtle       #18221C
Raised       #1E2A22
```

El objetivo es que dark mode mantenga un matiz verde-neutro sin que todas las superficies parezcan variantes del mismo verde.
# 43. Background Principles

Portal:

- puede usar superficies diferenciadas;
- puede incluir glass puntual;
- debe evitar un canvas blanco plano absoluto.

Field:

- fondo claro;
- cards blancas;
- contraste alto;
- sin transparencias complejas.

---

# 44. Image Treatment

Si se usan fotografías:

- agrícolas reales;
- alta calidad;
- naturales;
- evitar stock cliché;
- evitar saturación excesiva;
- mantener legibilidad de texto.

Uso principal:

- login;
- onboarding;
- comunicación de marca.

No usar fotografías como fondo de tablas o flujos operativos.

---

# 45. Illustration Style

Si se introducen ilustraciones:

- simples;
- geométricas;
- modernas;
- inspiradas en agricultura;
- alineadas con la paleta.

Evitar:

- estilo infantil;
- caricaturas;
- 3D decorativo;
- ilustraciones detalladas en operaciones.

---

# 46. Data Density

La densidad debe responder al contexto.

Portal:

```text
media / alta
```

Field:

```text
baja / media
```

La reducción de densidad no debe lograrse con tamaño de texto excesivamente pequeño.

---

# 47. Numerals and Units

Formato:

```text
1,284 jabas
24.8 ha
86 %
S/ 12,500
```

Las unidades deben ser visibles.

No mezclar unidades sin contexto.

Usar tabular numbers en tablas y métricas.

---

# 48. Date and Time

Formato recomendado para UI local:

```text
14 oct 2026
14 oct 2026 · 08:42
08:42
```

En campos/formularios puede utilizarse formato completo según necesidad.

Evitar timestamps técnicos ISO visibles al usuario final.

---

# 49. Status Language

Preferir etiquetas humanas:

```text
Activo
Inactivo
Pendiente
Sin conexión
Sincronizado
Cerrada
Programado
Consumido
Disponible
```

Evitar enums técnicos:

```text
ACTIVE
PENDING_SYNC
CLOSED_CAMPAIGN
```

---

# 50. Layout Tokens — Portal

```css
--portal-sidebar-collapsed: 72px;
--portal-sidebar-expanded: 248px;
--portal-topbar-height: 64px;
--portal-page-padding-x: 24px;
--portal-page-padding-y: 24px;
--portal-content-max: 1440px;
```

En desktop amplio puede aumentar el padding horizontal.

---

# 51. Layout Tokens — Field

```css
--field-header-height: 56px;
--field-page-padding-x: 16px;
--field-page-padding-y: 16px;
--field-home-gap: 12px;
--field-scan-input-height: 64px;
```

---

# 52. Sidebar Foundation

Portal desktop:

```text
collapsed width   72px
expanded width    248px
```

Debe preservar:

- icon alignment;
- focus;
- selected state;
- keyboard access;
- reduced motion.

---

# 53. Container Philosophy

No usar una sola “mega card” para toda la página.

Preferir:

```text
canvas
  ├── page header
  ├── controls
  ├── sections
  └── cards solo donde exista agrupación
```

---

# 54. Tables Foundation

Tokens orientativos:

```css
--table-row-height-compact: 40px;
--table-row-height-default: 44px;
--table-row-height-field: 48px;
--table-cell-padding-x: 12px;
--table-cell-padding-y: 8px;
```

Header:

```text
semibold
alto contraste
sticky cuando aplique
```

---

# 55. Form Foundation

Portal:

```text
input height 40–44px
label 13–14px
2 columnas máximo como patrón normal
```

Field:

```text
input height 56px
ScanInput 64px
label 15–16px
```

---

# 56. Buttons Foundation

Portal:

```text
compact     36–40px
default     40–44px
prominent   44–48px
```

Field:

```text
secondary   52px
primary     56px
```

---

# 57. Card Foundation

Portal:

```css
border-radius: var(--radius-lg);
padding: 20px;
```

Field:

```css
border-radius: 20px;
padding: 16px;
```

Ambos:

- border sutil;
- shadow baja;
- surface semántica.

---

# 58. Overlay Foundation

Overlay light:

```css
background: rgba(16, 42, 29, 0.30);
```

Overlay dark:

```css
background: rgba(0, 0, 0, 0.56);
```

Debe mantener contexto sin distraer.

---

# 59. Dialog Foundation

Portal:

```text
radius 18–22px
max-width según tarea
padding 24px
```

Field:

```text
preferir confirmaciones compactas
targets ≥ 48px
```

---

# 60. Toast Foundation

Debe:

- ser breve;
- tener icono semántico;
- poder cerrarse;
- no ocultar controles críticos.

Duración suficiente para lectura.

Errores críticos no deben depender solo de toast.

---

# 61. Accessibility — Color

No usar:

```text
verde vs rojo
```

como única diferencia.

Agregar:

- icono;
- label;
- texto;
- patrón;
- posición.

---

# 62. Accessibility — Keyboard

Portal debe soportar:

- Tab;
- Shift+Tab;
- Enter;
- Space;
- Escape;
- flechas donde el patrón lo requiera.

Field puede usar teclado físico si está disponible, pero el foco principal sigue siendo táctil/scanner.

---

# 63. Accessibility — Labels

Todo control debe tener:

- label visible;
- `aria-label`;
- `aria-labelledby`;

según corresponda.

Placeholder no sustituye label.

---

# 64. Accessibility — Error

Los errores deben:

- asociarse al control;
- ser legibles;
- describir cómo resolver;
- persistir hasta ser entendidos/corregidos.

---

# 65. Accessibility — Motion

Respetar reduced motion.

No usar animaciones parpadeantes.

---

# 66. Accessibility — Charts

Los gráficos deberán:

- tener título;
- labels;
- contraste;
- tooltip accesible;
- tabla alternativa cuando los datos sean críticos.

La especificación detallada vive en `data-viz.md`.

---

# 67. Theme Behavior

Portal:

```text
Sistema
Claro
Oscuro
```

La preferencia debe persistir.

Field:

```text
Claro
```

sin selector de tema.

---

# 68. Brand Consistency

El verde y amarillo deben ser reconocibles en todas las superficies, pero no dominar cada pantalla.

GesGROW debe poder reconocerse también por:

- tipografía;
- espaciado;
- iconografía;
- movimiento;
- radios;
- jerarquía;
- tono visual.

---

# 69. Agricultural Identity

Los fundamentos deben permitir expresar agricultura mediante:

- verdes naturales;
- amarillo cosecha;
- superficies cálidas;
- iconos del dominio;
- datos agrícolas;
- patrones visuales puntuales.

No mediante:

- textura de tierra;
- hojas repetidas;
- fondos rurales decorativos;
- exceso de ilustración.

---

# 70. Premium Quality

La percepción premium debe venir de:

- consistencia;
- precisión;
- buen spacing;
- motion;
- contraste;
- tipografía;
- estados completos;
- dark mode cuidado;
- microinteracciones.

No de:

- glass extremo;
- gradients llamativos;
- sombras fuertes;
- exceso de animación.

---

# 71. CSS Token Starter V2

```css
:root {
  /* Brand */
  --green-950: #102A1D;
  --green-900: #173F2B;
  --green-800: #1F5A3A;
  --green-700: #26734A;
  --green-600: #2F8A57;
  --green-500: #3A9C66;
  --green-300: #9CCDAF;
  --green-100: #E8F4EC;

  /* Harvest */
  --harvest-700: #8D6A1F;
  --harvest-500: #C69A2D;
  --harvest-300: #E7C97D;
  --harvest-100: #F8F0D8;

  /* Aqua */
  --aqua-700: #177F81;
  --aqua-500: #2FAFB0;
  --aqua-300: #76CFCE;
  --aqua-100: #DDF5F3;

  /* Sky */
  --sky-700: #365F8A;
  --sky-500: #4F7CAC;
  --sky-300: #8CAED1;
  --sky-100: #E5EFF8;

  /* Soil */
  --soil-700: #974A2E;
  --soil-500: #C96F45;
  --soil-300: #E3A083;
  --soil-100: #F8E9E2;

  /* Berry */
  --berry-700: #57499B;
  --berry-500: #7767C7;
  --berry-300: #AAA0DE;
  --berry-100: #EEEBFA;

  /* Error */
  --red-700: #9D3128;
  --red-500: #C4473A;
  --red-300: #E6938B;
  --red-100: #FBE9E7;

  /* Light surfaces */
  --surface-canvas-light: #F4F6F4;
  --surface-page-light: #F8FAF8;
  --surface-card-light: #FFFFFF;
  --surface-raised-light: #EEF3F0;
  --text-primary-light: #17201A;
  --text-secondary-light: #536159;
  --border-light: #DCE4DF;

  /* Dark surfaces */
  --surface-canvas-dark: #090F0B;
  --surface-page-dark: #0D1410;
  --surface-card-dark: #121A15;
  --surface-raised-dark: #18221C;
  --text-primary-dark: #F2F6F3;
  --text-secondary-dark: #AAB7AF;
  --border-dark: #26332B;

  /* Radius */
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 22px;
  --radius-2xl: 28px;
  --radius-3xl: 32px;
  --radius-round: 999px;

  /* Interaction */
  --touch-target-min: 48px;
  --focus-ring-width: 3px;
  --focus-ring-offset: 2px;
  --focus-ring-color: rgba(38, 115, 74, 0.22);

  /* Portal */
  --portal-rail-width: 72px;
  --portal-navigation-panel-width: 290px;
  --portal-topbar-height: 64px;

  /* Field */
  --field-header-height: 56px;
  --field-scan-input-height: 64px;
}
```
# 72. Implementation Rules

La implementación debe:

- consumir tokens;
- evitar hexadecimales locales cuando exista token;
- evitar spacing arbitrario;
- evitar z-index arbitrario;
- usar las mismas semantic colors;
- respetar las densidades Portal/Field;
- mantener dark mode separado de Field;
- permitir evolución sin romper nombres semánticos.

---

# 73. Token Governance

Antes de crear un token nuevo:

1. comprobar si ya existe uno equivalente;
2. decidir si es primitive, semantic o component;
3. evitar nombres atados a una sola pantalla;
4. documentar su propósito;
5. comprobar light/dark si aplica;
6. comprobar Portal/Field si aplica.

---

# 74. No crear tokens como

Evitar:

```text
dashboard-green
harvest-card-yellow
login-shadow
campaign-padding
worker-list-gray
```

Preferir:

```text
color.brand.primary
color.accent.harvest
shadow.md
space.4
color.text.secondary
```

---

# 75. Checklist de Foundations

## Color
- [ ] Paleta primitive definida
- [ ] Semantic colors definidos
- [ ] Light mode completo
- [ ] Dark mode completo para Portal
- [ ] Field light-only
- [ ] Contraste revisado

## Typography
- [ ] Inter
- [ ] Escala consistente
- [ ] Pesos definidos
- [ ] Números tabulares donde corresponde

## Layout
- [ ] Spacing 4px
- [ ] Grid Portal
- [ ] Grid Field
- [ ] Breakpoints
- [ ] Page widths

## Interaction
- [ ] Focus
- [ ] Hover
- [ ] Pressed
- [ ] Disabled
- [ ] Selection
- [ ] Reduced motion

## Surface
- [ ] Radius
- [ ] Border
- [ ] Shadow
- [ ] Elevation
- [ ] Glass limitado a Portal

## Accessibility
- [ ] Color no es único indicador
- [ ] Keyboard
- [ ] Labels
- [ ] Focus visible
- [ ] Motion reducible
- [ ] Charts accesibles

---

# 76. Principio final

> **Los Foundations de GesGROW deben ser suficientemente estables para que Portal, Field y futuros módulos puedan evolucionar sin inventar una nueva identidad visual.**

La calidad del sistema debe surgir de:

```text
tokens consistentes
+
jerarquía
+
densidad contextual
+
accesibilidad
+
detalles refinados
```

No de estilos arbitrarios pantalla por pantalla.
