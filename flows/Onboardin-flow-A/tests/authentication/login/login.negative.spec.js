import { test, expect } from '@playwright/test';
import invalidLogin from '../../../../../test-data/login/invalidLogin.json' with { type: 'json' };
import { LoginPage } from '../../../pages/authentication/LoginPage.js';
import { loginLocators } from '../../../../../locators/login.locators.js';

test.describe('Login negative scenarios', () => {
  test.skip('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(invalidLogin.email, invalidLogin.password);

    await expect(page.locator(loginLocators.errorMessage)).toContainText(invalidLogin.expectedError);
  });
});
