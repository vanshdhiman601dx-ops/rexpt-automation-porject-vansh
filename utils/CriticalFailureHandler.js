import fs from 'node:fs';
import path from 'node:path';
import { Logger } from './Logger.js';

export class CriticalFailureHandler {
  constructor(reporter, artifactDir = 'reports/assertions/artifacts') {
    this.reporter = reporter;
    this.artifactDir = artifactDir;
    fs.mkdirSync(this.artifactDir, { recursive: true });
  }

  async captureArtifacts(page, label) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeLabel = label.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const screenshotPath = path.join(this.artifactDir, `${safeLabel}-${timestamp}.png`);
    const storageStatePath = path.join(this.artifactDir, `${safeLabel}-${timestamp}-storage.json`);

    let currentUrl = 'Unavailable';

    try {
      currentUrl = page.url();
    } catch {
      currentUrl = 'Unavailable';
    }

    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch {
      // Trace/video are still handled by Playwright config; screenshot may fail after a browser crash.
    }

    try {
      await page.context().storageState({ path: storageStatePath });
    } catch {
      // Storage state may be unavailable after browser/context crash.
    }

    return {
      currentUrl,
      screenshotPath,
      storageStatePath,
    };
  }

  async authenticationBypass({ page, reason }) {
    Logger.critical(reason);

    const artifacts = await this.captureArtifacts(page, 'critical-authentication-bypass');

    this.reporter.record({
      assertionName: 'Critical Security Validation - Authentication Bypass',
      status: 'CRITICAL SECURITY FAILURE',
      failureReason: reason,
      exception: 'Authentication bypass detected.',
      impact: [
        'The application authenticated the user using an invalid or expired OTP.',
        'All subsequent authentication validations are invalid.',
        `Current URL: ${artifacts.currentUrl}`,
        `Screenshot: ${artifacts.screenshotPath}`,
        `Storage State: ${artifacts.storageStatePath}`,
        'Video and trace are captured by the Playwright reporter when enabled.',
      ],
      recoveryAction: 'Terminate execution immediately and investigate authentication security.',
      severity: 'CRITICAL',
    });

    throw new Error(reason);
  }

  async applicationCrash({ page, flowName, error }) {
    const reason = `Application crashed while executing ${flowName}.`;
    Logger.critical(reason);

    const artifacts = await this.captureArtifacts(page, `application-crash-${flowName}`);

    this.reporter.record({
      assertionName: `Application Crash - ${flowName}`,
      status: 'FAILED',
      failureReason: reason,
      exception: error?.stack || error?.message || String(error),
      impact: [
        'Application crashed.',
        'No further test scenarios could be executed after this point.',
        `Current URL: ${artifacts.currentUrl}`,
        `Screenshot: ${artifacts.screenshotPath}`,
        `Storage State: ${artifacts.storageStatePath}`,
        'Video and trace are captured by the Playwright reporter when enabled.',
      ],
      recoveryAction: 'Terminate execution because continuing is no longer technically possible.',
      severity: 'CRITICAL',
    });

    throw error;
  }
}
