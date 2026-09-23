import type { Experiencia } from '../lib/api/tipos';

/**
 * Catálogo de experiencias de Umbra. Contenido inventado pero específico y
 * coherente (precios, duraciones y horarios encajan entre sí), para la demo
 * de la skill skill-diseño-y-codigo-frontend (T-04).
 */
export const EXPERIENCIAS: Experiencia[] = [
  {
    id: 'noche-de-estrellas-en-familia',
    nombre: 'Noche de estrellas en familia',
    tipo: 'familiar',
    resumen:
      'La primera toma de contacto con el cielo nocturno, pensada para disfrutar en familia desde los 6 años.',
    descripcion:
      'Empezamos en la explanada baja del observatorio, donde el guía reparte mantas y sillas reclinables mientras el cielo se termina de oscurecer. Con un puntero láser verde recorremos las constelaciones visibles esa noche —la Osa Mayor, Casiopea, y en temporada, Orión— y explicamos cómo orientarse sin ayuda de aplicaciones. Después nos turnamos en dos telescopios Dobson de 200 mm para observar cúmulos estelares y, si la noche lo permite, alguna nebulosa. A mitad de sesión servimos chocolate caliente y dejamos un rato libre para preguntas, especialmente pensado para que los más pequeños se sientan protagonistas. Terminamos con una breve charla sobre por qué el Collado del Cielo es uno de los pocos lugares de la península con cielos de calidad Bortle 2.',
    duracionHoras: 2,
    precio: 28,
    aptaNinos: true,
    edadMinima: 6,
    aforoMaximo: 16,
    incluye: [
      'Guía astronómico durante toda la sesión',
      'Uso compartido de dos telescopios Dobson de 200 mm',
      'Manta y silla reclinable',
      'Chocolate caliente a mitad de sesión',
      'Mapa estelar ilustrado de recuerdo',
    ],
    horarios: ['20:30 - 22:30'],
    preguntasFrecuentes: [
      {
        pregunta: '¿A partir de qué edad pueden venir los niños?',
        respuesta:
          'Recomendamos esta experiencia a partir de 6 años: es la duración y el ritmo que mejor aguantan a esa edad sin perder el interés. Para niños más pequeños tenemos el taller "Pequeños astrónomos", en horario de tarde.',
      },
      {
        pregunta: '¿Qué pasa si está nublado esa noche?',
        respuesta:
          'Si la nubosidad prevista supera el 70% te avisamos por email 24 horas antes con la opción de cambiar de fecha sin coste o recibir el importe íntegro de vuelta.',
      },
      {
        pregunta: '¿Hace falta llevar ropa especial?',
        respuesta:
          'Sí: aunque en verano el día sea caluroso, a 1.850 m la temperatura nocturna baja varios grados. Recomendamos ropa de abrigo por capas y calzado cerrado.',
      },
    ],
    galeria: [
      { descripcion: 'Familia observando por un telescopio Dobson bajo un cielo estrellado' },
      { descripcion: 'Guía señalando la Osa Mayor con un puntero láser verde' },
      {
        descripcion:
          'Grupo alrededor de una mesa con tazas de chocolate caliente y mapas estelares',
      },
      { descripcion: 'Silueta de la montaña recortada contra la Vía Láctea al anochecer' },
    ],
  },
  {
    id: 'astrofotografia-para-principiantes',
    nombre: 'Astrofotografía para principiantes',
    tipo: 'astrofotografia',
    resumen:
      'Aprende a fotografiar la Vía Láctea con tu propia cámara o el móvil, paso a paso y con seguimiento individual.',
    descripcion:
      'Un taller pensado para quien tiene cámara (réflex, sin espejo o incluso un móvil reciente con modo nocturno) pero nunca ha conseguido una foto de estrellas que no salga movida. Empezamos con 45 minutos de teoría en el aula del observatorio: triángulo de exposición aplicado a la noche, por qué usamos la regla NPF en lugar de la regla de los 500, y cómo enfocar al infinito sin autofocus. Salimos después al mirador principal, donde cada participante monta su equipo en uno de nuestros trípodes de préstamo (o el propio) y el astrofotógrafo residente va pasando mesa por mesa para revisar el encuadre y los ajustes. Cerramos con una puesta en común de las primeras tomas en pantalla grande y te llevas un archivo RAW de referencia para practicar el revelado en casa.',
    duracionHoras: 3.5,
    precio: 65,
    aptaNinos: false,
    edadMinima: 14,
    aforoMaximo: 10,
    incluye: [
      'Taller teórico de 45 minutos sobre exposición larga',
      'Trípodes en préstamo para quien no traiga el suyo',
      'Seguimiento individual del astrofotógrafo residente',
      'Revisión conjunta de las primeras tomas en pantalla',
      'Archivo RAW de referencia para practicar el revelado en casa',
    ],
    horarios: ['21:00 - 00:30'],
    preguntasFrecuentes: [
      {
        pregunta: '¿Necesito traer mi propia cámara?',
        respuesta:
          'Es recomendable, aunque no imprescindible: puedes practicar con el modo nocturno de un smartphone reciente en modo Pro. Las réflex y sin espejo antiguas con objetivo luminoso (f/2.8 o menor) dan mejor resultado.',
      },
      {
        pregunta: '¿Qué nivel de fotografía hace falta tener?',
        respuesta:
          'Ninguno previo en fotografía nocturna. Sí ayuda saber manejar el modo manual de tu cámara (ISO, apertura, velocidad), pero también lo repasamos en la parte teórica.',
      },
      {
        pregunta: '¿En qué meses se ve mejor la Vía Láctea desde Umbra?',
        respuesta:
          'El núcleo galáctico es visible de forma óptima entre abril y septiembre, en la franja horaria de esta experiencia. El resto del año seguimos ofreciéndola centrada en constelaciones de invierno y trails de estrellas.',
      },
    ],
    galeria: [
      { descripcion: 'Fila de trípodes con cámaras apuntando al núcleo de la Vía Láctea' },
      { descripcion: 'Astrofotógrafo revisando la pantalla de una cámara réflex en plena noche' },
      {
        descripcion:
          'Detalle de una pantalla LCD mostrando una fotografía de estrellas recién capturada',
      },
    ],
  },
  {
    id: 'planetas-y-luna-llena',
    nombre: 'Observación de planetas y luna llena',
    tipo: 'observacion',
    resumen:
      'La noche ideal para ver de cerca los cráteres de la Luna y los anillos de Saturno, con imagen en directo en pantalla.',
    descripcion:
      'Programamos esta experiencia en las noches de luna llena o cuarto creciente/menguante alto, cuando la propia claridad lunar dificulta ver objetos de cielo profundo pero regala vistas espectaculares de cráteres, mares lunares y cordilleras. Usamos nuestro telescopio principal, un Schmidt-Cassegrain de 280 mm, con una cámara planetaria acoplada que proyecta la imagen en una pantalla para que todo el grupo vea el mismo detalle a la vez sin colas en el ocular. Según la época del año, completamos la sesión con los planetas visibles: los anillos de Saturno, las bandas de Júpiter y sus lunas galileanas, o el disco de Marte en oposición. El guía explica en cada caso qué estamos viendo y por qué cambia noche a noche.',
    duracionHoras: 2,
    precio: 32,
    aptaNinos: true,
    edadMinima: 8,
    aforoMaximo: 14,
    incluye: [
      'Telescopio Schmidt-Cassegrain de 280 mm con cámara planetaria en directo',
      'Proyección en pantalla de lo que se ve por el ocular',
      'Explicación de las fases lunares y los planetas visibles esa noche',
      'Infusión o café de cortesía',
    ],
    horarios: ['21:30 - 23:30'],
    preguntasFrecuentes: [
      {
        pregunta: '¿Se ven bien los anillos de Saturno a simple vista por el telescopio?',
        respuesta:
          'Con el Schmidt-Cassegrain de 280 mm y buena estabilidad atmosférica, los anillos se distinguen con claridad como un óvalo separado del disco del planeta, aunque el color y detalle real son más sutiles que en las fotografías de gran angular.',
      },
      {
        pregunta: '¿Por qué esta experiencia se ofrece en luna llena y no en luna nueva?',
        respuesta:
          'Porque el brillo lunar es precisamente el protagonista: en luna nueva reservamos el telescopio grande para observación de cielo profundo en otras experiencias, donde la oscuridad total es la que aporta valor.',
      },
    ],
    galeria: [
      { descripcion: 'Telescopio Schmidt-Cassegrain apuntando a la Luna llena' },
      {
        descripcion:
          'Pantalla mostrando en directo los cráteres lunares captados por la cámara planetaria',
      },
      { descripcion: 'Grupo de visitantes mirando una pantalla exterior con la imagen de Saturno' },
    ],
  },
  {
    id: 'escapada-nocturna-en-pareja',
    nombre: 'Escapada nocturna en pareja',
    tipo: 'observacion',
    resumen:
      'Observación en grupo reducido (máximo 3 parejas) con cava, manta compartida y una foto bajo la Vía Láctea.',
    descripcion:
      'Reservamos el mirador oeste, el que mejor vistas tiene del valle, para un máximo de tres parejas por sesión: suficiente intimidad sin renunciar al ambiente de una actividad guiada. Empezamos con una copa de cava o mosto y picoteo de productores de la zona mientras cae la noche, y seguimos con observación guiada de constelaciones y, si el cielo lo permite, algún cúmulo o nebulosa brillante por telescopio. Cada pareja recibe una manta térmica para compartir, y a mitad de sesión nuestro fotógrafo hace un retrato con la Vía Láctea de fondo (larga exposición, trípode fijo) que os enviamos por email en los días siguientes. Terminamos entregando un pequeño certificado con el nombre de la constelación bajo la que os hemos fotografiado esa noche.',
    duracionHoras: 2.5,
    precio: 78,
    aptaNinos: false,
    edadMinima: 16,
    aforoMaximo: 6,
    incluye: [
      'Sesión de observación exclusiva para un máximo de 3 parejas',
      'Copa de cava o mosto y picoteo de productores locales',
      'Manta térmica para compartir',
      'Fotografía de pareja bajo la Vía Láctea incluida en el precio',
      'Certificado de la constelación bajo la que os observamos',
    ],
    horarios: ['22:00 - 00:30'],
    preguntasFrecuentes: [
      {
        pregunta: '¿Podemos venir dos parejas juntas y reservarlo entero para nosotros?',
        respuesta:
          'El mirador tiene capacidad para tres parejas por sesión y no ofrecemos uso en exclusiva por defecto. Si queréis privacidad total para un grupo, escribidnos y valoramos una sesión cerrada fuera de la parrilla habitual.',
      },
      {
        pregunta: '¿Qué pasa con la foto si el cielo está parcialmente cubierto?',
        respuesta:
          'Hacemos la foto igualmente en cuanto hay una ventana despejada, aunque sea breve; si no llega a haber ninguna en toda la sesión, no se cobra el suplemento de fotografía y os lo indicamos en el email de confirmación.',
      },
    ],
    galeria: [
      { descripcion: 'Pareja envuelta en una manta observando el cielo desde el mirador oeste' },
      { descripcion: 'Copa de cava sobre una mesa de madera con el valle desenfocado al fondo' },
      { descripcion: 'Retrato de pareja a contraluz con la Vía Láctea visible sobre sus cabezas' },
    ],
  },
  {
    id: 'caza-de-la-via-lactea',
    nombre: 'Caza de la Vía Láctea',
    tipo: 'astrofotografia',
    resumen:
      'Salida avanzada de temporada (abril-septiembre) en 4x4 hasta un mirador panorámico para fotografiar el núcleo galáctico.',
    descripcion:
      'Pensada para quien ya domina lo básico de la fotografía nocturna y quiere dar el salto a una localización más espectacular y menos accesible. Subimos en dos 4x4 hasta el mirador del Risco del Fraile, a 2.100 m, desde donde el horizonte despejado permite encuadrar el núcleo de la Vía Láctea completo sobre la silueta de la sierra. Durante las cuatro horas de sesión, nuestro astrofotógrafo va asesorando de forma individual sobre composición, apilado de exposiciones y, para quien lo pida, el uso de un raíl motorizado para timelapse (disponibilidad limitada, una unidad por sesión). Es una experiencia física y logísticamente más exigente que el taller para principiantes: hay que caminar 10 minutos desde el punto de aparcamiento del 4x4 y las temperaturas nocturnas en el mirador pueden bajar de los 10°C incluso en verano.',
    duracionHoras: 4,
    precio: 85,
    aptaNinos: false,
    edadMinima: 16,
    aforoMaximo: 8,
    incluye: [
      'Desplazamiento en 4x4 hasta el mirador del Risco del Fraile (2.100 m)',
      'Asesoramiento individual de composición y ajustes',
      'Uso de raíl motorizado para timelapse (una unidad, bajo disponibilidad)',
      'Bebida caliente y manta térmica',
      'Videollamada opcional al día siguiente para revisar el revelado',
    ],
    horarios: ['23:00 - 03:00'],
    preguntasFrecuentes: [
      {
        pregunta: '¿Qué diferencia hay con el taller de astrofotografía para principiantes?',
        respuesta:
          'Esta salida da por hecho que ya sabes manejar tu cámara en modo manual y enfocar al infinito; el tiempo se dedica a composición avanzada, técnicas de apilado y una localización de más difícil acceso, no a la base teórica.',
      },
      {
        pregunta: '¿Se ofrece todo el año?',
        respuesta:
          'La programamos de abril a septiembre, que es cuando el núcleo galáctico es visible en un horario razonable desde esta latitud. El resto del año el mirador permanece cerrado por la nieve.',
      },
      {
        pregunta: '¿Hay algún requisito físico?',
        respuesta:
          'Hay que caminar unos 10 minutos por terreno irregular desde el punto donde nos deja el 4x4, con linterna frontal (la prestamos si no tienes). No es necesaria una forma física especial, pero sí calzado de montaña.',
      },
    ],
    galeria: [
      {
        descripcion:
          'Vehículo 4x4 subiendo de noche por una pista de montaña iluminada por sus faros',
      },
      { descripcion: 'Fotógrafo junto a un raíl motorizado enfocando el núcleo de la Vía Láctea' },
      {
        descripcion:
          'Panorámica del Risco del Fraile con el arco completo de la Vía Láctea sobre la sierra',
      },
    ],
  },
  {
    id: 'pequenos-astronomos',
    nombre: 'Pequeños astrónomos',
    tipo: 'familiar',
    resumen:
      'Taller de tarde para niños de 4 a 9 años: maqueta del sistema solar y primera observación solar segura.',
    descripcion:
      'La opción pensada para las familias con niños demasiado pequeños para aguantar despiertos hasta la noche cerrada. Empezamos a media tarde, con luz solar todavía disponible, con un taller manual en el que cada niño construye un móvil giratorio del sistema solar con los planetas a escala de tamaño (no de distancia, para que quepa en una mochila). Después salimos al exterior para una observación solar segura: usamos un telescopio con filtro solar homologado y una proyección en pantalla para ver manchas solares sin ningún riesgo para la vista. Cerramos con una merienda y el regalo de un cuento ilustrado sobre el origen de las constelaciones, para seguir la conversación en casa.',
    duracionHoras: 1.5,
    precio: 18,
    aptaNinos: true,
    edadMinima: 4,
    aforoMaximo: 12,
    incluye: [
      'Taller de construcción de un móvil del sistema solar',
      'Observación solar segura con filtro homologado y proyección en pantalla',
      'Cuento ilustrado sobre el origen de las constelaciones de regalo',
      'Merienda incluida',
    ],
    horarios: ['18:00 - 19:30'],
    preguntasFrecuentes: [
      {
        pregunta: '¿Es seguro mirar al Sol en esta actividad?',
        respuesta:
          'Sí: usamos exclusivamente telescopios con filtro solar homologado colocado en la parte frontal del tubo, nunca oculares solares sueltos, y reforzamos la imagen con una proyección en pantalla para que ningún niño necesite mirar directamente por el ocular si no quiere.',
      },
      {
        pregunta: '¿Pueden venir niños de más de 9 años?',
        respuesta:
          'Pueden apuntarse, aunque el contenido y el ritmo están pensados para 4-9 años; a partir de esa edad recomendamos directamente "Noche de estrellas en familia", con contenido algo más avanzado.',
      },
      {
        pregunta: '¿Los adultos acompañantes pagan entrada?',
        respuesta:
          'Un adulto acompañante por niño no paga entrada; adultos adicionales sí abonan el precio completo de la experiencia.',
      },
    ],
    galeria: [
      {
        descripcion:
          'Niños pintando las piezas de una maqueta del sistema solar sobre una mesa de madera',
      },
      { descripcion: 'Telescopio con filtro solar homologado apuntando al cielo de tarde' },
      {
        descripcion: 'Proyección del disco solar con manchas visibles sobre una pantalla portátil',
      },
    ],
  },
];

export function buscarExperienciaPorId(id: string): Experiencia | undefined {
  return EXPERIENCIAS.find((experiencia) => experiencia.id === id);
}
