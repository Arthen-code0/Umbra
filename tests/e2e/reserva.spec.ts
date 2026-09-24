import { expect, test, type Page } from '@playwright/test';

async function elegirFechaConPlazas(page: Page) {
  const fecha = page.getByLabel('Fecha', { exact: true });
  await expect(fecha).toBeVisible();
  const valor = await fecha
    .locator('option', { hasText: 'plazas libres' })
    .first()
    .getAttribute('value');
  await fecha.selectOption(valor!);
  await page.getByRole('button', { name: 'Continuar' }).click();
}

async function completarHastaResumen(page: Page) {
  await page.goto('/reservar?experiencia=noche-de-estrellas-en-familia');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await elegirFechaConPlazas(page);

  await page.getByLabel('Nombre y apellidos').fill('Ana García');
  await page.getByLabel('Correo electrónico').fill('ana@example.com');
  await page.getByLabel('Teléfono').fill('600111222');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: /4\. Resumen/ })).toBeVisible();
}

test('reserva completa hasta la confirmación con localizador', async ({ page }) => {
  await completarHastaResumen(page);
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await expect(page.getByRole('heading', { name: 'Reserva confirmada' })).toBeVisible();
  await expect(page.getByText(/UMB-[A-Z0-9]{6}/)).toBeVisible();
});

test('el error simulado se muestra junto al botón y se puede reintentar', async ({ page }) => {
  await completarHastaResumen(page);
  await page.evaluate(() => history.replaceState({}, '', '/reservar?simular=error'));
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await expect(page.getByRole('alert')).toContainText('sistema de reservas no responde');
  await expect(page.getByRole('button', { name: 'Confirmar reserva' })).toBeEnabled();
});

test('valida los campos obligatorios y mueve el foco al primer error', async ({ page }) => {
  await page.goto('/reservar?experiencia=pequenos-astronomos');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await elegirFechaConPlazas(page);

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Este campo es obligatorio')).toHaveCount(3);
  await expect(page.getByLabel('Nombre y apellidos')).toBeFocused();
});
