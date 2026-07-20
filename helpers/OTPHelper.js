import { expect } from '@playwright/test';

export class OTPHelper {
  static getOtp(data) {
    return data.validOtp;
  }

  static async expectOtpValues(loginPage, expectedValues) {
    await expect.poll(async () => loginPage.getOtpValues()).toEqual(expectedValues);
  }

  static showTerminalMessage(message) {
    process.stdout.write(`${message}\n`);
  }
}
