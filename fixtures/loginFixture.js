import { test as base, expect } from './baseFixture.js';
import { LoginHelper } from '../helpers/LoginHelper.js';

const test = base.extend({
  loginHelper: async ({ page }, use) => {
    await use(new LoginHelper(page));
  },
});

export { test, expect };
