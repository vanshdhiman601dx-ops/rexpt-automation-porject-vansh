import { expect } from '@playwright/test';
import { personalDetailsLocators } from '../../locators/personal-details.locators.js';
import { timeouts } from '../../config/timeouts.js';

export class PersonalDetailsPage {
  constructor(page) {
    this.page = page;
  }

  async verifyLoaded(expectedUrl) {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: timeouts.authRedirect });
    await expect(this.nameInput()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.page.locator(personalDetailsLocators.nameLabel)).toBeVisible();
    await expect(this.continueButton()).toBeVisible();
  }

  nameInput() {
    return this.page.locator(personalDetailsLocators.nameInput);
  }

  nameValidationError() {
    return this.page.locator(personalDetailsLocators.nameValidationError);
  }

  phoneInput() {
    return this.page.locator(personalDetailsLocators.phoneInput);
  }

  phoneValidationError() {
    return this.page.locator(personalDetailsLocators.phoneValidationError);
  }

  countryButton() {
    return this.page.locator(personalDetailsLocators.countryButton);
  }

  selectedCountryFlag() {
    return this.page.locator(personalDetailsLocators.selectedCountryFlag);
  }

  countryDropdown() {
    return this.page.locator(personalDetailsLocators.countryDropdown);
  }

  countrySearchInput() {
    return this.page.locator(personalDetailsLocators.countrySearchInput);
  }

  unitedStatesCountryOption() {
    return this.page.locator(personalDetailsLocators.unitedStatesCountryOption).first();
  }

  continueButton() {
    return this.page.locator(personalDetailsLocators.continueButton);
  }

  async clearName() {
    await this.nameInput().fill('');
  }

  async enterName(value) {
    await this.nameInput().fill(value);
  }

  async getNameValue() {
    return this.nameInput().inputValue();
  }

  async triggerNameValidation() {
    await this.continueButton().click();
  }

  async isNameErrorVisible() {
    return this.nameValidationError()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async getNameErrorText() {
    if (!(await this.isNameErrorVisible())) return '';
    return (await this.nameValidationError().innerText()).trim();
  }

  async expectNameErrorHidden() {
    await expect(this.nameValidationError()).toBeHidden({ timeout: timeouts.action });
  }

  async clearPhone() {
    await this.phoneInput().fill('');
  }

  async enterPhone(value) {
    await this.phoneInput().fill(value);
  }

  async getPhoneValue() {
    return this.phoneInput().inputValue();
  }

  async getPhoneValueAttribute() {
    return this.phoneInput().getAttribute('value');
  }

  async openCountrySelector() {
    await this.countryButton().click();
    await expect(this.countryDropdown()).toBeVisible({ timeout: timeouts.action });
  }

  async searchCountry(value) {
    await this.countrySearchInput().fill(value);
  }

  async selectUnitedStatesCountry() {
    await expect(this.unitedStatesCountryOption()).toBeVisible({ timeout: timeouts.action });
    await this.unitedStatesCountryOption().click();
  }

  async selectUnitedStatesCountryCode() {
    await this.openCountrySelector();
    await this.searchCountry('US');
    await this.selectUnitedStatesCountry();
    await this.expectUnitedStatesCountrySelected();
  }

  async expectUnitedStatesCountrySelected() {
    await expect(this.countryButton()).toContainText('+1', { timeout: timeouts.action });
    await expect(this.selectedCountryFlag()).toHaveAttribute('title', /United States/i, {
      timeout: timeouts.action,
    });
  }

  async isPhoneErrorVisible() {
    return this.phoneValidationError()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async getPhoneErrorText() {
    if (!(await this.isPhoneErrorVisible())) return '';
    return (await this.phoneValidationError().innerText()).trim();
  }

  async expectPhoneErrorHidden() {
    await expect(this.phoneValidationError()).toBeHidden({ timeout: timeouts.action });
  }

  async continueToNextStep() {
    await this.continueButton().click();
  }
}
