// Revisión visual: capturas de cada página en móvil/escritorio y claro/oscuro.
// Uso: npm run build && npm run preview (en otra terminal) && node scripts/capturas.mjs [ruta ...]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const SALIDA = 'tests/e2e/.capturas';
const PAGINAS = {
  inicio: '/',
  experiencias: '/experiencias',
  detalle: '/experiencias/caza-de-la-via-lactea',
  reservar: '/reservar',
  cielo: '/el-cielo-esta-noche',
  diario: '/diario',
  articulo: '/diario/que-ver-en-el-cielo-de-otono',
  404: '/no-existe',
};
const VIEWPORTS = {
  movil: { width: 375, height: 812 },
  escritorio: { width: 1440, height: 900 },
};

const filtro = process.argv.slice(2);
const nombres = Object.keys(PAGINAS).filter((n) => filtro.length === 0 || filtro.includes(n));

mkdirSync(SALIDA, { recursive: true });
const navegador = await chromium.launch();

for (const [vpNombre, viewport] of Object.entries(VIEWPORTS)) {
  for (const tema of ['light', 'dark']) {
    const contexto = await navegador.newContext({
      viewport,
      colorScheme: tema,
      reducedMotion: process.env.MOVIMIENTO_REDUCIDO ? 'reduce' : 'no-preference',
    });
    for (const nombre of nombres) {
      const pagina = await contexto.newPage();
      await pagina.goto(BASE + PAGINAS[nombre], { waitUntil: 'networkidle' });
      await pagina.waitForTimeout(nombre === 'inicio' ? 2500 : 1800);
      await pagina.screenshot({
        path: `${SALIDA}/${nombre}-${vpNombre}-${tema}.png`,
        fullPage: nombre !== 'inicio',
      });
      await pagina.close();
    }
    await contexto.close();
  }
}
await navegador.close();
console.log(`Capturas en ${SALIDA}`);
