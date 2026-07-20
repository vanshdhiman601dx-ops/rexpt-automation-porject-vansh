import { loginLocators } from '../../locators/login.locators.js';
import { expect } from '@playwright/test';
import { timeouts } from '../../config/timeouts.js';

export class GoogleLoginPage {
  constructor(page) {
    this.page = page;
  }

  async gotoLogin() {
    await this.page.goto('/');
    await this.navigateFromLandingToLogin();
    await expect(this.page).toHaveURL(/\/login/, { timeout: timeouts.pageLoad });
    await this.expectGoogleEntryPointVisible();
  }

  async navigateFromLandingToLogin() {
    const firstStepCta = this.page.locator(loginLocators.landingPrimaryCta).first();
    const secondStepCta = this.page.locator(loginLocators.landingBuildReceptionistCta).first();
    const skipLink = this.page.locator(loginLocators.landingSkipLink).first();

    if (await firstStepCta.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await firstStepCta.click({ timeout: timeouts.action });
    }

    if (await secondStepCta.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await secondStepCta.click({ timeout: timeouts.action });
      return;
    }

    if (await skipLink.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await skipLink.click({ timeout: timeouts.action });
    }
  }

  async continueWithGoogle() {
    await this.clickGoogleEntryPoint();
  }

  async expectGoogleEntryPointVisible() {
    await expect
      .poll(
        async () =>
          (await this.page.locator(loginLocators.googleLoginButton).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginFrame).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginIcon).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginSvgIcon).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginText).count()) > 0,
        { timeout: timeouts.pageLoad }
      )
      .toBe(true);
  }

  async clickGoogleEntryPoint() {
    const dataTestIdButton = this.page.locator(loginLocators.googleLoginButton).first();
    if (await dataTestIdButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await dataTestIdButton.click({ timeout: timeouts.action });
      return;
    }

    const gisFrame = this.page.locator(loginLocators.googleLoginFrame).first();
    if (await gisFrame.isVisible({ timeout: timeouts.action }).catch(() => false)) {
      const frameButton = this.page
        .frameLocator(loginLocators.googleLoginFrame)
        .first()
        .getByRole('button', { name: /sign in with google|continue with google/i })
        .first();

      if (await frameButton.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
        await frameButton.click({ timeout: timeouts.action });
        return;
      }

      await gisFrame.click({ position: { x: 20, y: 20 }, timeout: timeouts.action });
      return;
    }

    const iconButton = this.page.locator(loginLocators.googleLoginIcon).first();
    if (await iconButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await iconButton.click({ timeout: timeouts.action });
      return;
    }

    const svgButton = this.page.locator(loginLocators.googleLoginSvgButton).first();
    if (await svgButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await svgButton.click({ timeout: timeouts.action });
      return;
    }

    await this.page.locator(loginLocators.googleLoginText).first().click({ timeout: timeouts.action });
  }

  async launchFreshOAuthFlow() {
    await this.expectGoogleEntryPointVisible();

    const popupPromise = this.page
      .context()
      .waitForEvent('page', { timeout: timeouts.popup })
      .catch(() => null);

    await this.continueWithGoogle();

    const oauthPage = await popupPromise;
    const activePage = oauthPage || this.page;

    await activePage.waitForLoadState('domcontentloaded', { timeout: timeouts.expect }).catch(() => {});
    return activePage;
  }

  async returnToLoginPage(oauthPage) {
    if (oauthPage && oauthPage !== this.page && !oauthPage.isClosed()) {
      await oauthPage.close();
    }

    await this.gotoLogin();
  }

  async closeOAuthWindow(oauthPage) {
    if (oauthPage && oauthPage !== this.page && !oauthPage.isClosed()) {
      await oauthPage.close();
      return;
    }

    await this.gotoLogin();
  }

  async pressBrowserBackFromOAuth(oauthPage) {
    if (!oauthPage.isClosed()) {
      await oauthPage.goBack({ waitUntil: 'domcontentloaded', timeout: timeouts.action }).catch(() => {});
    }
  }

  async cancelOAuthIfAvailable(oauthPage) {
    const cancelButton = oauthPage.getByRole('button', { name: /^cancel$/i });

    if (await cancelButton.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await cancelButton.click();
      return;
    }

    await this.closeOAuthWindow(oauthPage);
  }

  async selectOrEnterEmail(oauthPage, email) {
    const existingAccount = oauthPage.getByText(email, { exact: true });

    if (await existingAccount.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await existingAccount.click();
      return;
    }

    const emailInput = oauthPage.locator('input[type="email"], #identifierId').first();
    await expect(emailInput).toBeVisible({ timeout: timeouts.expect });
    await emailInput.fill(email);
    await oauthPage.getByRole('button', { name: /^next$/i }).click();
  }

  async enterPasswordIfPrompted(oauthPage, password) {
    const passwordInput = oauthPage.locator('input[type="password"]').first();

    if (await passwordInput.isVisible({ timeout: timeouts.expect }).catch(() => false)) {
      await passwordInput.fill(password);
      await oauthPage.getByRole('button', { name: /^next$/i }).click();
    }
  }

  async approveConsentIfPrompted(oauthPage) {
    const consentButton = oauthPage.getByRole('button', { name: /^(continue|allow)$/i });

    if (await consentButton.isVisible({ timeout: timeouts.action }).catch(() => false)) {
      await consentButton.click();
    }
  }

  async completeGoogleAuthentication({ email, password, finalUrl }) {
    const oauthPage = await this.launchFreshOAuthFlow();

    await this.selectOrEnterEmail(oauthPage, email);
    await this.enterPasswordIfPrompted(oauthPage, password);
    await this.approveConsentIfPrompted(oauthPage);

    await this.page.waitForURL(finalUrl, { timeout: timeouts.authRedirect });
    await expect(this.page).toHaveURL(finalUrl);
  }
}
