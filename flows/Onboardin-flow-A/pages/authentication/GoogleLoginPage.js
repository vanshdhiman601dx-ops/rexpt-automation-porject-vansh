import { loginLocators } from '../../../../locators/login.locators.js';
import { expect } from '@playwright/test';
import { timeouts } from '../../../../config/timeouts.js';

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
    if (this.page.url().includes('/login')) return;
    if (await this.isLoginSurfaceVisible()) return;

    await this.clickSplashControl(
      loginLocators.splashScreen1HowItWorksButton,
      /How it Works/i,
      'How it Works'
    );
    await expect(this.page.locator(loginLocators.splashScreen2BuildMyReceptionistButton).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await this.clickSplashControl(
      loginLocators.splashScreen2BuildMyReceptionistButton,
      /Build My Receptionist/i,
      'Build My Receptionist'
    );
    await expect(this.page).toHaveURL(/\/login/, { timeout: timeouts.pageLoad });
  }

  async isLoginSurfaceVisible() {
    return (
      (await this.page.locator(loginLocators.googleLoginButton).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.googleLoginFrame).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.googleLoginIcon).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.googleLoginText).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.emailModeToggle).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.emailInput).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false))
    );
  }

  async clickSplashControl(selector, labelPattern, description) {
    const locator = this.page.locator(selector).first();
    if (await locator.isVisible({ timeout: timeouts.pageLoad }).catch(() => false)) {
      await locator.scrollIntoViewIfNeeded().catch(() => {});
      await locator.click({ timeout: timeouts.action, force: true });
      return;
    }

    const clicked = await this.page.evaluate((source) => {
      const pattern = new RegExp(source, 'i');
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };

      const target = Array.from(document.querySelectorAll('button, [role="button"], a, [class*="btnTheme"], span, p'))
        .filter(isVisible)
        .find((element) => pattern.test(element.textContent || ''));

      if (!target) return false;
      const clickable = target.closest('button, [role="button"], a, [class*="btnTheme"]') || target;
      clickable.scrollIntoView({ block: 'center', inline: 'center' });
      clickable.click();
      return true;
    }, labelPattern.source);

    if (clicked) return;

    if (await this.isLoginSurfaceVisible()) return;

    const skipLink = this.page.locator(loginLocators.landingSkipLink).first();
    if (await skipLink.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await skipLink.click({ timeout: timeouts.action, force: true });
      return;
    }

    await this.page.goto('/login');
    await this.expectGoogleEntryPointVisible();
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

    const gisButton = this.page.locator(loginLocators.googleGisButton).first();
    if (await gisButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await gisButton.scrollIntoViewIfNeeded().catch(() => {});
      await gisButton.click({ timeout: timeouts.action, force: true });
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

    const clickedGoogleButton = await this.page.evaluate(() => {
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };

      const candidates = Array.from(
        document.querySelectorAll('[role="button"], [class*="nsm7Bb-HzV7m-LgbsSe"], img[alt*="Google"], div, span')
      ).filter(isVisible);

      const target = candidates.find((element) =>
        /continue with google|sign in with google/i.test(element.textContent || element.getAttribute('alt') || '')
      );

      if (!target) return false;

      const clickable =
        target.closest('[role="button"], [class*="nsm7Bb-HzV7m-LgbsSe"], button, a, div[tabindex]') ||
        target.closest('div') ||
        target;
      clickable.scrollIntoView({ block: 'center', inline: 'center' });
      clickable.click();
      return true;
    });

    if (clickedGoogleButton) return;

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

    const googleText = this.page.locator(loginLocators.googleLoginText).first();
    await googleText.scrollIntoViewIfNeeded().catch(() => {});
    await googleText.click({ timeout: timeouts.action, force: true });
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

  async isGoogleTransientErrorVisible(oauthPage) {
    if (!oauthPage || oauthPage.isClosed()) return false;
    return oauthPage
      .locator(loginLocators.googleOauthSomethingWentWrong)
      .first()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async restartGoogleOAuthIfErrored(oauthPage) {
    if (!(await this.isGoogleTransientErrorVisible(oauthPage))) return false;

    const restartButton = oauthPage.locator(loginLocators.googleOauthRestartButton).first();
    await expect(restartButton, 'Google OAuth Restart button should be visible after transient error.').toBeVisible({
      timeout: timeouts.action,
    });
    await restartButton.click({ timeout: timeouts.action });
    await oauthPage.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
    await oauthPage.waitForTimeout(1000);
    return true;
  }

  async failIfGoogleOAuthErrored(oauthPage, stepName) {
    if (await this.isGoogleTransientErrorVisible(oauthPage)) {
      throw new Error(
        `Google OAuth showed "Something went wrong" during ${stepName}. This is a Google OAuth/browser verification failure, not an application locator failure.`
      );
    }
  }

  async getGoogleOAuthFailureSummary(oauthPage) {
    if (!oauthPage || oauthPage.isClosed()) return 'Google OAuth window is already closed.';

    const url = oauthPage.url();
    const bodyText = await oauthPage.locator('body').innerText({ timeout: timeouts.quickAction }).catch(() => '');
    const statusCodeMatch = bodyText.match(/\b(?:400|401|403|404|429|500)\b|Error\s*\d+|status\s*code\s*\d+/i);
    const transientErrorVisible = await this.isGoogleTransientErrorVisible(oauthPage);

    return [
      `Google OAuth failed before authentication completed.`,
      `OAuth URL: ${url}`,
      statusCodeMatch ? `Visible status/error code: ${statusCodeMatch[0]}` : 'Visible status/error code: not detected',
      transientErrorVisible ? 'Visible popup: Something went wrong' : 'Visible popup: not detected',
    ].join(' ');
  }

  async closeGoogleOAuthFailureSurface(oauthPage) {
    if (!oauthPage || oauthPage.isClosed()) return;

    const closeButton = oauthPage.locator(loginLocators.googleOauthCloseButton).first();
    if (await closeButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await closeButton.click({ timeout: timeouts.action }).catch(() => {});
      await oauthPage.waitForTimeout(500).catch(() => {});
    }

    if (!oauthPage.isClosed()) {
      await oauthPage.keyboard.press('Escape').catch(() => {});
      await oauthPage.waitForTimeout(500).catch(() => {});
    }

    if (oauthPage !== this.page && !oauthPage.isClosed()) {
      await oauthPage.close().catch(() => {});
    }
  }

  async handleGoogleOAuthFailureAndReturnToLogin(oauthPage, reason = '') {
    const summary = await this.getGoogleOAuthFailureSummary(oauthPage).catch(() => reason || 'Google OAuth failed.');
    await this.closeGoogleOAuthFailureSurface(oauthPage).catch(() => {});
    await this.gotoLogin();
    throw new Error(`${summary}${reason ? ` Failure reason: ${reason}` : ''}`);
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

  async selectOrEnterEmail(oauthPage, email, attempt = 1) {
    await this.restartGoogleOAuthIfErrored(oauthPage);

    const existingAccount = oauthPage.getByText(email, { exact: true });

    if (await existingAccount.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await existingAccount.click();
      await oauthPage.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
      if ((await this.restartGoogleOAuthIfErrored(oauthPage)) && attempt < 2) {
        await this.selectOrEnterEmail(oauthPage, email, attempt + 1);
        return;
      }
      await this.failIfGoogleOAuthErrored(oauthPage, 'existing account selection');
      return;
    }

    const emailInput = oauthPage.locator(loginLocators.googleOauthEmailInput).first();
    await expect(emailInput).toBeVisible({ timeout: timeouts.expect });
    await emailInput.fill(email);
    await this.clickGoogleNext(oauthPage);
    await oauthPage.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});

    if ((await this.restartGoogleOAuthIfErrored(oauthPage)) && attempt < 2) {
      await this.selectOrEnterEmail(oauthPage, email, attempt + 1);
      return;
    }

    await this.failIfGoogleOAuthErrored(oauthPage, 'email entry');
  }

  async enterPasswordIfPrompted(oauthPage, password, email, attempt = 1) {
    const passwordInput = oauthPage.locator(loginLocators.googleOauthPasswordInput).first();
    const startedAt = Date.now();
    let passwordVisible = false;

    while (Date.now() - startedAt < timeouts.expect) {
      if (await this.isGoogleTransientErrorVisible(oauthPage)) {
        if (attempt < 2 && email && (await this.restartGoogleOAuthIfErrored(oauthPage))) {
          await this.selectOrEnterEmail(oauthPage, email, attempt + 1);
          await this.enterPasswordIfPrompted(oauthPage, password, email, attempt + 1);
          return;
        }

        await this.failIfGoogleOAuthErrored(oauthPage, 'password prompt wait');
      }

      if (await passwordInput.isVisible().catch(() => false)) {
        passwordVisible = true;
        break;
      }

      if (await oauthPage.locator(loginLocators.googleOauthContinueButton).first().isVisible().catch(() => false)) {
        break;
      }

      if (oauthPage.isClosed()) {
        break;
      }

      await oauthPage.waitForTimeout(500);
    }

    if (await this.isGoogleTransientErrorVisible(oauthPage)) {
      if (attempt < 2 && email && (await this.restartGoogleOAuthIfErrored(oauthPage))) {
        await this.selectOrEnterEmail(oauthPage, email, attempt + 1);
        await this.enterPasswordIfPrompted(oauthPage, password, email, attempt + 1);
        return;
      }

      await this.failIfGoogleOAuthErrored(oauthPage, 'password prompt wait');
    }

    if (!passwordVisible) {
      return;
    }

    await passwordInput.click({ timeout: timeouts.action });
    await passwordInput.fill(password);
    await expect(passwordInput).toHaveValue(password, { timeout: timeouts.expect });
    await this.clickGoogleNext(oauthPage);
    await oauthPage.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
    if (await this.isGoogleTransientErrorVisible(oauthPage)) {
      if (attempt < 2 && email && (await this.restartGoogleOAuthIfErrored(oauthPage))) {
        await this.selectOrEnterEmail(oauthPage, email, attempt + 1);
        await this.enterPasswordIfPrompted(oauthPage, password, email, attempt + 1);
        return;
      }

      await this.failIfGoogleOAuthErrored(oauthPage, 'password submission');
    }
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
    await this.enterPasswordIfPrompted(oauthPage, password, email);
    await this.approveConsentIfPrompted(oauthPage);

    await this.page.waitForURL(finalUrl, { timeout: timeouts.authRedirect });
    await expect(this.page).toHaveURL(finalUrl);
  }

  async completeGoogleAuthenticationWithSteps({ email, password, finalUrl, resilient }) {
    const oauthPage = await this.launchFreshOAuthFlow();

    const emailStepPassed = await resilient.run({
      name: 'Google OAuth email selection or entry',
      assert: async () => this.selectOrEnterEmail(oauthPage, email),
      continueOnFailure: true,
      impact: ['Google OAuth could not select or enter the configured email.'],
      recoveryAction: 'Close Google OAuth popup/window and continue with Sign Up flow.',
      severity: 'CRITICAL',
    });
    if (!emailStepPassed) {
      await this.handleGoogleOAuthFailureAndReturnToLogin(oauthPage, 'Email selection/entry failed.');
    }

    const passwordStepPassed = await resilient.run({
      name: 'Google OAuth password entry and Next click',
      assert: async () => this.enterPasswordIfPrompted(oauthPage, password, email),
      continueOnFailure: true,
      impact: ['Google OAuth password was not filled or the Next button was not clicked.'],
      recoveryAction: 'Close Google OAuth popup/window and continue with Sign Up flow.',
      severity: 'CRITICAL',
    });
    if (!passwordStepPassed) {
      await this.handleGoogleOAuthFailureAndReturnToLogin(oauthPage, 'Password entry/Next click failed.');
    }

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
