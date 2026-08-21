import { test, expect } from '@playwright/test';
import otpData from '../../../../../test-data/login/otpData.json' with { type: 'json' };

test.describe('OTP authentication', () => {
  test.skip('accepts a valid OTP', async () => {
    expect(otpData.validOtp).toHaveLength(6);
  });
});
