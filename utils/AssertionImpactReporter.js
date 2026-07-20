import fs from 'node:fs';
import path from 'node:path';

export class AssertionImpactReporter {
  constructor(reportPath = 'reports/assertions/assertion-impact-report.txt') {
    this.reportPath = reportPath;
    this.records = [];
  }

  initialize() {
    fs.mkdirSync(path.dirname(this.reportPath), { recursive: true });
    fs.writeFileSync(
      this.reportPath,
      [
        'ASSERTION IMPACT REPORT',
        '=======================',
        `Execution Started: ${new Date().toISOString()}`,
        '',
      ].join('\n'),
      'utf8'
    );
  }

  record({
    assertionName,
    status,
    failureReason = 'N/A',
    exception = 'N/A',
    impact = [],
    recoveryAction = 'N/A',
    severity = 'INFO',
  }) {
    const record = {
      assertionName,
      status,
      failureReason,
      exception,
      impact: Array.isArray(impact) ? impact : [impact],
      recoveryAction,
      severity,
      timestamp: new Date().toISOString(),
    };

    this.records.push(record);
    this.append(record);
  }

  append(record) {
    const impactLines = record.impact.length
      ? record.impact.map((item) => `- ${item}`).join('\n')
      : '- No downstream impact.';

    const content = [
      `${record.status}`,
      '------',
      `Assertion Name: ${record.assertionName}`,
      `Severity: ${record.severity}`,
      `Timestamp: ${record.timestamp}`,
      `Failure Reason: ${record.failureReason}`,
      `Exception: ${record.exception}`,
      '',
      'IMPACT',
      '------',
      impactLines,
      '',
      'RECOVERY ACTION',
      '---------------',
      record.recoveryAction,
      '',
      '----------------------------------------',
      '',
    ].join('\n');

    fs.appendFileSync(this.reportPath, content, 'utf8');
  }

  hasFailures() {
    return this.records.some((record) => record.status !== 'PASS');
  }
}
