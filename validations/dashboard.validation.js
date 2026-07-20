import { expect } from '@playwright/test';
import { fastAgentDetailsLocators } from '../locators/fast-agent-details.locators.js';

export async function expectDashboardVisible(page) {
  await expect(page.locator(fastAgentDetailsLocators.header.logoutButton)).toBeVisible();
}
