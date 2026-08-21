import { loginLocators } from '../../../../locators/login.locators.js';
import { expect } from '@playwright/test';
import { timeouts } from '../../../../config/timeouts.js';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.navigateFromLandingToLogin();
    await expect(this.page).toHaveURL(/\/login/, { timeout: timeouts.pageLoad });
  }

  async gotoLoginDirect() {
    await this.page.goto('/login');
    await this.verifyLoginScreen();
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
      (await this.page.locator(loginLocators.emailModeToggle).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.emailInput).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.googleLoginButton).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.googleLoginFrame).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.googleLoginIcon).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.page.locator(loginLocators.googleLoginText).first().isVisible({ timeout: timeouts.quickAction }).catch(() => false))
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
    await this.verifyLoginScreen();
  }

  async verifyLoginScreen() {
    await expect
      .poll(
        async () =>
          (await this.page.locator(loginLocators.emailModeToggle).count()) > 0 ||
          (await this.page.locator(loginLocators.emailInput).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginButton).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginFrame).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginIcon).count()) > 0 ||
          (await this.page.locator(loginLocators.googleLoginText).count()) > 0,
        { timeout: timeouts.pageLoad }
      )
      .toBe(true);
  }

  async login(email, password) {
    await this.page.locator(loginLocators.emailInput).fill(email);
    await this.page.locator(loginLocators.passwordInput).fill(password);
    await this.page.locator(loginLocators.loginButton).click();
  }

  async verifyTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  async openEmailLogin() {
    const emailInput = this.page.locator(loginLocators.emailInput);

    if (!(await emailInput.isVisible())) {
      await this.page.locator(loginLocators.emailModeToggle).click();
    }

    await expect(emailInput).toBeVisible();
  }

  async enterEmail(email) {
    await this.page.locator(loginLocators.emailInput).fill(email);
  }

  async expectEmailValue(email) {
    await expect(this.page.locator(loginLocators.emailInput)).toHaveValue(email);
  }

  async waitForRecaptchaReadyIfPresent() {
    await expect
      .poll(async () => this.getRecaptchaStatus(), { timeout: timeouts.action })
      .toMatchObject({
        scriptPresent: true,
        apiPresent: true,
        readyCallbackResolved: true,
      });
  }

  async getRecaptchaStatus() {
    return this.page.evaluate(async () => {
      const script = document.querySelector('script[src*="recaptcha/api.js"]');
      const apiPresent = Boolean(window.grecaptcha?.ready && window.grecaptcha?.execute);
      let readyCallbackResolved = false;

      if (apiPresent) {
        readyCallbackResolved = await Promise.race([
          new Promise((resolve) => window.grecaptcha.ready(() => resolve(true))),
          new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
        ]);
      }

      return {
        scriptPresent: Boolean(script),
        apiPresent,
        readyCallbackResolved,
      };
    });
  }

  async clickWithoutNavigationWait(locator) {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await locator.click({ timeout: timeouts.action, noWaitAfter: true }).catch(async () => {
      await locator.evaluate((element) => element.click());
    });
  }

  async sendOtp() {
    await this.waitForRecaptchaReadyIfPresent();

    const candidates = this.page.locator(loginLocators.sendOtpButton);
    const count = await candidates.count();

    for (let index = 0; index < count; index += 1) {
      const candidate = candidates.nth(index);
      const visible = await candidate.isVisible({ timeout: timeouts.quickAction }).catch(() => false);

      if (visible) {
        await this.clickWithoutNavigationWait(candidate);
        return;
      }
    }

    const textCandidate = this.page.locator(loginLocators.sendOtpText).first();
    if (await textCandidate.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      const clickable = textCandidate.locator('xpath=ancestor::*[contains(@class, "btnTheme") or self::button or @role="button"][1]');

      if (await clickable.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
        await this.clickWithoutNavigationWait(clickable);
        return;
      }

      await this.clickWithoutNavigationWait(textCandidate);
      return;
    }

    const clicked = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, [role="button"], div, p'));
      const target = elements.find((element) => {
        const text = element.textContent || '';
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          /Send\s+One\s+Time\s+Password/i.test(text) &&
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          style.pointerEvents !== 'none'
        );
      });

      if (!target) return false;

      const clickable =
        target.closest('[class*="btnTheme"], button, [role="button"], [class*="BtnDiv"]') || target;
      clickable.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      clickable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      clickable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      clickable.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });

    expect(clicked, 'Send One Time Password CTA should be clickable.').toBeTruthy();
  }

  async verifyOtpScreen(email) {
    await expect(this.page.locator(loginLocators.otpScreenText)).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(this.page.locator(loginLocators.otpEmailSentText)).toBeVisible();
    await expect(this.page.getByText(email, { exact: true })).toBeVisible();
    await expect(this.otpInput(0)).toBeVisible();
  }

  otpInput(index) {
    return this.page.locator(loginLocators.otpInput(index));
  }

  async clearOtp() {
    for (let index = 5; index >= 0; index -= 1) {
      await this.otpInput(index).fill('');
    }
  }

  async fillOtp(values) {
    await this.clearOtp();

    for (let index = 0; index < values.length && index < 6; index += 1) {
      const value = values[index];
      if (value !== '') {
        await this.otpInput(index).fill(value);
      }
    }
  }

  async pasteOtp(value, index = 0) {
    await this.clearOtp();
    await this.otpInput(index).fill(value);
  }

  async getOtpValues() {
    const values = [];

    for (let index = 0; index < 6; index += 1) {
      values.push(await this.otpInput(index).inputValue());
    }

    return values;
  }

  async continueWithOtp() {
    await this.page.locator(loginLocators.continueButton).click();
  }

  async waitForLastOtpInputFilled() {
    await expect(this.otpInput(5)).not.toHaveValue('', { timeout: timeouts.manualOtpEntry });
  }

  async expectPopupMessage(message) {
    await expect(this.page.locator(loginLocators.popup)).toBeVisible();
    await expect(this.page.locator(loginLocators.popupMessage)).toHaveText(message);
    await expect(this.page.locator(loginLocators.popupCloseButton)).toBeVisible();
  }

  async isPopupMessageVisible(message, timeout = 5000) {
    const popupMessage = this.page.locator(loginLocators.popupMessage);

    return popupMessage
      .filter({ hasText: message })
      .isVisible({ timeout })
      .catch(() => false);
  }

  async closePopup() {
    await this.page.locator(loginLocators.popupCloseButton).click();
    await expect(this.page.locator(loginLocators.popup)).toBeHidden();
  }

  async closePopupIfVisible(timeout = timeouts.shortAction) {
    const closeButton = this.page.locator(loginLocators.popupCloseButton);

    if (await closeButton.isVisible({ timeout }).catch(() => false)) {
      await closeButton.click();
      await expect(this.page.locator(loginLocators.popup)).toBeHidden();
    }
  }

  async expectNoPopup() {
    await expect(this.page.locator(loginLocators.popup)).toBeHidden();
  }

  async waitForResendOtpEnabled() {
    await expect(this.page.locator(loginLocators.resendOtpButton)).toBeEnabled({
      timeout: timeouts.otpExpiration,
    });
  }

  async getResendOtpTimerText() {
    const resendButton = this.page.locator(loginLocators.resendOtpButton);

    await expect(resendButton).toBeVisible({ timeout: timeouts.action });
    return (await resendButton.innerText()).trim();
  }

  async waitForOtpTimerToExpire() {
    const resendButton = this.page.locator(loginLocators.resendOtpButton);

    await expect
      .poll(async () => (await resendButton.innerText()).trim(), {
        timeout: timeouts.otpExpiration,
      })
      .toBe('Resend One Time Password');

    await expect(resendButton).toBeEnabled();
  }

  async resendOtp() {
    await this.page.locator(loginLocators.resendOtpButton).click();
  }

  async resendOtpAndCloseSuccessPopup(successMessage) {
    await this.resendOtp();
    await this.expectPopupMessage(successMessage);
    await this.closePopup();
  }

  async waitForAuthToken() {
    await expect
      .poll(async () => this.hasAuthToken(), { timeout: timeouts.authRedirect })
      .toBe(true);
  }

  async saveSession(storageStatePath) {
    await this.waitForAuthToken();
    await this.page.context().storageState({ path: storageStatePath });
  }

  async clearAuthenticationSession() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async hasAuthToken() {
    return this.page.evaluate(() => Boolean(localStorage.getItem('token') || sessionStorage.getItem('token')));
  }

  isOnUrl(url) {
    return this.page.url() === url;
  }
}
