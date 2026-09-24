import { expect, test } from '@playwright/test';

test('una URL inexistente muestra la 404 propia con estado 404', async ({ page }) => {
  const respuesta = await page.goto('/esta-pagina-no-existe');
  expect(respuesta?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Aquí no hay ni una estrella' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver experiencias' })).toBeVisible();
});

test('navega de inicio a una experiencia y a reservar con la experiencia elegida', async ({
  page,
}) => {
  await page.goto('/experiencias');
  await page.getByRole('link', { name: 'Caza de la Vía Láctea' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Caza de la Vía Láctea');
  await page.getByRole('link', { name: 'Reservar esta experiencia' }).first().click();
  await expect(page).toHaveURL(/experiencia=caza-de-la-via-lactea/);
  await expect(page.getByRole('radio', { name: /Caza de la Vía Láctea/ })).toBeChecked();
});

test('el artículo del diario muestra índice y tiempo de lectura', async ({ page }) => {
  await page.goto('/diario/que-ver-en-el-cielo-de-otono');
  await expect(page.getByText(/min de lectura/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'En este artículo' })).toBeVisible();
});
