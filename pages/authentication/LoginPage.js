import { loginLocators } from '../../locators/login.locators.js';
import { expect } from '@playwright/test';
import { timeouts } from '../../config/timeouts.js';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.navigateFromLandingToLogin();
    await expect(this.page).toHaveURL(/\/login/, { timeout: timeouts.pageLoad });
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

  async sendOtp() {
    await this.page.locator(loginLocators.sendOtpButton).click();
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
    for (let index = 0; index < 6; index += 1) {
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

  async closePopupIfVisible() {
    const closeButton = this.page.locator(loginLocators.popupCloseButton);

    if (await closeButton.isVisible()) {
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

  async saveSession(storageStatePath) {
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
    return this.page.evaluate(() => Boolean(localStorage.getItem('token')));
  }

  isOnUrl(url) {
    return this.page.url() === url;
  }
}
