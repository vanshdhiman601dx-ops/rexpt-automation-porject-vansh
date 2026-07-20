import { expect } from '@playwright/test';
import { Logger } from './Logger.js';

export async function expectVisible(locator) {
  await expect(locator).toBeVisible();
}

export class ResilientAssertions {
  constructor(reporter) {
    this.reporter = reporter;
  }

  async run({
    name,
    assert,
    impact = [],
    recoveryAction = 'Continue with the next recoverable validation.',
    continueOnFailure = true,
    severity = 'ASSERTION',
  }) {
    Logger.step(name);

    try {
      await assert();
      Logger.pass(name);
      this.reporter.record({
        assertionName: name,
        status: 'PASS',
        impact: ['No downstream impact.'],
        recoveryAction: 'No recovery required.',
        severity,
      });
      return true;
    } catch (error) {
      const failureReason = error?.message || String(error);

      Logger.fail(`${name} - ${failureReason}`);
      Logger.recovery(recoveryAction);

      this.reporter.record({
        assertionName: name,
        status: 'FAIL',
        failureReason,
        exception: error?.stack || failureReason,
        impact,
        recoveryAction,
        severity,
      });

      if (!continueOnFailure) {
        throw error;
      }

      return false;
    }
  }

  async visible(name, locator, options = {}) {
    return this.run({
      name,
      assert: async () => expect(locator).toBeVisible(),
      ...options,
    });
  }

  async hidden(name, locator, options = {}) {
    return this.run({
      name,
      assert: async () => expect(locator).toBeHidden(),
      ...options,
    });
  }

  async text(name, locator, expectedText, options = {}) {
    return this.run({
      name,
      assert: async () => expect(locator).toHaveText(expectedText),
      ...options,
    });
  }

  async url(name, page, expectedUrl, options = {}) {
    return this.run({
      name,
      assert: async () => expect(page).toHaveURL(expectedUrl),
      ...options,
    });
  }

  async truthy(name, valueFactory, options = {}) {
    return this.run({
      name,
      assert: async () => expect(await valueFactory()).toBeTruthy(),
      ...options,
    });
  }
}
