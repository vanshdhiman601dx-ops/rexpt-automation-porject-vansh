import { expect } from '@playwright/test';
import { signupLocators } from '../../../../locators/signup.locators.js';
import { timeouts } from '../../../../config/timeouts.js';

export class SignupPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async clearSessionAndGoto() {
    await this.page.context().clearCookies();
    await this.page.goto('/');
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.reload();
  }

  async verifyEmailScreen() {
    await expect(this.page.locator(signupLocators.pageTitle)).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(this.page.locator(signupLocators.pageSubtitle)).toBeVisible();
    await expect(this.page.locator(signupLocators.emailInput)).toBeVisible();
    await expect(this.page.locator(signupLocators.sendOtpButton)).toBeVisible();
    await expect(this.page.locator(signupLocators.googleLoginText)).toBeVisible();
    await expect(this.page.locator(signupLocators.termsLink)).toBeVisible();
    await expect(this.page.locator(signupLocators.privacyLink)).toBeVisible();
  }

  async enterEmail(email) {
    await this.page.locator(signupLocators.emailInput).fill(email);
  }

  async expectEmailValue(email) {
    await expect(this.page.locator(signupLocators.emailInput)).toHaveValue(email);
  }

  async sendOtp() {
    await this.page.locator(signupLocators.sendOtpButton).click();
  }

  async verifyOtpScreen(email) {
    await expect(this.page.locator(signupLocators.otpScreenText)).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(this.page.locator(signupLocators.otpEmailSentText)).toBeVisible();
    await expect(this.page.getByText(email, { exact: true })).toBeVisible();
    await expect(this.otpInput(0)).toBeVisible();
  }

  otpInput(index) {
    return this.page.locator(signupLocators.otpInput(index));
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

  async waitForLastOtpInputFilled() {
    await expect(this.otpInput(5)).not.toHaveValue('', { timeout: timeouts.manualOtpEntry });
  }

  async continueWithOtp() {
    await this.page.locator(signupLocators.continueButton).click();
  }

  async expectOtpTimerVisible() {
    await expect(this.page.locator(signupLocators.resendOtpButton)).toBeVisible({
      timeout: timeouts.action,
    });
  }

  async expectPopupMessage(...messages) {
    await expect(this.page.locator(signupLocators.popup)).toBeVisible({ timeout: timeouts.action });

    const popupMessage = this.page.locator(signupLocators.popupMessage);
    await expect
      .poll(
        async () => {
          const text = (await popupMessage.innerText()).trim();
          return messages.includes(text);
        },
        { timeout: timeouts.action }
      )
      .toBe(true);

    await expect(this.page.locator(signupLocators.popupCloseButton)).toBeVisible();
  }

  async closePopup() {
    await this.page.locator(signupLocators.popupCloseButton).click();
    await expect(this.page.locator(signupLocators.popup)).toBeHidden();
  }
}
