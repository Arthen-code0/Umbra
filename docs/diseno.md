# Plan de diseño — Umbra

> Escrito antes de programar ninguna pantalla, siguiendo el paso 3 de la skill
> `skill-diseño-y-codigo-frontend`. Referencia de contenido y requisitos:
> [`specs/umbra/spec.md`](./specs/umbra/spec.md).

## 1. Qué es la web

- **Qué**: la web de reservas de Umbra, un observatorio astronómico en la Sierra de Gredos.
- **Para quién**: parejas/familias urbanas que buscan una escapada distinta (sin conocimientos
  previos) y aficionados a la astronomía que valoran el detalle técnico.
- **Qué debe conseguir**: que reserven una experiencia. Todo el diseño empuja hacia
  "Ver experiencias" → "Reservar".
- **Tipo de web**: web de contenido con reserva (marketing + formulario), varias páginas, poca
  interactividad global salvo 3 islas puntuales → **Astro**, según `references/stack.md`.

No partimos de una rueda de colores: partimos de lo que se ve realmente en Umbra de noche —
el cielo casi negro con matices índigo, la plata fría de las estrellas, la silueta de la montaña, y
el único punto de luz cálido permitido en un observatorio: las linternas de luz roja/ámbar que usan
los astrónomos para no perder la visión nocturna. De ahí sale la pareja índigo/cobre que evita el
cliché "azul espacial con morado neón" de mil landings de astronomía genéricas.

## 2. Paleta

Construida en OKLCH (con hex de respaldo) siguiendo los roles de `color-tipografia.md`. Contraste
verificado con la fórmula WCAG de luminancia relativa (script de verificación en
`docs/diseno-contraste.md`).

### Modo oscuro (por defecto — el tema natural de un observatorio nocturno)

| Token                       | OKLCH                   | Hex       | Uso                                      |
| --------------------------- | ----------------------- | --------- | ---------------------------------------- |
| `--color-fondo`             | `oklch(0.16 0.035 262)` | `#0b0f1a` | Fondo general                            |
| `--color-superficie`        | `oklch(0.21 0.04 262)`  | `#131a2b` | Tarjetas, paneles                        |
| `--color-superficie-alta`   | `oklch(0.26 0.045 262)` | `#1b2438` | Elementos elevados, modales              |
| `--color-texto`             | `oklch(0.95 0.01 90)`   | `#f1eee6` | Texto principal (blanco cálido, no puro) |
| `--color-texto-suave`       | `oklch(0.72 0.03 265)`  | `#a8adc4` | Texto secundario, metadatos              |
| `--color-primario`          | `oklch(0.72 0.13 55)`   | `#d98a3d` | Botones y CTA (cobre/ámbar)              |
| `--color-primario-claro`    | `oklch(0.82 0.11 60)`   | `#f0b374` | Hover, enlaces sobre fondo oscuro        |
| `--color-primario-oscuro`   | `oklch(0.55 0.13 50)`   | `#a8631f` | Texto sobre `--color-primario-claro`     |
| `--color-acento`            | `oklch(0.74 0.08 205)`  | `#6fb8c9` | Detalles fríos (telescopio, datos)       |
| `--color-borde`             | `oklch(0.27 0.03 262)`  | `#232c48` | Divisores decorativos                    |
| `--color-borde-interactivo` | `oklch(0.52 0.06 265)`  | `#6b78ab` | Bordes de campos y controles             |
| `--color-exito`             | `oklch(0.72 0.11 155)`  | `#6fbf8b` | Confirmaciones                           |
| `--color-aviso`             | `oklch(0.8 0.13 85)`    | `#e0b84a` | Avisos                                   |
| `--color-error`             | `oklch(0.65 0.15 30)`   | `#e2694f` | Errores                                  |

### Modo claro (rediseñado, no invertido — "papel de atlas estelar" bajo el sol de la sierra)

| Token                       | OKLCH                  | Hex       | Uso                                          |
| --------------------------- | ---------------------- | --------- | -------------------------------------------- |
| `--color-fondo`             | `oklch(0.97 0.012 85)` | `#f7f4ee` | Fondo general (crema cálido, no blanco puro) |
| `--color-superficie`        | `oklch(1 0 0)`         | `#ffffff` | Tarjetas, paneles                            |
| `--color-superficie-alta`   | `oklch(0.94 0.014 85)` | `#eeeadf` | Elementos elevados                           |
| `--color-texto`             | `oklch(0.24 0.03 262)` | `#1c2236` | Texto principal (índigo casi negro)          |
| `--color-texto-suave`       | `oklch(0.46 0.03 265)` | `#5b5f76` | Texto secundario                             |
| `--color-primario`          | `oklch(0.47 0.14 50)`  | `#a3550f` | Botones y CTA                                |
| `--color-primario-claro`    | `oklch(0.58 0.13 55)`  | `#c97a2e` | Hover                                        |
| `--color-primario-oscuro`   | `oklch(0.4 0.12 48)`   | `#8a4a12` | Enlaces de texto (más contraste sobre crema) |
| `--color-acento`            | `oklch(0.46 0.06 205)` | `#256877` | Detalles fríos                               |
| `--color-borde`             | `oklch(0.9 0.02 85)`   | `#e4ddc9` | Divisores decorativos                        |
| `--color-borde-interactivo` | `oklch(0.58 0.03 85)`  | `#8b8367` | Bordes de campos y controles                 |
| `--color-exito`             | `oklch(0.5 0.11 155)`  | `#2f7d52` | Confirmaciones                               |
| `--color-aviso`             | `oklch(0.48 0.11 75)`  | `#8a6a12` | Texto/icono de aviso                         |
| `--color-error`             | `oklch(0.45 0.15 25)`  | `#b23a24` | Errores                                      |

**Contraste comprobado** (relación WCAG, texto normal ≥ 4,5:1 y bordes/UI ≥ 3:1):

| Par                            | Oscuro                               | Claro                          |
| ------------------------------ | ------------------------------------ | ------------------------------ |
| Texto / fondo                  | 16,5:1                               | 14,4:1                         |
| Texto suave / fondo            | 8,6:1                                | 5,7:1                          |
| Texto sobre superficie         | 15,0:1                               | 15,8:1                         |
| Texto de botón sobre primario  | 5,75:1 (texto oscuro sobre primario) | 5,44:1 (blanco sobre primario) |
| Acento como texto / fondo      | 8,5:1                                | 5,75:1                         |
| Error / fondo                  | 5,8:1                                | 5,4:1                          |
| Éxito / fondo                  | 8,7:1                                | 4,6:1                          |
| Aviso / fondo                  | 10,1:1                               | 4,6:1                          |
| Borde interactivo / superficie | 4,05:1                               | 3,45–3,79:1                    |

Regla de aplicación: `--color-primario` como texto plano de enlace **solo** se usa en
`--color-primario-claro` (oscuro) o `--color-primario-oscuro` (claro); como fondo de botón se usa
`--color-primario` tal cual con el texto opuesto (`--color-primario-oscuro` en oscuro,
blanco/`--color-superficie` en claro). Ningún estado (error, éxito, aviso) se comunica solo con
color: siempre llevan icono o texto.

Proporción 60-30-10: el índigo (`fondo`/`superficie`) domina, el texto en sus grises con
temperatura ocupa el resto del "peso neutro", y el cobre (`primario`) aparece solo en CTA, enlaces
activos y algún acento puntual — nunca como color de fondo grande.

## 3. Tipografía

- **Fraunces** (serif con ejes ópticos, carácter "de atlas estelar antiguo") para titulares — pesos
  400 y 600, con la variante `optical-size` alta para tamaños grandes. Distingue a Umbra de la
  sans-serif genérica de cualquier landing de producto.
- **Manrope** (sans geométrica muy legible) para cuerpo de texto y UI — pesos 400, 500 y 700.
- Autoalojadas con `@fontsource/fraunces` y `@fontsource/manrope` (solo los pesos anteriores),
  `font-display: swap`.

Escala fluida (`clamp()`), proporción ~1,25:

```css
--texto-xs: clamp(0.78rem, 0.76rem + 0.1vw, 0.85rem);
--texto-sm: clamp(0.88rem, 0.85rem + 0.15vw, 0.95rem);
--texto-base: clamp(1rem, 0.97rem + 0.2vw, 1.125rem);
--texto-lg: clamp(1.15rem, 1.1rem + 0.3vw, 1.3rem);
--h4: clamp(1.3rem, 1.2rem + 0.5vw, 1.6rem);
--h3: clamp(1.55rem, 1.35rem + 1vw, 2rem);
--h2: clamp(2rem, 1.6rem + 2vw, 3rem);
--h1: clamp(2.6rem, 1.9rem + 3.5vw, 4.5rem);
```

Interlineado 1,6 en cuerpo de texto, 1,08 en `h1`/`h2`. Líneas de artículo a `max-width: 65ch`.

## 4. Layout general

Concepto: **"un observatorio de noche, no un dashboard de día"**. Header transparente que se funde
con el hero y se vuelve sólido (`--color-superficie` con `backdrop-filter: blur()`) al hacer
scroll; navegación reducida a 5 enlaces + CTA "Reservar" siempre visible; footer denso con datos de
contacto, horarios y redes, como el pie de un mapa estelar.

## 5. Tokens de movimiento

```css
--duracion-micro: 180ms;
--duracion-entrada: 550ms;
--duracion-hero: 1200ms;
--curva-entrada: cubic-bezier(0.22, 1, 0.36, 1);
--curva-salida: cubic-bezier(0.4, 0, 1, 1);
```

## 6. Páginas: wireframe, perfil de animación y momento estrella

### 6.1 Inicio — perfil **ESPECTACULAR**

```
┌─────────────────────────────────────────────┐
│ [Umbra ·] Inicio Experiencias Reservar ⌂☾    │  header transparente→sólido
├─────────────────────────────────────────────┤
│                                               │
│      ░░░  escena 3D: cielo + constelación  ░░│  HERO — momento estrella nº1
│      "Donde el cielo todavía se ve entero"   │  (Three.js interactivo)
│      [Reservar una noche]  [Ver experiencias]│
│                                               │
├─────────────────────────────────────────────┤
│ ░ atardecer ░ → ░ anochecer ░ → ░ noche ░    │  SCROLL NARRATIVO fijado —
│  texto breve en cada fase, fondo transiciona │  momento estrella nº2
├─────────────────────────────────────────────┤
│ Tres experiencias destacadas (tarjetas)      │  discreto, entrada suave
├─────────────────────────────────────────────┤
│ Cifras del observatorio (altitud, clientes)  │  discreto
├─────────────────────────────────────────────┤
│ Cita de un visitante + CTA final "Reservar"  │  discreto
├─────────────────────────────────────────────┤
│ Footer                                       │
└─────────────────────────────────────────────┘
```

Momento estrella: el hero 3D **y** el scroll narrativo son, juntos, la escena de apertura (el hero
es la primera fase estática/interactiva de la misma historia que el scroll narrativo continúa) —
cuentan como un único arco narrativo, no dos focos independientes. El resto de Inicio baja a perfil
sutil (fade-up simple, sin parallax) para no competir.

### 6.2 Experiencias (catálogo) — perfil **EXPRESIVO**

```
┌─────────────────────────────────────────────┐
│ Header                                       │
├───────────────┬───────────────────────────────┤
│ Filtros        │ Ordenar por: [precio ▾]       │
│ ☐ Observación   ├───────────────────────────────┤
│ ☐ Astrofoto     │ [Tarjeta] [Tarjeta] [Tarjeta] │
│ ☐ Familiar      │ [Tarjeta] [Tarjeta] [Tarjeta] │
│ Precio máx ──○─ │                               │
│ ☐ Apto niños    │ (skeleton / vacío / error)    │
├───────────────┴───────────────────────────────┤
│ Footer                                       │
└─────────────────────────────────────────────┘
```

En móvil los filtros colapsan en un panel deslizable desde abajo.

Momento estrella: las tarjetas se revelan con un stagger de 60 ms al aplicar un filtro (no al
cargar la página la primera vez, para no retrasar el LCP). Hover con inclinación sutil 3D en CSS
(`transform: perspective() rotateX()`), solo con `hover: hover`.

### 6.3 Experiencias (detalle) — perfil **EXPRESIVO** (heredado, sin nuevo momento estrella)

```
┌─────────────────────────────────────────────┐
│ Header                                       │
├─────────────────────────────────────────────┤
│ Título · tipo · duración · precio            │
│ [Galería SVG en mosaico]                     │
├───────────────────┬───────────────────────────┤
│ Descripción larga  │ Ficha: incluye, horarios,│
│ Preguntas frec.    │ edad mínima, aforo        │
│ (acordeón)         │ [Reservar esta experiencia]│
├───────────────────┴───────────────────────────┤
│ Footer                                       │
└─────────────────────────────────────────────┘
```

### 6.4 Reservar — perfil **SUTIL**

```
┌─────────────────────────────────────────────┐
│ Header                                       │
├─────────────────────────────────────────────┤
│  ① Experiencia — ② Fecha — ③ Datos — ④ Resumen│  indicador de pasos
├─────────────────────────────────────────────┤
│                                               │
│   [contenido del paso activo]                │
│                                               │
│              [Atrás]     [Continuar]         │
├─────────────────────────────────────────────┤
│ Footer                                       │
└─────────────────────────────────────────────┘
```

Confirmación: el indicador de pasos se sustituye por una pantalla con el localizador y un icono de
"reserva confirmada" (SVG, entrada única con `scale`+`opacity`). Transiciones entre pasos:
cross-fade + desplazamiento de 12 px, 300 ms — nada de scroll ni 3D aquí: es un formulario y debe
sentirse tranquilo y fiable.

### 6.5 El cielo esta noche — perfil **SUTIL**

```
┌─────────────────────────────────────────────┐
│ Header                                       │
├─────────────────────────────────────────────┤
│ "El cielo esta noche sobre el Collado"       │
├───────────────┬───────────────┬───────────────┤
│ 🌙 Fase lunar  │ 👁 Visibilidad │ ✦ Planetas    │  skeleton/vacío/error/datos
├───────────────┴───────────────┴───────────────┤
│ Próximos eventos astronómicos (lista)        │
├─────────────────────────────────────────────┤
│ Footer                                       │
└─────────────────────────────────────────────┘
```

Sin momento estrella propio: transición cross-fade entre skeleton y contenido real, 400 ms.

### 6.6 Diario (listado y artículo) — perfil **SUTIL**

```
Listado:                        Artículo:
┌───────────────────────┐       ┌───────────────────────┐
│ Header                 │       │ Header                 │
├───────────────────────┤       ├──────────┬──────────────┤
│ [Tarjeta artículo]     │       │ Índice   │ Título        │
│ [Tarjeta artículo]     │       │ (sticky) │ meta · tiempo │
│ [Tarjeta artículo]     │       │          │ lectura       │
├───────────────────────┤       │          │ Cuerpo (65ch) │
│ Footer                 │       ├──────────┴──────────────┤
└───────────────────────┘       │ Footer                   │
                                 └───────────────────────────┘
```

### 6.7 404 — perfil **SUTIL** (con humor)

```
┌─────────────────────────────────────────────┐
│ Header                                       │
├─────────────────────────────────────────────┤
│         [SVG: telescopio apuntando            │
│          a una casilla vacía del cielo]      │
│   "Esta coordenada no tiene estrellas"       │
│   "(ni página). Prueba desde el inicio."     │
│        [Volver al inicio] [Ver experiencias] │
├─────────────────────────────────────────────┤
│ Footer                                       │
└─────────────────────────────────────────────┘
```

## 7. Revisión frente a la skill

- ¿Algo de este plan serviría para cualquier web parecida? La paleta cobre/índigo, la tipografía
  Fraunces+Manrope y el hero-como-continuación-del-scroll-narrativo son específicos del tema
  (observatorio de montaña) y no intercambiables con otra landing genérica.
- Un único momento estrella real por página (Inicio: hero+scroll como un solo arco; el resto,
  perfil sutil o expresivo contenido) — regla común respetada.
- Todo el movimiento anima `transform`/`opacity` (ver detalle en implementación); todo respeta
  `prefers-reduced-motion`.
