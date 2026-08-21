import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import envConfig from '../../../config/config.js';
import { AssertionImpactReporter } from '../../../utils/AssertionImpactReporter.js';
import { ResilientAssertions } from '../../../utils/Assertions.js';
import { MoreButtonLoginPage } from '../pages/more-button-login-page.js';
import { MoreButtonPage } from '../pages/more-button-page.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const moreButtonAuthFile = path.resolve(__dirname, '../../../playwright/.auth/more-button-user.json');
const reportFile = path.resolve(__dirname, '../../../reports/assertions/more-button-standalone-flow-report.txt');
const fixedOtp = '903467';

test.describe('More Button Standalone Flow', () => {
  test('logs in with OTP and verifies Test Agent plus Call Settings', async ({ page }) => {
    const reporter = new AssertionImpactReporter(reportFile);
    reporter.initialize();
    const resilient = new ResilientAssertions(reporter);
    const loginPage = new MoreButtonLoginPage(page);
    const moreButtonPage = new MoreButtonPage(page);
    const email = envConfig.moreButton.email;
    const googleEmail = envConfig.googleAccount.email;
    const googlePassword = envConfig.googleAccount.password;

    await resilient.run({
      name: 'More Button login email is configured',
      assert: async () => expect(email).toBeTruthy(),
      impact: ['More Button standalone login cannot request OTP without EMAIL_FOR_MORE_BUTTON_FLOW.'],
      recoveryAction: 'Set EMAIL_FOR_MORE_BUTTON_FLOW in the automation environment and rerun this spec.',
      continueOnFailure: false,
      severity: 'BLOCKER',
    });

    await resilient.run({
      name: 'More Button standalone login screen opens',
      assert: async () => {
        await loginPage.gotoApplication();
        await loginPage.navigateToLogin();
        await loginPage.openEmailLogin();
      },
      impact: ['More Button flow cannot authenticate.'],
      recoveryAction: 'Review splash/login locators in locators/more-button-locators.js.',
      continueOnFailure: false,
      severity: 'BLOCKER',
    });

    await resilient.run({
      name: 'More Button OTP screen opens after Send One Time Password',
      assert: async () => {
        await loginPage.enterEmail(email);
        await loginPage.sendOtp();
        await loginPage.verifyOtpScreen(email);
        await loginPage.closePopupIfVisible();
      },
      impact: ['Fixed OTP cannot be entered and More Button flow cannot continue.'],
      recoveryAction: 'Check OTP API/app response and the More Button auth locators.',
      continueOnFailure: false,
      severity: 'BLOCKER',
    });

    await resilient.run({
      name: 'More Button fixed OTP authenticates and Fast Agent Details loads',
      assert: async () => {
        await loginPage.enterFixedOtp(fixedOtp);
        await loginPage.continueWithOtp();
        await loginPage.verifyAuthenticatedFastAgentDetails();
        fs.mkdirSync(path.dirname(moreButtonAuthFile), { recursive: true });
        await loginPage.saveSession(moreButtonAuthFile);
        expect(fs.existsSync(moreButtonAuthFile)).toBeTruthy();
      },
      impact: ['More Button menu cannot be reached without authenticated Fast Agent Details.'],
      recoveryAction: 'Verify fixed OTP support and auth token storage for the More Button login user.',
      continueOnFailure: false,
      severity: 'BLOCKER',
    });

    await resilient.run({
      name: 'Fast Agent Details More menu opens with required options',
      assert: async () => {
        await moreButtonPage.verifyFastAgentDetailsLoaded();
        await moreButtonPage.openMoreMenu();
        await moreButtonPage.verifyRequiredMoreOptions();
      },
      impact: ['Test Agent and Call Settings cannot be selected.'],
      recoveryAction: 'Review More menu locators and current Fast Agent Details UI.',
      continueOnFailure: false,
      severity: 'BLOCKER',
    });

    await resilient.run({
      name: 'More Button Test Agent call starts and ends successfully',
      assert: async () => {
        await moreButtonPage.openTestAgentPopup();
        await moreButtonPage.startTestCall();
        await moreButtonPage.waitDuringConnectedCall();
        await moreButtonPage.endTestCall();
        await moreButtonPage.closeTestAgentPopup();
      },
      impact: ['Test Agent call feature is not fully verified.'],
      recoveryAction: 'Capture trace/video and review Test Agent popup selectors or call state changes.',
      continueOnFailure: true,
      severity: 'MAJOR',
    });

    await resilient.run({
      name: 'More Button Call Settings redirects to call-setting page',
      assert: async () => {
        await moreButtonPage.openMoreMenu();
        await moreButtonPage.verifyRequiredMoreOptions();
        await moreButtonPage.openCallSettings();
      },
      impact: ['Call Settings navigation from More Button is not verified.'],
      recoveryAction: 'Review Call Setting menu locator and /call-setting route behavior.',
      continueOnFailure: false,
      severity: 'BLOCKER',
    });

    await resilient.run({
      name: 'Call Settings interactive controls are clickable and working',
      assert: async () => {
        await moreButtonPage.verifyCallSettingsInteractiveControls();
      },
      impact: ['Call Recording declaration, background sound, or agent speech sliders may not be configurable.'],
      recoveryAction: 'Review Call Settings control locators and current /call-setting UI state.',
      continueOnFailure: true,
      severity: 'MAJOR',
    });

    await resilient.run({
      name: 'More Button Connect Calendar Google OAuth flow starts and completes',
      assert: async () => {
        expect(googleEmail, 'Google email must be configured for Connect Calendar OAuth.').toBeTruthy();
        expect(googlePassword, 'Google password must be configured for Connect Calendar OAuth.').toBeTruthy();
        await moreButtonPage.verifyConnectCalendarGoogleFlow({
          email: googleEmail,
          password: googlePassword,
        });
      },
      impact: ['Connect Calendar flow from More Button was not verified.'],
      recoveryAction: 'Review Connect Calendar locators, Google OAuth state, and configured Google credentials.',
      continueOnFailure: true,
      severity: 'MAJOR',
    });

    await resilient.run({
      name: 'More Button Public Agent weekly availability is configurable and saved',
      assert: async () => {
        await moreButtonPage.verifyPublicAgentWeeklyAvailabilityFlow();
      },
      impact: [
        'Public Agent weekly availability, duration controls, or business-hours warning handling may not work.',
      ],
      recoveryAction:
        'Review dashboard return, Public Agent locators, weekly day controls, and the availability save API response.',
      continueOnFailure: false,
      severity: 'BLOCKER',
    });

    await resilient.run({
      name: 'More Button Agent Schedule applies and saves Monday business hours',
      assert: async () => {
        await moreButtonPage.verifyAgentScheduleFlow();
      },
      impact: ['Agent Schedule business hours may not be applied or saved correctly.'],
      recoveryAction:
        'Review Agent Schedule menu navigation, custom time dropdowns, confirmation popup, and business-hours API.',
      continueOnFailure: false,
      severity: 'BLOCKER',
    });
  });
});
