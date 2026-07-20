import { expect } from '@playwright/test';
import { loginLocators } from '../locators/login.locators.js';

export async function expectLoginError(page, message) {
  await expect(page.locator(loginLocators.errorMessage)).toContainText(message);
}
