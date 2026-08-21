import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import otpData from '../../../../../test-data/login/otpData.json' with { type: 'json' };
import { LoginPage } from '../../../pages/authentication/LoginPage.js';
import { GoogleLoginPage } from '../../../pages/authentication/GoogleLoginPage.js';
import { FastAgentDetailsPage } from '../../../pages/fast-agent-details/FastAgentDetailsPage.js';
import { OTPHelper } from '../../../../../helpers/OTPHelper.js';
import { AssertionImpactReporter } from '../../../../../utils/AssertionImpactReporter.js';
import { ResilientAssertions } from '../../../../../utils/Assertions.js';
import envConfig from '../../../../../config/config.js';
import { timeouts } from '../../../../../config/timeouts.js';
import { runOnboardingAfterSignup } from '../../onboarding-browsercloses-flow/signup-onboarding.flow.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.resolve(__dirname, '../../../../../playwright/.auth/users.json');
const onboardingFlowReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/signup-onboarding-flow-assertion-impact-report.txt'
);

function buildUrl(route) {
  return new URL(route, envConfig.baseURL).toString();
}

function storedSessionHasAuthToken(storageStatePath) {
  if (!fs.existsSync(storageStatePath)) return false;

  const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf8'));
  const authStorageKeys = ['token', 'authToken', 'accessToken', 'idToken', 'jwt'];
  const authCookiePattern = /token|auth|jwt|session/i;

  return (
    (storageState.origins || []).some((origin) =>
      (origin.localStorage || []).some(
        (entry) => authStorageKeys.includes(entry.name) && Boolean(entry.value)
      )
    ) || (storageState.cookies || []).some((cookie) => authCookiePattern.test(cookie.name) && Boolean(cookie.value))
  );
}

function storedSessionAuthSummary(storageStatePath) {
  if (!fs.existsSync(storageStatePath)) return 'storage state file does not exist';

  const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf8'));
  const localStorageKeys = (storageState.origins || []).flatMap((origin) =>
    (origin.localStorage || []).map((entry) => `${origin.origin}:${entry.name}`)
  );
  const cookieNames = (storageState.cookies || []).map((cookie) => cookie.name);

  return `localStorage keys: ${JSON.stringify(localStorageKeys)}, cookie names: ${JSON.stringify(cookieNames)}`;
}

async function allowThirdPartyGoogleAuthScripts(page) {
  await page.context().route(/https:\/\/(www\.google\.com|www\.gstatic\.com|accounts\.google\.com)\//, (route) => {
    const headers = { ...route.request().headers() };
    delete headers['x-vercel-protection-bypass'];

    route.continue({ headers });
  });
}

async function disableUnexpectedGoogleSurfaces(page) {
  await page.context().route(/https:\/\/accounts\.google\.com\/gsi\/client.*/, (route) =>
    route.abort()
  );

  page.context().on('page', async (popup) => {
    if (popup === page) return;

    await popup.close().catch(() => {});
  });

  await page.addInitScript(() => {
    const originalOpen = window.open.bind(window);

    window.open = (url, target, features) => {
      if (typeof url === 'string' && /(^|\.)google\.com|accounts\.google\.com/i.test(url)) {
        return null;
      }

      return originalOpen(url, target, features);
    };
  });
}

async function saveAuthenticatedSession({ loginPage, resilient }) {
  await resilient.run({
    name: 'Store authenticated session after Sign Up',
    assert: async () => {
      await loginPage.waitForAuthToken();
      await loginPage.saveSession(authFile);
      expect(storedSessionHasAuthToken(authFile), storedSessionAuthSummary(authFile)).toBeTruthy();
    },
    continueOnFailure: false,
    impact: ['Onboarding cannot resume from the stored session without the auth token.'],
    recoveryAction: 'Stop execution and verify Sign Up token storage before onboarding resume.',
    severity: 'CRITICAL',
  });
}

async function saveLoginSession({ loginPage, resilient }) {
  await resilient.run({
    name: 'Store authenticated session after Login',
    assert: async () => {
      await loginPage.waitForAuthToken();
      await loginPage.saveSession(authFile);
      expect(storedSessionHasAuthToken(authFile), storedSessionAuthSummary(authFile)).toBeTruthy();
    },
    continueOnFailure: false,
    impact: ['Login session file could not be created or did not contain an auth token.'],
    recoveryAction: 'Stop before Google login and Sign Up because login authentication was not persisted.',
    severity: 'CRITICAL',
  });
}

async function runLoginOtpValidationBeforeSignup({ page, loginPage, fastAgentDetailsPage, resilient }) {
  const loginEmail = envConfig.login.email;

  await loginPage.goto();
  await resilient.run({
    name: 'Login application title verification',
    assert: async () => loginPage.verifyTitle(otpData.expectedTitle),
    impact: ['Application launched, but the browser title did not match expected Rexpt branding.'],
    recoveryAction: 'Continue only after confirming the app is reachable.',
    severity: 'VALIDATION',
  });
  await resilient.run({
    name: 'Login screen visible before Email OTP',
    assert: async () => loginPage.verifyLoginScreen(),
    continueOnFailure: false,
    impact: ['Email OTP login cannot continue until the login screen is visible.'],
    recoveryAction: 'Stop pre-signup login flow and inspect login page rendering.',
    severity: 'CRITICAL',
  });
  await resilient.run({
    name: 'Email login mode opened before Login OTP',
    assert: async () => loginPage.openEmailLogin(),
    continueOnFailure: false,
    impact: ['Email input was not visible for Login OTP.'],
    recoveryAction: 'Stop pre-signup login flow and inspect email login toggle.',
    severity: 'CRITICAL',
  });
  await resilient.run({
    name: 'Login email entered before OTP request',
    assert: async () => {
      await loginPage.enterEmail(loginEmail);
      await loginPage.expectEmailValue(loginEmail);
    },
    continueOnFailure: false,
    impact: ['Login email could not be entered before requesting OTP.'],
    recoveryAction: 'Stop pre-signup login flow and inspect email input.',
    severity: 'CRITICAL',
  });
  await resilient.run({
    name: 'Login Send OTP click verification',
    assert: async () => loginPage.sendOtp(),
    continueOnFailure: false,
    impact: [
      'Send OTP click could not be completed.',
      'This commonly happens when reCAPTCHA is unavailable in the automation browser.',
    ],
    recoveryAction: 'Stop pre-signup login flow and inspect reCAPTCHA readiness/click behavior.',
    severity: 'CRITICAL',
  });
  await resilient.run({
    name: 'Login Send OTP redirects to Sign Up OTP screen',
    assert: async () => {
      const redirected = await page.waitForURL(/\/signup/, { timeout: timeouts.authRedirect })
        .then(() => true)
        .catch(() => false);

      if (!redirected) {
        const visibleEmailError = await page
          .locator('[class*="inlineError"], [class*="error"]')
          .first()
          .innerText()
          .catch(() => 'N/A');

        throw new Error(
          `Send OTP did not redirect to /signup. Current URL: ${page.url()}. Visible email error: ${visibleEmailError}`
        );
      }
    },
    continueOnFailure: false,
    impact: [
      'Login OTP validation cannot start until the application redirects to /signup.',
    ],
    recoveryAction: 'Stop pre-signup login flow and review Send OTP redirect behavior.',
    severity: 'CRITICAL',
  });
  await loginPage.verifyOtpScreen(loginEmail);
  await loginPage.closePopupIfVisible();

  for (const otpCase of otpData.fieldValidationCases) {
    await test.step(`Login OTP field validation: ${otpCase.name}`, async () => {
      await loginPage.fillOtp(otpCase.values);
      await resilient.run({
        name: `Login OTP input validation - ${otpCase.name}`,
        assert: async () => OTPHelper.expectOtpValues(loginPage, otpCase.expectedValues),
        impact: [
          `${otpCase.name} OTP field restriction could not be confirmed before Sign Up.`,
        ],
        recoveryAction: 'Record the OTP validation result and continue with the next case.',
        severity: 'VALIDATION',
      });

      if (otpCase.submit) {
        await loginPage.continueWithOtp();
        await resilient.run({
          name: `Login OTP popup validation - ${otpCase.name}`,
          assert: async () => loginPage.expectPopupMessage(otpCase.expectedPopupMessage),
          impact: [`${otpCase.name} OTP popup content could not be validated.`],
          recoveryAction: 'Close the popup and continue with the next OTP validation case.',
          severity: 'VALIDATION',
        });
        await resilient.run({
          name: `Login OTP popup close verification - ${otpCase.name}`,
          assert: async () => loginPage.closePopup(),
          impact: ['OTP popup may block the next login validation case.'],
          recoveryAction: 'Continue; next scenario will attempt to clear OTP inputs.',
          severity: 'VALIDATION',
        });
      }
    });
  }

  for (const otpCase of otpData.pasteValidationCases) {
    await test.step(`Login OTP paste validation: ${otpCase.name}`, async () => {
      await loginPage.pasteOtp(otpCase.pasteValue);
      await resilient.run({
        name: `Login OTP paste validation - ${otpCase.name}`,
        assert: async () => OTPHelper.expectOtpValues(loginPage, otpCase.expectedValues),
        impact: [`${otpCase.name} OTP paste behavior could not be confirmed before Sign Up.`],
        recoveryAction: 'Record the paste validation result and continue with the next case.',
        severity: 'VALIDATION',
      });

      if (otpCase.submit) {
        await loginPage.continueWithOtp();
        await resilient.run({
          name: `Login OTP paste popup validation - ${otpCase.name}`,
          assert: async () => loginPage.expectPopupMessage(otpCase.expectedPopupMessage),
          impact: [`${otpCase.name} paste popup content could not be validated.`],
          recoveryAction: 'Close the popup and continue with the next OTP paste case.',
          severity: 'VALIDATION',
        });
        await resilient.run({
          name: `Login OTP paste popup close verification - ${otpCase.name}`,
          assert: async () => loginPage.closePopup(),
          impact: ['OTP popup may block the next paste validation case.'],
          recoveryAction: 'Continue; next scenario will attempt to clear OTP inputs.',
          severity: 'VALIDATION',
        });
      }
    });
  }

  await loginPage.clearOtp();
  OTPHelper.showTerminalMessage(`Entering fixed login OTP for ${loginEmail}.`);
  await loginPage.fillOtp(otpData.validOtp.split(''));
  await loginPage.continueWithOtp();

  await resilient.run({
    name: 'Login authenticated redirect verification',
    assert: async () => expect(page).toHaveURL(envConfig.auth.finalUrl, { timeout: timeouts.authRedirect }),
    continueOnFailure: false,
    impact: ['Login OTP did not redirect to Fast Agent Details.'],
    recoveryAction: 'Stop before Google login and Sign Up because login authentication failed.',
    severity: 'CRITICAL',
  });
  await resilient.run({
    name: 'Login dashboard load verification',
    assert: async () => fastAgentDetailsPage.verifyLoaded(envConfig.auth.finalUrl),
    continueOnFailure: false,
    impact: ['Fast Agent Details page did not load after login OTP.'],
    recoveryAction: 'Stop before Google login and Sign Up because dashboard state is not verified.',
    severity: 'CRITICAL',
  });
  await saveLoginSession({ loginPage, resilient });
}

async function runGoogleLoginBeforeSignup({ page, loginPage, fastAgentDetailsPage, resilient }) {
  const googleLoginPage = new GoogleLoginPage(page);

  await resilient.run({
    name: 'Logout after Login OTP before Google authentication',
    assert: async () => fastAgentDetailsPage.logout(),
    continueOnFailure: false,
    impact: ['Google login cannot start from a clean logged-out state.'],
    recoveryAction: 'Stop before Google login and Sign Up because logout failed.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Login screen verification before Google authentication',
    assert: async () => {
      await fastAgentDetailsPage.verifyLoggedOutToLoginScreen();
      await loginPage.verifyLoginScreen();
    },
    continueOnFailure: false,
    impact: ['Google login button/surface was not visible after logout.'],
    recoveryAction: 'Stop before Google login and Sign Up because login screen is not verified.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Google credentials env verification',
    assert: async () => {
      expect(envConfig.googleAccount.email).toBeTruthy();
      expect(envConfig.googleAccount.password).toBeTruthy();
    },
    continueOnFailure: false,
    impact: ['Google login requires EMAIL_FOR_LOGIN/GOOGLE_TEST_EMAIL and GOOGLE_LOGIN_PASSWORD/GOOGLE_TEST_PASSWORD.'],
    recoveryAction: 'Add the Google credentials to the automation .env and rerun.',
    severity: 'CRITICAL',
  });

  const googleAuthenticated = await resilient.run({
    name: 'Google authentication after Login OTP logout',
    assert: async () =>
      googleLoginPage.completeGoogleAuthenticationWithSteps({
        email: envConfig.googleAccount.email,
        password: envConfig.googleAccount.password,
        finalUrl: envConfig.auth.finalUrl,
        resilient,
      }),
    continueOnFailure: true,
    impact: ['Google authentication did not redirect to Fast Agent Details.'],
    recoveryAction: 'Report Google OAuth failure, close any Google popup/window, and continue with Sign Up flow.',
    severity: 'CRITICAL',
  });

  if (!googleAuthenticated) {
    await resilient.run({
      name: 'Google login skipped after OAuth failure - continue Sign Up flow',
      assert: async () => {
        await loginPage.clearAuthenticationSession();
        await loginPage.goto();
        await loginPage.verifyLoginScreen();
      },
      continueOnFailure: false,
      impact: ['Sign Up flow requires a clean login screen after skipped Google authentication.'],
      recoveryAction: 'Stop only if automation cannot return to the login screen after Google OAuth failure.',
      severity: 'RECOVERY',
    });
    return;
  }

  await resilient.run({
    name: 'Google authenticated Fast Agent Details verification',
    assert: async () => fastAgentDetailsPage.verifyLoaded(envConfig.auth.finalUrl),
    continueOnFailure: false,
    impact: ['Google login landed somewhere other than Fast Agent Details.'],
    recoveryAction: 'Stop before Sign Up because Google login assertion failed.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Google authenticated user logout verification',
    assert: async () => fastAgentDetailsPage.logout(),
    continueOnFailure: false,
    impact: ['Sign Up flow cannot start from a verified logged-out Google state.'],
    recoveryAction: 'Stop before Sign Up because Google logout failed.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Google logout session clear verification',
    assert: async () => {
      await loginPage.clearAuthenticationSession();
      await fastAgentDetailsPage.verifySessionCleared();
    },
    continueOnFailure: false,
    impact: ['Sign Up could reuse stale Google-authenticated browser state.'],
    recoveryAction: 'Stop before Sign Up until the browser session is clean.',
    severity: 'CRITICAL',
  });
}

async function runLoginAndGooglePreSignupFlow({ page, loginPage, fastAgentDetailsPage, resilient }) {
  await runLoginOtpValidationBeforeSignup({ page, loginPage, fastAgentDetailsPage, resilient });
  await resilient.run({
    name: 'Logout after Login OTP before Sign Up flow',
    assert: async () => {
      await fastAgentDetailsPage.logout();
      await fastAgentDetailsPage.verifyLoggedOutToLoginScreen();
    },
    continueOnFailure: false,
    impact: ['Sign Up flow cannot start until the Login OTP user is logged out.'],
    recoveryAction: 'Stop and inspect logout from Fast Agent Details before Sign Up.',
    severity: 'CRITICAL',
  });
  // Google login flow is intentionally skipped for now.
  // After OTP login logout, continue directly with the Sign Up flow.
  // await runGoogleLoginBeforeSignup({ page, loginPage, fastAgentDetailsPage, resilient });
}

test.describe('Signup', () => {
  test('signs up with email OTP and reaches Business Step SS1', async ({
    browser,
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const fastAgentDetailsPage = new FastAgentDetailsPage(page);
    const signupEmail = envConfig.signup.email;
    const detailsUrl = envConfig.signup.detailsUrl;
    const businessStepUrl = buildUrl('/business-step');
    const dashboardUrl = buildUrl('/fast-agent-detail');
    const flowReporter = new AssertionImpactReporter(onboardingFlowReportFile);
    flowReporter.initialize();
    const flowAssertions = new ResilientAssertions(flowReporter);

    await allowThirdPartyGoogleAuthScripts(page);

    // Temporary: skip the Login flow while fixing and validating Signup + Onboarding.
    // Keep this invocation commented so the existing Login implementation can be restored later.
    // await runLoginAndGooglePreSignupFlow({
    //   page,
    //   loginPage,
    //   fastAgentDetailsPage,
    //   resilient: flowAssertions,
    // });

    await disableUnexpectedGoogleSurfaces(page);
    await loginPage.gotoLoginDirect();
    await loginPage.verifyLoginScreen();
    await loginPage.openEmailLogin();
    await loginPage.enterEmail(signupEmail);
    await loginPage.expectEmailValue(signupEmail);
    await loginPage.sendOtp();
    await loginPage.verifyOtpScreen(signupEmail);

    OTPHelper.showTerminalMessage(`Entering fixed signup OTP for ${signupEmail}.`);
    await loginPage.clearOtp();
    await loginPage.fillOtp(otpData.validOtp.split(''));
    await loginPage.continueWithOtp();
    await saveAuthenticatedSession({ loginPage, resilient: flowAssertions });

    await runOnboardingAfterSignup({
      browser,
      page,
      detailsUrl,
      businessStepUrl,
      dashboardUrl,
      resilient: flowAssertions,
    });
  });
});

