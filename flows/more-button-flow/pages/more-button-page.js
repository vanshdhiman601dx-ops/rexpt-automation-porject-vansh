import { expect } from '@playwright/test';
import { moreButtonLocators } from '../../../locators/more-button-locators.js';
import { callSettingsLocators } from '../../../locators/call-settings.locators.js';
import { timeouts } from '../../../config/timeouts.js';

export class MoreButtonPage {
  constructor(page) {
    this.page = page;
  }

  moreButton() {
    return this.page.locator(`${moreButtonLocators.footer.moreWrapper}, ${moreButtonLocators.footer.moreButton}`).first();
  }

  moreModalTitle() {
    return this.page.locator(moreButtonLocators.modal.title).first();
  }

  testAgentOption() {
    return this.page.locator(moreButtonLocators.menuItems.testAgent).first();
  }

  callSettingOption() {
    return this.page.locator(moreButtonLocators.menuItems.callSetting).first();
  }

  testAgentPopup() {
    return this.page.locator(moreButtonLocators.testAgentCall.modal).first();
  }

  callAgentButton() {
    return this.page.locator(moreButtonLocators.testAgentCall.callAgentButton).first();
  }

  connectedState() {
    return this.page.locator(moreButtonLocators.testAgentCall.connectedState).first();
  }

  endCallButton() {
    return this.page.locator(moreButtonLocators.testAgentCall.endCallButton).first();
  }

  callAgentReadyButton() {
    return this.page.locator(moreButtonLocators.testAgentCall.callAgentButton).first();
  }

  closeTestAgentPopupButton() {
    return this.page.locator(moreButtonLocators.testAgentCall.closeButton).first();
  }

  callSettingsTitle() {
    return this.page.locator(moreButtonLocators.callSettingsPage.title).first();
  }

  callRecordingToggle() {
    return this.page.locator(callSettingsLocators.recordingDeclaration.toggleInput).first();
  }

  callRecordingToggleSlider() {
    return this.page.locator(callSettingsLocators.recordingDeclaration.toggleSlider).first();
  }

  backgroundSoundDropdown() {
    return this.page.locator(callSettingsLocators.backgroundSound.dropdown).first();
  }

  backgroundSoundSettingsButton() {
    return this.page.locator(callSettingsLocators.backgroundSound.settingsButton).first();
  }

  headerBackButton() {
    return this.page.locator(moreButtonLocators.header.backButton).first();
  }

  connectCalendarOption() {
    return this.page.locator(moreButtonLocators.menuItems.connectCalendar).first();
  }

  publicAgentOption() {
    return this.page.locator(moreButtonLocators.menuItems.publicAgent).first();
  }

  googleCalendarConnectButton() {
    return this.page.locator(moreButtonLocators.connectCalendarPage.googleCalendarConnectButton).first();
  }

  continueWithGoogleCalendarButton() {
    return this.page.locator(moreButtonLocators.connectCalendarPage.continueWithGoogleCalendarButton).first();
  }

  async verifyFastAgentDetailsLoaded() {
    await expect(this.page).toHaveURL(/\/fast-agent-details?/, { timeout: timeouts.authRedirect });
    await expect(this.moreButton()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async openMoreMenu() {
    await expect(this.moreButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.moreButton().scrollIntoViewIfNeeded().catch(() => {});
    await this.moreButton().click({ force: true });
    await this.verifyMoreMenuOpen();
  }

  async verifyMoreMenuOpen() {
    await expect(this.moreModalTitle()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async verifyRequiredMoreOptions() {
    await expect(this.testAgentOption()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.callSettingOption()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async openTestAgentPopup() {
    await expect(this.testAgentOption()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.testAgentOption().click({ force: true });
    await expect(this.testAgentPopup()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.callAgentButton()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async startTestCall() {
    await expect(this.callAgentButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.callAgentButton().scrollIntoViewIfNeeded().catch(() => {});
    await this.callAgentButton().click({ force: true });
    await expect
      .poll(
        async () =>
          (await this.endCallButton().isVisible().catch(() => false)) ||
          (await this.connectedState().isVisible().catch(() => false)),
        { timeout: timeouts.authRedirect }
      )
      .toBe(true);
  }

  async waitDuringConnectedCall() {
    await this.page.waitForTimeout(6000);
  }

  async endTestCall() {
    await expect(this.endCallButton()).toBeVisible({ timeout: timeouts.authRedirect });
    await this.endCallButton().scrollIntoViewIfNeeded().catch(() => {});
    await this.endCallButton().click({ force: true });
    await expect(this.callAgentReadyButton()).toBeVisible({ timeout: timeouts.authRedirect });
  }

  async closeTestAgentPopup() {
    await expect(this.closeTestAgentPopupButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.closeTestAgentPopupButton().click({ force: true });
    await expect(this.testAgentPopup()).toBeHidden({ timeout: timeouts.pageLoad });
  }

  async openCallSettings() {
    await expect(this.callSettingOption()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.callSettingOption().scrollIntoViewIfNeeded().catch(() => {});
    await this.callSettingOption().click({ force: true });
    await expect(this.page).toHaveURL(/\/call-setting/, { timeout: timeouts.authRedirect });
    await expect(this.callSettingsTitle()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async waitForCallRecordingLoadingToFinish() {
    await this.page
      .locator(callSettingsLocators.recordingDeclaration.loadingSpinner)
      .first()
      .waitFor({ state: 'hidden', timeout: timeouts.pageLoad })
      .catch(() => {});
  }

  async clickCallRecordingToggle() {
    await this.waitForCallRecordingLoadingToFinish();
    await expect(this.callRecordingToggle()).toBeAttached({ timeout: timeouts.pageLoad });
    await expect(this.callRecordingToggle()).toBeEnabled({ timeout: timeouts.pageLoad });
    await this.callRecordingToggleSlider().scrollIntoViewIfNeeded().catch(() => {});
    await this.callRecordingToggleSlider().click({ force: true });
  }

  async confirmRecordingDisclaimerIfVisible() {
    const disclaimerTitle = this.page.locator(callSettingsLocators.recordingDeclaration.disclaimerTitle).first();
    if (!(await disclaimerTitle.isVisible({ timeout: timeouts.popup }).catch(() => false))) {
      return false;
    }

    const checkbox = this.page.locator(callSettingsLocators.recordingDeclaration.disclaimerCheckbox).first();
    const confirmButton = this.page.locator(callSettingsLocators.recordingDeclaration.confirmButton).first();

    await expect(checkbox).toBeVisible({ timeout: timeouts.pageLoad });
    await checkbox.check({ force: true });
    await expect(confirmButton).toBeEnabled({ timeout: timeouts.pageLoad });
    await confirmButton.click({ force: true });
    await expect(disclaimerTitle).toBeHidden({ timeout: timeouts.pageLoad });
    await this.waitForCallRecordingLoadingToFinish();
    return true;
  }

  async verifyCallRecordingDeclarationToggleFlow() {
    await expect(this.page.locator(callSettingsLocators.recordingDeclaration.questionText).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(this.callRecordingToggle()).toBeAttached({ timeout: timeouts.pageLoad });

    await this.clickCallRecordingToggle();
    await this.waitForCallRecordingLoadingToFinish();

    await this.clickCallRecordingToggle();
    await expect(this.page.locator(callSettingsLocators.recordingDeclaration.disclaimerTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await this.confirmRecordingDisclaimerIfVisible();
  }

  async verifyBackgroundSoundDropdownAndVolumeSlider() {
    await expect(this.backgroundSoundDropdown()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.backgroundSoundDropdown()).toBeEnabled({ timeout: timeouts.pageLoad });

    const currentValue = await this.backgroundSoundDropdown().inputValue();
    const nextValue = currentValue === 'coffee-shop' ? 'call-center' : 'coffee-shop';
    await this.backgroundSoundDropdown().selectOption(nextValue);
    await expect(this.backgroundSoundDropdown()).toHaveValue(nextValue, { timeout: timeouts.pageLoad });

    await expect(this.backgroundSoundSettingsButton()).toBeEnabled({ timeout: timeouts.pageLoad });
    await this.backgroundSoundSettingsButton().click({ force: true });

    const volumeSlider = this.page.locator(callSettingsLocators.backgroundSound.volumeSlider).first();
    await expect(volumeSlider).toBeVisible({ timeout: timeouts.pageLoad });
    await this.verifyRangeSliderWorks(volumeSlider, '1.5');
  }

  async verifyRangeSliderWorks(slider, preferredValue) {
    await expect(slider).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(slider).toBeEnabled({ timeout: timeouts.pageLoad });

    const beforeValue = await slider.inputValue();
    const min = Number(await slider.getAttribute('min'));
    const max = Number(await slider.getAttribute('max'));
    const fallbackValue = Number.isFinite(min) && Number.isFinite(max) ? String(min + (max - min) / 2) : preferredValue;
    const targetValue = beforeValue === preferredValue ? fallbackValue : preferredValue;

    await slider.evaluate((element, value) => {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    }, targetValue);

    await expect(slider).toHaveValue(targetValue, { timeout: timeouts.pageLoad });
  }

  async verifyAllCallSettingSlidersWork() {
    await this.verifyRangeSliderWorks(
      this.page.locator(callSettingsLocators.speechSetting.interruptionSensitivitySlider).first(),
      '0.5'
    );
    await this.verifyRangeSliderWorks(
      this.page.locator(callSettingsLocators.speechSetting.responseEagernessSlider).first(),
      '0.6'
    );
    await this.verifyRangeSliderWorks(
      this.page.locator(callSettingsLocators.speechSetting.voiceSpeedSlider).first(),
      '1.25'
    );
    await this.verifyRangeSliderWorks(
      this.page.locator(callSettingsLocators.endCallOnSilence.slider).first(),
      '300'
    );
  }

  async verifyCallSettingsInteractiveControls() {
    await this.verifyCallRecordingDeclarationToggleFlow();
    await this.verifyBackgroundSoundDropdownAndVolumeSlider();
    await this.verifyAllCallSettingSlidersWork();
  }

  async goBackFromCallSettingsToFastAgentDetails() {
    await expect(this.headerBackButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.headerBackButton().click({ force: true });
    await expect(this.page).toHaveURL(/\/fast-agent-details?/, { timeout: timeouts.authRedirect });
    await expect(this.moreButton()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async openConnectCalendarFromMoreMenu() {
    await this.openMoreMenu();
    await expect(this.connectCalendarOption()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.connectCalendarOption().scrollIntoViewIfNeeded().catch(() => {});
    await this.connectCalendarOption().click({ force: true });
    await expect(this.page).toHaveURL(/\/connect-calender2/, { timeout: timeouts.authRedirect });
    await expect(this.page.locator(moreButtonLocators.connectCalendarPage.title).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
  }

  async openGoogleCalendarOAuth() {
    const disconnectButton = this.page.locator(moreButtonLocators.connectCalendarPage.googleCalendarDisconnectButton).first();
    if (await disconnectButton.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      return false;
    }

    await expect(this.googleCalendarConnectButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.googleCalendarConnectButton()).toBeEnabled({ timeout: timeouts.pageLoad });
    await this.googleCalendarConnectButton().click({ force: true });
    await expect(this.page.locator(moreButtonLocators.connectCalendarPage.modalTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });

    await expect(this.continueWithGoogleCalendarButton()).toBeVisible({ timeout: timeouts.pageLoad });
    await this.continueWithGoogleCalendarButton().click({ force: true, noWaitAfter: true });
    await this.page.waitForLoadState('domcontentloaded', { timeout: timeouts.expect }).catch(() => {});
    return true;
  }

  async clickGoogleNext() {
    const nextButton = this.page.locator(moreButtonLocators.googleOAuth.nextButton).first();
    if (await nextButton.isVisible({ timeout: timeouts.action }).catch(() => false)) {
      await expect(nextButton).toBeEnabled({ timeout: timeouts.action });
      await nextButton.click({ timeout: timeouts.action });
      await this.page.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
      return;
    }

    await this.page.getByRole('button', { name: /^next$/i }).click({ timeout: timeouts.action });
    await this.page.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
  }

  async selectOrEnterGoogleEmail(email) {
    const existingAccount = this.page.getByText(email, { exact: true });
    if (await existingAccount.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
      await existingAccount.click({ force: true });
      await this.page.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
      return;
    }

    const emailInput = this.page.locator(moreButtonLocators.googleOAuth.emailInput).first();
    await expect(emailInput).toBeVisible({ timeout: timeouts.pageLoad });
    await emailInput.fill(email);
    await this.clickGoogleNext();
  }

  async enterGooglePasswordIfPrompted(password) {
    const passwordInput = this.page.locator(moreButtonLocators.googleOAuth.passwordInput).first();
    if (!(await passwordInput.isVisible({ timeout: timeouts.expect }).catch(() => false))) {
      return;
    }

    await passwordInput.fill(password);
    await expect(passwordInput).toHaveValue(password, { timeout: timeouts.expect });
    await this.clickGoogleNext();
  }

  async continueGoogleConsentSteps(maxClicks = 4) {
    for (let index = 0; index < maxClicks; index += 1) {
      if (!/accounts\.google\.com|google\.com/.test(this.page.url())) {
        return;
      }

      const transientError = this.page.locator(moreButtonLocators.googleOAuth.somethingWentWrong).first();
      if (await transientError.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
        throw new Error('Google OAuth showed Something went wrong while connecting calendar.');
      }

      const continueButton = this.page.locator(moreButtonLocators.googleOAuth.continueButton).first();
      if (!(await continueButton.isVisible({ timeout: timeouts.shortAction }).catch(() => false))) {
        break;
      }

      await expect(continueButton).toBeEnabled({ timeout: timeouts.action });
      await continueButton.click({ timeout: timeouts.action });
      await this.page.waitForLoadState('domcontentloaded', { timeout: timeouts.action }).catch(() => {});
    }
  }

  async completeGoogleCalendarOAuth({ email, password }) {
    await expect.poll(async () => this.page.url(), { timeout: timeouts.authRedirect }).toMatch(/accounts\.google\.com|google\.com/);
    await this.selectOrEnterGoogleEmail(email);
    await this.enterGooglePasswordIfPrompted(password);
    await this.continueGoogleConsentSteps();
    await expect.poll(async () => !/accounts\.google\.com|google\.com/.test(this.page.url()), {
      timeout: timeouts.authRedirect,
    }).toBe(true);
  }

  async verifyConnectCalendarGoogleFlow({ email, password }) {
    await this.goBackFromCallSettingsToFastAgentDetails();
    await this.openConnectCalendarFromMoreMenu();
    const oauthStarted = await this.openGoogleCalendarOAuth();
    if (!oauthStarted) {
      return;
    }
    await this.completeGoogleCalendarOAuth({ email, password });
  }

  async waitForDashboardAfterCalendarFlow() {
    await expect(this.page).toHaveURL(/\/(fast-agent-details?|dashboard)(?:[/?#]|$)/, {
      timeout: timeouts.authRedirect,
    });
    await expect(this.moreButton()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async openPublicAgentAvailability() {
    await this.openMoreMenu();
    await expect(this.publicAgentOption()).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(this.publicAgentOption()).toBeEnabled({ timeout: timeouts.pageLoad });
    await this.publicAgentOption().click({ force: true });
    await expect(this.page).toHaveURL(/\/public-agent-availability(?:[/?#]|$)/, {
      timeout: timeouts.authRedirect,
    });
    await expect(
      this.page.locator(moreButtonLocators.publicAgentAvailabilityPage.pageTitle).first()
    ).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async openWeeklyAvailabilityEditor() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    const editButton = this.page.locator(locators.editWeeklyAvailabilityButton).first();
    await expect(this.page.locator(locators.weeklyAvailabilityTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(editButton).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(editButton).toBeEnabled({ timeout: timeouts.pageLoad });
    await editButton.click();
    await expect(this.page.locator(locators.weeklyEditorTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
  }

  async verifyAppointmentDurationOptions() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    for (const minutes of [15, 30, 45, 60]) {
      const option = this.page.locator(locators.durationButton(minutes)).first();
      await expect(option).toBeVisible({ timeout: timeouts.pageLoad });
      await expect(option).toBeEnabled({ timeout: timeouts.pageLoad });
      await option.click();
      await expect(option).toHaveClass(/pillOn/, { timeout: timeouts.action });
    }
  }

  async handleBusinessHoursWarningIfVisible() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    const warningTitle = this.page.locator(locators.businessHoursWarningTitle).first();
    if (!(await warningTitle.isVisible({ timeout: timeouts.quickAction }).catch(() => false))) {
      return false;
    }

    const enableAnywayButton = this.page.locator(locators.enableAnywayButton).first();
    await expect(enableAnywayButton).toBeVisible({ timeout: timeouts.action });
    await expect(enableAnywayButton).toBeEnabled({ timeout: timeouts.action });
    await enableAnywayButton.click();
    await expect(warningTitle).toBeHidden({ timeout: timeouts.action });
    return true;
  }

  async clickDayToggle(day) {
    const toggle = this.page
      .locator(moreButtonLocators.publicAgentAvailabilityPage.dayToggle(day))
      .first();
    await expect(toggle).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(toggle).toBeEnabled({ timeout: timeouts.pageLoad });
    const before = await toggle.getAttribute('aria-pressed');
    await toggle.click();
    await this.handleBusinessHoursWarningIfVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true', {
      timeout: timeouts.action,
    });
  }

  async verifyAllDayTogglesAreClickable() {
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
      await this.clickDayToggle(day);
    }
  }

  async setDayEnabled(day, shouldBeEnabled) {
    const toggle = this.page
      .locator(moreButtonLocators.publicAgentAvailabilityPage.dayToggle(day))
      .first();
    await expect(toggle).toBeVisible({ timeout: timeouts.pageLoad });
    const isEnabled = (await toggle.getAttribute('aria-pressed')) === 'true';
    if (isEnabled !== shouldBeEnabled) {
      await toggle.click();
      await this.handleBusinessHoursWarningIfVisible();
    }
    await expect(toggle).toHaveAttribute('aria-pressed', String(shouldBeEnabled), {
      timeout: timeouts.action,
    });
  }

  async setWeeklyAvailabilityToTenUntilSevenExceptSunday() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) {
      await this.setDayEnabled(day, true);
      const startTime = this.page.locator(locators.dayStartTime(day)).first();
      const endTime = this.page.locator(locators.dayEndTime(day)).first();
      await expect(startTime).toBeVisible({ timeout: timeouts.action });
      await expect(endTime).toBeVisible({ timeout: timeouts.action });
      await startTime.selectOption('10:00');
      await endTime.selectOption('19:00');
      await expect(startTime).toHaveValue('10:00');
      await expect(endTime).toHaveValue('19:00');
    }

    await this.setDayEnabled('Sunday', false);
    await expect(this.page.locator(locators.dayOffStatus('Sunday')).first()).toBeVisible({
      timeout: timeouts.action,
    });
  }

  async saveWeeklyAvailability() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    const saveButton = this.page.locator(locators.saveWeeklyAvailabilityButton).first();
    await expect(saveButton).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(saveButton).toBeEnabled({ timeout: timeouts.pageLoad });

    const saveResponse = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        /\/api\/availability(?:\?|$)/.test(response.url()),
      { timeout: timeouts.authRedirect }
    );
    await saveButton.click();
    const response = await saveResponse;
    expect(response.ok(), `Availability save returned HTTP ${response.status()}.`).toBeTruthy();
    const responseBody = await response.json();
    const savedWeekly = responseBody?.data?.weekly;
    expect(savedWeekly).toHaveLength(7);
    for (const dayIndex of [1, 2, 3, 4, 5, 6]) {
      expect(savedWeekly[dayIndex]).toMatchObject({
        enabled: true,
        start: '10:00',
        end: '19:00',
      });
    }
    expect(savedWeekly[0]).toMatchObject({ enabled: false });
    await expect(this.page.locator(locators.saveErrorToast).first()).toBeHidden({
      timeout: timeouts.quickAction,
    });
    await expect(saveButton).toBeEnabled({ timeout: timeouts.pageLoad });
  }

  async returnToAvailabilityOverview() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    const backButton = this.page.locator(locators.backButton).first();
    await expect(backButton).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(backButton).toBeEnabled({ timeout: timeouts.pageLoad });
    await backButton.click({ force: true });
    await expect(this.page.locator(locators.pageTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    await expect(this.page.locator(locators.editWeeklyAvailabilityButton).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
  }

  getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async addTomorrowAsEntireDayOverride() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    const manageOverridesButton = this.page.locator(locators.manageOverridesButton).first();
    await manageOverridesButton.scrollIntoViewIfNeeded();
    await expect(manageOverridesButton).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(manageOverridesButton).toBeEnabled({ timeout: timeouts.pageLoad });
    await manageOverridesButton.click();
    await expect(this.page.locator(locators.overridesEditorTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });

    const tomorrow = this.getTomorrowDate();
    const dateInput = this.page.locator(locators.overrideDateInput).first();
    await dateInput.fill(tomorrow);
    await expect(dateInput).toHaveValue(tomorrow);

    const allDayToggle = this.page.locator(locators.blockEntireDayToggle).first();
    await expect(allDayToggle).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(allDayToggle).toBeEnabled({ timeout: timeouts.pageLoad });
    if ((await allDayToggle.getAttribute('aria-pressed')) !== 'true') {
      await allDayToggle.click();
    }
    await expect(allDayToggle).toHaveAttribute('aria-pressed', 'true');

    const addOverrideButton = this.page.locator(locators.addOverrideButton).first();
    await expect(addOverrideButton).toBeEnabled({ timeout: timeouts.pageLoad });
    const saveResponse = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        /\/api\/availability(?:\?|$)/.test(response.url()),
      { timeout: timeouts.authRedirect }
    );
    await addOverrideButton.click();
    const response = await saveResponse;
    expect(response.ok(), `Override save returned HTTP ${response.status()}.`).toBeTruthy();
    const body = await response.json();
    expect(body?.data?.overrides).toEqual(
      expect.arrayContaining([expect.objectContaining({ date: tomorrow, allDay: true })])
    );
    await expect(this.page.locator(locators.upcomingOverridesTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
  }

  async returnFromSubscreenToAvailabilityOverview() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    const backButton = this.page.locator(locators.backButton).first();
    await expect(backButton).toBeVisible({ timeout: timeouts.pageLoad });
    await backButton.click({ force: true });
    await expect(this.page.locator(locators.pageTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
  }

  async returnFromAvailabilityOverviewToDashboard() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    await expect(this.page.locator(locators.pageTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    const backButton = this.page.locator(locators.backButton).first();
    await expect(backButton).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(backButton).toBeEnabled({ timeout: timeouts.pageLoad });
    await backButton.click({ force: true });
    await expect(this.page).toHaveURL(/\/(fast-agent-details?|dashboard)(?:[/?#]|$)/, {
      timeout: timeouts.authRedirect,
    });
    await expect(this.moreButton()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async configureBookingRules() {
    const locators = moreButtonLocators.publicAgentAvailabilityPage;
    const bufferIntervalsButton = this.page.locator(locators.bufferIntervalsButton).first();
    await bufferIntervalsButton.scrollIntoViewIfNeeded();
    await expect(bufferIntervalsButton).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(bufferIntervalsButton).toBeEnabled({ timeout: timeouts.pageLoad });
    await bufferIntervalsButton.click();
    await expect(this.page.locator(locators.bookingRulesEditorTitle).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });

    const bufferSelect = this.page.locator(locators.bufferIntervalsSelect).first();
    await expect(bufferSelect).toBeVisible({ timeout: timeouts.pageLoad });
    await bufferSelect.selectOption({ index: 1 });
    await expect(bufferSelect).toHaveValue('5');

    const minimumNoticeInput = this.page.locator(locators.minimumNoticeInput).first();
    await minimumNoticeInput.fill('2');
    await expect(minimumNoticeInput).toHaveValue('2');
    const hoursButton = this.page.locator(locators.minimumNoticeHoursButton).first();
    await expect(hoursButton).toBeEnabled({ timeout: timeouts.action });
    await hoursButton.click();
    await expect(hoursButton).toHaveClass(/segOn/, { timeout: timeouts.action });

    const fourteenDaysButton = this.page.locator(locators.schedulingHorizonButton(14)).first();
    await expect(fourteenDaysButton).toBeEnabled({ timeout: timeouts.action });
    await fourteenDaysButton.click();
    await expect(fourteenDaysButton).toHaveClass(/segOn/, { timeout: timeouts.action });

    const saveButton = this.page.locator(locators.saveBookingRulesButton).first();
    await expect(saveButton).toBeEnabled({ timeout: timeouts.pageLoad });
    const saveResponse = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        /\/api\/availability(?:\?|$)/.test(response.url()),
      { timeout: timeouts.authRedirect }
    );
    await saveButton.click();
    const response = await saveResponse;
    expect(response.ok(), `Booking rules save returned HTTP ${response.status()}.`).toBeTruthy();
    const body = await response.json();
    expect(body?.data).toMatchObject({ bufferMins: 5, minNoticeMins: 120, horizonDays: 14 });
    await expect(saveButton).toBeEnabled({ timeout: timeouts.pageLoad });
  }

  async verifyPublicAgentWeeklyAvailabilityFlow() {
    await this.waitForDashboardAfterCalendarFlow();
    await this.openPublicAgentAvailability();
    await this.openWeeklyAvailabilityEditor();
    await this.verifyAppointmentDurationOptions();
    await this.verifyAllDayTogglesAreClickable();
    await this.setWeeklyAvailabilityToTenUntilSevenExceptSunday();
    await this.saveWeeklyAvailability();
    await this.returnToAvailabilityOverview();
    await this.addTomorrowAsEntireDayOverride();
    await this.returnFromSubscreenToAvailabilityOverview();
    await this.configureBookingRules();
    await this.returnFromSubscreenToAvailabilityOverview();
    await this.returnFromAvailabilityOverviewToDashboard();
  }

  async openAgentScheduleFromMoreMenu() {
    const locators = moreButtonLocators.agentSchedulePage;
    await this.openMoreMenu();
    const agentScheduleOption = this.page.locator(moreButtonLocators.menuItems.agentSchedule).first();
    await expect(agentScheduleOption).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(agentScheduleOption).toBeEnabled({ timeout: timeouts.pageLoad });
    await agentScheduleOption.click({ force: true });
    await expect(this.page).toHaveURL(/\/Business_hours(?:[/?#]|$)/, {
      timeout: timeouts.authRedirect,
    });
    await expect(this.page.locator(locators.title).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
  }

  async selectAgentScheduleTime(day, controlLocator, timeValue) {
    const locators = moreButtonLocators.agentSchedulePage;
    const control = this.page.locator(controlLocator(day)).first();
    await expect(control).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(control).toBeEnabled({ timeout: timeouts.pageLoad });
    await control.click();
    const option = this.page.locator(locators.timeOption(timeValue)).first();
    await expect(option).toBeVisible({ timeout: timeouts.action });
    await option.click();
    await expect(control).toContainText(timeValue === '09:00' ? '9:00 AM' : '5:00 PM');
  }

  async setMondayAgentSchedule() {
    const locators = moreButtonLocators.agentSchedulePage;
    const mondayCheckbox = this.page.locator(locators.dayEnabledCheckbox('Monday')).first();
    await expect(mondayCheckbox).toBeAttached({ timeout: timeouts.pageLoad });
    if (!(await mondayCheckbox.isChecked())) {
      await mondayCheckbox.check({ force: true });
    }
    await expect(mondayCheckbox).toBeChecked();
    await this.selectAgentScheduleTime('Monday', locators.dayOpenTimeButton, '09:00');
    await this.selectAgentScheduleTime('Monday', locators.dayCloseTimeButton, '17:00');
  }

  async applySameAgentScheduleEveryday() {
    const locators = moreButtonLocators.agentSchedulePage;
    const toggle = this.page.locator(locators.sameScheduleEverydayCheckbox).first();
    await expect(toggle).toBeAttached({ timeout: timeouts.pageLoad });
    await expect(toggle).toBeEnabled({ timeout: timeouts.pageLoad });
    await toggle.click({ force: true });
    await expect(this.page.locator(locators.confirmationMessage).first()).toBeVisible({
      timeout: timeouts.popup,
    });
    const confirmButton = this.page.locator(locators.confirmationButton).first();
    await expect(confirmButton).toBeEnabled({ timeout: timeouts.action });
    await confirmButton.click();
    await expect(this.page.locator(locators.confirmationMessage).first()).toBeHidden({
      timeout: timeouts.action,
    });
    await expect(toggle).toBeChecked({ timeout: timeouts.action });
  }

  async saveAgentScheduleAndClosePopup() {
    const locators = moreButtonLocators.agentSchedulePage;
    const saveButton = this.page.locator(locators.saveButton).first();
    await expect(saveButton).toBeVisible({ timeout: timeouts.pageLoad });
    const saveResponse = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        /\/api\/business-hours\//.test(response.url()),
      { timeout: timeouts.authRedirect }
    );
    await saveButton.click({ force: true });
    const response = await saveResponse;
    expect(response.ok(), `Business hours save returned HTTP ${response.status()}.`).toBeTruthy();
    await expect(this.page.locator(locators.saveSuccessMessage).first()).toBeVisible({
      timeout: timeouts.authRedirect,
    });
    const closeButton = this.page.locator(locators.popupCloseButton).first();
    await expect(closeButton).toBeVisible({ timeout: timeouts.action });
    await closeButton.click();
    await expect(this.page.locator(locators.saveSuccessMessage).first()).toBeHidden({
      timeout: timeouts.action,
    });
  }

  async returnFromAgentScheduleToDashboard() {
    const locators = moreButtonLocators.agentSchedulePage;
    const backButton = this.page.locator(locators.backButton).first();
    await expect(backButton).toBeVisible({ timeout: timeouts.pageLoad });
    await backButton.click({ force: true });
    await expect(this.page).toHaveURL(/\/(fast-agent-details?|dashboard)(?:[/?#]|$)/, {
      timeout: timeouts.authRedirect,
    });
    await expect(this.moreButton()).toBeVisible({ timeout: timeouts.pageLoad });
  }

  async verifyAgentScheduleFlow() {
    await this.openAgentScheduleFromMoreMenu();
    await this.setMondayAgentSchedule();
    await this.applySameAgentScheduleEveryday();
    await this.saveAgentScheduleAndClosePopup();
    await this.returnFromAgentScheduleToDashboard();
  }
}
