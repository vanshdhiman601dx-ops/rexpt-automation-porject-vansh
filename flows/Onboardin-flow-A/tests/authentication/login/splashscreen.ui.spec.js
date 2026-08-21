import { test, expect } from '@playwright/test';
import { loginLocators } from '../../../../../locators/login.locators.js';

test.describe('Splash Screen UI', () => {
  test('displays splash screen elements', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/rexpt - The AI Receptionist Service/);

    const howItWorksButton = page.locator(loginLocators.howItWorksButton);
    await howItWorksButton.click();
  });
});
