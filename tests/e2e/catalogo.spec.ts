import { expect, test } from '@playwright/test';

test('filtra por apta para niños y muestra el estado vacío con precio bajo', async ({ page }) => {
  await page.goto('/experiencias?aptaNinos=1');
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3);
  await expect(page.getByText('Caza de la Vía Láctea')).toHaveCount(0);

  await page.goto('/experiencias?precioMax=15');
  await expect(page.getByText('Ninguna experiencia cumple estos filtros')).toBeVisible();
  await page.getByRole('button', { name: 'Quitar filtros' }).last().click();
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(6);
});

test('el modo de error simulado ofrece reintentar', async ({ page }) => {
  await page.goto('/experiencias?simular=error');
  await expect(page.getByRole('alert')).toContainText('No se han podido cargar las experiencias');
  await page.evaluate(() => history.replaceState({}, '', '/experiencias'));
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(6);
});
