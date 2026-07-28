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
      await oauthPage.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
      return;
    }

    const emailInput = oauthPage.locator(loginLocators.googleOauthEmailInput).first();
    await expect(emailInput).toBeVisible({ timeout: timeouts.expect });
    await emailInput.fill(email);
    await this.clickGoogleNext(oauthPage);
  }

  async enterPasswordIfPrompted(oauthPage, password) {
    const passwordInput = oauthPage.locator(loginLocators.googleOauthPasswordInput).first();
    const passwordVisible = await passwordInput
      .waitFor({ state: 'visible', timeout: timeouts.authRedirect })
      .then(() => true)
      .catch(() => false);

    if (!passwordVisible) {
      return;
    }

    await passwordInput.click({ timeout: timeouts.action });
    await passwordInput.fill(password);
    await expect(passwordInput).toHaveValue(password, { timeout: timeouts.expect });
    await this.clickGoogleNext(oauthPage);
    await oauthPage.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
  }

  async clickGoogleNext(oauthPage) {
    const locator = oauthPage.locator(loginLocators.googleOauthNextButton).first();

    if (await locator.isVisible({ timeout: timeouts.action }).catch(() => false)) {
      await expect(locator).toBeEnabled({ timeout: timeouts.action });
      await locator.click({ timeout: timeouts.action });
      return;
    }

    await oauthPage.getByRole('button', { name: /^next$/i }).click({ timeout: timeouts.action });
  }

  async approveConsentIfPrompted(oauthPage) {
    const consentButton = oauthPage.locator(loginLocators.googleOauthContinueButton).first();

    if (await consentButton.isVisible({ timeout: timeouts.action }).catch(() => false)) {
      await consentButton.click();
      await oauthPage.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
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

  async completeGoogleAuthenticationWithSteps({ email, password, finalUrl, resilient }) {
    const oauthPage = await this.launchFreshOAuthFlow();

    await resilient.run({
      name: 'Google OAuth email selection or entry',
      assert: async () => this.selectOrEnterEmail(oauthPage, email),
      continueOnFailure: false,
      impact: ['Google OAuth could not select or enter the configured email.'],
      recoveryAction: 'Stop Google login and inspect Google account selection/email input screen.',
      severity: 'CRITICAL',
    });

    await resilient.run({
      name: 'Google OAuth password entry and Next click',
      assert: async () => this.enterPasswordIfPrompted(oauthPage, password),
      continueOnFailure: false,
      impact: ['Google OAuth password was not filled or the Next button was not clicked.'],
      recoveryAction: 'Stop Google login and inspect the Google password screen.',
      severity: 'CRITICAL',
    });

    await resilient.run({
      name: 'Google OAuth consent continue if prompted',
      assert: async () => this.approveConsentIfPrompted(oauthPage),
      impact: ['Google OAuth consent screen may still be open.'],
      recoveryAction: 'Continue because consent may not be shown for returning users.',
      severity: 'VALIDATION',
    });

    await this.page.waitForURL(finalUrl, { timeout: timeouts.authRedirect });
    await expect(this.page).toHaveURL(finalUrl);
  }
}
