import { expect } from '@playwright/test';
import { moreButtonLocators } from '../../../locators/more-button-locators.js';
import { timeouts } from '../../../config/timeouts.js';

export class MoreButtonLoginPage {
  constructor(page) {
    this.page = page;
    this.emailValue = '';
  }

  emailInput() {
    return this.page.locator(moreButtonLocators.auth.emailInput).first();
  }

  otpInput(index) {
    return this.page.locator(moreButtonLocators.auth.otpInput(index)).first();
  }

  continueButton() {
    return this.page.locator(moreButtonLocators.auth.continueButton).first();
  }

  async gotoApplication() {
    await this.page.goto(moreButtonLocators.routes.landing, { waitUntil: 'domcontentloaded' });
  }

  async clickVisibleControl(selectors, labelPattern) {
    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      if (await locator.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
        await locator.scrollIntoViewIfNeeded().catch(() => {});
        await locator.click({ force: true, noWaitAfter: true });
        return true;
      }
    }

    return this.page.evaluate((source) => {
      const pattern = new RegExp(source, 'i');
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };

      const target = Array.from(document.querySelectorAll('button, [role="button"], a, [class*="btnTheme"], [class*="BtnDiv"], span, p'))
        .filter(isVisible)
        .find((element) => pattern.test(element.textContent || ''));

      if (!target) return false;
      const clickable = target.closest('button, [role="button"], a, [class*="btnTheme"], [class*="BtnDiv"]') || target;
      clickable.scrollIntoView({ block: 'center', inline: 'center' });
      clickable.click();
      return true;
    }, labelPattern.source);
  }

  async navigateToLogin() {
    if (this.page.url().includes(moreButtonLocators.routes.login)) return;
    if (await this.emailInput().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) return;

    await this.clickVisibleControl(
      [moreButtonLocators.auth.splashHowItWorksButton],
      /How it Works/i
    );

    await this.clickVisibleControl(
      [moreButtonLocators.auth.splashBuildReceptionistButton],
      /Build My Receptionist/i
    );

    if (!(await this.emailInput().isVisible({ timeout: timeouts.pageLoad }).catch(() => false))) {
      await this.page.goto(moreButtonLocators.routes.login, { waitUntil: 'domcontentloaded' });
    }

    await this.verifyLoginScreen();
  }

  async verifyLoginScreen() {
    await expect
      .poll(
        async () =>
          (await this.emailInput().isVisible().catch(() => false)) ||
          (await this.page.locator(moreButtonLocators.auth.emailModeToggle).first().isVisible().catch(() => false)),
        { timeout: timeouts.pageLoad }
      )
      .toBe(true);
  }

  async openEmailLogin() {
    const emailInput = this.emailInput();

    if (!(await emailInput.isVisible())) {
      await this.page.locator(moreButtonLocators.auth.emailModeToggle).first().click();
    }

    await expect(emailInput).toBeVisible();
  }

  async enterEmail(email) {
    this.emailValue = email;
    await this.emailInput().fill(email);
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

  async waitForRecaptchaReadyIfPresent() {
    const waitForReady = async () =>
      expect
        .poll(async () => this.getRecaptchaStatus(), { timeout: timeouts.quickAction })
        .toMatchObject({
          scriptPresent: true,
          apiPresent: true,
          readyCallbackResolved: true,
        });

    try {
      await waitForReady();
      return;
    } catch (error) {
      const status = await this.getRecaptchaStatus();

      if (!status.scriptPresent || status.apiPresent) {
        throw error;
      }

      await this.page.evaluate(() => {
        window.grecaptcha = {
          ready: (callback) => callback(),
          execute: () => Promise.resolve('automation-recaptcha-token'),
        };
      });
    }
  }

  async clickWithoutNavigationWait(locator) {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await locator.click({ timeout: timeouts.action, noWaitAfter: true }).catch(async () => {
      await locator.evaluate((element) => {
        element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    });
  }

  async sendOtp() {
    await this.waitForRecaptchaReadyIfPresent();

    const candidates = this.page.locator(moreButtonLocators.auth.sendOtpButton);
    const count = await candidates.count();

    for (let index = 0; index < count; index += 1) {
      const candidate = candidates.nth(index);
      const visible = await candidate.isVisible({ timeout: timeouts.quickAction }).catch(() => false);

      if (visible) {
        await this.clickWithoutNavigationWait(candidate);
        return;
      }
    }

    const textCandidate = this.page.locator(moreButtonLocators.auth.sendOtpText).first();
    if (await textCandidate.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      const clickable = textCandidate.locator(
        'xpath=ancestor::*[contains(@class, "btnTheme") or self::button or @role="button" or contains(@class, "BtnDiv")][1]'
      );

      if (await clickable.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
        await this.clickWithoutNavigationWait(clickable);
        return;
      }

      await this.clickWithoutNavigationWait(textCandidate);
      return;
    }

    const clicked = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, [role="button"], div, p, span'));
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

    expect(clicked, 'More Button Send One Time Password CTA should be clickable.').toBeTruthy();
  }

  async verifyOtpScreen(email) {
    await expect(this.page.locator(moreButtonLocators.auth.otpScreenText).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(this.page.locator(moreButtonLocators.auth.otpEmailSentText).first()).toBeVisible();
    await expect(this.page.getByText(email, { exact: true })).toBeVisible();
    await expect(this.otpInput(0)).toBeVisible();
  }

  async closePopupIfVisible() {
    const closeButton = this.page.locator(moreButtonLocators.auth.popupCloseButton).first();
    if (await closeButton.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await closeButton.click({ force: true });
      await this.page.locator(moreButtonLocators.auth.popup).first().waitFor({
        state: 'hidden',
        timeout: timeouts.shortAction,
      }).catch(() => {});
    }
  }

  async clearOtpFields() {
    for (let index = 5; index >= 0; index -= 1) {
      await this.otpInput(index).fill('');
    }
  }

  async enterFixedOtp(otp = '903467') {
    await this.clearOtpFields();

    for (let index = 0; index < otp.length && index < 6; index += 1) {
      await this.otpInput(index).fill(otp[index]);
    }
  }

  async continueWithOtp() {
    await this.continueButton().click({ force: true });
  }

  async hasAuthToken() {
    return this.page.evaluate(() => Boolean(localStorage.getItem('token') || sessionStorage.getItem('token')));
  }

  async verifyAuthenticatedFastAgentDetails() {
    await expect(this.page).toHaveURL(/\/fast-agent-details?/, { timeout: timeouts.authRedirect });
    await expect(this.page.locator(moreButtonLocators.auth.authenticatedSignal).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect.poll(async () => this.hasAuthToken(), { timeout: timeouts.authRedirect }).toBe(true);
  }

  async saveSession(storageStatePath) {
    await this.page.context().storageState({ path: storageStatePath });
  }
}
