import { test, expect } from '@playwright/test';
import { BusinessPhoneLookupPage } from '../../pages/onboarding-browsercloses-flow/BusinessPhoneLookupPage.js';
import { FastAgentDetailsPage } from '../../pages/fast-agent-details/FastAgentDetailsPage.js';
import { fastAgentDetailsLocators } from '../../../../locators/fast-agent-details.locators.js';
import { timeouts } from '../../../../config/timeouts.js';
import { positiveOnboardingData } from '../../../../test-data/onboarding/positiveOnboardingData.js';

const isChromeNewTab = (url) => /^chrome:\/\/(newtab|new-tab-page)\/?$/i.test(url);

const normalizeWords = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const hasTolerantBusinessMatch = (actual, profile) => {
  const actualName = normalizeWords(actual.businessName);
  const expectedName = normalizeWords(profile.updateBusinessDetails.businessName);
  const actualAddress = new Set(normalizeWords(actual.businessAddress));
  const expectedAddress = normalizeWords(profile.updateBusinessDetails.businessAddress);
  const matchingAddressTokens = expectedAddress.filter((word) => actualAddress.has(word));

  const nameMatches = expectedName.every((word) => actualName.includes(word));
  const addressMatchRatio = matchingAddressTokens.length / Math.max(expectedAddress.length, 1);
  const zipMatches = actualAddress.has(String(profile.zipCode));

  return nameMatches && (zipMatches || addressMatchRatio >= 0.6);
};

export async function runOnboardingAfterSignup({
  browser,
  page,
  detailsUrl,
  businessStepUrl,
  dashboardUrl,
  resilient,
}) {
  const businessPhoneLookupPage = new BusinessPhoneLookupPage(page);
  const fastAgentDetailsPage = new FastAgentDetailsPage(page);
  const draftCard = page.locator(fastAgentDetailsLocators.draftAgent.card).first();

  const isDraftCardVisible = () => draftCard.isVisible().catch(() => false);
  const waitForBusinessPhoneScreen = () =>
    expect
      .poll(() => businessPhoneLookupPage.isBusinessPhoneScreenVisible(), {
        timeout: timeouts.authRedirect,
      })
      .toBeTruthy();

  const continueFromUnexpectedDraft = async () => {
    await fastAgentDetailsPage.continueDraftSetup();
    await expect(page).toHaveURL(businessStepUrl, { timeout: timeouts.authRedirect });
    await waitForBusinessPhoneScreen();
  };

  await test.step('verfiy business phone number screen and check for draft card', async () => {
    await expect
      .poll(
        async () =>
          (await isDraftCardVisible()) ||
          (await businessPhoneLookupPage.isBusinessPhoneScreenVisible()),
        { timeout: timeouts.authRedirect }
      )
      .toBeTruthy();

    if (await isDraftCardVisible()) {
      await resilient.run({
        name: 'BUG - Draft Agent card appeared immediately after Signup',
        assert: async () => expect(false).toBeTruthy(),
        continueOnFailure: true,
        impact: [
          'A newly signed-up user was sent to the Draft Agent resume entry point instead of Business Phone Number.',
          `Actual URL: ${page.url()}`,
        ],
        recoveryAction: 'Click Continue Setup and return to the Business Phone Number screen.',
        severity: 'BUG',
      });
      await continueFromUnexpectedDraft();
    } else {
      await resilient.run({
        name: 'Business Phone Number screen appears immediately after Signup',
        assert: async () => {
          await expect(page).toHaveURL(businessStepUrl);
          expect(await businessPhoneLookupPage.isBusinessPhoneScreenVisible()).toBeTruthy();
        },
        continueOnFailure: false,
        impact: ['Post-Signup onboarding did not start on the Business Phone Number screen.'],
        recoveryAction: 'Stop and inspect the Signup onboarding redirect.',
        severity: 'CRITICAL',
      });
    }

    await page.goBack({ waitUntil: 'domcontentloaded', timeout: timeouts.action }).catch(() => null);
    await page.waitForTimeout(timeouts.quickAction);

    if (await isDraftCardVisible()) {
      await resilient.run({
        name: 'BUG - Browser Back opened Draft Agent card from Business Phone Number screen',
        assert: async () => expect(false).toBeTruthy(),
        continueOnFailure: true,
        impact: [
          'Browser Back exposed the Draft Agent resume entry point during initial onboarding.',
          `Actual URL: ${page.url()}`,
        ],
        recoveryAction: 'Click Continue Setup and restore the Business Phone Number screen.',
        severity: 'BUG',
      });
      await continueFromUnexpectedDraft();
    } else if (await businessPhoneLookupPage.isExitAppPopupVisible()) {
      await resilient.run({
        name: 'BUG - Browser Back opened Exit App popup from Business Phone Number screen',
        assert: async () => expect(false).toBeTruthy(),
        continueOnFailure: true,
        impact: [
          'Browser Back displayed an Exit App confirmation during initial onboarding.',
          `Actual URL: ${page.url()}`,
        ],
        recoveryAction: 'Click Keep Setting Up and restore the Business Phone Number screen.',
        severity: 'BUG',
      });
      await businessPhoneLookupPage.keepSettingUp();
      await waitForBusinessPhoneScreen();
    } else {
      const remainedOnBusinessPhone =
        page.url().includes('/business-step') &&
        (await businessPhoneLookupPage.isBusinessPhoneScreenVisible());
      const openedChromeNewTab = isChromeNewTab(page.url());

      await resilient.run({
        name: 'Browser Back does not expose Draft Agent card',
        assert: async () => expect(remainedOnBusinessPhone || openedChromeNewTab).toBeTruthy(),
        continueOnFailure: true,
        impact: [
          'Browser Back navigated to an unexpected page.',
          `Actual URL: ${page.url()}`,
        ],
        recoveryAction: 'Use browser Forward and verify the Business Phone Number screen is restored.',
        severity: 'BUG',
      });

      await page.goForward({ waitUntil: 'domcontentloaded', timeout: timeouts.action }).catch(() => null);
    }

    await resilient.run({
      name: 'Browser navigation restores Business Phone Number screen',
      assert: async () => {
        await expect(page).toHaveURL(businessStepUrl, { timeout: timeouts.authRedirect });
        await waitForBusinessPhoneScreen();
      },
      continueOnFailure: false,
      impact: ['The Business Phone Number screen was not restored after Back/Forward or Draft recovery.'],
      recoveryAction: 'Stop this onboarding navigation test and inspect browser history behavior.',
      severity: 'CRITICAL',
    });
  });

  await test.step("Let's train your receptionist screen test", async () => {
    for (const profile of positiveOnboardingData.businessProfiles) {
      const expected = profile.updateBusinessDetails;

      await resilient.run({
        name: `Google Business Phone lookup - ${expected.businessName}`,
        assert: async () => {
          const actual = await businessPhoneLookupPage.lookupBusinessPhone(expected.phoneNumber);

          expect(
            actual.found,
            `Google API did not display a business UI box for ${expected.phoneNumber}. Error: ${actual.error || 'N/A'}`
          ).toBeTruthy();
          expect(
            hasTolerantBusinessMatch(actual, profile),
            [
              `Google API business details did not match ${expected.phoneNumber}.`,
              `Expected name: ${expected.businessName}`,
              `Actual name: ${actual.businessName}`,
              `Expected address: ${expected.businessAddress}`,
              `Actual address: ${actual.businessAddress}`,
            ].join(' ')
          ).toBeTruthy();
        },
        continueOnFailure: true,
        impact: [
          `Google Business Profile lookup did not return the expected details for ${expected.phoneNumber}.`,
        ],
        recoveryAction: 'Clear the phone field and continue with the next positive business number.',
        severity: 'BUG',
      });
    }
  });

  // The previous Personal Details through Fast Step execution remains available
  // in the existing flow modules. It is temporarily disconnected while the new
  // SS1/SS2 onboarding implementation is introduced phase by phase.
}
