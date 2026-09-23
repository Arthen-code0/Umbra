/** Constantes de marca reutilizadas en metadatos, JSON-LD y el pie de página. */
export const SITIO = {
  nombre: 'Umbra',
  nombreCompleto: 'Umbra — Observatorio Astronómico de Gredos',
  eslogan: 'Donde el cielo todavía se ve entero',
  url: 'https://umbra-observatorio.example',
  descripcion:
    'Observatorio astronómico en el Collado del Cielo, Sierra de Gredos: noches de observación, talleres de astrofotografía y experiencias familiares lejos de la contaminación lumínica.',
  telefono: '+34 920 55 18 40',
  email: 'reservas@umbra-observatorio.example',
  direccion: {
    calle: 'Collado del Cielo, s/n',
    localidad: 'Hoyos del Espino',
    region: 'Ávila',
    codigoPostal: '05634',
    pais: 'ES',
  },
  coordenadas: { lat: 40.2508, lon: -5.1667 },
  altitudMetros: 1850,
  redesSociales: [
    'https://www.instagram.com/umbra.observatorio',
    'https://www.facebook.com/umbraobservatorio',
  ],
} as const;

export const NAV_PRINCIPAL = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Experiencias', href: '/experiencias' },
  { etiqueta: 'El cielo esta noche', href: '/el-cielo-esta-noche' },
  { etiqueta: 'Diario', href: '/diario' },
] as const;
