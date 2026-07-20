import { defineConfig, devices } from '@playwright/test';
import envConfig from './config/config.js';
import { timeouts } from './config/timeouts.js';

const isLocalBaseURL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(envConfig.baseURL);
const frontendStartCommand = process.platform === 'win32' ? 'npm.cmd start' : 'npm start';

export default defineConfig({
  testDir: './tests',
  timeout: timeouts.test,
  expect: {
    timeout: timeouts.expect,
  },
  fullyParallel: true,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/json/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: envConfig.baseURL,
    headless: false,
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
      name: 'setup',
      testMatch: /.*auth\.setup\.js/,
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'iPhone 14',
      dependencies: ['setup'],
      testIgnore: /.*auth\.setup\.js/,
      use: {
        ...devices['iPhone 14'],
        storageState: 'playwright/.auth/users.json',
      },
    },
  ],
});
