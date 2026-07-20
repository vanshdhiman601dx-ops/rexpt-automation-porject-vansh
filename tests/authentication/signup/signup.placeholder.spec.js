import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { LoginPage } from '../../../pages/authentication/LoginPage.js';
import { PersonalDetailsPage } from '../../../pages/onboarding/PersonalDetailsPage.js';
import { OTPHelper } from '../../../helpers/OTPHelper.js';
import envConfig from '../../../config/config.js';
import { timeouts } from '../../../config/timeouts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.resolve(__dirname, '../../../playwright/.auth/users.json');

test.describe('Signup', () => {
  test('signs up with email OTP and stores session', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);
    const signupEmail = envConfig.signup.email;
    const detailsUrl = envConfig.signup.detailsUrl;

    await loginPage.goto();
    await loginPage.verifyLoginScreen();
    await loginPage.openEmailLogin();
    await loginPage.enterEmail(signupEmail);
    await loginPage.expectEmailValue(signupEmail);
    await loginPage.sendOtp();
    await loginPage.verifyOtpScreen(signupEmail);

    OTPHelper.showTerminalMessage(
      `Enter the signup OTP for ${signupEmail} in the browser. The automation will continue automatically after all 6 digits are entered.`
    );

    await loginPage.waitForLastOtpInputFilled();
    await loginPage.continueWithOtp();
    await expect(page).toHaveURL(detailsUrl, { timeout: timeouts.authRedirect });
    await personalDetailsPage.verifyLoaded(detailsUrl);
    await loginPage.saveSession(authFile);
  });
});
