import { test as base, expect } from './baseFixture.js';

const test = base.extend({
  dashboardPage: async ({ page }, use) => {
    await use(page);
  },
});

export { test, expect };
