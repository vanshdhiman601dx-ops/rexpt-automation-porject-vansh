import { expect } from '@playwright/test';
import { personalDetailsLocators } from '../../locators/personal-details.locators.js';
import { timeouts } from '../../config/timeouts.js';

export class PersonalDetailsPage {
  constructor(page) {
    this.page = page;
  }

  async verifyLoaded(expectedUrl) {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: timeouts.authRedirect });
    await expect(this.page.locator(personalDetailsLocators.rexptLogo)).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(this.page.locator(personalDetailsLocators.agentSetupDivider)).toBeVisible();
    await expect(this.page.locator(personalDetailsLocators.pageHeading)).toBeVisible();
    await expect(this.page.locator(personalDetailsLocators.pageSubtitle)).toBeVisible();
    await expect(this.page.locator(personalDetailsLocators.businessSearchInput)).toBeVisible();
    await expect(this.page.locator(personalDetailsLocators.emptyBusinessState)).toBeVisible();
    await expect(this.page.locator(personalDetailsLocators.nextButton)).toBeVisible();
  }
}
