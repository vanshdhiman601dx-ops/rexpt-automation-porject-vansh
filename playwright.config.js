import { defineConfig, devices } from '@playwright/test';
import envConfig from './config/config.js';
import { timeouts } from './config/timeouts.js';

const isLocalBaseURL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(envConfig.baseURL);
const frontendStartCommand = process.platform === 'win32' ? 'npm.cmd start' : 'npm start';

export default defineConfig({
  testDir: './flows/Onboardin-flow-A/tests',
  testMatch: /.*authentication[\\/]signup[\\/]signup\.placeholder\.spec\.js/,
  timeout: timeouts.test,
  expect: {
    timeout: timeouts.expect,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/json/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: envConfig.baseURL,
    headless: process.env.HEADLESS === 'true',
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
  ...(isLocalBaseURL
    ? {
        webServer: {
          command: frontendStartCommand,
          cwd: '../Rexpt-application-frontend',
          url: envConfig.baseURL,
          reuseExistingServer: true,
          timeout: timeouts.webServer,
        },
      }
    : {}),
  outputDir: 'reports/traces',
  projects: [
    {
      name: 'Chromium',
      testIgnore: /.*auth\.setup\.js/,
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        permissions: ['microphone'],
      },
    },
  ],
});
