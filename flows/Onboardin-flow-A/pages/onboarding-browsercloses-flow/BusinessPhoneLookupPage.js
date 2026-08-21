import { expect } from '@playwright/test';
import { onboardingLocators } from '../../../../locators/onboarding.locators.js';
import { timeouts } from '../../../../config/timeouts.js';

export class BusinessPhoneLookupPage {
  constructor(page) {
    this.page = page;
  }

  container() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.container).first();
  }

  titlePrefix() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.titlePrefix).first();
  }

  titleMain() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.titleMain).first();
  }

  phoneInput() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.phoneInput).first();
  }

  businessResultCard() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.businessResultCard).first();
  }

  businessResultName() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.businessResultName).first();
  }

  businessResultAddress() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.businessResultAddress).first();
  }

  noResultMessage() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.noResultMessage).first();
  }

  notOnGoogleMapsButton() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.notOnGoogleMapsButton).first();
  }

  exitAppPopup() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.exitAppPopup).first();
  }

  keepSettingUpButton() {
    return this.page.locator(onboardingLocators.businessPhoneLookup.keepSettingUpButton).first();
  }

  async isExitAppPopupVisible() {
    return this.exitAppPopup().isVisible().catch(() => false);
  }

  async keepSettingUp() {
    await expect(this.keepSettingUpButton()).toBeVisible({ timeout: timeouts.action });
    await expect(this.keepSettingUpButton()).toBeEnabled();
    await this.keepSettingUpButton().click();
  }

  async lookupBusinessPhone(phoneNumber) {
    await expect(this.phoneInput()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.phoneInput().fill(phoneNumber);

    await expect
      .poll(
        async () =>
          (await this.businessResultCard().isVisible().catch(() => false)) ||
          (await this.noResultMessage().isVisible().catch(() => false)),
        { timeout: timeouts.authRedirect }
      )
      .toBeTruthy();

    if (!(await this.businessResultCard().isVisible().catch(() => false))) {
      return {
        found: false,
        error: await this.noResultMessage().innerText().catch(() => 'No Google business result appeared.'),
      };
    }

    return {
      found: true,
      businessName: (await this.businessResultName().innerText()).trim(),
      businessAddress: (await this.businessResultAddress().innerText()).trim(),
    };
  }

  async isBusinessPhoneScreenVisible() {
    const titleVisible = await this.titleMain().isVisible().catch(() => false);
    const phoneVisible = await this.phoneInput().isVisible().catch(() => false);
    return titleVisible && phoneVisible;
  }

  async verifyLoaded(expectedUrl) {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: timeouts.authRedirect });
    await expect(this.container()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.titlePrefix()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.titleMain()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.phoneInput()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.notOnGoogleMapsButton()).toBeVisible({ timeout: timeouts.pageLoad });
  }
}
