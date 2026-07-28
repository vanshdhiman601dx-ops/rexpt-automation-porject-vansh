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

  async verifyDraftAgentVisible() {
    const card = this.page.locator(fastAgentDetailsLocators.draftAgent.card).first();

    await expect(card).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(this.page.locator(fastAgentDetailsLocators.draftAgent.badge).first()).toBeVisible();
    await expect(this.page.locator(fastAgentDetailsLocators.draftAgent.title).first()).toBeVisible();
    await expect(this.page.locator(fastAgentDetailsLocators.draftAgent.description).first()).toBeVisible();
    await expect(this.page.locator(fastAgentDetailsLocators.draftAgent.discardButton).first()).toBeVisible();
    const button = await this.findVisibleDraftContinueSetupButton();
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  }

  async findVisibleDraftContinueSetupButton() {
    const buttons = this.page.locator(fastAgentDetailsLocators.draftAgent.continueSetupButton);
    const count = await buttons.count();

    for (let index = 0; index < count; index += 1) {
      const button = buttons.nth(index);
      const visible = await button.isVisible({ timeout: timeouts.quickAction }).catch(() => false);
      const enabled = visible && (await button.isEnabled().catch(() => false));

      if (visible && enabled) {
        return button;
      }
    }

    return buttons.first();
  }

  async dismissIntroTourIfVisible() {
    const closeButton = this.page.locator(fastAgentDetailsLocators.tour.closeButton).first();
    const skipButton = this.page.locator(fastAgentDetailsLocators.tour.skipButton).first();

    if (await closeButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await closeButton.click({ timeout: timeouts.action }).catch(() => {});
    }

    if (await skipButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await skipButton.click({ timeout: timeouts.action }).catch(() => {});
    }

    await this.page
      .locator(fastAgentDetailsLocators.tour.overlay)
      .first()
      .waitFor({ state: 'hidden', timeout: timeouts.shortAction })
      .catch(() => {});
  }

  async continueDraftSetup() {
    await this.dismissIntroTourIfVisible();
    const button = await this.findVisibleDraftContinueSetupButton();
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(button).toBeEnabled({ timeout: timeouts.pageLoad });
    await button.click({ timeout: timeouts.action }).catch(async () => {
      await button.evaluate((element) => element.click());
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
