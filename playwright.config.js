const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/playwright',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [['line']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://emais-energia.devinhas.com.br',
    headless: true,
    trace: 'retain-on-failure'
  }
});
