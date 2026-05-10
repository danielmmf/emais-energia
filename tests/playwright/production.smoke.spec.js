const { test, expect } = require('@playwright/test');

const MENTOR_PASSWORD = process.env.MENTOR_PASSWORD || 'baconpedacudo';
const MENTOR_NAME = process.env.MENTOR_NAME || 'Mentor QA';

test('producao: landing bloqueada e app no ar', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Viabilidade Verde' })).toBeVisible();
  await expect(page.getByLabel('Nome do mentor')).toBeVisible();
  await expect(page.getByLabel('Senha de acesso')).toBeVisible();

  await page.getByLabel('Nome do mentor').fill(MENTOR_NAME);
  await page.getByLabel('Senha de acesso').fill(MENTOR_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/viabilidade-verde\/?/);
  await expect(page.locator('body')).not.toContainText('{{');
  await expect(page.locator('.leaflet-container').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Oportunidades' })).toBeVisible();

  await page.getByText('Goias - Biometano para Fertilizantes').click();
  await expect(page.getByText('Potencial territorial:')).toBeVisible();
  await page.getByRole('button', { name: 'Calcular Viabilidade' }).click();
  await page.getByRole('button', { name: 'Executar simulacao' }).click();

  await expect(page.getByRole('heading', { name: 'Resultado' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Custo atual anual' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Custo verde anual' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Economia anual' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recomendacao' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Relatorio Executivo' })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar dados da simulacao' }).click();
  const download = await downloadPromise;
  expect(await download.suggestedFilename()).toMatch(/viabilidade-verde-.*\.html$/);
  await page.waitForTimeout(1000);

  expect(pageErrors, 'page errors').toEqual([]);
  expect(
    consoleErrors.filter((entry) => !/Failed to load resource/i.test(entry)),
    'console errors'
  ).toEqual([]);
});
