# Umbra — web de reservas de un observatorio astronómico

Web de demostración de un observatorio ficticio (Collado del Cielo, Sierra de Gredos, 1.850 m)
que ofrece noches de observación, talleres de astrofotografía y experiencias familiares. El
objetivo de la web es que el visitante **reserve una experiencia**. Todo el contenido es inventado.

Se construyó para poner a prueba la skill `skill-diseño-y-codigo-frontend`, siguiendo la
especificación de [`docs/specs/umbra/`](docs/specs/umbra/spec.md) y el plan de diseño de
[`docs/diseno.md`](docs/diseno.md).

## Cómo arrancarlo

Requisitos: Node 22.12 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:4321>. Otros comandos:

| Comando                           | Qué hace                                                  |
| --------------------------------- | --------------------------------------------------------- |
| `npm run build`                   | Comprueba tipos (`astro check`) y genera `dist/`          |
| `npm run preview`                 | Sirve la build de producción                              |
| `npm run lint` / `npm run format` | ESLint y Prettier                                         |
| `npm run test:unit`               | Vitest + Testing Library                                  |
| `npm run test:e2e`                | Playwright (escritorio y móvil) con axe; necesita `build` |
| `npm run capturas`                | Capturas de cada página (móvil/escritorio, claro/oscuro)  |
| `npm run lighthouse`              | Lighthouse en Inicio, Experiencias y Reservar             |

Los tests e2e, las capturas y Lighthouse usan la build: ejecuta antes `npm run build` y, en otra
terminal, `npm run preview`.

## Estados de error simulados

No hay backend: la API vive en `src/lib/api/` con latencia artificial (300–900 ms). Añade
`?simular=error` a la URL de cualquier página para que las llamadas fallen con un error en formato
Problem Details y veas los estados de error con su botón de reintentar:

- `/experiencias?simular=error`
- `/el-cielo-esta-noche?simular=error`
- `/reservar?simular=error` (falla la consulta de disponibilidad del paso 2; para ver el fallo del
  envío final, añade el parámetro antes de pulsar «Confirmar reserva»)

El estado vacío del catálogo se ve con `/experiencias?precioMax=15`. Las fechas sin plazas del paso
2 salen de forma determinista (≈ 1 de cada 8 días).

## Estructura

```
docs/            especificación (spec.md, tareas.md) y plan de diseño (diseno.md)
public/          favicon, imagen Open Graph y robots.txt
scripts/         capturas.mjs (revisión visual) y lighthouse.mjs
src/
├── components/  UI reutilizable (tarjetas, estados de error, skeletons, medidor, SEO)
├── content/     artículos del Diario en Markdown (colección `diario`)
├── data/        experiencias y disponibilidad simulada
├── islands/     componentes React con interactividad real (catálogo, asistente, cielo, hero 3D, tema)
├── layouts/     LayoutBase: cabecera, pie, tema, View Transitions y JSON-LD LocalBusiness
├── lib/         api simulada (`api/`), escena Three.js, scroll narrativo GSAP, utilidades
├── pages/       rutas: inicio, experiencias, reservar, el cielo esta noche, diario, 404
└── styles/      global.css: tokens, base, componentes y movimiento
tests/
├── unit/        Vitest (API simulada y componentes)
└── e2e/         Playwright (flujos, movimiento reducido, sin JS) y axe en las 8 páginas
```

## Decisiones y su porqué

- **Astro + TypeScript estricto.** Web de contenido con varias páginas y solo tres zonas con
  estado real. Astro no envía JavaScript salvo en las islas de React.
- **Islas de React solo donde hay interactividad:** catálogo (filtros), asistente de reserva,
  panel del cielo, hero 3D y selector de tema. El resto (detalle, diario, 404) es HTML estático.
  El asistente usa `client:only`: la preselección por `?experiencia=` provocaba un desajuste de
  hidratación (React 19 no lo corrige) y sin JavaScript se muestra un aviso con el correo de reservas.
- **Tailwind v4 con tokens en CSS.** Los colores viven como variables CSS con dos paletas
  rediseñadas (no invertidas) y `@theme inline` las expone como utilidades. El CSS propio está
  ordenado por capas (tokens → base → layout → componentes → utilidades → movimiento).
- **Paleta cobre/índigo.** Sale de lo que se ve en un observatorio: cielo casi negro y la luz
  ámbar de las linternas que usan los astrónomos. Contrastes AA comprobados con la fórmula WCAG y
  con axe. Detalle en [`docs/diseno.md`](docs/diseno.md).
- **Fraunces + Manrope** autoalojadas con Fontsource (sin peticiones a Google Fonts).
- **Un momento estrella por página.** Inicio (perfil espectacular): hero con Three.js y scroll
  narrativo GSAP «del atardecer a la noche», que son un único arco. Experiencias (expresivo):
  entrada escalonada de tarjetas. Reservar, Cielo, Diario y 404 (sutil): transiciones de estado.
- **Three.js y GSAP con `import()` dinámico**, solo en Inicio y solo si procede. Con
  `prefers-reduced-motion`, poca CPU (`hardwareConcurrency ≤ 2`) o sin WebGL, el hero es un cielo
  SVG estático y ni se descarga Three.js; en móvil o con movimiento reducido la narrativa son
  cuatro secciones apiladas sin pin.
- **TanStack Query para los datos** (recomendado por la skill). `retry: false`: los reintentos
  automáticos se quedaban pausados en pestañas sin foco y cada estado de error ya ofrece
  «Reintentar».
- **API simulada con las convenciones de `habilidad-backend`:** listados `{ data, meta }` y
  errores Problem Details (RFC 9457) con `errors` por campo, para sustituirla por un backend real
  sin tocar los componentes.
- **Arte generado con SVG/CSS.** Sin fotografías: no hay problemas de derechos de autor.
- **Imagen Open Graph en SVG**: suficiente para la demo; en producción convendría un PNG de
  1200×630, porque algunas redes no renderizan SVG.

## Calidad

- `astro check`, ESLint y Prettier sin avisos; TypeScript en modo estricto.
- 24 tests de Vitest y 60 ejecuciones de Playwright (escritorio y móvil, incluido axe en claro y
  oscuro sin violaciones serias).
- Lighthouse en Inicio, Experiencias y Reservar: 97–100 en Rendimiento y 100 en Accesibilidad,
  Buenas prácticas y SEO, en móvil y escritorio.
