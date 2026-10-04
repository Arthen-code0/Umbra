import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Line,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  type IUniform,
} from 'three';

/**
 * Escena de la portada: un único cielo continuo que pasa del atardecer a la
 * noche cerrada según el scroll. Capas:
 *  1. Cielo (shader): degradado, sol, estrellas procedurales y Vía Láctea.
 *  2. Estrellas brillantes con parpadeo, constelación que se dibuja,
 *     planeta con anillos y estrellas fugaces.
 *  3. Montañas y telescopio en 2D con paralaje (cámara ortográfica).
 * Se pausa fuera de pantalla y reduce el coste en móvil.
 */

const GLSL_RUIDO = /* glsl */ `
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float ruido(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < OCTAVAS; i++) { v += a * ruido(p); p *= 2.03; a *= 0.5; } return v; }
`;

const VERTEX_CIELO = /* glsl */ `
varying vec3 vDir;
void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const FRAGMENT_CIELO = /* glsl */ `
varying vec3 vDir;
uniform float uNoche; uniform float uTiempo; uniform vec3 uSol;
${GLSL_RUIDO}
void main(){
  vec3 d = normalize(vDir);
  float t = pow(clamp(d.y, 0.0, 1.0), 0.55);
  vec3 dia = mix(vec3(1.0, 0.50, 0.22), mix(vec3(0.55, 0.28, 0.45), vec3(0.07, 0.07, 0.22), smoothstep(0.25, 1.0, t)), smoothstep(0.0, 0.45, t));
  vec3 noche = mix(vec3(0.07, 0.10, 0.22), vec3(0.006, 0.010, 0.030), t);
  float k = smoothstep(0.15, 0.85, uNoche);
  vec3 col = mix(dia, noche, k);

  float s = max(dot(d, normalize(uSol)), 0.0);
  col += vec3(1.0, 0.45, 0.22) * (pow(s, 18.0) * 0.45 + pow(s, 180.0) * 0.6) * (1.0 - k);

  float vis = smoothstep(0.25, 0.8, uNoche) * smoothstep(-0.05, 0.25, d.y);
  vec3 p = d * 70.0; vec3 id = floor(p); vec3 f = fract(p) - 0.5; float hs = hash(id);
  float estrella = step(0.982, hs) * smoothstep(0.32, 0.0, length(f)) * (0.6 + 0.4 * sin(uTiempo * (1.0 + hs * 4.0) + hs * 40.0));
  col += vec3(0.9, 0.92, 1.0) * estrella * vis;

  vec3 n = normalize(vec3(0.75, 0.55, 0.32));
  float dd = dot(d, n);
  float banda = exp(-dd * dd * 9.0);
  float nube = fbm(d * 3.5 + vec3(0.0, 0.0, uTiempo * 0.003));
  #ifdef POLVO
  float polvo = fbm(d * 9.0 + 4.0);
  float mw = banda * (0.35 + 0.9 * nube) * (1.0 - 0.7 * smoothstep(0.45, 0.8, polvo));
  #else
  float mw = banda * (0.35 + 0.9 * nube);
  #endif
  col += mix(vec3(0.35, 0.40, 0.70), vec3(0.90, 0.70, 0.50), nube) * mw * 1.0 * smoothstep(0.45, 0.95, uNoche) * smoothstep(-0.02, 0.3, d.y);

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERTEX_ESTRELLAS = /* glsl */ `
attribute float aTam; attribute float aFase; attribute vec3 aColor;
uniform float uPx; uniform float uTiempo; uniform float uNoche;
varying vec3 vC; varying float vA;
void main(){
  vC = aColor;
  float tw = 0.65 + 0.35 * sin(uTiempo * (0.8 + aFase * 0.5) + aFase * 20.0);
  vA = tw * smoothstep(0.2, 0.7, uNoche);
  gl_PointSize = aTam * uPx * (0.8 + 0.5 * tw);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const FRAGMENT_ESTRELLAS = /* glsl */ `
varying vec3 vC; varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d); a *= a;
  gl_FragColor = vec4(vC, a * vA);
}
`;

const VERTEX_PLANETA = /* glsl */ `
varying vec3 vN; varying vec3 vP; varying vec3 vW;
void main(){
  vP = position; vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;
const FRAGMENT_PLANETA = /* glsl */ `
varying vec3 vN; varying vec3 vP; varying vec3 vW;
uniform float uTiempo; uniform vec3 uLuz;
${GLSL_RUIDO}
void main(){
  vec3 n = normalize(vN);
  float banda = sin(vP.y * 18.0 + fbm(vP * 3.0 + uTiempo * 0.01) * 3.0) * 0.5 + 0.5;
  vec3 base = mix(vec3(0.62, 0.42, 0.28), vec3(0.86, 0.68, 0.45), banda);
  base = mix(base, vec3(0.93, 0.82, 0.62), smoothstep(0.6, 1.0, fbm(vP * 5.0)));
  float l = clamp(dot(n, normalize(uLuz)) * 1.1 + 0.12, 0.0, 1.0);
  vec3 v = normalize(cameraPosition - vW);
  float borde = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 col = base * (0.10 + l * 0.95) + vec3(0.95, 0.65, 0.35) * borde * 0.22 * l;
  gl_FragColor = vec4(col, 1.0);
}
`;

const VERTEX_ANILLOS = /* glsl */ `
varying float vR;
void main(){ vR = length(position.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const FRAGMENT_ANILLOS = /* glsl */ `
varying float vR; uniform float uInterior; uniform float uExterior;
void main(){
  float t = (vR - uInterior) / (uExterior - uInterior);
  float a = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.92, t);
  float r = sin(t * 60.0) * 0.5 + 0.5; r = mix(r, sin(t * 90.0 + 2.0) * 0.5 + 0.5, 0.4);
  a *= (0.25 + 0.75 * r) * (1.0 - 0.9 * (1.0 - smoothstep(0.0, 0.035, abs(t - 0.47))));
  vec3 col = mix(vec3(0.70, 0.56, 0.40), vec3(0.93, 0.82, 0.64), r);
  gl_FragColor = vec4(col, a * 0.85);
}
`;

const VERTEX_LINEA = /* glsl */ `
attribute float aAlfa;
varying float vAlfa;
void main(){ vAlfa = aAlfa; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const FRAGMENT_LINEA = /* glsl */ `
varying float vAlfa; uniform vec3 uColor; uniform float uGlobal;
void main(){ gl_FragColor = vec4(uColor, vAlfa * uGlobal); }
`;

const NODOS: [number, number][] = [
  [-3.2, 1.6],
  [-1.9, 2.4],
  [-0.6, 1.5],
  [0.9, 2.6],
  [2.2, 1.7],
  [0.6, 0.2],
  [-0.7, -0.9],
];
const ENLACES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [5, 6],
  [2, 6],
];

function hashNum(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function ruido1D(x: number, semilla: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hashNum(i + semilla);
  const b = hashNum(i + 1 + semilla);
  return a + (b - a) * u;
}
function cresta(x: number, semilla: number, frecuencia: number): number {
  return (
    0.55 * ruido1D(x * frecuencia, semilla) +
    0.3 * ruido1D(x * frecuencia * 2.3, semilla + 10) +
    0.15 * ruido1D(x * frecuencia * 5.1, semilla + 20)
  );
}

const suavizar = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function crearCielo(movil: boolean): Mesh {
  const material = new ShaderMaterial({
    vertexShader: VERTEX_CIELO,
    fragmentShader: FRAGMENT_CIELO,
    side: BackSide,
    depthWrite: false,
    defines: { OCTAVAS: movil ? 3 : 5, ...(movil ? {} : { POLVO: 1 }) },
    uniforms: {
      uNoche: { value: 0 },
      uTiempo: { value: 0 },
      uSol: { value: new Vector3(-0.55, 0.1, -0.83) },
    },
  });
  return new Mesh(new SphereGeometry(100, 48, 32), material);
}

function crearEstrellas(cantidad: number): Points {
  const posiciones = new Float32Array(cantidad * 3);
  const tamanos = new Float32Array(cantidad);
  const fases = new Float32Array(cantidad);
  const colores = new Float32Array(cantidad * 3);
  const frias = [0.75, 0.85, 1.0];
  const calidas = [1.0, 0.82, 0.62];
  for (let i = 0; i < cantidad; i++) {
    const theta = Math.random() * Math.PI * 2;
    const y = 0.02 + Math.random() * 0.98;
    const r = Math.sqrt(1 - y * y);
    const radio = 80;
    posiciones.set([radio * r * Math.cos(theta), radio * y, radio * r * Math.sin(theta)], i * 3);
    tamanos[i] = 2 + Math.pow(Math.random(), 3) * 8;
    fases[i] = Math.random();
    const mezcla = Math.random() < 0.25 ? calidas : frias;
    colores.set(mezcla, i * 3);
  }
  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new Float32BufferAttribute(posiciones, 3));
  geometria.setAttribute('aTam', new Float32BufferAttribute(tamanos, 1));
  geometria.setAttribute('aFase', new Float32BufferAttribute(fases, 1));
  geometria.setAttribute('aColor', new Float32BufferAttribute(colores, 3));
  const material = new ShaderMaterial({
    vertexShader: VERTEX_ESTRELLAS,
    fragmentShader: FRAGMENT_ESTRELLAS,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uPx: { value: 1 }, uTiempo: { value: 0 }, uNoche: { value: 0 } },
  });
  const estrellas = new Points(geometria, material);
  estrellas.frustumCulled = false;
  return estrellas;
}

function crearConstelacion() {
  const grupo = new Group();
  const posNodos = NODOS.flatMap(([x, y]) => [x, y, 0]);
  const geoNodos = new BufferGeometry();
  geoNodos.setAttribute('position', new Float32BufferAttribute(posNodos, 3));
  geoNodos.setAttribute(
    'aTam',
    new Float32BufferAttribute(new Float32Array(NODOS.length).fill(20), 1),
  );
  geoNodos.setAttribute(
    'aFase',
    new Float32BufferAttribute(
      NODOS.map((_, i) => i * 0.37),
      1,
    ),
  );
  geoNodos.setAttribute(
    'aColor',
    new Float32BufferAttribute(
      NODOS.flatMap(() => [1, 0.72, 0.45]),
      3,
    ),
  );
  const matNodos = new ShaderMaterial({
    vertexShader: VERTEX_ESTRELLAS,
    fragmentShader: FRAGMENT_ESTRELLAS,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uPx: { value: 1 }, uTiempo: { value: 0 }, uNoche: { value: 1 } },
  });
  const nodos = new Points(geoNodos, matNodos);
  nodos.frustumCulled = false;

  const posiciones: number[] = [];
  for (const [a, b] of ENLACES) {
    posiciones.push(NODOS[a][0], NODOS[a][1], 0, NODOS[b][0], NODOS[b][1], 0);
  }
  const alfa = new Float32Array(ENLACES.length * 2);
  const geoLineas = new BufferGeometry();
  geoLineas.setAttribute('position', new Float32BufferAttribute(posiciones, 3));
  const atributoAlfa = new Float32BufferAttribute(alfa, 1);
  geoLineas.setAttribute('aAlfa', atributoAlfa);
  const matLineas = new ShaderMaterial({
    vertexShader: VERTEX_LINEA,
    fragmentShader: FRAGMENT_LINEA,
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new Vector3(1, 0.72, 0.45) }, uGlobal: { value: 0.7 } },
  });
  const lineas = new LineSegments(geoLineas, matLineas);
  lineas.frustumCulled = false;
  grupo.add(nodos, lineas);

  const azimut = MathUtils.degToRad(2);
  const elevacion = MathUtils.degToRad(33);
  const radio = 24;
  grupo.position.set(
    radio * Math.sin(azimut) * Math.cos(elevacion),
    radio * Math.sin(elevacion),
    -radio * Math.cos(azimut) * Math.cos(elevacion),
  );
  grupo.scale.setScalar(1.9);
  grupo.lookAt(0, 0, 0);

  return { grupo, matNodos, atributoAlfa };
}

function crearPlaneta() {
  const grupo = new Group();
  const matPlaneta = new ShaderMaterial({
    vertexShader: VERTEX_PLANETA,
    fragmentShader: FRAGMENT_PLANETA,
    defines: { OCTAVAS: 4 },
    uniforms: { uTiempo: { value: 0 }, uLuz: { value: new Vector3(-0.7, 0.35, 0.6) } },
  });
  const planeta = new Mesh(new SphereGeometry(1, 64, 48), matPlaneta);
  const matAnillos = new ShaderMaterial({
    vertexShader: VERTEX_ANILLOS,
    fragmentShader: FRAGMENT_ANILLOS,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    uniforms: { uInterior: { value: 1.45 }, uExterior: { value: 2.45 } },
  });
  const anillos = new Mesh(new RingGeometry(1.45, 2.45, 160, 1), matAnillos);
  anillos.rotation.x = Math.PI / 2;
  grupo.add(planeta, anillos);
  grupo.rotation.set(0.35, 0, -0.38);
  grupo.position.set(6.2, 7.6, -17);
  grupo.scale.setScalar(1.6);
  return { grupo, planeta, matPlaneta };
}

interface EstrellaFugaz {
  linea: Line;
  inicio: Vector3;
  direccion: Vector3;
  edad: number;
  vida: number;
  activa: boolean;
  uniforms: Record<string, IUniform>;
}

function crearEstrellaFugaz(): EstrellaFugaz {
  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new Float32BufferAttribute(new Float32Array(6), 3));
  geometria.setAttribute('aT', new Float32BufferAttribute([0, 1], 1));
  const uniforms: Record<string, IUniform> = { uVida: { value: 0 } };
  const material = new ShaderMaterial({
    vertexShader: `attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying float vT; uniform float uVida; void main(){ gl_FragColor = vec4(vec3(1.0, 0.95, 0.85), pow(vT, 2.0) * uVida); }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms,
  });
  const linea = new Line(geometria, material);
  linea.frustumCulled = false;
  linea.visible = false;
  return {
    linea,
    inicio: new Vector3(),
    direccion: new Vector3(),
    edad: 0,
    vida: 1,
    activa: false,
    uniforms,
  };
}

function crearCordillera(
  semilla: number,
  base: number,
  amplitud: number,
  frecuencia: number,
  color: MeshBasicMaterial,
): Mesh {
  const ancho = 6;
  const forma = new Shape();
  forma.moveTo(-ancho, -1.3);
  const pasos = 220;
  for (let i = 0; i <= pasos; i++) {
    const x = -ancho + (2 * ancho * i) / pasos;
    forma.lineTo(x, base + amplitud * cresta(x, semilla, frecuencia));
  }
  forma.lineTo(ancho, -1.3);
  forma.closePath();
  return new Mesh(new ShapeGeometry(forma), color);
}

function rectanguloInclinado(
  desde: [number, number],
  hasta: [number, number],
  grosor: number,
  material: MeshBasicMaterial,
): Mesh {
  const dx = hasta[0] - desde[0];
  const dy = hasta[1] - desde[1];
  const largo = Math.hypot(dx, dy);
  const nx = (-dy / largo) * (grosor / 2);
  const ny = (dx / largo) * (grosor / 2);
  const forma = new Shape();
  forma.moveTo(desde[0] + nx, desde[1] + ny);
  forma.lineTo(hasta[0] + nx, hasta[1] + ny);
  forma.lineTo(hasta[0] - nx, hasta[1] - ny);
  forma.lineTo(desde[0] - nx, desde[1] - ny);
  forma.closePath();
  return new Mesh(new ShapeGeometry(forma), material);
}

function crearTelescopio(material: MeshBasicMaterial): Group {
  const grupo = new Group();
  const pivote: [number, number] = [0, 0];
  const angulo = MathUtils.degToRad(42);
  const u: [number, number] = [Math.cos(angulo), Math.sin(angulo)];
  grupo.add(
    rectanguloInclinado(
      [pivote[0] - u[0] * 0.12, pivote[1] - u[1] * 0.12],
      [pivote[0] + u[0] * 0.5, pivote[1] + u[1] * 0.5],
      0.075,
      material,
    ),
    rectanguloInclinado(
      [pivote[0] + u[0] * 0.43, pivote[1] + u[1] * 0.43],
      [pivote[0] + u[0] * 0.56, pivote[1] + u[1] * 0.56],
      0.105,
      material,
    ),
    rectanguloInclinado([pivote[0], pivote[1]], [-0.17, -0.62], 0.016, material),
    rectanguloInclinado([pivote[0], pivote[1]], [0.14, -0.62], 0.016, material),
    rectanguloInclinado([pivote[0], pivote[1]], [-0.02, -0.62], 0.016, material),
  );
  return grupo;
}

export function crearEscena(contenedor: HTMLElement): () => void {
  const movil = window.innerWidth < 768;
  const escenaDom = contenedor.closest<HTMLElement>('[data-escena]');
  const narrativaDom = document.querySelector<HTMLElement>('[data-narrativa]');
  const punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let renderizador: WebGLRenderer;
  try {
    renderizador = new WebGLRenderer({
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });
  } catch {
    return () => undefined;
  }
  const dpr = Math.min(window.devicePixelRatio, movil ? 1 : 2);
  renderizador.setPixelRatio(dpr);
  renderizador.autoClear = false;
  contenedor.appendChild(renderizador.domElement);

  // --- Escena 3D ---
  const escena = new Scene();
  const camara = new PerspectiveCamera(60, 1, 0.1, 400);
  camara.rotation.order = 'YXZ';

  const cielo = crearCielo(movil);
  const estrellas = crearEstrellas(movil ? 650 : 1500);
  const constelacion = crearConstelacion();
  const planeta = crearPlaneta();
  const fugaces = Array.from({ length: 3 }, crearEstrellaFugaz);
  escena.add(cielo, estrellas, constelacion.grupo, planeta.grupo, ...fugaces.map((f) => f.linea));

  // --- Capa 2D: montañas y telescopio ---
  const escenaMontanas = new Scene();
  const camaraOrto = new OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const colores = {
    lejana: { dia: [0.55, 0.35, 0.5], noche: [0.05, 0.08, 0.16] },
    media: { dia: [0.3, 0.18, 0.3], noche: [0.03, 0.05, 0.1] },
    cercana: { dia: [0.1, 0.06, 0.12], noche: [0.01, 0.015, 0.03] },
    primer: { dia: [0.02, 0.015, 0.03], noche: [0.004, 0.006, 0.012] },
  } as const;
  const materiales = {
    lejana: new MeshBasicMaterial(),
    media: new MeshBasicMaterial(),
    cercana: new MeshBasicMaterial(),
    primer: new MeshBasicMaterial(),
  };
  const capas = [
    { malla: crearCordillera(3, -0.28, 0.3, 0.9, materiales.lejana), z: 0, k: 0.012 },
    { malla: crearCordillera(11, -0.46, 0.26, 1.2, materiales.media), z: 1, k: 0.03 },
    { malla: crearCordillera(23, -0.66, 0.2, 1.6, materiales.cercana), z: 2, k: 0.055 },
  ];
  const montanas = new Group();
  for (const capa of capas) {
    capa.malla.position.z = capa.z;
    montanas.add(capa.malla);
  }
  const telescopio = crearTelescopio(materiales.primer);
  telescopio.position.z = 3;
  telescopio.scale.set(-0.85, 0.85, 1);
  const primerPlano = crearCordillera(41, -0.9, 0.1, 2.2, materiales.primer);
  primerPlano.position.z = 3;
  montanas.add(primerPlano);
  escenaMontanas.add(montanas, telescopio);

  const raton = { x: 0, y: 0 };
  const objetivo = { x: 0, y: 0 };
  let noche = 0.12;
  let alturaPlaneta = 7.6;
  let aspecto = 1;

  function ajustarTamano() {
    const { clientWidth: ancho, clientHeight: altura } = contenedor;
    if (ancho === 0 || altura === 0) return;
    aspecto = ancho / altura;
    renderizador.setSize(ancho, altura, false);
    camara.aspect = aspecto;
    camara.updateProjectionMatrix();
    camaraOrto.left = -aspecto;
    camaraOrto.right = aspecto;
    camaraOrto.updateProjectionMatrix();
    montanas.scale.x = MathUtils.clamp(aspecto / 1.6, 0.35, 1);
    telescopio.position.x = aspecto * (aspecto < 1 ? 0.55 : 0.62);
    telescopio.scale.set(aspecto < 1 ? -0.6 : -0.85, aspecto < 1 ? 0.6 : 0.85, 1);
    telescopio.position.y = aspecto < 1 ? -0.62 : -0.4;
    const retrato = aspecto < 1;
    alturaPlaneta = retrato ? 9.8 : 7.6;
    planeta.grupo.scale.setScalar(retrato ? 0.8 : 1.6);
    planeta.grupo.position.x = retrato
      ? 17 * Math.tan(MathUtils.degToRad(30)) * aspecto * 0.5
      : 6.2;
    const uPx = dpr * MathUtils.clamp(altura / 900, 0.6, 1.4);
    (estrellas.material as ShaderMaterial).uniforms.uPx.value = uPx;
    constelacion.matNodos.uniforms.uPx.value = uPx;
  }

  function progresoNarrativa(): number {
    if (!narrativaDom) return 0;
    const r = narrativaDom.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (total <= 0) return r.top <= 0 ? 1 : 0;
    return MathUtils.clamp(-r.top / total, 0, 1);
  }

  function lanzarFugaz(f: EstrellaFugaz) {
    const local = new Vector3(MathUtils.randFloat(-18, 18), MathUtils.randFloat(5, 16), -34);
    f.inicio.copy(camara.localToWorld(local));
    const dirLocal = new Vector3(MathUtils.randFloat(-1, -0.45), -0.35, 0).normalize();
    f.direccion.copy(dirLocal.transformDirection(camara.matrixWorld));
    f.edad = 0;
    f.vida = MathUtils.randFloat(0.7, 1.1);
    f.activa = true;
    f.linea.visible = true;
  }

  let proximaFugaz = 2;
  let visible = true;
  let idAnimacion = 0;
  let primerFotograma = true;
  let ultimo = performance.now();

  function fotograma() {
    idAnimacion = 0;
    if (!visible || document.hidden) return;
    const ahora = performance.now();
    if (movil && ahora - ultimo < 32) {
      idAnimacion = requestAnimationFrame(fotograma);
      return;
    }
    const dt = Math.min((ahora - ultimo) / 1000, 0.1);
    ultimo = ahora;
    const t = ahora / 1000;

    const cubierta =
      narrativaDom &&
      !narrativaDom.classList.contains('narrativa--animada') &&
      narrativaDom.getBoundingClientRect().top <= 0;
    if (cubierta) {
      idAnimacion = requestAnimationFrame(fotograma);
      return;
    }

    raton.x = MathUtils.lerp(raton.x, objetivo.x, 0.05);
    raton.y = MathUtils.lerp(raton.y, objetivo.y, 0.05);
    const q = progresoNarrativa();
    noche = MathUtils.lerp(noche, 0.12 + 0.88 * q, 0.08);
    const heroScroll = MathUtils.clamp(window.scrollY / window.innerHeight, 0, 1);

    const k = suavizar(0, 1, noche);
    camara.rotation.x = 0.12 + 0.3 * k + raton.y * -0.03;
    camara.rotation.y = -raton.x * 0.09;

    const sky = (cielo.material as ShaderMaterial).uniforms;
    sky.uNoche.value = noche;
    sky.uTiempo.value = t;
    (sky.uSol.value as Vector3).y = MathUtils.lerp(0.1, -0.35, suavizar(0, 0.6, noche));
    const stars = (estrellas.material as ShaderMaterial).uniforms;
    stars.uNoche.value = noche;
    stars.uTiempo.value = t;
    constelacion.matNodos.uniforms.uTiempo.value = t;
    constelacion.matNodos.uniforms.uNoche.value = suavizar(0.4, 0.8, noche);

    // La constelación se dibuja trazo a trazo entre noche 0.5 y 0.95.
    const dibujo = suavizar(0.5, 0.95, noche) * ENLACES.length;
    const alfa = constelacion.atributoAlfa;
    for (let i = 0; i < ENLACES.length; i++) {
      const a = MathUtils.clamp(dibujo - i, 0, 1);
      alfa.setX(i * 2, a);
      alfa.setX(i * 2 + 1, a);
    }
    alfa.needsUpdate = true;

    planeta.planeta.rotation.y = t * 0.05;
    planeta.matPlaneta.uniforms.uTiempo.value = t;
    planeta.grupo.position.y = alturaPlaneta + Math.sin(t * 0.3) * 0.08;

    proximaFugaz -= dt;
    if (proximaFugaz <= 0 && noche > 0.65) {
      const libre = fugaces.find((f) => !f.activa);
      if (libre) lanzarFugaz(libre);
      proximaFugaz = MathUtils.randFloat(2.5, 6);
    }
    for (const f of fugaces) {
      if (!f.activa) continue;
      f.edad += dt;
      const p = f.edad / f.vida;
      if (p >= 1) {
        f.activa = false;
        f.linea.visible = false;
        continue;
      }
      const cabeza = f.inicio.clone().addScaledVector(f.direccion, f.edad * 34);
      const cola = cabeza.clone().addScaledVector(f.direccion, -7);
      const pos = f.linea.geometry.getAttribute('position');
      pos.setXYZ(0, cola.x, cola.y, cola.z);
      pos.setXYZ(1, cabeza.x, cabeza.y, cabeza.z);
      pos.needsUpdate = true;
      f.uniforms.uVida.value = Math.sin(p * Math.PI);
    }

    // Colores de las montañas: del malva del atardecer al casi negro de la noche.
    const mezcla = suavizar(0.1, 0.85, noche);
    (Object.keys(materiales) as (keyof typeof materiales)[]).forEach((clave) => {
      const { dia, noche: nc } = colores[clave];
      materiales[clave].color.setRGB(
        MathUtils.lerp(dia[0], nc[0], mezcla),
        MathUtils.lerp(dia[1], nc[1], mezcla),
        MathUtils.lerp(dia[2], nc[2], mezcla),
        SRGBColorSpace,
      );
    });
    for (const capa of capas) capa.malla.position.x = raton.x * capa.k * 4;
    montanas.position.y = -heroScroll * 0.12;
    telescopio.position.y = (aspecto < 1 ? -0.62 : -0.4) - heroScroll * 0.12;

    renderizador.clear();
    renderizador.render(escena, camara);
    renderizador.clearDepth();
    renderizador.render(escenaMontanas, camaraOrto);

    if (primerFotograma) {
      primerFotograma = false;
      contenedor.classList.add('is-lista');
      escenaDom?.classList.add('escena--3d');
    }
    idAnimacion = requestAnimationFrame(fotograma);
  }

  function arrancar() {
    ultimo = performance.now();
    if (idAnimacion === 0) idAnimacion = requestAnimationFrame(fotograma);
  }

  function alMoverRaton(evento: PointerEvent) {
    objetivo.x = (evento.clientX / window.innerWidth - 0.5) * 2;
    objetivo.y = (evento.clientY / window.innerHeight - 0.5) * 2;
  }

  const observadorVisibilidad = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    if (visible) arrancar();
  });
  observadorVisibilidad.observe(contenedor);
  const observadorTamano = new ResizeObserver(ajustarTamano);
  observadorTamano.observe(contenedor);
  if (punteroFino) window.addEventListener('pointermove', alMoverRaton, { passive: true });
  document.addEventListener('visibilitychange', arrancar);

  ajustarTamano();
  arrancar();

  return () => {
    visible = false;
    cancelAnimationFrame(idAnimacion);
    observadorVisibilidad.disconnect();
    observadorTamano.disconnect();
    window.removeEventListener('pointermove', alMoverRaton);
    document.removeEventListener('visibilitychange', arrancar);
    for (const raiz of [escena, escenaMontanas]) {
      raiz.traverse((objeto) => {
        const malla = objeto as Mesh;
        malla.geometry?.dispose();
        const material = malla.material as ShaderMaterial | MeshBasicMaterial | undefined;
        material?.dispose();
      });
    }
    renderizador.dispose();
    renderizador.domElement.remove();
    contenedor.classList.remove('is-lista');
    escenaDom?.classList.remove('escena--3d');
  };
}
