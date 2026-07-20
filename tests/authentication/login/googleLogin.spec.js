import { test, expect } from '@playwright/test';
// import { GoogleLoginPage } from '../../../pages/authentication/GoogleLoginPage.js';
import { AssertionImpactReporter } from '../../../utils/AssertionImpactReporter.js';
import { ResilientAssertions } from '../../../utils/Assertions.js';
import envConfig from '../../../config/config.js';

function slugify(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function createAssertionContext(testInfo) {
  const reporter = new AssertionImpactReporter(
    `reports/assertions/google-oauth-${slugify(testInfo.title)}.txt`
  );
  reporter.initialize();

  return {
    reporter,
    resilient: new ResilientAssertions(reporter),
  };
}

// Google sign-in is temporarily commented out. Keep this helper for future reuse.
// function getGoogleAccount() {
//   const { email, password } = envConfig.googleAccount;
//
//   if (!email || !password) {
//     throw new Error('GOOGLE_TEST_EMAIL and GOOGLE_TEST_PASSWORD must be configured in .env.');
//   }
//
//   return { email, password };
// }

// Temporarily skipped: Google sign-in coverage is kept for future reuse.
test.describe.skip('Google login', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    const googleLoginPage = new GoogleLoginPage(page);
    await googleLoginPage.gotoLogin();
  });

  test('returns to login after closing the Google OAuth window and can relaunch', async ({
    page,
  }, testInfo) => {
    const { resilient } = createAssertionContext(testInfo);
    const googleLoginPage = new GoogleLoginPage(page);
    let oauthPage;

    const launched = await resilient.run({
      name: 'Google OAuth launch verification',
      assert: async () => {
        oauthPage = await googleLoginPage.launchFreshOAuthFlow();
        await expect(oauthPage).toHaveURL(/accounts\.google\.com|oauth|google/i, {
          timeout: 30000,
        });
      },
      impact: [
        'Google OAuth close-window interruption could not be validated.',
        'Fresh OAuth relaunch verification was skipped.',
      ],
      recoveryAction: 'Return to the Rexpt login page and continue with the next scenario.',
    });

    if (!launched) {
      await googleLoginPage.gotoLogin();
      return;
    }

    await resilient.run({
      name: 'Google OAuth popup close recovery',
      assert: async () => {
        await googleLoginPage.closeOAuthWindow(oauthPage);
        await googleLoginPage.gotoLogin();
      },
      impact: ['The next Google OAuth scenario may inherit an interrupted popup state.'],
      recoveryAction: 'Force navigation back to the Rexpt login page.',
    });

    await resilient.run({
      name: 'Fresh Google OAuth relaunch after popup close',
      assert: async () => {
        oauthPage = await googleLoginPage.launchFreshOAuthFlow();
        await expect(oauthPage).toHaveURL(/accounts\.google\.com|oauth|google/i, {
          timeout: 30000,
        });
        await googleLoginPage.returnToLoginPage(oauthPage);
      },
      impact: ['Google OAuth flow independence after popup close could not be confirmed.'],
      recoveryAction: 'Return to the Rexpt login page before executing the next test.',
    });
  });

  test('returns to login after browser back interruption and can relaunch', async ({
    page,
  }, testInfo) => {
    const { resilient } = createAssertionContext(testInfo);
    const googleLoginPage = new GoogleLoginPage(page);
    let oauthPage;

    const launched = await resilient.run({
      name: 'Google OAuth launch before browser back',
      assert: async () => {
        oauthPage = await googleLoginPage.launchFreshOAuthFlow();
        await expect(oauthPage).toHaveURL(/accounts\.google\.com|oauth|google/i, {
          timeout: 30000,
        });
      },
      impact: [
        'Browser Back interruption could not be validated.',
        'Fresh OAuth relaunch after Back was skipped.',
      ],
      recoveryAction: 'Return to the Rexpt login page and continue with the next scenario.',
    });

    if (!launched) {
      await googleLoginPage.gotoLogin();
      return;
    }

    await resilient.run({
      name: 'Google OAuth browser back recovery',
      assert: async () => {
        await googleLoginPage.pressBrowserBackFromOAuth(oauthPage);
        await googleLoginPage.returnToLoginPage(oauthPage);
      },
      impact: ['The OAuth flow may remain in an interrupted browser history state.'],
      recoveryAction: 'Close the OAuth surface and force navigation to the Rexpt login page.',
    });

    await resilient.run({
      name: 'Fresh Google OAuth relaunch after browser back',
      assert: async () => {
        oauthPage = await googleLoginPage.launchFreshOAuthFlow();
        await expect(oauthPage).toHaveURL(/accounts\.google\.com|oauth|google/i, {
          timeout: 30000,
        });
        await googleLoginPage.returnToLoginPage(oauthPage);
      },
      impact: ['Google OAuth flow independence after browser Back could not be confirmed.'],
      recoveryAction: 'Return to the Rexpt login page before executing the next test.',
    });
  });

  test('returns to login after cancelling before consent and can relaunch', async ({
    page,
  }, testInfo) => {
    const { email, password } = getGoogleAccount();
    const { resilient } = createAssertionContext(testInfo);
    const googleLoginPage = new GoogleLoginPage(page);
    let oauthPage;

    const launched = await resilient.run({
      name: 'Google OAuth launch before consent cancellation',
      assert: async () => {
        oauthPage = await googleLoginPage.launchFreshOAuthFlow();
        await googleLoginPage.selectOrEnterEmail(oauthPage, email);
        await googleLoginPage.enterPasswordIfPrompted(oauthPage, password);
      },
      impact: [
        'Consent cancellation could not be reached.',
        'Fresh OAuth relaunch after consent cancellation was skipped.',
      ],
      recoveryAction: 'Return to the Rexpt login page and continue with the next scenario.',
    });

    if (!launched) {
      await googleLoginPage.gotoLogin();
      return;
    }

    await resilient.run({
      name: 'Google OAuth consent cancellation recovery',
      assert: async () => {
        await googleLoginPage.cancelOAuthIfAvailable(oauthPage);
        await googleLoginPage.returnToLoginPage(oauthPage);
      },
      impact: ['The OAuth flow may remain authenticated or partially consented.'],
      recoveryAction: 'Close the OAuth surface and force navigation to the Rexpt login page.',
    });

    await resilient.run({
      name: 'Fresh Google OAuth relaunch after consent cancellation',
      assert: async () => {
        oauthPage = await googleLoginPage.launchFreshOAuthFlow();
        await expect(oauthPage).toHaveURL(/accounts\.google\.com|oauth|google/i, {
          timeout: 30000,
        });
        await googleLoginPage.returnToLoginPage(oauthPage);
      },
      impact: ['Google OAuth flow independence after consent cancellation could not be confirmed.'],
      recoveryAction: 'Return to the Rexpt login page before executing the next test.',
    });
  });

  test('completes successful Google authentication', async ({ page }, testInfo) => {
    const googleAccount = getGoogleAccount();
    const { resilient } = createAssertionContext(testInfo);
    const googleLoginPage = new GoogleLoginPage(page);

    await resilient.run({
      name: 'Successful Google OAuth authentication',
      assert: async () =>
        googleLoginPage.completeGoogleAuthentication({
          ...googleAccount,
          finalUrl: envConfig.auth.finalUrl,
        }),
      impact: [
        'Google authenticated dashboard validation could not be completed.',
        'The stored Google test account may be invalid, blocked, or require manual verification.',
      ],
      recoveryAction: 'Review Google account configuration and rerun this scenario independently.',
      continueOnFailure: false,
    });
  });
});
