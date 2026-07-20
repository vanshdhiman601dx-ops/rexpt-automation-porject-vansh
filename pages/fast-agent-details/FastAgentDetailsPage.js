import { expect } from '@playwright/test';
import { fastAgentDetailsLocators } from '../../locators/fast-agent-details.locators.js';
import { loginLocators } from '../../locators/login.locators.js';
import { timeouts } from '../../config/timeouts.js';

export class FastAgentDetailsPage {
  constructor(page) {
    this.page = page;
  }

  async verifyLoaded(expectedUrl) {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: timeouts.authRedirect });
    await expect(this.page.locator(fastAgentDetailsLocators.header.logoutButton)).toBeVisible({
      timeout: timeouts.pageLoad,
    });
  }

  async logout() {
    await this.page.locator(fastAgentDetailsLocators.header.logoutButton).click();
    await expect(this.page.locator(fastAgentDetailsLocators.popup.confirmButton)).toBeVisible();
    await this.page.locator(fastAgentDetailsLocators.popup.confirmButton).click();
  }

  async verifyLoggedOutToLoginScreen() {
    await expect
      .poll(
        async () =>
          (await this.page.locator(loginLocators.googleLoginButton).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginFrame).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginIcon).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginText).count()) > 0,
        { timeout: timeouts.pageLoad }
      )
      .toBe(true);
  }

  async verifySessionCleared() {
    await expect
      .poll(async () =>
        this.page.evaluate(() => ({
          hasToken: Boolean(localStorage.getItem('token')),
          localStorageLength: localStorage.length,
          sessionStorageLength: sessionStorage.length,
        }))
      )
      .toEqual({
        hasToken: false,
        localStorageLength: 0,
        sessionStorageLength: 0,
      });
  }
}
