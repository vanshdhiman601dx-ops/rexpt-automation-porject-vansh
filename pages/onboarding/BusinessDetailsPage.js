import { expect } from '@playwright/test';
import { onboardingLocators } from '../../locators/onboarding.locators.js';
import { timeouts } from '../../config/timeouts.js';

export class BusinessDetailsPage {
  constructor(page) {
    this.page = page;
  }

  async verifyLoaded(expectedUrl) {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: timeouts.authRedirect });
    await expect(this.title()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.businessNameInput()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.zipCodeInput()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.continueButton()).toBeVisible();
  }

  title() {
    return this.page.locator(onboardingLocators.businessLookup.title);
  }

  businessNameInput() {
    return this.page.locator(onboardingLocators.businessLookup.businessNameInput);
  }

  zipCodeInput() {
    return this.page.locator(onboardingLocators.businessLookup.zipCodeInput);
  }

  businessNameRequiredError() {
    return this.page.locator(onboardingLocators.businessLookup.businessNameRequiredError).first();
  }

  selectedZipSummary() {
    return this.page.locator(onboardingLocators.businessLookup.selectedZipSummary).first();
  }

  clearLocationButton() {
    return this.page.locator(onboardingLocators.businessLookup.clearLocationButton).first();
  }

  listingConfirmTitle() {
    return this.page.locator(onboardingLocators.businessLookup.listingConfirmTitle).first();
  }

  firstListingUseThisButton() {
    return this.page.locator(onboardingLocators.businessLookup.listingUseThisButton).first();
  }

  manualFooterCard() {
    return this.page.locator(onboardingLocators.businessLookup.manualFooterCard).first();
  }

  manualFooterEnterButton() {
    return this.page.locator(onboardingLocators.businessLookup.manualFooterEnterButton).first();
  }

  continueButton() {
    return this.page.locator(onboardingLocators.businessStep.continueButton);
  }

  manualTitle() {
    return this.page.locator(onboardingLocators.businessManualDetails.title).first();
  }

  manualWebsiteInput() {
    return this.page.locator(onboardingLocators.businessManualDetails.websiteInput).first();
  }

  noWebsiteCheckbox() {
    return this.page.locator(onboardingLocators.businessManualDetails.noWebsiteCheckbox).first();
  }

  noWebsiteLabel() {
    return this.page.locator(onboardingLocators.businessManualDetails.noWebsiteLabel).first();
  }

  manualBusinessNameInput() {
    return this.page.locator(onboardingLocators.businessManualDetails.businessNameInput).first();
  }

  manualPhoneInput() {
    return this.page.locator(onboardingLocators.businessManualDetails.phoneInput).first();
  }

  manualAddressInput() {
    return this.page.locator(onboardingLocators.businessManualDetails.addressInput).first();
  }

  manualEmailInput() {
    return this.page.locator(onboardingLocators.businessManualDetails.businessEmailInput).first();
  }

  manualSearchAgainLink() {
    return this.page.locator(onboardingLocators.businessManualDetails.searchAgainLink).first();
  }

  alertPopup() {
    return this.page.locator(onboardingLocators.businessStep.genericPopup).first();
  }

  alertPopupCloseButton() {
    return this.page.locator(onboardingLocators.businessStep.genericPopupCloseButton).first();
  }

  async clearBusinessName() {
    await this.businessNameInput().fill('');
  }

  async enterBusinessName(value) {
    await this.businessNameInput().fill(value);
  }

  async getBusinessNameValue() {
    return this.businessNameInput().inputValue();
  }

  async getBusinessNameValueAttribute() {
    return this.businessNameInput().getAttribute('value');
  }

  async triggerBusinessNameValidation() {
    await this.businessNameInput().blur();
    const canContinue = await this.continueButton()
      .isEnabled({ timeout: timeouts.quickAction })
      .catch(() => false);

    if (canContinue) {
      await this.continueButton().click({ force: true }).catch(() => {});
    }
  }

  async isBusinessNameErrorVisible() {
    return this.businessNameRequiredError()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async getBusinessNameErrorText() {
    if (!(await this.isBusinessNameErrorVisible())) return '';
    return (await this.businessNameRequiredError().innerText()).trim();
  }

  async expectBusinessNameErrorHidden() {
    await expect(this.businessNameRequiredError()).toBeHidden({ timeout: timeouts.quickAction });
  }

  async enterZipCode(value) {
    await this.zipCodeInput().fill(value);
  }

  async clearZipCode() {
    await this.zipCodeInput().fill('');
  }

  async typeZipCode(value) {
    await this.zipCodeInput().pressSequentially(value);
  }

  async pasteZipCode(value) {
    await this.zipCodeInput().fill(value);
  }

  async getZipCodeValue() {
    return this.zipCodeInput().inputValue();
  }

  async getZipCodeValueAttribute() {
    return this.zipCodeInput().getAttribute('value');
  }

  zipRequiredError() {
    return this.page.locator(onboardingLocators.businessLookup.zipRequiredError).first();
  }

  zipNotFoundError() {
    return this.page.locator(onboardingLocators.businessLookup.zipNotFoundError).first();
  }

  async triggerZipValidation() {
    await this.zipCodeInput().blur();
    await this.continueButton().click({ force: true }).catch(() => {});
  }

  async isZipErrorVisible() {
    return (
      (await this.zipRequiredError().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) ||
      (await this.zipNotFoundError().isVisible({ timeout: timeouts.quickAction }).catch(() => false))
    );
  }

  async getZipErrorText() {
    if (await this.zipRequiredError().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      return (await this.zipRequiredError().innerText()).trim();
    }

    if (await this.zipNotFoundError().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      return (await this.zipNotFoundError().innerText()).trim();
    }

    return '';
  }

  async waitForZipNotFoundError() {
    await expect(this.zipNotFoundError()).toBeVisible({ timeout: timeouts.authRedirect });
  }

  async expectZipErrorHidden() {
    await expect(this.zipRequiredError()).toBeHidden({ timeout: timeouts.quickAction });
    await expect(this.zipNotFoundError()).toBeHidden({ timeout: timeouts.quickAction });
  }

  async expectManualEntryBoxVisible() {
    await expect(this.manualFooterCard()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.manualFooterEnterButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.manualFooterEnterButton()).toBeEnabled({ timeout: timeouts.action });
  }

  async isManualEntryBoxVisible() {
    return this.manualFooterCard()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async waitForZipResolved() {
    await expect(this.selectedZipSummary()).toBeVisible({ timeout: timeouts.authRedirect });
  }

  async clearLocationIfVisible() {
    if (await this.clearLocationButton().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await this.clearLocationButton().click({ force: true });
      await expect(this.selectedZipSummary()).toBeHidden({ timeout: timeouts.action }).catch(() => {});
    }
  }

  async refillSimpleBusinessDetails({ businessName, zipCode }) {
    await this.clearBusinessName();
    await this.enterBusinessName(businessName);
    await this.clearLocationIfVisible();
    await this.clearZipCode();
    await this.zipCodeInput().click();
    await this.typeZipCode(zipCode);
    await this.waitForZipResolved().catch(() => {});
    await this.zipCodeInput().blur().catch(() => {});
  }

  async selectFirstBusinessListingIfVisible() {
    if (await this.firstListingUseThisButton().isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await this.firstListingUseThisButton().scrollIntoViewIfNeeded().catch(() => {});
      await this.firstListingUseThisButton().click({ force: true });
      return true;
    }

    return false;
  }

  async continueToBusinessListing() {
    await expect(this.continueButton()).toBeEnabled({ timeout: timeouts.action });
    await this.continueButton().click();
    await expect(this.listingConfirmTitle()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async verifyManualLoaded() {
    await expect(this.manualTitle()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.manualBusinessNameInput()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async isManualLoaded() {
    return this.manualBusinessNameInput()
      .isVisible({ timeout: timeouts.shortAction })
      .catch(() => false);
  }

  async clickSearchAgainIfVisible() {
    if (await this.manualSearchAgainLink().isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await this.manualSearchAgainLink().click();
    }
  }

  async getManualDetailsData() {
    await this.verifyManualLoaded();
    return {
      businessName: await this.manualBusinessNameInput().inputValue().catch(() => ''),
      businessPhone: await this.manualPhoneInput().inputValue().catch(() => ''),
      email: await this.manualEmailInput().inputValue().catch(() => ''),
      website: await this.manualWebsiteInput().inputValue().catch(() => ''),
      address: await this.manualAddressInput().inputValue().catch(() => ''),
    };
  }

  async clearManualBusinessName() {
    await this.manualBusinessNameInput().fill('');
  }

  async enterManualBusinessName(value) {
    await this.manualBusinessNameInput().fill(value || '');
  }

  async getManualBusinessNameValue() {
    return this.manualBusinessNameInput().inputValue();
  }

  async getManualBusinessNameValueAttribute() {
    return this.manualBusinessNameInput().getAttribute('value');
  }

  async enterManualPhone(value) {
    const rawValue = String(value || '').trim();
    const nextValue = rawValue.startsWith('+1') ? rawValue : `+1 ${rawValue}`.trim();
    await this.manualPhoneInput().fill(nextValue);
  }

  async getManualPhoneValue() {
    return this.manualPhoneInput().inputValue();
  }

  async getManualPhoneValueAttribute() {
    return this.manualPhoneInput().getAttribute('value');
  }

  async clearManualAddress() {
    await this.manualAddressInput().fill('');
  }

  async enterManualAddress(value) {
    await this.manualAddressInput().fill(value || '');
  }

  async clearManualEmail() {
    await this.manualEmailInput().fill('');
  }

  async enterManualEmail(value) {
    await this.manualEmailInput().fill(value || '');
  }

  async getManualEmailValue() {
    return this.manualEmailInput().inputValue();
  }

  async getManualEmailValueAttribute() {
    return this.manualEmailInput().getAttribute('value');
  }

  manualEmailValidationError() {
    return this.page.locator(onboardingLocators.businessManualDetails.emailValidationError).first();
  }

  async isManualEmailErrorVisible() {
    return this.manualEmailValidationError()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async getManualEmailErrorText() {
    if (!(await this.isManualEmailErrorVisible())) return '';
    return (await this.manualEmailValidationError().innerText()).trim();
  }

  async clearManualWebsite() {
    await this.manualWebsiteInput().fill('');
  }

  async enterManualWebsite(value) {
    await this.manualWebsiteInput().fill(value || '');
  }

  async getManualWebsiteValue() {
    return this.manualWebsiteInput().inputValue();
  }

  async getManualWebsiteValueAttribute() {
    return this.manualWebsiteInput().getAttribute('value');
  }

  async triggerManualWebsiteValidation() {
    await this.manualWebsiteInput().blur();
    await this.continueButton().click({ force: true }).catch(() => {});
  }

  async isManualInvalidUrlIconVisible() {
    return this.page
      .locator(onboardingLocators.businessManualDetails.invalidUrlIcon)
      .first()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async isManualValidUrlIconVisible() {
    return this.page
      .locator(onboardingLocators.businessManualDetails.validUrlIcon)
      .first()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async isNoWebsiteChecked() {
    return this.noWebsiteCheckbox()
      .isChecked({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async uncheckNoWebsiteIfChecked() {
    const checkbox = this.noWebsiteCheckbox();
    if (!(await this.isNoWebsiteChecked())) return false;

    await checkbox.evaluate((element) => {
      if (!element.checked) return;

      element.click();

      if (element.checked) {
        element.checked = false;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await expect(checkbox).not.toBeChecked({ timeout: timeouts.quickAction }).catch(async () => {
      await checkbox.evaluate((element) => {
        element.checked = false;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    return !(await this.isNoWebsiteChecked());
  }

  async clearManualPhone() {
    await this.manualPhoneInput().fill('+1 ');
  }

  async isAlertPopupVisible() {
    return this.alertPopup()
      .isVisible({ timeout: timeouts.shortAction })
      .catch(() => false);
  }

  async closeAlertPopupIfVisible() {
    const closeButtonVisible = await this.alertPopupCloseButton()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);

    if (!closeButtonVisible) return false;

    await this.alertPopupCloseButton().click().catch(() => {});
    await expect(this.alertPopupCloseButton()).toBeHidden({ timeout: timeouts.quickAction }).catch(() => {});
    return true;
  }
}
