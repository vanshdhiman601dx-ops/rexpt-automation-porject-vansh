import { test, expect } from '@playwright/test';
import validLogin from '../../../test-data/login/validLogin.json' with { type: 'json' };
import { LoginPage } from '../../../pages/authentication/LoginPage.js';
import { fastAgentDetailsLocators } from '../../../locators/fast-agent-details.locators.js';

test.describe('Login positive scenarios', () => {
  test.skip('logs in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(validLogin.email, validLogin.password);

    await expect(page.locator(fastAgentDetailsLocators.header.logoutButton)).toBeVisible();
  });
});
