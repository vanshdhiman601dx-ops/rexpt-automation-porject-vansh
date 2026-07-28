import { expect } from '@playwright/test';
import { onboardingLocators } from '../../locators/onboarding.locators.js';
import { timeouts } from '../../config/timeouts.js';

export class BusinessCategoryPage {
  constructor(page) {
    this.page = page;
  }

  async verifyLoaded(expectedUrl) {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: timeouts.authRedirect });
    await expect(this.title()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.searchInput()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.continueButton()).toBeVisible();
  }

  title() {
    return this.page.locator(onboardingLocators.businessCategory.title);
  }

  searchInput() {
    return this.page.locator(onboardingLocators.businessCategory.searchInput);
  }

  validationError() {
    return this.page.locator(onboardingLocators.businessCategory.searchValidationError).first();
  }

  addCategorySuggestion(category) {
    return this.page.locator(onboardingLocators.businessCategory.noMatchAddCategoryBox(category)).first();
  }

  addCategoryBox() {
    return this.page.locator(onboardingLocators.businessCategory.addCategoryBox).first();
  }

  categoryCard(category) {
    return this.page.locator(onboardingLocators.businessCategory.categoryCard(category)).first();
  }

  selectedConfirmation() {
    return this.page.locator(onboardingLocators.businessCategory.selectedConfirmation);
  }

  selectedCategoryText() {
    return this.page.locator(onboardingLocators.businessCategory.selectedCategoryText);
  }

  continueButton() {
    return this.page.locator(onboardingLocators.businessStep.continueButton);
  }

  categoryRequiredToast() {
    return this.page.locator(onboardingLocators.businessStep.errorToast);
  }

  async clearSearch() {
    await this.searchInput().fill('');
  }

  async enterCategory(value) {
    await this.searchInput().fill(value);
  }

  async getSearchValue() {
    return this.searchInput().inputValue();
  }

  async isValidationErrorVisible() {
    return this.validationError()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async getValidationErrorText() {
    if (!(await this.isValidationErrorVisible())) return '';
    return (await this.validationError().innerText()).trim();
  }

  async isAddCategorySuggestionVisible(category) {
    return this.addCategorySuggestion(category)
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async isAddCategoryBoxVisible() {
    return this.addCategoryBox()
      .isVisible({ timeout: timeouts.action })
      .catch(() => false);
  }

  async getAddCategoryBoxText() {
    await expect(this.addCategoryBox()).toBeVisible({ timeout: timeouts.action });
    return (await this.addCategoryBox().innerText()).trim();
  }

  async selectExistingCategory(category) {
    await this.clearSearch();
    await this.enterCategory(category);
    await expect(this.categoryCard(category)).toBeVisible({ timeout: timeouts.action });
    await this.categoryCard(category).click();
    await expect(this.searchInput()).toHaveValue(category, { timeout: timeouts.action });
  }

  async selectCustomCategory(category) {
    await this.clearSearch();
    await this.enterCategory(category);
    await expect(this.addCategorySuggestion(category)).toBeVisible({ timeout: timeouts.action });
    await this.addCategorySuggestion(category).click();
    await expect(this.searchInput()).toHaveValue(category, { timeout: timeouts.action });
  }

  async selectCategoryForContinue(category) {
    await this.clearSearch();
    await this.enterCategory(category);

    if (await this.categoryCard(category).isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await this.categoryCard(category).click();
    } else {
      await expect(this.addCategorySuggestion(category)).toBeVisible({ timeout: timeouts.action });
      await this.addCategorySuggestion(category).click();
    }

    await expect(this.searchInput()).toHaveValue(category, { timeout: timeouts.action });
    await expect(this.continueButton()).toBeEnabled({ timeout: timeouts.action });
  }

  async selectCategoryForRecovery(category) {
    await this.searchInput().fill(category);
    await this.page.waitForTimeout(350);

    const categoryCard = this.categoryCard(category);
    if (await categoryCard.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await categoryCard.click({ force: true });
    } else if (await this.addCategorySuggestion(category).isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await this.addCategorySuggestion(category).click({ force: true });
    } else if (await this.addCategoryBox().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await this.addCategoryBox().click({ force: true });
    } else {
      throw new Error(`Recovery category was not selectable: ${category}`);
    }

    await expect(this.continueButton()).toBeEnabled({ timeout: timeouts.shortAction });
  }

  async clickContinue() {
    await expect(this.continueButton()).toBeEnabled({ timeout: timeouts.action });
    await this.continueButton().click();
  }

  async clickContinueWithFallback() {
    await expect(this.continueButton()).toBeEnabled({ timeout: timeouts.action });
    await this.continueButton().click();

    if (await this.title().isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await this.continueButton().click({ force: true });
    }
  }
}
