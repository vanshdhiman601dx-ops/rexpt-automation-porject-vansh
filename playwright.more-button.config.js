import { defineConfig } from '@playwright/test';
import envConfig from './config/config.js';
import { timeouts } from './config/timeouts.js';

export default defineConfig({
  testDir: './flows/more-button-flow/tests',
  testMatch: /.*\.spec\.js/,
  timeout: timeouts.test,
  expect: {
    timeout: timeouts.expect,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/html-more-button', open: 'never' }],
    ['json', { outputFile: 'reports/json/more-button-results.json' }],
    ['list'],
  ],
  use: {
    baseURL: envConfig.baseURL,
    headless: false,
    viewport: null,
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': 'rZRonKR0ieFW5P8f23z7qkJs97Kfx841',
    },
    launchOptions: {
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: 'reports/traces-more-button',
  projects: [
    {
      name: 'Chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        permissions: ['microphone'],
      },
    },
  ],
});
