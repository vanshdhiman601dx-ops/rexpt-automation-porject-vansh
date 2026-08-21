import { expect } from '@playwright/test';
import { onboardingLocators } from '../../../../locators/onboarding.locators.js';
import { timeouts } from '../../../../config/timeouts.js';

export class BusinessListingPage {
  constructor(page) {
    this.page = page;
  }

  async verifyLoaded(expectedUrl) {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: timeouts.authRedirect });
    await expect(this.title()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.firstListingResult()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  title() {
    return this.page.locator(onboardingLocators.businessLookup.listingConfirmTitle).first();
  }

  listingResults() {
    return this.page.locator(onboardingLocators.businessLookup.listingResult);
  }

  firstListingResult() {
    return this.listingResults().first();
  }

  firstUseThisButton() {
    return this.firstListingResult().locator(onboardingLocators.businessLookup.listingUseThisButton).first();
  }

  confirmDialog() {
    return this.page.locator(onboardingLocators.businessConfirmModal.dialog).first();
  }

  confirmTitle() {
    return this.page.locator(onboardingLocators.businessConfirmModal.title).first();
  }

  emailInput() {
    return this.page.locator(onboardingLocators.businessConfirmModal.businessEmailInput).first();
  }

  editButton() {
    return this.page.locator(onboardingLocators.businessConfirmModal.editButton).first();
  }

  emailValidationError() {
    return this.page.locator(onboardingLocators.businessConfirmModal.emailValidationError).first();
  }

  looksGoodButton() {
    return this.page.locator(onboardingLocators.businessConfirmModal.looksGoodButton).first();
  }

  confirmRow(label) {
    return this.page.locator(onboardingLocators.businessConfirmModal.confirmRow).filter({ hasText: label }).first();
  }

  progressDot(step) {
    return this.page.locator(onboardingLocators.businessStep.progressDots).nth(step - 1);
  }

  manualFooterEnterButton() {
    return this.page.locator(onboardingLocators.businessLookup.manualFooterEnterButton).first();
  }

  manualConfirmTitle() {
    return this.page.locator(onboardingLocators.manualEntryConfirmModal.title).first();
  }

  continueManuallyButton() {
    return this.page.locator(onboardingLocators.manualEntryConfirmModal.continueManuallyButton).first();
  }

  async resultCount() {
    return this.listingResults().count();
  }

  async selectFirstBusinessListing() {
    await expect(this.firstListingResult()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.firstUseThisButton()).toBeEnabled({ timeout: timeouts.action });
    await this.firstUseThisButton().click();
    await this.verifyConfirmDialogOpen();
  }

  async verifyConfirmDialogOpen() {
    await expect(this.confirmTitle()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.emailInput()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.looksGoodButton()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async clearEmail() {
    await this.emailInput().fill('');
  }

  async enterEmail(value) {
    await this.emailInput().fill(value);
  }

  async pasteEmail(value) {
    await this.emailInput().fill(value);
  }

  async getEmailValue() {
    return this.emailInput().inputValue();
  }

  async getEmailValueAttribute() {
    return this.emailInput().getAttribute('value');
  }

  async triggerEmailValidation({ clickLooksGood = false } = {}) {
    await this.emailInput().blur();
    if (clickLooksGood) {
      await this.looksGoodButton().click();
    }
  }

  async isEmailErrorVisible() {
    return this.emailValidationError()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);
  }

  async getEmailErrorText() {
    if (!(await this.isEmailErrorVisible())) return '';
    return (await this.emailValidationError().innerText()).trim();
  }

  async expectEmailErrorHidden() {
    await expect(this.emailValidationError()).toBeHidden({ timeout: timeouts.quickAction });
  }

  async confirmLooksGood() {
    await expect(this.looksGoodButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.looksGoodButton().click();
  }

  async expectConfirmDialogClosed() {
    await expect(this.confirmTitle()).toBeHidden({ timeout: timeouts.action });
  }

  async isBusinessListingScreenVisible() {
    return this.title()
      .isVisible({ timeout: timeouts.shortAction })
      .catch(() => false);
  }

  async isEditButtonVisible() {
    return this.editButton()
      .isVisible({ timeout: timeouts.shortAction })
      .catch(() => false);
  }

  async openEditPopup() {
    await expect(this.editButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.editButton().click();
    await this.verifyConfirmDialogOpen();
  }

  async clickEditIconFromLooksGoodPopup() {
    await expect(this.editButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.editButton().click();
  }

  async getConfirmRowValue(label) {
    const row = this.confirmRow(label);
    await expect(row).toBeVisible({ timeout: timeouts.pageLoad });

    const input = row.locator('input').first();
    if (await input.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      return (await input.inputValue()).trim();
    }

    const values = await row.locator('span').allInnerTexts();
    return (values[1] || '').trim();
  }

  async collectLooksGoodData() {
    await this.verifyConfirmDialogOpen();
    return {
      businessName: await this.getConfirmRowValue('Business Name'),
      businessPhone: await this.getConfirmRowValue('Phone Number'),
      email: await this.getEmailValue(),
      website: await this.getConfirmRowValue('Website'),
      address: await this.getConfirmRowValue('City / location'),
    };
  }

  async clickProgressDot(step) {
    await expect
      .poll(
        async () =>
          this.page.evaluate(() => {
            const isVisible = (element) => {
              const rect = element.getBoundingClientRect();
              const style = window.getComputedStyle(element);
              return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
            };

            return Array.from(document.querySelectorAll('[class*="FooterNav"] [class*="steps"] > span'))
              .filter(isVisible)
              .some((dot) => !String(dot.className || '').includes('disabled'));
          }),
        { timeout: timeouts.shortAction }
      )
      .toBeTruthy()
      .catch(() => {});

    const domClicked = await this.page.evaluate((targetStep) => {
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };

      const footer = Array.from(document.querySelectorAll('[class*="FooterNav"]'))
        .filter(isVisible)
        .sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0];
      const stepsContainer = Array.from(footer?.querySelectorAll('[class*="steps"]') || [])
        .filter(isVisible)
        .find((container) => Array.from(container.querySelectorAll(':scope > span')).filter(isVisible).length >= 3);
      const dots = Array.from(stepsContainer?.querySelectorAll(':scope > span') || []).filter(isVisible);
      const activeDot = dots.find((candidateDot) => candidateDot.textContent?.trim());
      const siblingDot =
        targetStep === 2 && activeDot?.textContent?.trim() === '3'
          ? activeDot.previousElementSibling
          : null;
      const dot = siblingDot && isVisible(siblingDot) ? siblingDot : dots[targetStep - 1];

      if (!dot || String(dot.className || '').includes('disabled')) return false;

      dot.scrollIntoView({ block: 'center', inline: 'center' });
      dot.click();
      return true;
    }, step);

    if (domClicked) {
      await this.page.waitForTimeout(850);
      if (await this.isProgressDotActive(step)) return;
    }

    const target = await this.page.evaluate((targetStep) => {
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };

      const footerCandidates = Array.from(document.querySelectorAll('[class*="FooterNav"]'))
        .filter(isVisible)
        .map((footer) => {
          const footerRect = footer.getBoundingClientRect();
          const stepsContainers = Array.from(footer.querySelectorAll('[class*="steps"]')).filter(isVisible);
          const steps = stepsContainers
            .map((stepsContainer) => {
              const dots = Array.from(stepsContainer.querySelectorAll(':scope > span')).filter(isVisible);
              return { stepsContainer, dots };
            })
            .filter((candidate) => candidate.dots.length >= 3);

          return { footer, footerRect, steps };
        })
        .filter((candidate) => candidate.steps.length > 0)
        .sort((a, b) => b.footerRect.bottom - a.footerRect.bottom);

      const footerCandidate = footerCandidates[0];
      const stepsCandidate = footerCandidate?.steps[0];
      const activeDot = stepsCandidate?.dots.find((candidateDot) => candidateDot.textContent?.trim());
      const siblingDot =
        targetStep === 2 && activeDot?.textContent?.trim() === '3'
          ? activeDot.previousElementSibling
          : null;
      const dot = siblingDot && isVisible(siblingDot) ? siblingDot : stepsCandidate?.dots[targetStep - 1];

      if (!dot) {
        return {
          found: false,
          reason: `Unable to find visible footer dot ${targetStep}`,
          footerCount: footerCandidates.length,
          dotCounts: footerCandidates.map((candidate) =>
            candidate.steps.map((stepsCandidateItem) => stepsCandidateItem.dots.length)
          ),
        };
      }

      dot.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = dot.getBoundingClientRect();

      return {
        found: true,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        text: dot.textContent?.trim() || '',
        className: dot.className || '',
      };
    }, step);

    if (!target.found) {
      throw new Error(
        `${target.reason}. Visible footer count: ${target.footerCount}. Dot counts: ${JSON.stringify(
          target.dotCounts
        )}`
      );
    }

    await this.page.mouse.click(target.x, target.y);
    await this.page.waitForTimeout(500);

    if (!(await this.isProgressDotActive(step))) {
      const clicked = await this.page.evaluate((targetStep) => {
        const isVisible = (element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        };

        const footer = Array.from(document.querySelectorAll('[class*="FooterNav"]'))
          .filter(isVisible)
          .sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0];
        const stepsContainer = Array.from(footer?.querySelectorAll('[class*="steps"]') || [])
          .filter(isVisible)
          .find((container) => Array.from(container.querySelectorAll(':scope > span')).filter(isVisible).length >= 3);
        const dots = Array.from(stepsContainer?.querySelectorAll(':scope > span') || []).filter(isVisible);
        const activeDot = dots.find((candidateDot) => candidateDot.textContent?.trim());
        const siblingDot =
          targetStep === 2 && activeDot?.textContent?.trim() === '3'
            ? activeDot.previousElementSibling
            : null;
        const dot = siblingDot && isVisible(siblingDot) ? siblingDot : dots[targetStep - 1];

        if (!dot) return false;

        const rect = dot.getBoundingClientRect();
        const eventOptions = {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        };

        dot.dispatchEvent(new MouseEvent('pointerdown', eventOptions));
        dot.dispatchEvent(new MouseEvent('mousedown', eventOptions));
        dot.dispatchEvent(new MouseEvent('pointerup', eventOptions));
        dot.dispatchEvent(new MouseEvent('mouseup', eventOptions));
        dot.dispatchEvent(new MouseEvent('click', eventOptions));
        dot.click();
        return true;
      }, step);

      if (!clicked) throw new Error(`Unable to click footer progress dot ${step}`);
      await this.page.waitForTimeout(500);
    }
  }

  async isProgressDotActive(step) {
    return this.page.evaluate((targetStep) => {
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };

      const footer = Array.from(document.querySelectorAll('[class*="FooterNav"]'))
        .filter(isVisible)
        .sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0];
      const stepsContainer = Array.from(footer?.querySelectorAll('[class*="steps"]') || [])
        .filter(isVisible)
        .find((container) => Array.from(container.querySelectorAll(':scope > span')).filter(isVisible).length >= 3);
      const dot = Array.from(stepsContainer?.querySelectorAll(':scope > span') || []).filter(isVisible)[targetStep - 1];

      return Boolean(dot && dot.textContent?.trim() === String(targetStep));
    }, step);
  }

  async openManualEntryFromListing() {
    await expect(this.manualFooterEnterButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.manualFooterEnterButton().click();
    await expect(this.manualConfirmTitle()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async continueManually() {
    await expect(this.continueManuallyButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.continueManuallyButton().click();
  }
}
