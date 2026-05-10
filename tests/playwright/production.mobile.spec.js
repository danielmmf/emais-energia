const { test, expect } = require('@playwright/test');

const MENTOR_PASSWORD = process.env.MENTOR_PASSWORD || 'baconpedacudo';
const MENTOR_NAME = process.env.MENTOR_NAME || 'Mentor QA Mobile';

test.use({
  viewport: {
    width: 390,
    height: 844
  }
});

test('producao mobile: rota verde carrega, layout nao estoura e feedback aparece', async ({ page }) => {
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
  await page.getByLabel('Nome do mentor').fill(MENTOR_NAME);
  await page.getByLabel('Senha de acesso').fill(MENTOR_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/viabilidade-verde\/?/);
  await expect(page.getByRole('button', { name: 'Enviar feedback' })).toBeVisible();
  await expect(page.locator('.leaflet-container').first()).toBeVisible();
  await expect(page.locator('.data-source-note')).toContainText(/PID no mapa: .*Portos .*Biometano .*H2/);

  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    html: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));

  expect(overflow.body).toBeLessThanOrEqual(4);
  expect(overflow.html).toBeLessThanOrEqual(4);

  await page.getByText('Goias - Biometano para Fertilizantes').click();
  await page.getByRole('button', { name: 'Calcular Viabilidade' }).click();

  const routeSelect = page.locator('select[ng-model="home.form.recommendedRoute"]');
  const routeOptions = page.locator('select[ng-model="home.form.recommendedRoute"] option');
  const selectedRoute = await routeSelect.evaluate((element) => {
    return element.selectedOptions && element.selectedOptions[0]
      ? element.selectedOptions[0].textContent.trim()
      : '';
  });
  expect(selectedRoute).toBe('Biometano');
  expect(await routeOptions.count()).toBeGreaterThan(0);

  expect(pageErrors, 'page errors').toEqual([]);
  expect(
    consoleErrors.filter((entry) => !/Failed to load resource/i.test(entry)),
    'console errors'
  ).toEqual([]);
});
