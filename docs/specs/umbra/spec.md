# Umbra — web de reservas del observatorio astronómico

> Estado: Aprobada · Versión: 1.0 · Última actualización: 2026-09-23

## 1. Contexto y objetivo

Umbra es un observatorio astronómico ficticio situado en el Collado del Cielo, en la Sierra de
Gredos (Ávila), a 1.850 m de altitud y lejos de la contaminación lumínica de cualquier núcleo
urbano. Ofrece experiencias guiadas de observación de estrellas, talleres de astrofotografía y
noches familiares. Necesita una web de demostración que sirva como escaparate de marca y, sobre
todo, como canal de reserva: hoy las reservas se gestionan por teléfono y WhatsApp, lo que genera
errores de disponibilidad y pérdida de reservas fuera de horario comercial.

El público son dos perfiles: (1) parejas y familias urbanas de Madrid, Ávila y Salamanca que buscan
una escapada distinta de fin de semana, sin conocimientos previos de astronomía; y (2) aficionados
a la astronomía y la astrofotografía que valoran datos técnicos (fase lunar, seeing, apertura de
los telescopios).

**Métrica de éxito**: un visitante puede completar una reserva de principio a fin (elegir
experiencia, fecha, plazas y datos personales) sin errores de validación no gestionados, en
cualquier dispositivo desde 360 px de ancho.

## 2. Alcance

**Incluye (esta versión):**

- Página de inicio con hero 3D interactivo y sección de scroll narrativo.
- Catálogo de experiencias con filtros y ordenación, y página de detalle por experiencia.
- Formulario de reserva en 4 pasos con validación accesible y pantalla de confirmación.
- Panel "El cielo esta noche" con datos astronómicos simulados y sus cuatro estados de interfaz.
- Blog ("Diario") con listado y artículo, usando colecciones de contenido de Astro.
- Página 404 propia.
- Modo claro/oscuro, transiciones entre páginas, SEO técnico, sitio responsive y accesible.
- API simulada en el propio frontend (sin backend real) que imita las convenciones de
  `habilidad-backend` (Problem Details, listados paginados) para poder sustituirse en el futuro.

**No incluye (queda fuera o para más adelante):**

- Backend real, base de datos o persistencia de reservas (la reserva "envía" datos a la API
  simulada y no se guarda entre sesiones).
- Pasarela de pago o cobro online (se indica que el pago se hace al llegar o por transferencia).
- Autenticación de usuarios, panel de cliente o historial de reservas.
- Internacionalización (la web se entrega solo en español).
- Panel de administración para el observatorio.

## 3. Usuarios y roles

| Rol       | Descripción                                      | Qué puede hacer                                                                                                 |
| --------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Visitante | Cualquier persona que llega a la web, sin cuenta | Ver contenido, filtrar experiencias, consultar el cielo de esta noche, leer el diario, reservar una experiencia |

No hay roles con permisos diferenciados: toda la web es pública.

## 4. Requisitos funcionales

- **RF-01** — El visitante puede ver la página de inicio con la escena 3D del hero y el scroll
  narrativo del atardecer a la noche.
- **RF-02** — El visitante puede consultar el catálogo de experiencias y filtrarlo por tipo,
  duración, precio máximo y si es apto para niños.
- **RF-03** — El visitante puede ordenar el catálogo por precio (ascendente/descendente) o por
  duración.
- **RF-04** — El visitante puede abrir la página de detalle de una experiencia y ver su galería,
  qué incluye, horarios disponibles y preguntas frecuentes.
- **RF-05** — El visitante puede reservar una experiencia completando un formulario de 4 pasos:
  experiencia, fecha y plazas, datos personales, resumen y confirmación.
- **RF-06** — El formulario valida cada campo al salir de él y de nuevo al enviar, mostrando el
  error junto al campo y moviendo el foco al primer campo con error si el envío falla.
- **RF-07** — Al confirmar una reserva válida, el visitante ve una pantalla de confirmación con un
  localizador de reserva generado por la API simulada.
- **RF-08** — El visitante puede consultar el panel "El cielo esta noche" con fase lunar,
  visibilidad prevista, planetas visibles y próximos eventos astronómicos.
- **RF-09** — El panel "El cielo esta noche" permite reintentar la carga si la petición falla.
- **RF-10** — El visitante puede listar los artículos del diario y leer un artículo completo con
  tiempo de lectura estimado e índice de contenidos.
- **RF-11** — El visitante puede cambiar manualmente entre modo claro y oscuro, y la web recuerda
  su elección en visitas posteriores.
- **RF-12** — Si el visitante navega a una URL inexistente, ve una página 404 propia con enlaces de
  vuelta al catálogo y al inicio.

## 5. Criterios de aceptación

### RF-02

- **CA-02.1** — Dado el catálogo cargado, cuando el visitante marca el filtro "Apto para niños",
  entonces solo se muestran experiencias con `apta_ninos: true`.
- **CA-02.2** — Dado el catálogo cargado, cuando el visitante fija un precio máximo, entonces solo
  se muestran experiencias con `precio <= precio_maximo`.
- **CA-02.3** (error) — Dado un filtro que no deja ninguna experiencia, cuando se aplica, entonces
  se muestra un estado vacío con un botón "Quitar filtros".

### RF-05

- **CA-05.1** — Dado el paso 1 del formulario, cuando el visitante elige una experiencia y pulsa
  "Continuar", entonces avanza al paso 2 con esa experiencia preseleccionada.
- **CA-05.2** — Dado el paso 2, cuando el visitante elige una fecha sin plazas libres, entonces el
  campo de plazas se deshabilita y se muestra "Sin plazas disponibles para esta fecha".
- **CA-05.3** — Dado el paso 3, cuando el visitante deja el email vacío y pulsa "Continuar",
  entonces se muestra "Este campo es obligatorio" bajo el campo y el foco se mueve a él.
- **CA-05.4** — Dado el paso 3, cuando el visitante escribe un email sin arroba y sale del campo,
  entonces se muestra "Introduce un correo electrónico válido" bajo el campo.
- **CA-05.5** — Dado el paso 4 con todos los datos válidos, cuando el visitante pulsa "Confirmar
  reserva", entonces el botón se deshabilita, muestra un indicador de envío y, al resolver la API
  simulada, se navega a la pantalla de confirmación con el localizador.
- **CA-05.6** (error) — Dado el paso 4, cuando la API simulada devuelve un error (por ejemplo, con
  `?simular=error`), entonces se muestra el `detail` del error en un aviso junto al botón de envío
  y el botón se reactiva.

### RF-08

- **CA-08.1** — Dado que la petición del cielo de esta noche está en curso, entonces se muestran
  _skeletons_ con la forma de las tarjetas de datos, no un spinner a pantalla completa.
- **CA-08.2** — Dado que la API simulada responde con datos, entonces se muestran fase lunar (con
  icono y porcentaje), visibilidad (texto y valor de 0 a 100), lista de planetas visibles y lista de
  próximos eventos con fecha.
- **CA-08.3** (error) — Dado que la API simulada fallla (parámetro `?simular=error`), entonces se
  muestra un mensaje de error en lenguaje humano con un botón "Reintentar" que repite la petición.
- **CA-08.4** — Dado que la API simulada responde sin eventos próximos, entonces la sección de
  eventos muestra el mensaje "No hay eventos astronómicos destacados en los próximos 30 días."

### RF-11

- **CA-11.1** — Dado un visitante nuevo sin preferencia guardada, cuando carga la web, entonces se
  usa el esquema de color del sistema operativo.
- **CA-11.2** — Dado un visitante que pulsa el selector de tema, cuando elige "Oscuro", entonces la
  web cambia a modo oscuro y recuerda la elección en la siguiente visita (misma pestaña/navegador).

### RF-12

- **CA-12.1** — Dado que el visitante entra en una URL inexistente, entonces responde con estado
  404 y una página con el diseño de la web y enlaces a "Inicio" y "Experiencias".

## 6. Reglas de negocio

- **RN-01** — Cada experiencia tiene un aforo máximo por sesión (entre 6 y 16 personas según la
  experiencia); no se puede reservar más plazas de las libres en esa fecha.
- **RN-02** — Las experiencias marcadas como no aptas para niños requieren que todos los asistentes
  tengan 12 años o más.
- **RN-03** — El precio mostrado es por persona; los menores de 6 años no pagan entrada y no cuentan
  para el aforo mínimo de la experiencia, pero sí para el aforo máximo.
- **RN-04** — Una reserva requiere un mínimo de 1 plaza y un máximo de 8 plazas por formulario; para
  grupos mayores se indica contactar directamente.

## 7. Modelo de datos

| Entidad        | Campo                | Tipo                                                   | Obligatorio | Notas                                                |
| -------------- | -------------------- | ------------------------------------------------------ | ----------- | ---------------------------------------------------- |
| Experiencia    | id                   | string (slug)                                          | Sí          | Identificador único, usado en la URL                 |
| Experiencia    | nombre               | string                                                 | Sí          |                                                      |
| Experiencia    | tipo                 | enum: `observacion` \| `astrofotografia` \| `familiar` | Sí          | Usado en el filtro por tipo                          |
| Experiencia    | resumen              | string                                                 | Sí          | 1-2 frases para la tarjeta del catálogo              |
| Experiencia    | descripcion          | string (markdown)                                      | Sí          | Texto largo de la página de detalle                  |
| Experiencia    | duracion_horas       | number                                                 | Sí          |                                                      |
| Experiencia    | precio               | number                                                 | Sí          | Euros por persona                                    |
| Experiencia    | apta_ninos           | boolean                                                | Sí          |                                                      |
| Experiencia    | edad_minima          | number                                                 | Sí          | 0 si no hay restricción                              |
| Experiencia    | aforo_maximo         | number                                                 | Sí          |                                                      |
| Experiencia    | incluye              | string[]                                               | Sí          | Lista de qué incluye la experiencia                  |
| Experiencia    | horarios             | string[]                                               | Sí          | Franjas horarias disponibles, p. ej. "21:30 - 23:30" |
| Experiencia    | preguntas_frecuentes | {pregunta, respuesta}[]                                | Sí          |                                                      |
| Experiencia    | galeria              | {descripcion}[]                                        | Sí          | Descripciones para generar arte SVG, no fotos        |
| Disponibilidad | experiencia_id       | string                                                 | Sí          | Relación N—1 con Experiencia                         |
| Disponibilidad | fecha                | string (ISO 8601, fecha)                               | Sí          |                                                      |
| Disponibilidad | plazas_libres        | number                                                 | Sí          |                                                      |
| Reserva        | id                   | string (UUID)                                          | Sí          | Generado por la API simulada al crear                |
| Reserva        | localizador          | string                                                 | Sí          | Código corto para mostrar al visitante               |
| Reserva        | experiencia_id       | string                                                 | Sí          |                                                      |
| Reserva        | fecha                | string (ISO 8601, fecha)                               | Sí          |                                                      |
| Reserva        | plazas               | number                                                 | Sí          | Entre 1 y 8 (RN-04)                                  |
| Reserva        | nombre               | string                                                 | Sí          |                                                      |
| Reserva        | email                | string                                                 | Sí          |                                                      |
| Reserva        | telefono             | string                                                 | Sí          |                                                      |
| Reserva        | comentarios          | string                                                 | No          |                                                      |
| CieloEstaNoche | fase_lunar           | {nombre, porcentaje_iluminacion}                       | Sí          |                                                      |
| CieloEstaNoche | visibilidad          | {texto, valor_0_100}                                   | Sí          |                                                      |
| CieloEstaNoche | planetas_visibles    | string[]                                               | Sí          |                                                      |
| CieloEstaNoche | proximos_eventos     | {nombre, fecha}[]                                      | Sí          | Puede ser vacío (CA-08.4)                            |
| Articulo       | slug                 | string                                                 | Sí          | Colección de contenido de Astro                      |
| Articulo       | titulo               | string                                                 | Sí          |                                                      |
| Articulo       | resumen              | string                                                 | Sí          |                                                      |
| Articulo       | fecha_publicacion    | date                                                   | Sí          |                                                      |
| Articulo       | autor                | string                                                 | Sí          |                                                      |
| Articulo       | categoria            | string                                                 | Sí          |                                                      |
| Articulo       | contenido            | markdown                                               | Sí          | Cuerpo del artículo                                  |

Relaciones: Experiencia 1—N Disponibilidad · Experiencia 1—N Reserva.

## 8. Casos límite y errores

| Situación                                           | Comportamiento esperado                                                                                                                                                                       |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catálogo sin resultados tras filtrar                | Estado vacío con mensaje y botón para quitar filtros (CA-02.3)                                                                                                                                |
| Fecha de reserva sin plazas                         | Aviso junto al selector de fecha y plazas deshabilitadas (CA-05.2)                                                                                                                            |
| Envío del formulario con la API simulada en error   | Aviso con el `detail` del Problem Details, botón reactivado (CA-05.6)                                                                                                                         |
| Doble clic en "Confirmar reserva"                   | El botón se deshabilita al primer clic; no se duplica la petición                                                                                                                             |
| Cielo de esta noche sin conexión/con error simulado | Estado de error con reintentar, sin trazas técnicas (CA-08.3)                                                                                                                                 |
| Artículo del diario inexistente                     | Página 404 propia                                                                                                                                                                             |
| JavaScript deshabilitado                            | El contenido de todas las páginas se lee igualmente; el formulario sigue siendo enviable como formulario HTML nativo con validación del navegador; el hero 3D muestra su alternativa estática |
| `prefers-reduced-motion: reduce` activado           | Se elimina el scroll narrativo fijado, la rotación automática del hero 3D y las animaciones de entrada quedan estáticas                                                                       |

## 9. Contrato de la API simulada

Base: `src/lib/api/`. Todas las funciones simulan latencia de red (300-900 ms) y aceptan
`?simular=error` para forzar una respuesta de error con formato Problem Details.

| Función                       | Equivale a                                     | Descripción                    | Entrada                                                                    | Respuesta                                                           | Errores                                     |
| ----------------------------- | ---------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| `listarExperiencias(filtros)` | GET `/api/v1/experiencias`                     | Lista paginada de experiencias | `{ tipo?, precioMax?, apta_ninos?, orden?, page?, size? }`                 | `{ data: Experiencia[], meta: { page, size, total, total_pages } }` | 500                                         |
| `obtenerExperiencia(id)`      | GET `/api/v1/experiencias/{id}`                | Detalle de una experiencia     | `id: string`                                                               | `Experiencia`                                                       | 404, 500                                    |
| `obtenerDisponibilidad(id)`   | GET `/api/v1/experiencias/{id}/disponibilidad` | Fechas y plazas libres         | `id: string`                                                               | `Disponibilidad[]`                                                  | 404, 500                                    |
| `crearReserva(datos)`         | POST `/api/v1/reservas`                        | Crea una reserva               | `{ experiencia_id, fecha, plazas, nombre, email, telefono, comentarios? }` | 201 `Reserva`                                                       | 400/422 (validación), 409 (sin plazas), 500 |
| `obtenerCieloEstaNoche()`     | GET `/api/v1/cielo-esta-noche`                 | Datos astronómicos del día     | —                                                                          | `CieloEstaNoche`                                                    | 500                                         |

Formato de error único (Problem Details, RFC 9457):

```json
{
  "type": "plazas-insuficientes",
  "title": "No hay plazas suficientes",
  "status": 409,
  "detail": "Quedan 2 plazas libres para el 14 de noviembre y se han solicitado 4.",
  "instance": "/api/v1/reservas",
  "errors": []
}
```

## 10. Pantallas y flujos

### Inicio

- Propósito: causar la primera impresión y dirigir a "Experiencias" o "Reservar".
- Datos: ninguno remoto; contenido estático (experiencias destacadas tomadas de los datos locales).
- Estados: solo el de carga progresiva de la escena 3D (con marcador de posición estático mientras
  Three.js se inicializa).

### Experiencias (catálogo)

- Propósito: explorar y comparar experiencias.
- Datos: `listarExperiencias`.
- Estados: cargando (skeletons de tarjeta), vacío (CA-02.3), error (aviso + reintentar), con datos.

### Experiencias (detalle)

- Propósito: decidir y pasar a reservar.
- Datos: `obtenerExperiencia`, `obtenerDisponibilidad`.
- Estados: cargando, error (404 si no existe la experiencia; error genérico + reintentar si falla
  la red), con datos.

### Reservar

- Propósito: completar una reserva.
- Flujo: paso 1 (experiencia) → paso 2 (fecha y plazas) → paso 3 (datos personales) → paso 4
  (resumen y envío) → confirmación.
- Estados: cada paso valida antes de avanzar; el paso 4 tiene estado de envío y de error de envío;
  la confirmación es una pantalla final con el localizador.

### El cielo esta noche

- Propósito: aportar valor informativo y reforzar la credibilidad técnica del observatorio.
- Datos: `obtenerCieloEstaNoche`.
- Estados: cargando (skeletons), vacío (CA-08.4 solo afecta a la subsección de eventos), error
  (CA-08.3), con datos.

### Diario (listado y artículo)

- Propósito: SEO de contenido y reforzar la autoridad del observatorio.
- Datos: colección de contenido local de Astro (sin API).
- Estados: con datos (listado siempre tiene ≥ 3 artículos); 404 propia si el slug no existe.

### 404

- Propósito: recuperar al visitante que ha llegado a una URL inexistente.

## 11. Requisitos no funcionales

- **Rendimiento**: Lighthouse ≥ 90 en Rendimiento, Accesibilidad, Buenas prácticas y SEO en Inicio,
  Experiencias y Reservar, medido en modo escritorio y móvil. LCP < 2,5 s, CLS < 0,1.
- **Accesibilidad**: cumplimiento WCAG 2.1 AA; navegación completa con teclado; contraste mínimo
  4,5:1 en texto normal y 3:1 en texto grande/iconos; `prefers-reduced-motion` respetado en CSS y
  JS; contenido visible y utilizable sin JavaScript.
- **Compatibilidad**: responsive desde 360 px hasta 1920 px; últimas dos versiones de Chrome,
  Firefox, Safari y Edge.
- **SEO**: metadatos y Open Graph únicos por página; JSON-LD `LocalBusiness` en el layout base,
  `Event` en cada experiencia, `Article` en cada entrada del diario; `sitemap.xml` y `robots.txt`.
- **Internacionalización**: solo español (`lang="es"`), sin requisito de multi-idioma.

## 12. Decisiones técnicas

| Decisión                                                                                      | Motivo                                                                                                                                  | Alternativas descartadas                                                                                               |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Astro + TypeScript estricto                                                                   | Web de contenido con varias páginas y poca interactividad global; solo 3 zonas necesitan estado (catálogo, formulario, panel del cielo) | Next.js (más peso del necesario), SPA React pura (peor SEO por defecto)                                                |
| Islas de React (`client:visible` / `client:load`) para catálogo, formulario y panel del cielo | Son las únicas partes con estado real; el resto se sirve sin JS                                                                         | Componentes `.astro` con `<script>` a mano (se descarta solo en el formulario multi-paso por la complejidad de estado) |
| Tailwind CSS con tokens en `tailwind.config` sobre variables CSS                              | Recomendado por la skill para proyectos con islas de React; acelera la coherencia de espaciados y tipografía fluida                     | CSS puro con capas manuales (más trabajo de mantenimiento sin beneficio aquí)                                          |
| Three.js solo en la isla del hero de Inicio                                                   | Es el único "momento estrella" que lo justifica; el resto de la web no necesita 3D                                                      | React Three Fiber (añade una capa extra sin necesidad, ya que solo hay una escena)                                     |
| GSAP + ScrollTrigger para el scroll narrativo de Inicio                                       | Coreografía de pin-scroll con varias fases; CSS `animation-timeline: view()` no permite fijar (pin) sin más JS                          | Solo CSS scroll-driven (soporte parcial y sin pin)                                                                     |
| Fontsource para autoalojar tipografías                                                        | Cumple el requisito de rendimiento (sin peticiones a Google Fonts) y de "no usar recursos con derechos ajenos"                          | Google Fonts vía CDN                                                                                                   |
| API simulada en `src/lib/api/` con `setTimeout` y Problem Details                             | Permite ver los 4 estados de interfaz y sustituir por un backend real sin tocar componentes                                             | MSW (Mock Service Worker): más infraestructura de la necesaria para una demo sin tests que la requieran                |

## 13. Dependencias y riesgos

- **Riesgo**: Three.js y GSAP pueden penalizar el rendimiento en móvil. _Mitigación_: carga
  diferida (`client:visible`), escena simplificada y alternativa estática bajo
  `prefers-reduced-motion` o `navigator.hardwareConcurrency` bajo.
- **Riesgo**: contenido 100% inventado podría parecer genérico. _Mitigación_: anclar todos los
  textos a un lugar, unos precios y unos horarios concretos y coherentes entre sí.
- **Dependencia**: ninguna externa (no hay backend real ni claves de API de terceros).

## 14. Supuestos y preguntas abiertas

**Supuestos:**

- El pago de la reserva no se gestiona en esta versión; se indica "Pago in situ o por
  transferencia, te lo confirmamos por email" en la pantalla de confirmación.
- Los datos de disponibilidad simulados cubren los próximos 30 días desde la fecha de carga.
- Las imágenes son arte generado con SVG/CSS (degradados de cielo, siluetas de montaña,
  constelaciones dibujadas), no fotografías, para evitar derechos de autor.
- El dominio de ejemplo usado en metadatos (`https://umbra-observatorio.example`) es ficticio.

**Preguntas abiertas:** ninguna bloqueante; el usuario ha dado libertad total sobre el contenido.

## 15. Historial de cambios

| Versión | Fecha      | Cambio          |
| ------- | ---------- | --------------- |
| 1.0     | 2026-09-23 | Versión inicial |
