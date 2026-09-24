// Uso: npm run build && npm run preview (otra terminal) && node scripts/lighthouse.mjs [ruta ...]
// Lanza el Chromium de Playwright con depuración remota y pasa Lighthouse en móvil y escritorio.
import { chromium } from '@playwright/test';
import lighthouse, { desktopConfig } from 'lighthouse';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const rutas = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/', '/experiencias', '/reservar'];
const PUERTO = 9333;

const contexto = await chromium.launchPersistentContext('', {
  args: [`--remote-debugging-port=${PUERTO}`],
});

let hayFallos = false;
for (const ruta of rutas) {
  for (const [nombre, config] of [
    ['móvil', undefined],
    ['escritorio', desktopConfig],
  ]) {
    const { lhr } = await lighthouse(
      BASE + ruta,
      {
        port: PUERTO,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      config,
    );
    const puntuaciones = Object.values(lhr.categories).map((c) => ({
      id: c.id,
      valor: Math.round(c.score * 100),
    }));
    if (puntuaciones.some((p) => p.valor < 90)) hayFallos = true;
    console.log(
      `${ruta.padEnd(14)} ${nombre.padEnd(10)}`,
      puntuaciones.map((p) => `${p.id.slice(0, 4)}:${p.valor}`).join(' '),
      `| LCP ${lhr.audits['largest-contentful-paint'].displayValue}`,
      `CLS ${lhr.audits['cumulative-layout-shift'].displayValue}`,
      `TBT ${lhr.audits['total-blocking-time'].displayValue}`,
    );
  }
}
await contexto.close();
process.exit(hayFallos ? 1 : 0);
