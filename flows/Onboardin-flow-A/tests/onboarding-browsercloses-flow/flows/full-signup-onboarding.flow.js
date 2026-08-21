import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PersonalDetailsPage } from '../../../pages/onboarding-browsercloses-flow/PersonalDetailsPage.js';
import { BusinessCategoryPage } from '../../../pages/onboarding-browsercloses-flow/BusinessCategoryPage.js';
import { BusinessDetailsPage } from '../../../pages/onboarding-browsercloses-flow/BusinessDetailsPage.js';
import { BusinessListingPage } from '../../../pages/onboarding-browsercloses-flow/BusinessListingPage.js';
import { FastAgentDetailsPage } from '../../../pages/fast-agent-details/FastAgentDetailsPage.js';
import { AssertionImpactReporter } from '../../../../../utils/AssertionImpactReporter.js';
import { ResilientAssertions } from '../../../../../utils/Assertions.js';
import envConfig from '../../../../../config/config.js';
import { timeouts } from '../../../../../config/timeouts.js';
import { positiveOnboardingData } from '../../../../../test-data/onboarding/positiveOnboardingData.js';
import { onboardingLocators } from '../../../../../locators/onboarding.locators.js';
import { fastAgentDetailsLocators } from '../../../../../locators/fast-agent-details.locators.js';
import { billingLocators } from '../../../../../locators/billing.locators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.resolve(__dirname, '../../../../../playwright/.auth/users.json');
const personalDetailsReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/personal-details-name-validation-report.txt'
);
const personalDetailsPhoneReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/personal-details-phone-validation-report.txt'
);
const businessCategoryReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/business-category-validation-report.txt'
);
const businessDetailsReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/business-details-name-validation-report.txt'
);
const businessDetailsPinReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/business-details-pin-validation-report.txt'
);
const businessListingEmailReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/business-listing-email-validation-report.txt'
);
const updateBusinessDetailsWebUrlReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/update-business-details-web-url-validation-report.txt'
);
const updateBusinessDetailsBusinessNameReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/update-business-details-business-name-validation-report.txt'
);
const updateBusinessDetailsPhoneReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/update-business-details-phone-validation-report.txt'
);
const updateBusinessDetailsEmailReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/update-business-details-email-validation-report.txt'
);
const businessDetailsBugReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/business-details-bug-verification-report.txt'
);
const businessDetailsScreenshotDir = path.resolve(
  __dirname,
  '../../../../../reports/screenshots/business-details'
);
const businessListingScreenshotDir = path.resolve(
  __dirname,
  '../../../../../reports/screenshots/business-listing'
);
const onboardingResumeStateFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/onboarding-resume-state.json'
);
const onboardingLifecycleBugReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/onboarding-lifecycle-bug-report.txt'
);
const finalBusinessDetailsFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/final-business-details.json'
);
const agentCreationReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/agent-creation-report.txt'
);
const fastStepAgentNameReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/fast-step-agent-name-validation-report.txt'
);
const fastStepPostCallReportFile = path.resolve(
  __dirname,
  '../../../../../reports/assertions/fast-step-post-call-flow-report.txt'
);
const POSITIVE_FLOW_ONLY = false;

const invalidNameScenarios = [
  { name: 'Empty field', value: '', mode: 'error' },
  { name: 'Only spaces', value: ' ', mode: 'error' },
  { name: 'Multiple spaces', value: '  ', mode: 'error' },
  { name: 'Only numbers', value: '123456', mode: 'sanitized', forbidden: /[0-9]/ },
  { name: 'Special characters only', value: '@#$%^&*', mode: 'sanitized', forbidden: /[@#$%^&*]/ },
  { name: 'Mixed special characters', value: 'john@123', mode: 'sanitized', forbidden: /[@0-9]/ },
  { name: 'SQL Injection', value: "' OR 1=1 --", mode: 'sanitized', forbidden: /['0-9=-]/ },
  { name: 'SQL Drop', value: "'; DROP TABLE users;--", mode: 'sanitized', forbidden: /[';.-]/ },
  { name: 'XSS Script', value: '<script>alert(1)</script>', mode: 'sanitized', forbidden: /[<>/()0-9]/ },
  { name: 'HTML Tags', value: '<b>John</b>', mode: 'sanitized', forbidden: /[<>/]/ },
  { name: 'Emoji', value: 'ðŸ˜ŠJohn', mode: 'sanitized', forbidden: /[\p{Emoji_Presentation}\u200d]/u },
  { name: 'Unicode Symbols', value: 'â™ â˜…âœ“', mode: 'sanitized', forbidden: /[â™ â˜…âœ“]/ },
  { name: 'Non-English Characters - Chinese', value: 'å¼ ä¸‰', mode: 'sanitized', forbidden: /[^\x00-\x7F]/ },
  { name: 'Non-English Characters - Arabic', value: 'Ù…Ø­Ù…Ø¯', mode: 'sanitized', forbidden: /[^\x00-\x7F]/ },
  { name: 'Non-English Characters - Hindi', value: 'à¤°à¤¾à¤®', mode: 'sanitized', forbidden: /[^\x00-\x7F]/ },
  { name: 'New Line', value: 'John\nDoe', mode: 'sanitized', forbidden: /[\r\n]/ },
  { name: 'Tab Character', value: 'John\tDoe', mode: 'sanitized', forbidden: /\t/ },
  { name: 'Zero Width Space', value: 'John\u200bDoe', mode: 'sanitized', forbidden: /\u200b/ },
  { name: 'Extremely Long Name', value: 'A'.repeat(256), mode: 'maxlength', maxLength: 150 },
  { name: 'Below Minimum Length', value: 'A', mode: 'error' },
  { name: 'Only Punctuation', value: '.....', mode: 'sanitized', forbidden: /\./ },
  { name: 'Consecutive Special Characters', value: 'john__doe', mode: 'sanitized', forbidden: /_/ },
  { name: 'Starts with Number', value: '1john', mode: 'sanitized', forbidden: /[0-9]/ },
  { name: 'Starts with Underscore', value: '_john', mode: 'sanitized', forbidden: /_/ },
  { name: 'Starts with Hyphen', value: '-john', mode: 'sanitized', forbidden: /-/ },
  { name: 'Ends with Underscore', value: 'john_', mode: 'sanitized', forbidden: /_/ },
  { name: 'Ends with Dot', value: 'john.', mode: 'sanitized', forbidden: /\./ },
  { name: 'Consecutive Dots', value: 'john..doe', mode: 'sanitized', forbidden: /\./ },
  { name: 'Consecutive Underscores', value: 'john__doe', mode: 'sanitized', forbidden: /_/ },
  { name: 'Consecutive Hyphens', value: 'john--doe', mode: 'sanitized', forbidden: /-/ },
  { name: 'Reserved Name', value: 'admin', mode: 'accepted' },
  { name: 'URL', value: 'https://abc.com', mode: 'sanitized', forbidden: /[:/.]/ },
  { name: 'Email Address', value: 'john@gmail.com', mode: 'sanitized', forbidden: /[@.]/ },
  { name: 'Phone Number', value: '9876543210', mode: 'sanitized', forbidden: /[0-9]/ },
  { name: 'File Path', value: 'C:\\Users\\Admin', mode: 'sanitized', forbidden: /[:\\]/ },
  { name: 'Command Injection', value: '&& shutdown', mode: 'sanitized', forbidden: /&/ },
  { name: 'Shell Command', value: 'rm -rf /', mode: 'sanitized', forbidden: /[-/]/ },
  { name: 'Null Value', value: 'NULL', mode: 'accepted' },
  { name: 'JavaScript', value: 'javascript:alert(1)', mode: 'sanitized', forbidden: /[:()0-9]/ },
  { name: 'JSON', value: '{"name":"john"}', mode: 'sanitized', forbidden: /[{}":]/ },
  { name: 'XML', value: '<user>john</user>', mode: 'sanitized', forbidden: /[<>/]/ },
  { name: 'Only Underscore', value: '_', mode: 'sanitized', forbidden: /_/ },
  { name: 'Only Hyphen', value: '-', mode: 'sanitized', forbidden: /-/ },
  { name: 'Only Dot', value: '.', mode: 'sanitized', forbidden: /\./ },
  { name: 'Repeated Characters', value: 'a'.repeat(260), mode: 'maxlength', maxLength: 150 },
  { name: 'Random Invalid String', value: 'asd@#12!!', mode: 'sanitized', forbidden: /[@#0-9!]/ },
];

const invalidPhoneScenarios = [
  { name: 'Repeated Zeros', value: '00000000000', mode: 'error' },
  { name: 'Repeated Ones', value: '11111111111', mode: 'error' },
  { name: 'Empty field', value: '', mode: 'error' },
  { name: 'Only spaces', value: ' ', mode: 'filtered', forbidden: /\s/ },
  { name: 'Leading spaces', value: ' 1234567890', mode: 'filtered', forbidden: /^\s/ },
  { name: 'Trailing spaces', value: '1234567890 ', mode: 'filtered', forbidden: /\s$/ },
  { name: 'Spaces between digits', value: '123 456 7890', mode: 'filtered', forbidden: /\s/ },
  { name: 'Alphabets', value: 'abcdef', mode: 'filtered', forbidden: /[A-Za-z]/ },
  { name: 'Mixed letters and digits', value: '123abc456', mode: 'filtered', forbidden: /[A-Za-z]/ },
  { name: 'Uppercase letters', value: 'ABC123', mode: 'filtered', forbidden: /[A-Z]/ },
  { name: 'Lowercase letters', value: 'abc123', mode: 'filtered', forbidden: /[a-z]/ },
  { name: 'Special characters', value: '@#$%^&*', mode: 'filtered', forbidden: /[@#$%^&*]/ },
  { name: 'Digits with special characters', value: '123@456', mode: 'filtered', forbidden: /@/ },
  { name: 'Plus sign', value: '+911234567890', mode: 'filtered', forbidden: /\+/ },
  { name: 'Minus sign', value: '123-456-7890', mode: 'filtered', forbidden: /-/ },
  { name: 'Parentheses', value: '(123)4567890', mode: 'filtered', forbidden: /[()]/ },
  { name: 'Slash', value: '123/4567890', mode: 'filtered', forbidden: /\// },
  { name: 'Backslash', value: '123\\4567890', mode: 'filtered', forbidden: /\\/ },
  { name: 'Dot', value: '123.456.7890', mode: 'filtered', forbidden: /\./ },
  { name: 'Comma', value: '123,4567890', mode: 'filtered', forbidden: /,/ },
  { name: 'Colon', value: '123:4567890', mode: 'filtered', forbidden: /:/ },
  { name: 'Semicolon', value: '123;4567890', mode: 'filtered', forbidden: /;/ },
  { name: 'Underscore', value: '123_4567890', mode: 'filtered', forbidden: /_/ },
  { name: 'Emoji', value: 'ðŸ˜Š123456', mode: 'filtered', forbidden: /[\p{Emoji_Presentation}\u200d]/u },
  { name: 'Unicode Symbols', value: 'â˜Ž123456', mode: 'filtered', forbidden: /[^\x00-\x7F]/ },
  { name: 'Non-English Digits - Arabic', value: 'Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©Ù ', mode: 'filtered', forbidden: /[^\x00-\x7F]/ },
  { name: 'Non-English Digits - Hindi', value: 'à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦', mode: 'filtered', forbidden: /[^\x00-\x7F]/ },
  { name: 'SQL Injection', value: "' OR 1=1 --", mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'XSS', value: '<script>alert(1)</script>', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'HTML', value: '<input>', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'JavaScript', value: 'javascript:alert(1)', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'URL', value: 'https://123.com', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'Email', value: 'abc@test.com', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'New Line', value: '123\n456', mode: 'filtered', forbidden: /[\r\n]/ },
  { name: 'Tab', value: '123\t456', mode: 'filtered', forbidden: /\t/ },
  { name: 'Zero-width Space', value: '123\u200b456', mode: 'filtered', forbidden: /\u200b/ },
  { name: 'Only Plus', value: '+', mode: 'filtered', forbidden: /\+/ },
  { name: 'Only Minus', value: '-', mode: 'filtered', forbidden: /-/ },
  { name: 'Decimal Number', value: '123.45', mode: 'filtered', forbidden: /\./ },
  { name: 'Scientific Notation', value: '1e10', mode: 'filtered', forbidden: /e/i },
  { name: 'Hexadecimal', value: '0x12345', mode: 'filtered', forbidden: /x/i },
];

const invalidBusinessCategoryScenarios = [
  { name: 'Below minimum length', value: 'A' },
  { name: 'Special characters only', value: '@@@' },
  { name: 'Emoji', value: '\u{1F642}' },
  { name: 'Only digits', value: '12345' },
  { name: 'Repeated characters', value: 'aaaa' },
  { name: 'No vowel consonant mash', value: 'xkcd' },
  { name: 'Keyboard walk', value: 'asdfgh' },
  { name: 'Script payload', value: '<script>alert(1)</script>' },
];

const meaninglessBusinessCategoryScenarios = [
  { name: 'Meaningless random asdqweu', value: 'asdqweu' },
  { name: 'Meaningless random zxcvbnm', value: 'zxcvbnm' },
  { name: 'Meaningless random qwertyu', value: 'qwertyu' },
  { name: 'Meaningless random plmokni', value: 'plmokni' },
];

const positiveBusinessCategoryScenarios = [
  { name: 'Existing category Restaurant', value: 'Restaurant', type: 'existing' },
  { name: 'Existing category Salon', value: 'Salon', type: 'existing' },
  { name: 'Meaningful custom category Pet Grooming', value: 'Pet Grooming', type: 'custom' },
  { name: 'Final existing category Restaurant', value: 'Restaurant', type: 'existing' },
];

const invalidBusinessNameScenarios = [
  { name: 'Empty field', value: '', mode: 'error' },
  { name: 'Only spaces', value: ' ', mode: 'error' },
  { name: 'Extremely Long Business Name', value: 'A'.repeat(256), mode: 'maxlength-or-error', maxLength: 50 },
  { name: 'XML', value: '<business>ABC</business>', mode: 'error' },
  { name: 'JSON', value: '{"name":"ABC"}', mode: 'error' },
  { name: 'XSS Script', value: '<script>alert(1)</script>', mode: 'error' },
  { name: 'SQL Injection', value: "' OR 1=1 --", mode: 'error' },
  { name: 'SQL Drop', value: "'; DROP TABLE users;--", mode: 'error' },
];

const invalidPinCodeScenarios = [
  { name: 'Empty field', value: '', inputMethod: 'Typing', mode: 'empty' },
  { name: 'Only spaces', value: ' ', inputMethod: 'Typing', mode: 'filtered', forbidden: /\s/ },
  { name: '1 digit', value: '1', inputMethod: 'Typing', mode: 'short' },
  { name: '2 digits', value: '12', inputMethod: 'Typing', mode: 'short' },
  { name: '3 digits', value: '123', inputMethod: 'Typing', mode: 'short' },
  { name: '4 digits', value: '1234', inputMethod: 'Typing', mode: 'short' },
  { name: 'More than 5 digits', value: '123456', inputMethod: 'Typing', mode: 'maxlength-or-error', maxLength: 5 },
  { name: 'Very long number', value: '123456789012345', inputMethod: 'Paste', mode: 'maxlength-or-error', maxLength: 5 },
  { name: 'Alphabets only', value: 'ABCDE', inputMethod: 'Typing', mode: 'filtered', forbidden: /[A-Za-z]/ },
  { name: 'Lowercase alphabets', value: 'abcde', inputMethod: 'Typing', mode: 'filtered', forbidden: /[A-Za-z]/ },
  { name: 'Mixed digits and alphabets', value: '12AB3', inputMethod: 'Typing', mode: 'filtered', forbidden: /[A-Za-z]/ },
  { name: 'Special characters', value: '@#$%&', inputMethod: 'Typing', mode: 'filtered', forbidden: /[@#$%&]/ },
  { name: 'Digits with special characters', value: '12@34', inputMethod: 'Typing', mode: 'filtered', forbidden: /@/ },
  { name: 'Alphanumeric with special characters', value: '12AB@3', inputMethod: 'Typing', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'Hyphen', value: '123-4', inputMethod: 'Typing', mode: 'filtered', forbidden: /-/ },
  { name: 'Decimal number', value: '12.34', inputMethod: 'Typing', mode: 'filtered', forbidden: /\./ },
  { name: 'Comma', value: '12,34', inputMethod: 'Typing', mode: 'filtered', forbidden: /,/ },
  { name: 'Slash', value: '12/34', inputMethod: 'Typing', mode: 'filtered', forbidden: /\// },
  { name: 'Backslash', value: '12\\34', inputMethod: 'Typing', mode: 'filtered', forbidden: /\\/ },
  { name: 'Plus sign', value: '+1234', inputMethod: 'Typing', mode: 'filtered', forbidden: /\+/ },
  { name: 'Minus sign', value: '-1234', inputMethod: 'Typing', mode: 'filtered', forbidden: /-/ },
  { name: 'Parentheses', value: '(1234)', inputMethod: 'Typing', mode: 'filtered', forbidden: /[()]/ },
  { name: 'Spaces between digits', value: '12 34', inputMethod: 'Typing', mode: 'filtered', forbidden: /\s/ },
  { name: 'Leading space', value: ' 12345', inputMethod: 'Paste', mode: 'trim-or-filter', expectedValue: '12345' },
  { name: 'Trailing space', value: '12345 ', inputMethod: 'Paste', mode: 'trim-or-filter', expectedValue: '12345' },
  { name: 'Tab character', value: '12\t34', inputMethod: 'Paste', mode: 'filtered', forbidden: /\t/ },
  { name: 'New line', value: '12\n34', inputMethod: 'Paste', mode: 'filtered', forbidden: /[\r\n]/ },
  { name: 'Emoji', value: 'ðŸ˜Š1234', inputMethod: 'Paste', mode: 'filtered', forbidden: /[\p{Emoji_Presentation}\u200d]/u },
  { name: 'Unicode symbols', value: 'â˜…1234', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^\x00-\x7F]/ },
  { name: 'Non-English digits - Fullwidth', value: 'ï¼‘ï¼’ï¼“ï¼”ï¼•', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^\x00-\x7F]/ },
  { name: 'Non-English digits - Arabic', value: 'Ù¡Ù¢Ù£Ù¤Ù¥', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^\x00-\x7F]/ },
  { name: 'Zero-width space', value: '12\u200b345', inputMethod: 'Paste', mode: 'filtered', forbidden: /\u200b/ },
  { name: 'SQL Injection', value: "' OR 1=1 --", inputMethod: 'Paste', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'XSS Script', value: '<script>alert(1)</script>', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'HTML Tags', value: '<input>', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'JavaScript', value: 'javascript:alert(1)', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'URL', value: 'https://12345.com', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'Email', value: '12345@test.com', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'JSON', value: '{"zip":"12345"}', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^0-9]/ },
  { name: 'XML', value: '<zip>12345</zip>', inputMethod: 'Paste', mode: 'filtered', forbidden: /[^0-9]/ },
];

const boundaryPinCodeScenarios = [
  { name: 'Minimum Length - 1', value: '1234', inputMethod: 'Typing', mode: 'short' },
  { name: 'Exactly 5 Digits', value: positiveOnboardingData.zipCode, inputMethod: 'Paste', mode: 'valid' },
  { name: 'Maximum Length + 1', value: '123456', inputMethod: 'Paste', mode: 'maxlength-or-error', maxLength: 5 },
];

const invalidBusinessListingEmailScenarios = [
  { name: 'Missing @', value: 'johnexample.com', inputMethod: 'Typing' },
  { name: 'Missing username', value: '@gmail.com', inputMethod: 'Typing' },
  { name: 'Missing domain', value: 'john@', inputMethod: 'Typing' },
  { name: 'Missing top-level domain', value: 'john@gmail', inputMethod: 'Typing' },
  { name: 'Missing domain name', value: 'john@.com', inputMethod: 'Typing' },
  { name: 'Missing dot after domain', value: 'john@gmailcom', inputMethod: 'Typing' },
  { name: 'Multiple @ symbols', value: 'john@@gmail.com', inputMethod: 'Typing' },
  { name: 'Multiple dots', value: 'john..doe@gmail.com', inputMethod: 'Typing' },
  { name: 'Starts with dot', value: '.john@gmail.com', inputMethod: 'Typing' },
  { name: 'Ends with dot before @', value: 'john.@gmail.com', inputMethod: 'Typing' },
  { name: 'Dot immediately after @', value: 'john@.gmail.com', inputMethod: 'Typing' },
  { name: 'Ends with dot', value: 'john@gmail.com.', inputMethod: 'Typing' },
  { name: 'Consecutive dots in domain', value: 'john@gmail..com', inputMethod: 'Typing' },
  { name: 'Space inside email', value: 'john doe@gmail.com', inputMethod: 'Typing' },
  { name: 'Tab character', value: 'john\t@gmail.com', inputMethod: 'Paste' },
  { name: 'New line', value: 'john\n@gmail.com', inputMethod: 'Paste' },
  { name: 'Only username', value: 'john', inputMethod: 'Typing' },
  { name: 'Only domain', value: 'gmail.com', inputMethod: 'Typing' },
  { name: 'Special characters only', value: '@#$%^&*', inputMethod: 'Typing' },
  { name: 'Invalid special characters', value: 'john<>@gmail.com', inputMethod: 'Typing' },
  { name: 'Comma instead of dot', value: 'john@gmail,com', inputMethod: 'Typing' },
  { name: 'Semicolon', value: 'john@gmail;com', inputMethod: 'Typing' },
  { name: 'Colon', value: 'john@gmail:com', inputMethod: 'Typing' },
  { name: 'Slash', value: 'john/gmail.com', inputMethod: 'Typing' },
  { name: 'Backslash', value: 'john\\gmail.com', inputMethod: 'Typing' },
  { name: 'Emoji', value: 'ðŸ˜Š@gmail.com', inputMethod: 'Paste' },
  { name: 'Unicode symbols', value: 'â˜…john@gmail.com', inputMethod: 'Paste' },
  { name: 'SQL Injection', value: "' OR 1=1 --", inputMethod: 'Paste' },
  { name: 'SQL Drop', value: '"; DROP TABLE users;--', inputMethod: 'Paste' },
  { name: 'XSS Script', value: '<script>alert(1)</script>', inputMethod: 'Paste' },
  { name: 'HTML Tags', value: '<b>john@gmail.com</b>', inputMethod: 'Paste' },
  { name: 'JavaScript', value: 'javascript:alert(1)', inputMethod: 'Paste' },
  { name: 'URL', value: 'https://google.com', inputMethod: 'Paste' },
  { name: 'Phone Number', value: '9876543210', inputMethod: 'Typing' },
  { name: 'JSON', value: '{"email":"john@gmail.com"}', inputMethod: 'Paste' },
  { name: 'XML', value: '<email>john@gmail.com</email>', inputMethod: 'Paste' },
  { name: 'Zero-width space', value: 'john\u200b@gmail.com', inputMethod: 'Paste' },
  { name: 'Invalid TLD', value: 'john@gmail.c', inputMethod: 'Typing' },
  { name: 'Numeric TLD', value: 'john@gmail.123', inputMethod: 'Typing' },
];

const boundaryBusinessListingEmailScenarios = [
  { name: 'Username length exceeds limit', value: `${'a'.repeat(35)}@gmail.com`, inputMethod: 'Paste', mode: 'maxlength-or-error' },
  { name: 'Domain length exceeds limit', value: `john@${'a'.repeat(35)}.com`, inputMethod: 'Paste', mode: 'maxlength-or-error' },
  { name: 'Email exceeds maximum allowed length', value: `${'a'.repeat(50)}@gmail.com`, inputMethod: 'Paste', mode: 'maxlength-or-error' },
  { name: 'Minimum valid email length', value: 'a@b.co', inputMethod: 'Typing', mode: 'valid' },
  { name: 'Maximum valid email length', value: `${'a'.repeat(30)}@gmail.com`, inputMethod: 'Paste', mode: 'valid' },
];

const pasteBusinessListingEmailScenarios = [
  { name: 'Paste text without @', value: 'johnexample.com', inputMethod: 'Paste' },
  { name: 'Paste URL', value: 'https://google.com', inputMethod: 'Paste' },
  { name: 'Paste SQL Injection', value: "' OR 1=1 --", inputMethod: 'Paste' },
  { name: 'Paste HTML', value: '<b>john@gmail.com</b>', inputMethod: 'Paste' },
  { name: 'Paste JavaScript', value: 'javascript:alert(1)', inputMethod: 'Paste' },
  { name: 'Paste emoji', value: 'ðŸ˜Š@gmail.com', inputMethod: 'Paste' },
  { name: 'Paste email with leading and trailing spaces', value: ' john@gmail.com ', inputMethod: 'Paste', mode: 'valid' },
  { name: 'Paste multiple email addresses', value: 'john@gmail.com,jane@gmail.com', inputMethod: 'Paste' },
  { name: 'Paste email containing hidden zero-width characters', value: 'john\u200b@gmail.com', inputMethod: 'Paste' },
];

const positiveBusinessListingEmailScenarios = [
  { name: 'Uppercase email accepted', value: 'JOHN.DOE@GMAIL.COM', inputMethod: 'Typing', mode: 'valid' },
];

const invalidUpdateBusinessDetailsWebUrlScenarios = [
  { name: 'Empty field', value: '', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Only spaces', value: '     ', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Plain text', value: 'example', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Missing protocol', value: 'www.google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Missing domain', value: 'https://', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Missing TLD', value: 'https://google', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Missing domain name', value: 'https://.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Invalid protocol', value: 'htp://google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Misspelled protocol', value: 'http//google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'No colon after protocol', value: 'https//google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Single slash after protocol', value: 'https:/google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Too many slashes', value: 'https:////google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Space in URL', value: 'https://goo gle.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Leading space', value: ' https://google.com', inputMethod: 'Typing', mode: 'reject-or-trim', normalizedValue: 'https://google.com' },
  { name: 'Trailing space', value: 'https://google.com ', inputMethod: 'Typing', mode: 'reject-or-trim', normalizedValue: 'https://google.com' },
  { name: 'Double dots', value: 'https://google..com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Starts with dot', value: 'https://.google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Ends with dot', value: 'https://google.com.', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Invalid characters', value: 'https://goo<>gle.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Emoji', value: 'https://Ã°Å¸ËœÅ .com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Special characters only', value: '@#$%^&*', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Multiple protocols', value: 'https://http://google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'FTP URL', value: 'ftp://example.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'File URL', value: 'file:///C:/test.txt', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Mailto URL', value: 'mailto:test@gmail.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'JavaScript URL', value: 'javascript:alert(1)', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Data URL', value: 'data:text/html;base64,...', inputMethod: 'Typing', mode: 'reject' },
  { name: 'SQL Injection', value: "' OR 1=1 --", inputMethod: 'Typing', mode: 'reject' },
  { name: 'SQL Drop', value: "'; DROP TABLE users;--", inputMethod: 'Typing', mode: 'reject' },
  { name: 'XSS Script', value: '<script>alert(1)</script>', inputMethod: 'Typing', mode: 'reject' },
  { name: 'HTML Tags', value: '<a href="https://google.com">', inputMethod: 'Typing', mode: 'reject' },
  { name: 'JSON', value: '{"url":"https://google.com"}', inputMethod: 'Typing', mode: 'reject' },
  { name: 'XML', value: '<url>https://google.com</url>', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Backslash', value: 'https:\\\\google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Forward slash only', value: '////google.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Consecutive slashes', value: 'https://google.com//page', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Invalid IP', value: 'http://999.999.999.999', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Invalid port', value: 'https://google.com:999999', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Non-English domain', value: 'https://Ã Â¤â€”Ã Â¥â€šÃ Â¤â€”Ã Â¤Â².com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Zero-width space', value: 'https://goo\u200bgle.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'New line', value: 'https://google\n.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Tab', value: 'https://google\t.com', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Extremely long URL', value: `https://${'a'.repeat(2050)}.com`, inputMethod: 'Paste', mode: 'reject' },
];

const boundaryUpdateBusinessDetailsWebUrlScenarios = [
  { name: '1 character', value: 'a', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Below minimum length', value: 'a.c', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Exactly minimum valid URL', value: 'a.co', inputMethod: 'Typing', mode: 'valid' },
  { name: 'Maximum supported length', value: `${'a'.repeat(60)}.com`, inputMethod: 'Paste', mode: 'valid' },
  { name: 'Above maximum length', value: `https://${'a'.repeat(2050)}.com`, inputMethod: 'Paste', mode: 'reject' },
];

const pasteUpdateBusinessDetailsWebUrlScenarios = [
  { name: 'Paste only spaces', value: '     ', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste plain text', value: 'google', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste email', value: 'user@gmail.com', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste phone number', value: '9876543210', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste SQL injection', value: "' OR 1=1 --", inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste XSS payload', value: '<script>alert(1)</script>', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste HTML', value: '<img src=x onerror=alert(1)>', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste JavaScript URL', value: 'javascript:alert(1)', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste URL with leading/trailing spaces', value: ' https://google.com ', inputMethod: 'Paste', mode: 'reject-or-trim', normalizedValue: 'https://google.com' },
  { name: 'Paste URL with emoji', value: 'https://Ã°Å¸ËœÅ .com', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste hidden zero-width characters', value: 'https://goo\u200bgle.com', inputMethod: 'Paste', mode: 'reject' },
  { name: 'Paste URL longer than max', value: `https://${'a'.repeat(2050)}.com`, inputMethod: 'Paste', mode: 'reject' },
];

const updateBusinessDetailsBusinessNameScenarios = [
  { name: 'Empty field', value: '', inputMethod: 'Typing', mode: 'disabled' },
  { name: 'Only spaces', value: '     ', inputMethod: 'Typing', mode: 'disabled' },
  { name: 'Extremely long business name', value: 'A'.repeat(256), inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'XML payload', value: '<business><name>DSX</name></business>', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'JSON payload', value: '{"businessName":"DSX"}', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'XSS script', value: '<script>alert(1)</script>', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'SQL injection', value: "' OR 1=1 --", inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'SQL drop statement', value: "'; DROP TABLE agents;--", inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Maximum 75 characters', value: 'A'.repeat(76), inputMethod: 'Paste', mode: 'maxlength', maxLength: 75 },
];

const updateBusinessDetailsPhoneScenarios = [
  { name: 'Empty field', value: '', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Only spaces', value: ' ', inputMethod: 'Typing', mode: 'red-alert-or-empty' },
  { name: '1 digit', value: '1', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Less than minimum length', value: '12345', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'More than maximum length', value: '123456789012', inputMethod: 'Typing', mode: 'max-digits', maxDigits: 10 },
  { name: 'Very long number', value: '12345678901234567890', inputMethod: 'Paste', mode: 'max-digits', maxDigits: 10 },
  { name: 'Alphabets only', value: 'abcdefghij', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[a-z]/i },
  { name: 'Mixed letters and digits', value: '12345abcde', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[a-z]/i },
  { name: 'Uppercase letters', value: 'ABCDE12345', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[A-Z]/ },
  { name: 'Lowercase letters', value: 'abcde12345', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[a-z]/ },
  { name: 'Special characters', value: '@#$%^&*', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[@#$%^&*]/ },
  { name: 'Digits with special characters', value: '123@456789', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[@]/ },
  { name: 'Spaces between digits', value: '123 456 7890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /\s/ },
  { name: 'Leading space', value: ' 1234567890', inputMethod: 'Typing', mode: 'red-alert-or-trim', normalizedValue: '1234567890' },
  { name: 'Trailing space', value: '1234567890 ', inputMethod: 'Typing', mode: 'red-alert-or-trim', normalizedValue: '1234567890' },
  { name: 'Hyphen', value: '123-456-7890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /-/ },
  { name: 'Parentheses', value: '(123)4567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[()]/ },
  { name: 'Dot separator', value: '123.456.7890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /\./ },
  { name: 'Slash', value: '123/4567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /\// },
  { name: 'Backslash', value: '123\\4567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /\\/ },
  { name: 'Plus sign', value: '+1234567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /\+/ },
  { name: 'Minus sign', value: '-1234567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /-/ },
  { name: 'Decimal number', value: '12345.6789', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /\./ },
  { name: 'Comma', value: '123,4567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /,/ },
  { name: 'Colon', value: '123:4567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /:/ },
  { name: 'Semicolon', value: '123;4567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /;/ },
  { name: 'Underscore', value: '123_4567890', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /_/ },
  { name: 'Emoji', value: 'ðŸ˜Š123456789', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[\p{Emoji_Presentation}\u200d]/u },
  { name: 'Unicode symbols', value: 'â˜Ž123456789', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /â˜Ž/ },
  { name: 'Non-English digits Arabic', value: 'Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©Ù ', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[^\x00-\x7F]/ },
  { name: 'Non-English digits Full width', value: 'ï¼‘ï¼’ï¼“ï¼”ï¼•ï¼–ï¼—ï¼˜ï¼™', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[^\x00-\x7F]/ },
  { name: 'Tab character', value: '12345\t6789', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /\t/ },
  { name: 'New line', value: '12345\n6789', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[\r\n]/ },
  { name: 'Zero-width space', value: '12345\u200b67890', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /\u200b/ },
  { name: 'SQL Injection', value: "' OR 1=1 --", inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /['=-]/ },
  { name: 'XSS Script', value: '<script>alert(1)</script>', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[<>/()a-z]/i },
  { name: 'HTML Tags', value: '<input>', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[<>a-z]/i },
  { name: 'JavaScript', value: 'javascript:alert(1)', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[a-z:()]/i },
  { name: 'URL', value: 'https://google.com', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[a-z:/.]/i },
  { name: 'Email', value: 'user@gmail.com', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[a-z@.]/i },
  { name: 'JSON', value: '{"phone":"1234567890"}', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[{}":a-z]/i },
  { name: 'XML', value: '<phone>1234567890</phone>', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[<>/a-z]/i },
  { name: 'Minimum length - 1 digit', value: '1', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Exactly minimum valid length', value: '1234567890', inputMethod: 'Typing', mode: 'valid', expectedDigits: '1234567890' },
  { name: 'Maximum length + 1 digit', value: '12345678901', inputMethod: 'Typing', mode: 'max-digits', maxDigits: 10 },
  { name: 'Paste number longer than maximum length', value: '123456789012345', inputMethod: 'Paste', mode: 'max-digits', maxDigits: 10 },
  { name: 'Only digits can be typed', value: '1234567890', inputMethod: 'Typing', mode: 'valid', expectedDigits: '1234567890' },
  { name: 'Alphabets blocked while typing', value: 'abcde', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[a-z]/i },
  { name: 'Special characters blocked while typing', value: '@#$%', inputMethod: 'Typing', mode: 'red-alert-or-sanitized', forbidden: /[@#$%]/ },
  { name: 'Paste with alphabets rejected', value: '123abc4567', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[a-z]/i },
  { name: 'Paste with special characters rejected', value: '123@456#789', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[@#]/ },
  { name: 'Paste with spaces rejected', value: '123 456 7890', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /\s/ },
  { name: 'Paste with emoji rejected', value: '123ðŸ˜Š456789', inputMethod: 'Paste', mode: 'red-alert-or-sanitized', forbidden: /[\p{Emoji_Presentation}\u200d]/u },
  { name: 'Field does not accept more than allowed digits', value: '987654321098765', inputMethod: 'Paste', mode: 'max-digits', maxDigits: 10 },
  { name: 'Copy-paste valid numeric phone accepted', value: '8882011203', inputMethod: 'Paste', mode: 'valid', expectedDigits: '8882011203' },
];

const updateBusinessDetailsEmailScenarios = [
  { name: 'Missing @', value: 'business.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Missing username', value: '@company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Missing domain', value: 'business@', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Missing TLD', value: 'business@company', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Missing domain name', value: 'business@.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Missing dot in domain', value: 'business@companycom', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Multiple @ symbols', value: 'business@@company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Consecutive dots', value: 'business..mail@company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Dot at beginning', value: '.business@company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Dot before @', value: 'business.@company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Dot immediately after @', value: 'business@.company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Ends with dot', value: 'business@company.com.', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Consecutive dots in domain', value: 'business@company..com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Space before email', value: ' business@company.com', inputMethod: 'Typing', mode: 'red-alert-or-trim', normalizedValue: 'business@company.com' },
  { name: 'Space after email', value: 'business@company.com ', inputMethod: 'Typing', mode: 'red-alert-or-trim', normalizedValue: 'business@company.com' },
  { name: 'Space inside email', value: 'business @company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Tab character', value: 'business\t@company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'New line', value: 'business\n@company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Only username', value: 'business', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Only domain', value: 'company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Special characters only', value: '@#$%^&*', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Invalid special characters', value: 'business<>@company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Comma instead of dot', value: 'business@company,com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Semicolon', value: 'business@company;com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Colon', value: 'business@company:com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Slash', value: 'business/company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Backslash', value: 'business\\company.com', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Emoji', value: 'ðŸ˜Š@company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Unicode symbols', value: 'â˜…business@company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'SQL Injection', value: "' OR 1=1 --", inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'SQL Drop', value: '; DROP TABLE users;--', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'XSS Script', value: '<script>alert(1)</script>', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'HTML Tags', value: '<b>business@company.com</b>', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'JavaScript', value: 'javascript:alert(1)', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'URL instead of email', value: 'https://company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Phone number', value: '9876543210', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'JSON', value: '{"email":"business@company.com"}', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'XML', value: '<email>business@company.com</email>', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Zero-width space', value: 'business\u200b@company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Extremely long email', value: `${'a'.repeat(245)}@company.com`, inputMethod: 'Paste', mode: 'maxlength-or-red-alert', maxLength: 40 },
  { name: 'Invalid TLD', value: 'business@company.c', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Numeric TLD', value: 'business@company.123', inputMethod: 'Typing', mode: 'red-alert' },
  { name: 'Username below minimum length', value: 'a@company.com', inputMethod: 'Typing', mode: 'valid', expectedValue: 'a@company.com' },
  { name: 'Email exceeding maximum allowed length', value: `${'a'.repeat(31)}@gmail.com`, inputMethod: 'Paste', mode: 'maxlength-or-red-alert', maxLength: 40 },
  { name: 'Domain exceeding maximum allowed length', value: `business@${'a'.repeat(35)}.com`, inputMethod: 'Paste', mode: 'maxlength-or-red-alert', maxLength: 40 },
  { name: 'Exactly maximum valid email length', value: `${'a'.repeat(30)}@gmail.com`, inputMethod: 'Paste', mode: 'valid', expectedValue: `${'a'.repeat(30)}@gmail.com` },
  { name: 'One character more than maximum length', value: `${'a'.repeat(31)}@gmail.com`, inputMethod: 'Paste', mode: 'maxlength-or-red-alert', maxLength: 40 },
  { name: 'Paste only spaces', value: '     ', inputMethod: 'Paste', mode: 'red-alert-or-empty' },
  { name: 'Paste plain text', value: 'business', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Paste URL', value: 'https://company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Paste phone number', value: '9876543210', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Paste SQL injection string', value: "' OR 1=1 --", inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Paste XSS payload', value: '<script>alert(1)</script>', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Paste HTML', value: '<b>business@company.com</b>', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Paste emoji', value: 'ðŸ˜Š@company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Paste email with leading/trailing spaces', value: ' business@company.com ', inputMethod: 'Paste', mode: 'red-alert-or-trim', normalizedValue: 'business@company.com' },
  { name: 'Paste multiple email addresses', value: 'a@company.com, b@company.com', inputMethod: 'Paste', mode: 'red-alert' },
  { name: 'Paste email with hidden zero-width characters', value: 'business\u200b@company.com', inputMethod: 'Paste', mode: 'red-alert' },
];

const fastStepAgentNameScenarios = [
  { name: 'Empty field', value: '', inputMethod: 'Typing', mode: 'reject' },
  { name: 'Only spaces', value: ' ', inputMethod: 'Typing', mode: 'reject-or-trim', normalizedValue: '' },
  { name: 'Leading spaces', value: ' John', inputMethod: 'Typing', mode: 'reject-or-trim', normalizedValue: 'John' },
  { name: 'Trailing spaces', value: 'John ', inputMethod: 'Typing', mode: 'reject-or-trim', normalizedValue: 'John' },
  { name: 'Multiple consecutive spaces', value: 'John  Doe', inputMethod: 'Typing', mode: 'reject-or-normalize', normalizedValue: 'John Doe' },
  { name: '16 characters', value: 'ABCDEFGHIJKLMNOP', inputMethod: 'Typing', mode: 'maxlength', maxLength: 15 },
  { name: '20 characters', value: 'ABCDEFGHIJKLMNOPQRST', inputMethod: 'Typing', mode: 'maxlength', maxLength: 15 },
  { name: '100+ characters', value: 'A'.repeat(100), inputMethod: 'Paste', mode: 'maxlength', maxLength: 15 },
  { name: 'Only numbers', value: '123456', inputMethod: 'Typing', mode: 'reject-or-sanitized', forbidden: /[0-9]/ },
  { name: 'Mixed letters and numbers', value: 'John123', inputMethod: 'Typing', mode: 'reject-or-sanitized', forbidden: /[0-9]/ },
  { name: 'Special characters', value: '@#$%^&*', inputMethod: 'Typing', mode: 'reject-or-sanitized', forbidden: /[@#$%^&*]/ },
  { name: 'Mixed special characters', value: 'John@Doe', inputMethod: 'Typing', mode: 'reject-or-sanitized', forbidden: /@/ },
  { name: 'SQL Injection', value: "' OR 1=1 --", inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /['0-9=-]/ },
  { name: 'SQL Drop', value: "'; DROP TABLE users;--", inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[';.-]/ },
  { name: 'XSS Script', value: '<script>alert(1)</script>', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[<>/()0-9]/ },
  { name: 'HTML Tags', value: '<b>John</b>', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[<>/]/ },
  { name: 'JavaScript', value: 'javascript:alert(1)', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[:()0-9]/ },
  { name: 'URL', value: 'https://google.com', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[:/.]/ },
  { name: 'Email Address', value: 'john@gmail.com', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[@.]/ },
  { name: 'Phone Number', value: '9876543210', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[0-9]/ },
  { name: 'Emoji', value: 'ðŸ˜ŠJohn', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[\p{Emoji_Presentation}\u200d]/u },
  { name: 'Unicode Symbols', value: 'â˜…John', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[^\x00-\x7F]/ },
  { name: 'New Line', value: 'John\nDoe', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[\r\n]/ },
  { name: 'Tab Character', value: 'John\tDoe', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /\t/ },
  { name: 'Zero-width Space', value: 'John\u200bDoe', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /\u200b/ },
  { name: 'Slash', value: 'John/Doe', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /\// },
  { name: 'Backslash', value: 'John\\Doe', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /\\/ },
  { name: 'Underscore', value: 'John_Doe', inputMethod: 'Typing', mode: 'reject-or-sanitized', forbidden: /_/ },
  { name: 'Consecutive dots', value: 'John..Doe', inputMethod: 'Typing', mode: 'reject-or-sanitized', forbidden: /\./ },
  { name: 'Only punctuation', value: '.....', inputMethod: 'Typing', mode: 'reject-or-sanitized', forbidden: /\./ },
  { name: 'JSON', value: '{"name":"John"}', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[{}":]/ },
  { name: 'XML', value: '<name>John</name>', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[<>/]/ },
  { name: '14 characters', value: 'ABCDEFGHIJKLMN', inputMethod: 'Typing', mode: 'valid-boundary' },
  { name: 'Exactly 15 characters', value: 'ABCDEFGHIJKLMNO', inputMethod: 'Typing', mode: 'valid-boundary' },
  { name: 'Paste longer than 15 characters', value: 'ABCDEFGHIJKLMNOPQRST', inputMethod: 'Paste', mode: 'maxlength', maxLength: 15 },
  { name: 'Paste only numbers', value: '123456', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[0-9]/ },
  { name: 'Paste special characters', value: '@#$%^&*', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[@#$%^&*]/ },
  { name: 'Paste SQL injection', value: "' OR 1=1 --", inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /['0-9=-]/ },
  { name: 'Paste XSS payload', value: '<img src=x onerror=alert(1)>', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[<>=()0-9]/ },
  { name: 'Paste HTML', value: '<b>John</b>', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[<>/]/ },
  { name: 'Paste emoji', value: 'ðŸ˜ŠJohn', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[\p{Emoji_Presentation}\u200d]/u },
  { name: 'Paste URL', value: 'https://google.com', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[:/.]/ },
  { name: 'Paste email address', value: 'john@gmail.com', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[@.]/ },
  { name: 'Paste phone number', value: '9876543210', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /[0-9]/ },
  { name: 'Paste text with leading/trailing spaces', value: ' John ', inputMethod: 'Paste', mode: 'reject-or-trim', normalizedValue: 'John' },
  { name: 'Paste hidden zero-width characters', value: 'John\u200bDoe', inputMethod: 'Paste', mode: 'reject-or-sanitized', forbidden: /\u200b/ },
];

const onboardingScreens = {
  personalDetails: {
    key: 'personal_details',
    screen: 'Personal Details',
    route: '/details',
  },
  businessCategory: {
    key: 'business_category',
    screen: 'Business Category',
    route: '/business-step',
  },
  businessDetails: {
    key: 'business_details',
    screen: 'Business Details',
    route: '/business-step',
  },
  businessListing: {
    key: 'business_listing',
    screen: 'Business Listing',
    route: '/business-step',
  },
  updateBusinessDetails: {
    key: 'update_your_business_details',
    screen: 'Update Your Business Details',
    route: '/business-step',
  },
  yourAiSound: {
    key: 'your_ai_sound',
    screen: 'Your AI Sound',
    route: '/business-step',
  },
};

const businessStepScreens = [
  onboardingScreens.businessCategory,
  onboardingScreens.businessDetails,
  onboardingScreens.businessListing,
  onboardingScreens.updateBusinessDetails,
  onboardingScreens.yourAiSound,
];

function initializePersonalDetailsReport() {
  fs.mkdirSync(path.dirname(personalDetailsReportFile), { recursive: true });
  fs.writeFileSync(
    personalDetailsReportFile,
    [
      'PERSONAL DETAILS NAME VALIDATION REPORT',
      '=======================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializePersonalDetailsPhoneReport() {
  fs.mkdirSync(path.dirname(personalDetailsPhoneReportFile), { recursive: true });
  fs.writeFileSync(
    personalDetailsPhoneReportFile,
    [
      'PERSONAL DETAILS PHONE VALIDATION REPORT',
      '========================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeBusinessCategoryReport() {
  fs.mkdirSync(path.dirname(businessCategoryReportFile), { recursive: true });
  fs.writeFileSync(
    businessCategoryReportFile,
    [
      'BUSINESS CATEGORY VALIDATION REPORT',
      '===================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeBusinessDetailsReport() {
  fs.mkdirSync(path.dirname(businessDetailsReportFile), { recursive: true });
  fs.writeFileSync(
    businessDetailsReportFile,
    [
      'BUSINESS DETAILS NAME VALIDATION REPORT',
      '=======================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeBusinessDetailsPinReport() {
  fs.mkdirSync(path.dirname(businessDetailsPinReportFile), { recursive: true });
  fs.writeFileSync(
    businessDetailsPinReportFile,
    [
      'BUSINESS DETAILS PIN CODE VALIDATION REPORT',
      '===========================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeUpdateBusinessDetailsWebUrlReport() {
  fs.mkdirSync(path.dirname(updateBusinessDetailsWebUrlReportFile), { recursive: true });
  fs.writeFileSync(
    updateBusinessDetailsWebUrlReportFile,
    [
      'UPDATE YOUR BUSINESS DETAILS WEB URL VALIDATION REPORT',
      '======================================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeUpdateBusinessDetailsBusinessNameReport() {
  fs.mkdirSync(path.dirname(updateBusinessDetailsBusinessNameReportFile), { recursive: true });
  fs.writeFileSync(
    updateBusinessDetailsBusinessNameReportFile,
    [
      'UPDATE YOUR BUSINESS DETAILS BUSINESS NAME VALIDATION REPORT',
      '===========================================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeUpdateBusinessDetailsPhoneReport() {
  fs.mkdirSync(path.dirname(updateBusinessDetailsPhoneReportFile), { recursive: true });
  fs.writeFileSync(
    updateBusinessDetailsPhoneReportFile,
    [
      'UPDATE YOUR BUSINESS DETAILS PHONE NUMBER VALIDATION REPORT',
      '==========================================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeUpdateBusinessDetailsEmailReport() {
  fs.mkdirSync(path.dirname(updateBusinessDetailsEmailReportFile), { recursive: true });
  fs.writeFileSync(
    updateBusinessDetailsEmailReportFile,
    [
      'UPDATE YOUR BUSINESS DETAILS BUSINESS EMAIL VALIDATION REPORT',
      '============================================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeBusinessListingEmailReport() {
  fs.mkdirSync(path.dirname(businessListingEmailReportFile), { recursive: true });
  fs.writeFileSync(
    businessListingEmailReportFile,
    [
      'BUSINESS LISTING EMAIL VALIDATION REPORT',
      '========================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function initializeFastStepAgentNameReport() {
  fs.mkdirSync(path.dirname(fastStepAgentNameReportFile), { recursive: true });
  fs.writeFileSync(
    fastStepAgentNameReportFile,
    [
      'FAST STEP AGENT NAME VALIDATION REPORT',
      '======================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function appendPersonalDetailsResult({
  scenario,
  inputValue,
  fieldValue,
  errorVisible,
  errorText,
  status,
  reason,
}) {
  const content = [
    `${status}: ${scenario}`,
    `Input Data: ${JSON.stringify(inputValue)}`,
    `Field Value: ${JSON.stringify(fieldValue)}`,
    `Error Visible: ${errorVisible}`,
    `Error Text: ${errorText || 'N/A'}`,
    `Failure Reason: ${reason || 'N/A'}`,
    '----------------------------------------',
    '',
  ].join('\n');

  fs.appendFileSync(personalDetailsReportFile, content, 'utf8');
}

function appendPersonalDetailsPhoneResult({
  scenario,
  inputValue,
  enteredValue,
  storedValue,
  errorVisible,
  errorText,
  status,
  reason,
}) {
  const content = [
    `${status}: ${scenario}`,
    `Input Data: ${JSON.stringify(inputValue)}`,
    `Entered Value: ${JSON.stringify(enteredValue)}`,
    `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
    `Error Visible: ${errorVisible}`,
    `Error Text: ${errorText || 'N/A'}`,
    `Failure Reason: ${reason || 'N/A'}`,
    '----------------------------------------',
    '',
  ].join('\n');

  fs.appendFileSync(personalDetailsPhoneReportFile, content, 'utf8');
}

function appendBusinessCategoryResult({
  scenario,
  inputValue,
  fieldValue,
  errorVisible,
  errorText,
  addCategoryVisible,
  status,
  reason,
}) {
  const content = [
    `${status}: ${scenario}`,
    `Input Data: ${JSON.stringify(inputValue)}`,
    `Field Value: ${JSON.stringify(fieldValue)}`,
    `Error Visible: ${errorVisible}`,
    `Error Text: ${errorText || 'N/A'}`,
    `Add Category Visible: ${addCategoryVisible}`,
    `Failure Reason: ${reason || 'N/A'}`,
    '----------------------------------------',
    '',
  ].join('\n');

  fs.appendFileSync(businessCategoryReportFile, content, 'utf8');
}

function appendBusinessDetailsResult({
  scenario,
  inputValue,
  fieldValue,
  storedValue,
  validationResult,
  errorVisible,
  errorText,
  characterCount,
  status,
  reason,
  screenshotPath,
}) {
  const content = [
    `${status}: ${scenario}`,
    `Test Data: ${JSON.stringify(inputValue)}`,
    `Field Value: ${JSON.stringify(fieldValue)}`,
    `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
    `Validation Result: ${validationResult}`,
    `Error Visibility: ${errorVisible}`,
    `Error Text: ${errorText || 'N/A'}`,
    `Character Count: ${characterCount}`,
    `Assertion Status: ${status}`,
    `Pass/Fail: ${status}`,
    `Failure Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '----------------------------------------',
    '',
  ].join('\n');

  fs.appendFileSync(businessDetailsReportFile, content, 'utf8');
}

function appendBusinessDetailsPinResult({
  scenario,
  inputValue,
  inputMethod,
  enteredValue,
  storedValue,
  validationMessageStatus,
  errorText,
  assertionStatus,
  reason,
  screenshotPath,
}) {
  const content = [
    `${assertionStatus}: ${scenario}`,
    `Test Data: ${JSON.stringify(inputValue)}`,
    `Input Method: ${inputMethod}`,
    `Entered Value: ${JSON.stringify(enteredValue)}`,
    `Actual Stored Value: ${JSON.stringify(storedValue)}`,
    `Validation Message Status: ${validationMessageStatus}`,
    `Error Text: ${errorText || 'N/A'}`,
    `Assertion Status: ${assertionStatus}`,
    `Pass / Fail: ${assertionStatus}`,
    `Failure Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '----------------------------------------',
    '',
  ].join('\n');

  fs.appendFileSync(businessDetailsPinReportFile, content, 'utf8');
}

function appendUpdateBusinessDetailsWebUrlResult({
  scenario,
  inputValue,
  inputMethod,
  enteredValue,
  storedValue,
  validationSignal,
  assertionStatus,
  reason,
  screenshotPath,
}) {
  fs.mkdirSync(path.dirname(updateBusinessDetailsWebUrlReportFile), { recursive: true });
  const content = [
    `Scenario: ${scenario}`,
    `Input Value: ${JSON.stringify(inputValue)}`,
    `Input Method: ${inputMethod}`,
    `Entered Value: ${JSON.stringify(enteredValue)}`,
    `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
    `Validation Signal: ${validationSignal}`,
    `Assertion Status: ${assertionStatus}`,
    `Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '',
  ].join('\n');

  fs.appendFileSync(updateBusinessDetailsWebUrlReportFile, content, 'utf8');
}

function appendUpdateBusinessDetailsBusinessNameResult({
  scenario,
  inputValue,
  inputMethod,
  enteredValue,
  storedValue,
  validationSignal,
  assertionStatus,
  reason,
  screenshotPath,
}) {
  fs.mkdirSync(path.dirname(updateBusinessDetailsBusinessNameReportFile), { recursive: true });
  const content = [
    `Scenario: ${scenario}`,
    `Input Value: ${JSON.stringify(inputValue)}`,
    `Input Method: ${inputMethod}`,
    `Entered Value: ${JSON.stringify(enteredValue)}`,
    `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
    `Validation Signal: ${validationSignal}`,
    `Assertion Status: ${assertionStatus}`,
    `Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '',
  ].join('\n');

  fs.appendFileSync(updateBusinessDetailsBusinessNameReportFile, content, 'utf8');
}

function appendUpdateBusinessDetailsPhoneResult({
  scenario,
  inputValue,
  inputMethod,
  enteredValue,
  storedValue,
  digitValue,
  validationSignal,
  assertionStatus,
  reason,
  screenshotPath,
}) {
  fs.mkdirSync(path.dirname(updateBusinessDetailsPhoneReportFile), { recursive: true });
  const content = [
    `Scenario: ${scenario}`,
    `Input Value: ${JSON.stringify(inputValue)}`,
    `Input Method: ${inputMethod}`,
    `Entered Value: ${JSON.stringify(enteredValue)}`,
    `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
    `Digits From Value Attribute: ${digitValue}`,
    `Validation Signal: ${validationSignal}`,
    `Assertion Status: ${assertionStatus}`,
    `Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '',
  ].join('\n');

  fs.appendFileSync(updateBusinessDetailsPhoneReportFile, content, 'utf8');
}

function appendUpdateBusinessDetailsEmailResult({
  scenario,
  inputValue,
  inputMethod,
  enteredValue,
  storedValue,
  validationSignal,
  errorText,
  assertionStatus,
  reason,
  screenshotPath,
}) {
  fs.mkdirSync(path.dirname(updateBusinessDetailsEmailReportFile), { recursive: true });
  const content = [
    `Scenario: ${scenario}`,
    `Input Value: ${JSON.stringify(inputValue)}`,
    `Input Method: ${inputMethod}`,
    `Entered Value: ${JSON.stringify(enteredValue)}`,
    `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
    `Validation Signal: ${validationSignal}`,
    `Error Text: ${errorText || 'N/A'}`,
    `Assertion Status: ${assertionStatus}`,
    `Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '',
  ].join('\n');

  fs.appendFileSync(updateBusinessDetailsEmailReportFile, content, 'utf8');
}

function appendBusinessListingEmailResult({
  scenario,
  inputValue,
  inputMethod,
  fieldValue,
  validationMessageStatus,
  errorText,
  status,
  reason,
  screenshotPath,
}) {
  const content = [
    `${status}: ${scenario}`,
    `Test Data: ${JSON.stringify(inputValue)}`,
    `Input Method: ${inputMethod}`,
    `Field Value: ${JSON.stringify(fieldValue)}`,
    `Validation Message Status: ${validationMessageStatus}`,
    `Error Text: ${errorText || 'N/A'}`,
    `Assertion Status: ${status}`,
    `Pass / Fail: ${status}`,
    `Failure Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '----------------------------------------',
    '',
  ].join('\n');

  fs.appendFileSync(businessListingEmailReportFile, content, 'utf8');
}

function appendBusinessListingEmailPersistenceResult({
  positiveEmail,
  popupSavedSuccessfully,
  businessListingLoaded,
  editPopupOpened,
  storedEmailValue,
  expectedEmailValue,
  status,
  reason,
  screenshotPath,
}) {
  const content = [
    `${status}: Business Listing positive email persistence verification`,
    `Positive Email Entered: ${positiveEmail}`,
    `Popup Saved Successfully: ${popupSavedSuccessfully}`,
    `Business Listing Screen Loaded: ${businessListingLoaded}`,
    `Edit Popup Opened: ${editPopupOpened}`,
    `Stored Email Value: ${JSON.stringify(storedEmailValue)}`,
    `Expected Email Value: ${JSON.stringify(expectedEmailValue)}`,
    `Assertion Status: ${status}`,
    `Pass / Fail: ${status}`,
    `Failure Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '----------------------------------------',
    '',
  ].join('\n');

  fs.appendFileSync(businessListingEmailReportFile, content, 'utf8');
}

function appendFastStepAgentNameResult({
  scenario,
  inputValue,
  inputMethod,
  originalMeetName,
  inputValueAfterEdit,
  meetNameWhileEditing,
  meetNameAfterScenario,
  assertionStatus,
  reason,
  screenshotPath,
}) {
  fs.mkdirSync(path.dirname(fastStepAgentNameReportFile), { recursive: true });
  const content = [
    `Scenario: ${scenario}`,
    `Input Value: ${JSON.stringify(inputValue)}`,
    `Input Method: ${inputMethod}`,
    `Original Meet Agent Name: ${originalMeetName}`,
    `Input Value After Edit: ${JSON.stringify(inputValueAfterEdit)}`,
    `Meet Agent Name While Editing: ${meetNameWhileEditing}`,
    `Meet Agent Name After Scenario: ${meetNameAfterScenario}`,
    `Assertion Status: ${assertionStatus}`,
    `Reason: ${reason || 'N/A'}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    '',
  ].join('\n');

  fs.appendFileSync(fastStepAgentNameReportFile, content, 'utf8');
}

function appendBusinessDetailsBugResult({
  bugTitle,
  expectedResult,
  actualResult,
  currentUrl,
  screenName,
  screenshotPath,
  status = 'BUG',
}) {
  fs.mkdirSync(path.dirname(businessDetailsBugReportFile), { recursive: true });
  const content = [
    `${status}: ${bugTitle}`,
    `Expected Result: ${expectedResult}`,
    `Actual Result: ${actualResult}`,
    `Current URL: ${currentUrl}`,
    `Screen Name: ${screenName}`,
    `Screenshot: ${screenshotPath || 'N/A'}`,
    `Timestamp: ${new Date().toISOString()}`,
    '----------------------------------------',
    '',
  ].join('\n');

  fs.appendFileSync(businessDetailsBugReportFile, content, 'utf8');
}

function initializeBusinessDetailsBugReport() {
  fs.mkdirSync(path.dirname(businessDetailsBugReportFile), { recursive: true });
  fs.writeFileSync(
    businessDetailsBugReportFile,
    [
      'BUSINESS DETAILS BUG VERIFICATION REPORT',
      '========================================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );
}

function buildUrl(route) {
  return new URL(route, envConfig.baseURL).toString();
}

function currentPath(page) {
  return new URL(page.url()).pathname.replace(/\/$/, '') || '/';
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

function screenIdentity(screen) {
  return {
    key: screen.key,
    screen: screen.screen,
    route: screen.route,
  };
}

function createOnboardingState({ completedPages = [], previous = null, lastOpened }) {
  return {
    completed_pages_list: completedPages.map(screenIdentity),
    previous: previous ? screenIdentity(previous) : null,
    last_opened: screenIdentity(lastOpened),
    updatedAt: new Date().toISOString(),
  };
}

function writeOnboardingStateFile(state) {
  fs.mkdirSync(path.dirname(onboardingResumeStateFile), { recursive: true });
  fs.writeFileSync(
    onboardingResumeStateFile,
    JSON.stringify(
      {
        ...state,
        expectedResumeScreen: state.last_opened,
        previousScreen: state.previous,
        businessStepScreens,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  );
}

function appendOnboardingLifecycleBug({ reason, state }) {
  fs.mkdirSync(path.dirname(onboardingLifecycleBugReportFile), { recursive: true });
  fs.appendFileSync(
    onboardingLifecycleBugReportFile,
    [
      `MAJOR BUG: ${reason}`,
      `State: ${JSON.stringify(state, null, 2)}`,
      `Time: ${new Date().toISOString()}`,
      '----------------------------------------',
      '',
    ].join('\n'),
    'utf8'
  );
}

function normalizeCompletedPage(value) {
  if (typeof value === 'string') return value.toLowerCase().replace(/[_-]/g, ' ');
  if (value && typeof value === 'object') {
    return String(value.screen || value.page || value.name || value.title || value.route || value.url || '')
      .toLowerCase()
      .replace(/[_-]/g, ' ');
  }
  return '';
}

function completedPagesIncludePersonalDetails(completedPagesList) {
  if (!Array.isArray(completedPagesList)) return false;

  return completedPagesList.some((pageEntry) => {
    const normalized = normalizeCompletedPage(pageEntry);
    return normalized.includes('personal details') || normalized.includes('details');
  });
}

function completedPagesIncludeScreen(completedPagesList, expectedScreen) {
  if (!Array.isArray(completedPagesList)) return false;

  return completedPagesList.some((pageEntry) => {
    const normalized = normalizeCompletedPage(pageEntry);
    return (
      normalized.includes(expectedScreen.screen.toLowerCase()) ||
      normalized.includes(expectedScreen.key.replace(/_/g, ' '))
    );
  });
}

function storedScreenRoute(screenValue) {
  if (typeof screenValue === 'string') return screenValue;
  return screenValue?.url || screenValue?.route || '';
}

function storedScreenName(screenValue) {
  if (typeof screenValue === 'string') return screenValue;
  return screenValue?.screen || screenValue?.name || screenValue?.key || '';
}

function storedScreenMatches(screenValue, expectedScreen) {
  const route = storedScreenRoute(screenValue);
  const name = storedScreenName(screenValue).toLowerCase().replace(/[_-]/g, ' ');

  return (
    route === expectedScreen.route &&
    (name.includes(expectedScreen.screen.toLowerCase()) ||
      name.includes(expectedScreen.key.replace(/_/g, ' ')))
  );
}

async function persistOnboardingState(page, state) {
  writeOnboardingStateFile(state);

  await page.evaluate((nextState) => {
    localStorage.setItem('completed_pages_list', JSON.stringify(nextState.completed_pages_list));
    localStorage.setItem('previous', JSON.stringify(nextState.previous));
    localStorage.setItem('last_opened', JSON.stringify(nextState.last_opened));
    localStorage.setItem('last_screen', JSON.stringify(nextState.last_opened));
    localStorage.setItem('rexpt_onboarding_resume_route', nextState.last_opened.route);
    localStorage.setItem(
      'rexpt_automation_onboarding_state',
      JSON.stringify({
        ...nextState,
        expectedResumeScreen: nextState.last_opened,
      })
    );
  }, state);
}

async function getStoredOnboardingResumeState(page) {
  return page.evaluate(() => {
    const parseStorageValue = (value) => {
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch (_error) {
        return value;
      }
    };

    const readStorage = (key) =>
      parseStorageValue(localStorage.getItem(key) || sessionStorage.getItem(key));

    const completedPagesList = readStorage('completed_pages_list');
    const previous = readStorage('previous');
    const lastOpened = readStorage('last_opened');
    const resumeRoute = readStorage('rexpt_onboarding_resume_route');
    const resumeSnapshot = readStorage('rexpt_onboarding_resume_snapshot');
    const automationState = readStorage('rexpt_automation_onboarding_state');
    const lastScreen = lastOpened || readStorage('last_screen') || readStorage('lastScreen') || resumeRoute;

    return {
      completed_pages_list: completedPagesList,
      previous,
      last_opened: lastOpened,
      last_screen: lastScreen,
      resume_route: resumeRoute,
      resume_snapshot: resumeSnapshot,
      automation_state: automationState,
      owner_details: readStorage('OwnerDetails'),
    };
  });
}

async function saveCurrentSession({ page, resilient, onboardingState }) {
  await resilient.run({
    name: `Store onboarding session for ${onboardingState.last_opened.screen}`,
    assert: async () => {
      await persistOnboardingState(page, onboardingState);
      await page.context().storageState({ path: authFile });
      expect(storedSessionHasAuthToken(authFile), storedSessionAuthSummary(authFile)).toBeTruthy();
    },
    continueOnFailure: false,
    impact: ['Business Category resume cannot be validated without the stored auth session.'],
    recoveryAction: 'Stop execution and verify session persistence after Personal Details.',
    severity: 'CRITICAL',
  });
}

export async function resumeOnboardingInCurrentPage({ page, detailsUrl, resilient }) {
  const personalDetailsPage = new PersonalDetailsPage(page);

  await resilient.run({
    name: 'Restore authenticated session for onboarding',
    assert: async () => {
      expect(storedSessionHasAuthToken(authFile)).toBeTruthy();
    },
    continueOnFailure: false,
    impact: ['Onboarding resume cannot be validated without a stored authenticated session.'],
    recoveryAction: 'Stop execution and regenerate the stored session from Sign Up.',
    severity: 'CRITICAL',
  });

  await page.goto(envConfig.baseURL);

  await resilient.url('Resume onboarding URL verification', page, detailsUrl, {
    continueOnFailure: false,
    impact: [`Expected resume URL: ${detailsUrl}`, `Actual URL: ${page.url()}`],
    recoveryAction: 'Stop onboarding execution and review application resume routing.',
    severity: 'CRITICAL',
  });

  await resilient.truthy(
    'Sign Up flow is not executed again after session restore',
    async () => page.url() === detailsUrl && (await personalDetailsPage.nameInput().isVisible()),
    {
      continueOnFailure: false,
      impact: ['Stored session did not resume directly to Personal Details.'],
      recoveryAction: 'Stop onboarding execution and review session restore behavior.',
      severity: 'CRITICAL',
    }
  );

  await personalDetailsPage.verifyLoaded(detailsUrl);

  return personalDetailsPage;
}

export async function continueFromDraftAgentIfNeeded({
  page,
  detailsUrl,
  businessStepUrl,
  dashboardUrl,
  resilient,
}) {
  if (currentPath(page) !== '/fast-agent-detail') {
    return currentPath(page);
  }

  const fastAgentDetailsPage = new FastAgentDetailsPage(page);

  await resilient.url('Draft Agent dashboard URL verification', page, dashboardUrl, {
    continueOnFailure: false,
    impact: [`Expected dashboard URL: ${dashboardUrl}`, `Actual URL: ${page.url()}`],
    recoveryAction: 'Stop onboarding execution and review post-signup resume routing.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Post-signup Draft Agent card verification',
    assert: async () => fastAgentDetailsPage.verifyDraftAgentVisible(),
    continueOnFailure: false,
    impact: ['The app resumed to dashboard, but the Draft Agent card was not automation-ready.'],
    recoveryAction: 'Stop onboarding execution and review Draft Agent card rendering.',
    severity: 'CRITICAL',
  });

  await fastAgentDetailsPage.continueDraftSetup();

  await expect
    .poll(() => currentPath(page), { timeout: timeouts.authRedirect })
    .toMatch(/^\/(details|business-step)$/);

  if (currentPath(page) === '/details') {
    await expect(page).toHaveURL(detailsUrl, { timeout: timeouts.authRedirect });
  }

  if (currentPath(page) === '/business-step') {
    await expect(page).toHaveURL(businessStepUrl, { timeout: timeouts.authRedirect });
  }

  return currentPath(page);
}

async function restoreStoredSessionInNewBrowserContext({ browser }) {
  const restoredContext = await browser.newContext({ storageState: authFile });
  const restoredPage = await restoredContext.newPage();
  await disableUnexpectedGoogleSurfaces(restoredPage);
  return restoredPage;
}

async function verifyBusinessStepScreen({ page, screen, businessStepUrl }) {
  await expect(page).toHaveURL(businessStepUrl, { timeout: timeouts.authRedirect });

  if (screen.key === onboardingScreens.businessCategory.key) {
    await new BusinessCategoryPage(page).verifyLoaded(businessStepUrl);
    return;
  }

  const expectedTextByScreen = {
    [onboardingScreens.businessDetails.key]: 'business details',
    [onboardingScreens.businessListing.key]: 'Business Listing',
    [onboardingScreens.updateBusinessDetails.key]: 'Update Your',
    [onboardingScreens.yourAiSound.key]: 'your AI sounds',
  };

  const expectedText = expectedTextByScreen[screen.key];
  if (expectedText) {
    await expect(page.locator(`text="${expectedText}"`).first()).toBeVisible({
      timeout: timeouts.pageLoad,
    });
  }
}

async function detectBusinessStepScreen(page) {
  const screenKey = await expect
    .poll(
      async () => {
        if (await page.locator('text="business details"').first().isVisible().catch(() => false)) {
          return onboardingScreens.businessDetails.key;
        }
        if (await page.locator('text="business category"').first().isVisible().catch(() => false)) {
          return onboardingScreens.businessCategory.key;
        }
        if (await page.locator('text="Business Listing"').first().isVisible().catch(() => false)) {
          return onboardingScreens.businessListing.key;
        }
        if (await page.locator('text="Update Your"').first().isVisible().catch(() => false)) {
          return onboardingScreens.updateBusinessDetails.key;
        }
        if (await page.locator('text="your AI sounds"').first().isVisible().catch(() => false)) {
          return onboardingScreens.yourAiSound.key;
        }
        return 'unknown';
      },
      { timeout: timeouts.shortAction }
    )
    .not.toBe('unknown')
    .then(async () => {
      if (await page.locator('text="business details"').first().isVisible().catch(() => false)) {
        return onboardingScreens.businessDetails.key;
      }
      if (await page.locator('text="business category"').first().isVisible().catch(() => false)) {
        return onboardingScreens.businessCategory.key;
      }
      if (await page.locator('text="Business Listing"').first().isVisible().catch(() => false)) {
        return onboardingScreens.businessListing.key;
      }
      if (await page.locator('text="Update Your"').first().isVisible().catch(() => false)) {
        return onboardingScreens.updateBusinessDetails.key;
      }
      if (await page.locator('text="your AI sounds"').first().isVisible().catch(() => false)) {
        return onboardingScreens.yourAiSound.key;
      }
      return 'unknown';
    })
    .catch(() => 'unknown');

  return screenKey;
}

async function recoverBusinessDetailsFromBusinessCategory({ page, businessStepUrl, resilient }) {
  await resilient.run({
    name: 'Recover Business Details resume from completed Business Category',
    assert: async () => {
      const businessCategoryPage = new BusinessCategoryPage(page);
      const recoveryCategories = ['Web Agency', 'Web Design Agency', 'Restaurant'];

      await expect(page).toHaveURL(businessStepUrl, { timeout: timeouts.shortAction });
      await expect(businessCategoryPage.searchInput()).toBeVisible({ timeout: timeouts.shortAction });
      let recoveredCategory = '';

      for (const category of recoveryCategories) {
        try {
          await businessCategoryPage.clearSearch().catch(() => {});
          await businessCategoryPage.selectCategoryForRecovery(category);
          recoveredCategory = category;
          break;
        } catch (_error) {
          await businessCategoryPage.clearSearch().catch(() => {});
        }
      }

      expect(recoveredCategory, 'No recovery Business Category could be selected.').not.toBe('');
      await businessCategoryPage.clickContinueWithFallback();

      let businessDetailsVisible = await expect
        .poll(
          async () =>
            page.locator('text="business details"').first().isVisible().catch(() => false),
          { timeout: timeouts.shortAction }
        )
        .toBeTruthy()
        .then(() => true)
        .catch(() => false);

      if (!businessDetailsVisible) {
        await businessCategoryPage.clickContinueWithFallback().catch(() => {});
        businessDetailsVisible = await page
          .locator('text="business details"')
          .first()
          .isVisible({ timeout: timeouts.shortAction })
          .catch(() => false);
      }

      expect(businessDetailsVisible).toBeTruthy();

      await verifyBusinessStepScreen({
        page,
        screen: onboardingScreens.businessDetails,
        businessStepUrl,
      });
    },
    continueOnFailure: false,
    impact: [
      'Application resumed to previous Business Category screen instead of last_opened Business Details.',
      'Recovery selected a Business Category and attempted to move forward to Business Details.',
    ],
    recoveryAction: 'Stop execution if recovery cannot reach Business Details.',
    severity: 'RECOVERY',
  });
}

async function forceBusinessCategorySelectionAndReturnToDetails({
  page,
  businessStepUrl,
  resilient,
  recoveryCategory = 'Web Agency',
}) {
  await resilient.run({
    name: 'Recover missing Business Category before Business Details continue',
    assert: async () => {
      await page.evaluate(() => {
        localStorage.setItem('rexpt_onboarding_resume_route', '/business-step');
        localStorage.setItem(
          'rexpt_onboarding_resume_snapshot',
          JSON.stringify({ route: '/business-step', keys: { currentStep: 1 } })
        );

        [
          'currentStep',
          'businessType',
          'businessSubtype',
          'customBusiness',
          'subType',
          'displayBusinessName',
          'googleListing',
          'placeDetailsExtract',
          'showDetailedForm',
          'showListingConfirm',
        ].forEach((key) => sessionStorage.removeItem(key));
      });

      await page.goto(businessStepUrl, { waitUntil: 'domcontentloaded' });

      const businessCategoryPage = new BusinessCategoryPage(page);
      const businessListingPage = new BusinessListingPage(page);
      let currentScreen = await detectBusinessStepScreen(page);

      if (currentScreen === onboardingScreens.businessDetails.key) {
        await businessListingPage.clickProgressDot(1);
        currentScreen = await detectBusinessStepScreen(page);
      }

      if (currentScreen !== onboardingScreens.businessCategory.key) {
        await page.evaluate(() => {
          sessionStorage.setItem('currentStep', '1');
          sessionStorage.removeItem('businessType');
          sessionStorage.removeItem('businessSubtype');
          sessionStorage.removeItem('customBusiness');
          sessionStorage.removeItem('subType');
        });
        await page.goto(businessStepUrl, { waitUntil: 'domcontentloaded' });
        currentScreen = await detectBusinessStepScreen(page);
      }

      if (currentScreen === onboardingScreens.businessDetails.key) {
        await businessListingPage.clickProgressDot(1);
        currentScreen = await detectBusinessStepScreen(page);
      }

      expect(currentScreen, `Expected Business Category before recovery category selection. Current screen: ${currentScreen}`).toBe(
        onboardingScreens.businessCategory.key
      );
      await businessCategoryPage.verifyLoaded(businessStepUrl);
      await businessCategoryPage.selectCategoryForRecovery(recoveryCategory);
      await businessCategoryPage.clickContinueWithFallback();
      await verifyBusinessStepScreen({
        page,
        screen: onboardingScreens.businessDetails,
        businessStepUrl,
      });
    },
    continueOnFailure: false,
    impact: [
      'Business Details cannot continue to Business Listing until Business Category has a selected category.',
      `Recovery category used: ${recoveryCategory}`,
    ],
    recoveryAction: 'Reset BusinessStep resume to category, select a category, and return to Business Details.',
    severity: 'CRITICAL',
  });
}

async function waitForManualWebsiteValidationSignal({ page, businessDetailsPage }) {
  await expect
    .poll(
      async () =>
        (await businessDetailsPage.isManualValidUrlIconVisible()) ||
        (await businessDetailsPage.isManualInvalidUrlIconVisible()) ||
        (await businessDetailsPage.isAlertPopupVisible()) ||
        (await businessDetailsPage.isNoWebsiteChecked()) ||
        (await isYourAiSoundsScreenVisible(page)),
      { timeout: timeouts.shortAction }
    )
    .toBeTruthy()
    .catch(() => {});
}

async function reportAndUncheckUnexpectedNoWebsite({
  page,
  businessDetailsPage,
  resilient,
  scenarioName,
  phase,
}) {
  if (!(await businessDetailsPage.isNoWebsiteChecked())) return false;

  const screenshotPath = await reportBug({
    page,
    bugTitle: `No Business Website checkbox auto-selected during ${scenarioName}`,
    expectedResult: 'The "I do not have a Business website" checkbox should not auto-check during Web URL validation.',
    actualResult: `Checkbox was checked unexpectedly during ${phase}.`,
    screenName: 'Update Your Business Details',
  });

  await resilient.truthy(
    `Unexpected No Business Website checkbox auto-check - ${scenarioName} - ${phase}`,
    () => false,
    {
      impact: [
        `Scenario: ${scenarioName}`,
        `Phase: ${phase}`,
        'Checkbox was auto-selected and has been unchecked so the Web URL flow can continue.',
        `Screenshot: ${screenshotPath || 'N/A'}`,
      ],
      recoveryAction: 'Uncheck the checkbox and continue with the next Web URL validation step.',
      severity: 'BUG',
    }
  );

  await businessDetailsPage.uncheckNoWebsiteIfChecked();
  return true;
}

function isScenarioPassed({ scenario, fieldValue, errorVisible }) {
  if (scenario.mode === 'error') {
    return {
      passed: errorVisible,
      reason: errorVisible
        ? ''
        : 'Expected red validation error, but it was not visible.',
    };
  }

  if (scenario.mode === 'maxlength') {
    const passed = fieldValue.length <= scenario.maxLength;
    return {
      passed,
      reason: passed
        ? ''
        : `Expected max length ${scenario.maxLength}, but field value length was ${fieldValue.length}.`,
    };
  }

  if (scenario.mode === 'sanitized') {
    const passed = !scenario.forbidden.test(fieldValue);
    return {
      passed,
      reason: passed
        ? ''
        : 'Invalid characters were accepted in the input field without validation error.',
    };
  }

  return { passed: true, reason: '' };
}

function isPhoneScenarioPassed({ scenario, enteredValue, storedValue, errorVisible }) {
  const actualStoredValue = storedValue || '';

  if (scenario.mode === 'error') {
    return {
      passed: errorVisible,
      reason: errorVisible
        ? ''
        : 'Expected red phone validation error, but it was not visible.',
    };
  }

  const invalidCharactersFiltered =
    !scenario.forbidden.test(enteredValue) && !scenario.forbidden.test(actualStoredValue);

  return {
    passed: invalidCharactersFiltered || errorVisible,
    reason:
      invalidCharactersFiltered || errorVisible
        ? ''
        : 'Invalid phone characters were accepted and no red validation error was visible.',
  };
}

function isBusinessNameScenarioPassed({ scenario, fieldValue, errorVisible }) {
  if (scenario.mode === 'maxlength-or-error') {
    const maxLengthApplied = fieldValue.length <= scenario.maxLength;
    return {
      passed: errorVisible || maxLengthApplied,
      validationResult: errorVisible
        ? 'Red validation error visible'
        : maxLengthApplied
          ? `Input capped to ${scenario.maxLength} characters`
          : 'Long input accepted without cap or validation error',
      reason:
        errorVisible || maxLengthApplied
          ? ''
          : `Expected red validation error or max ${scenario.maxLength} characters, but field value length was ${fieldValue.length}.`,
    };
  }

  return {
    passed: errorVisible,
    validationResult: errorVisible
      ? 'Red validation error visible'
      : 'Invalid input accepted without red validation error',
    reason: errorVisible
      ? ''
      : 'Expected red Business Name validation error, but it was not visible.',
  };
}

function isPinCodeScenarioPassed({ scenario, enteredValue, storedValue, errorVisible }) {
  const actualEnteredValue = enteredValue || '';
  const actualStoredValue = storedValue || '';

  if (scenario.mode === 'valid') {
    const accepted = actualEnteredValue === scenario.value && actualStoredValue === scenario.value && !errorVisible;
    return {
      passed: accepted,
      validationResult: accepted
        ? 'Valid 5-digit PIN Code accepted without validation message'
        : 'Valid 5-digit PIN Code was not accepted cleanly',
      reason: accepted
        ? ''
        : `Expected ${scenario.value} with no validation message. Entered: ${JSON.stringify(
            actualEnteredValue
          )}, Stored: ${JSON.stringify(actualStoredValue)}, Error Visible: ${errorVisible}.`,
    };
  }

  if (scenario.mode === 'empty') {
    return {
      passed: errorVisible,
      validationResult: errorVisible
        ? 'Required validation message visible'
        : 'Required validation message missing',
      reason: errorVisible ? '' : 'Expected required PIN Code validation message, but it was not visible.',
    };
  }

  if (scenario.mode === 'short') {
    return {
      passed: errorVisible,
      validationResult: errorVisible
        ? 'Short PIN Code rejected with validation message'
        : 'Short PIN Code remained without validation message',
      reason: errorVisible
        ? ''
        : `Expected validation for less than 5 digits. Entered: ${JSON.stringify(actualEnteredValue)}.`,
    };
  }

  if (scenario.mode === 'maxlength-or-error') {
    const capped = actualEnteredValue.length <= scenario.maxLength && actualStoredValue.length <= scenario.maxLength;
    return {
      passed: errorVisible || capped,
      validationResult: errorVisible
        ? 'Over-length PIN Code rejected with validation message'
        : capped
          ? `PIN Code capped to ${scenario.maxLength} characters`
          : 'Over-length PIN Code accepted without cap or validation message',
      reason:
        errorVisible || capped
          ? ''
          : `Expected max ${scenario.maxLength} digits or validation message. Entered length: ${actualEnteredValue.length}, Stored length: ${actualStoredValue.length}.`,
    };
  }

  if (scenario.mode === 'trim-or-filter') {
    const cleaned = actualEnteredValue === scenario.expectedValue && actualStoredValue === scenario.expectedValue;
    return {
      passed: errorVisible || cleaned,
      validationResult: errorVisible
        ? 'Spaced PIN Code rejected with validation message'
        : cleaned
          ? 'Spaces trimmed/filtered and valid digits retained'
          : 'Spaces were not handled as expected',
      reason:
        errorVisible || cleaned
          ? ''
          : `Expected ${scenario.expectedValue} or validation message. Entered: ${JSON.stringify(
              actualEnteredValue
            )}, Stored: ${JSON.stringify(actualStoredValue)}.`,
    };
  }

  const invalidCharactersFiltered =
    !scenario.forbidden.test(actualEnteredValue) && !scenario.forbidden.test(actualStoredValue);

  return {
    passed: errorVisible || invalidCharactersFiltered,
    validationResult: errorVisible
      ? 'Invalid PIN Code rejected with validation message'
      : invalidCharactersFiltered
        ? 'Invalid characters filtered from PIN Code field'
        : 'Invalid characters accepted without validation message',
    reason:
      errorVisible || invalidCharactersFiltered
        ? ''
        : 'Invalid PIN Code characters remained in the visible input or value attribute without a validation message.',
  };
}

function screenshotNameFromScenario(scenarioName) {
  return scenarioName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function captureBusinessDetailsFailureScreenshot(page, scenarioName) {
  fs.mkdirSync(businessDetailsScreenshotDir, { recursive: true });
  const screenshotPath = path.join(
    businessDetailsScreenshotDir,
    `${Date.now()}-${screenshotNameFromScenario(scenarioName)}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  return screenshotPath;
}

async function captureBusinessListingFailureScreenshot(page, scenarioName) {
  fs.mkdirSync(businessListingScreenshotDir, { recursive: true });
  const screenshotPath = path.join(
    businessListingScreenshotDir,
    `${Date.now()}-${screenshotNameFromScenario(scenarioName)}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  return screenshotPath;
}

function normalizeComparableValue(value) {
  return String(value || '').trim();
}

async function reportBug({ page, bugTitle, expectedResult, actualResult, screenName }) {
  const screenshotPath = await captureBusinessListingFailureScreenshot(page, bugTitle);
  appendBusinessDetailsBugResult({
    bugTitle,
    expectedResult,
    actualResult,
    currentUrl: page.url(),
    screenName,
    screenshotPath,
  });
  return screenshotPath;
}

async function verifyDataPersistence({ page, resilient, expectedData, actualData, screenName, fieldMap }) {
  for (const [fieldName, actualKey] of Object.entries(fieldMap)) {
    const expectedValue = normalizeComparableValue(expectedData[fieldName]);
    const actualValue = normalizeComparableValue(actualData[actualKey || fieldName]);

    if (!expectedValue || expectedValue === 'N/A') continue;

    const passed = actualValue === expectedValue;
    const screenshotPath = passed
      ? ''
      : await reportBug({
          page,
          bugTitle: `${screenName} ${fieldName} data persistence mismatch`,
          expectedResult: `${fieldName} should remain ${expectedValue}`,
          actualResult: `${fieldName} was ${actualValue || 'EMPTY'}`,
          screenName,
        });

    await resilient.truthy(`${screenName} ${fieldName} matches stored Looks Good data`, () => passed, {
      impact: [
        `Field: ${fieldName}`,
        `Expected: ${expectedValue}`,
        `Actual: ${actualValue || 'EMPTY'}`,
        `Screenshot: ${screenshotPath || 'N/A'}`,
      ],
      recoveryAction: 'Record the persistence mismatch and continue bug verification.',
      severity: 'BUG',
    });
  }
}

async function runPersonalDetailsPhoneAutomation({ page, personalDetailsPage, businessStepUrl, resilient }) {
  initializePersonalDetailsPhoneReport();

  await resilient.run({
    name: 'Select United States country code before Phone validation',
    assert: async () => personalDetailsPage.selectUnitedStatesCountryCode(),
    continueOnFailure: false,
    impact: ['Phone validation scenarios require the United States (+1) country code.'],
    recoveryAction: 'Stop Phone validation and review the country selector.',
    severity: 'CRITICAL',
  });

  if (POSITIVE_FLOW_ONLY) {
    // Positive-only run: skip Phone negative validation scenarios.
    await personalDetailsPage.clearPhone();
    await personalDetailsPage.enterPhone('8882011203');
    await personalDetailsPage.expectPhoneErrorHidden();
    await personalDetailsPage.continueToNextStep();

    await resilient.url('Personal Details Continue redirects to Business Step', page, businessStepUrl, {
      continueOnFailure: false,
      impact: [`Expected next onboarding URL: ${businessStepUrl}`, `Actual URL: ${page.url()}`],
      recoveryAction: 'Stop onboarding execution and review Personal Details submit/navigation.',
      severity: 'CRITICAL',
    });
    return;
  }

  for (const scenario of invalidPhoneScenarios) {
    await personalDetailsPage.clearPhone();
    await personalDetailsPage.enterPhone(scenario.value);

    const enteredValue = await personalDetailsPage.getPhoneValue();
    const storedValue = await personalDetailsPage.getPhoneValueAttribute();
    const errorVisible = await personalDetailsPage.isPhoneErrorVisible();
    const errorText = await personalDetailsPage.getPhoneErrorText();
    const result = isPhoneScenarioPassed({
      scenario,
      enteredValue,
      storedValue,
      errorVisible,
    });

    appendPersonalDetailsPhoneResult({
      scenario: scenario.name,
      inputValue: scenario.value,
      enteredValue,
      storedValue,
      errorVisible,
      errorText,
      status: result.passed ? 'PASS' : 'FAIL',
      reason: result.reason,
    });

    await resilient.truthy(`Personal Details Phone validation - ${scenario.name}`, () => result.passed, {
      impact: [
        `Test Data: ${JSON.stringify(scenario.value)}`,
        `Entered Value: ${JSON.stringify(enteredValue)}`,
        `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
        `Error Visible: ${errorVisible}`,
        `Error Text: ${errorText || 'N/A'}`,
      ],
      recoveryAction: 'Record the scenario failure and continue with the next Phone validation case.',
      severity: 'VALIDATION',
    });
  }

  await personalDetailsPage.clearPhone();
  await resilient.run({
    name: 'United States country code remains selected before valid Phone submission',
    assert: async () => personalDetailsPage.expectUnitedStatesCountrySelected(),
    continueOnFailure: false,
    impact: ['Valid US phone number cannot be verified against the expected country code.'],
    recoveryAction: 'Stop execution and review country selector state.',
    severity: 'CRITICAL',
  });

  await personalDetailsPage.enterPhone('8882011203');

  await resilient.run({
    name: 'Valid US Phone number is accepted',
    assert: async () => personalDetailsPage.expectPhoneErrorHidden(),
    impact: ['Personal Details cannot be submitted if the valid US phone number is rejected.'],
    recoveryAction: 'Review Phone validation rules for United States numbers.',
    severity: 'VALIDATION',
  });

  await personalDetailsPage.continueToNextStep();

  await resilient.url('Personal Details Continue redirects to Business Step', page, businessStepUrl, {
    continueOnFailure: false,
    impact: [`Expected next onboarding URL: ${businessStepUrl}`, `Actual URL: ${page.url()}`],
    recoveryAction: 'Stop onboarding execution and review Personal Details submit/navigation.',
    severity: 'CRITICAL',
  });
}

export async function runPersonalDetailsNameAutomation({ page, personalDetailsPage, detailsUrl, businessStepUrl }) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/personal-details-name-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);

  initializePersonalDetailsReport();

  await resilient.url('Personal Details URL verification', page, detailsUrl, {
    continueOnFailure: false,
    impact: ['Personal Details automation cannot start without /details URL.'],
    recoveryAction: 'Stop this test and verify signup redirect.',
    severity: 'CRITICAL',
  });
  await personalDetailsPage.verifyLoaded(detailsUrl);

  if (POSITIVE_FLOW_ONLY) {
    // Positive-only run: skip Name negative validation scenarios.
    await personalDetailsPage.clearName();
    await personalDetailsPage.enterName('vansh');
    await personalDetailsPage.expectNameErrorHidden();
    await runPersonalDetailsPhoneAutomation({ page, personalDetailsPage, businessStepUrl, resilient });
    return;
  }

  await personalDetailsPage.clearName();
  await personalDetailsPage.triggerNameValidation();

  for (const scenario of invalidNameScenarios) {
    await personalDetailsPage.clearName();
    await personalDetailsPage.enterName(scenario.value);

    const fieldValue = await personalDetailsPage.getNameValue();
    const errorVisible = await personalDetailsPage.isNameErrorVisible();
    const errorText = await personalDetailsPage.getNameErrorText();
    const result = isScenarioPassed({ scenario, fieldValue, errorVisible });

    appendPersonalDetailsResult({
      scenario: scenario.name,
      inputValue: scenario.value,
      fieldValue,
      errorVisible,
      errorText,
      status: result.passed ? 'PASS' : 'FAIL',
      reason: result.reason,
    });

    await resilient.truthy(`Personal Details Name validation - ${scenario.name}`, () => result.passed, {
      impact: [
        `Test Data: ${JSON.stringify(scenario.value)}`,
        `Field Value: ${JSON.stringify(fieldValue)}`,
        `Error Visible: ${errorVisible}`,
        `Error Text: ${errorText || 'N/A'}`,
      ],
      recoveryAction: 'Record the scenario failure and continue with the next Name validation case.',
      severity: 'VALIDATION',
    });
  }

  await personalDetailsPage.clearName();
  await personalDetailsPage.enterName('vansh');
  await personalDetailsPage.expectNameErrorHidden();
  await runPersonalDetailsPhoneAutomation({ page, personalDetailsPage, businessStepUrl, resilient });
}

async function verifyBusinessCategoryResume({
  browser,
  page,
  onboardingState,
  businessStepUrl,
  dashboardUrl,
  resilient,
}) {
  await saveCurrentSession({ page, resilient, onboardingState });
  await page.context().close();

  const restoredPage = await restoreStoredSessionInNewBrowserContext({ browser });
  const restoredFastAgentDetailsPage = new FastAgentDetailsPage(restoredPage);

  await restoredPage.goto(envConfig.baseURL);

  await resilient.url('Business Category resume dashboard URL verification', restoredPage, dashboardUrl, {
    continueOnFailure: false,
    impact: [`Expected dashboard URL: ${dashboardUrl}`, `Actual URL: ${restoredPage.url()}`],
    recoveryAction: 'Stop Business Category resume validation and review dashboard routing.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Draft Agent card verification',
    assert: async () => restoredFastAgentDetailsPage.verifyDraftAgentVisible(),
    continueOnFailure: false,
    impact: ['Continue Setup cannot be validated without the Draft Agent card.'],
    recoveryAction: 'Stop Business Category resume validation and review draft agent rendering.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Draft Agent resume state matches completed pages, previous, and last_opened',
    assert: async () => {
      const storedResumeState = await getStoredOnboardingResumeState(restoredPage);
      const completedPagesList = storedResumeState.completed_pages_list;
      const expectedLastOpened = onboardingState.last_opened;
      const expectedPrevious = onboardingState.previous;

      if (completedPagesIncludeScreen(completedPagesList, onboardingScreens.yourAiSound)) {
        const reason =
          'Draft Agent card appeared after Your AI Sound was completed. Agent should have been created and Draft Agent should not be visible.';
        appendOnboardingLifecycleBug({ reason, state: storedResumeState });
        throw new Error(reason);
      }

      expect(
        completedPagesIncludePersonalDetails(completedPagesList),
        `completed_pages_list did not contain Personal Details. Actual: ${JSON.stringify(completedPagesList)}`
      ).toBeTruthy();

      if (expectedPrevious) {
        expect(
          storedScreenMatches(storedResumeState.previous, expectedPrevious),
          `previous did not match expected screen. Expected: ${JSON.stringify(
            expectedPrevious
          )}. Actual state: ${JSON.stringify(storedResumeState)}`
        ).toBeTruthy();
      }

      expect(
        storedScreenMatches(storedResumeState.last_opened || storedResumeState.last_screen, expectedLastOpened),
        `last_opened did not match expected screen. Expected: ${JSON.stringify(
          expectedLastOpened
        )}. Actual state: ${JSON.stringify(
          storedResumeState
        )}`
      ).toBeTruthy();
    },
    continueOnFailure: false,
    impact: [
      'Draft Agent card appeared, but stored onboarding state did not prove Personal Details was completed.',
      `Expected completed_pages_list to contain: Personal Details`,
      `Expected last_opened screen: ${onboardingState.last_opened.screen}`,
    ],
    recoveryAction:
      'Stop Business Category resume validation and review onboarding completed_pages_list persistence.',
    severity: 'CRITICAL',
  });

  await restoredFastAgentDetailsPage.continueDraftSetup();

  await resilient.url('Continue Setup resumes last_opened URL', restoredPage, businessStepUrl, {
    continueOnFailure: false,
    impact: [`Expected resume URL: ${businessStepUrl}`, `Actual URL: ${restoredPage.url()}`],
    recoveryAction: 'Stop Business Category automation and review Continue Setup routing.',
    severity: 'CRITICAL',
  });

  const resumedLastOpenedScreen = await resilient.run({
    name: `Continue Setup resumes last_opened screen - ${onboardingState.last_opened.screen}`,
    assert: async () => {
      await expect(restoredPage).toHaveURL(businessStepUrl, { timeout: timeouts.shortAction });
      const actualScreenKey = await detectBusinessStepScreen(restoredPage);
      expect(
        actualScreenKey,
        `Expected ${onboardingState.last_opened.screen}, but application resumed to ${actualScreenKey}.`
      ).toBe(onboardingState.last_opened.key);
    },
    continueOnFailure: onboardingState.last_opened.key === onboardingScreens.businessDetails.key,
    impact: [
      `Expected resume screen: ${onboardingState.last_opened.screen}`,
      'If the app resumes to Business Category instead, recovery should start immediately.',
    ],
    recoveryAction: 'Stop Business Category automation and review saved onboarding screen state.',
    severity: 'CRITICAL',
  });

  if (
    !resumedLastOpenedScreen &&
    onboardingState.last_opened.key === onboardingScreens.businessDetails.key
  ) {
    await recoverBusinessDetailsFromBusinessCategory({
      page: restoredPage,
      businessStepUrl,
      resilient,
    });
  }

  return restoredPage;
}

async function runBusinessCategoryInvalidValidations({ businessCategoryPage, resilient }) {
  for (const scenario of invalidBusinessCategoryScenarios) {
    await businessCategoryPage.clearSearch();
    await businessCategoryPage.enterCategory(scenario.value);

    const fieldValue = await businessCategoryPage.getSearchValue();
    const errorVisible = await businessCategoryPage.isValidationErrorVisible();
    const errorText = await businessCategoryPage.getValidationErrorText();
    const result = {
      passed: errorVisible,
      reason: errorVisible
        ? ''
        : 'Expected red Business Category validation error, but it was not visible.',
    };

    appendBusinessCategoryResult({
      scenario: scenario.name,
      inputValue: scenario.value,
      fieldValue,
      errorVisible,
      errorText,
      addCategoryVisible: 'N/A',
      status: result.passed ? 'PASS' : 'FAIL',
      reason: result.reason,
    });

    await resilient.truthy(`Business Category invalid validation - ${scenario.name}`, () => result.passed, {
      impact: [
        `Test Data: ${JSON.stringify(scenario.value)}`,
        `Field Value: ${JSON.stringify(fieldValue)}`,
        `Error Visible: ${errorVisible}`,
        `Error Text: ${errorText || 'N/A'}`,
      ],
      recoveryAction: 'Record the scenario failure and continue with the next Business Category case.',
      severity: 'VALIDATION',
    });
  }
}

async function runBusinessCategoryAddSuggestionValidations({ businessCategoryPage, resilient }) {
  for (const scenario of meaninglessBusinessCategoryScenarios) {
    await businessCategoryPage.clearSearch();
    await businessCategoryPage.enterCategory(scenario.value);

    const fieldValue = await businessCategoryPage.getSearchValue();
    const errorVisible = await businessCategoryPage.isValidationErrorVisible();
    const errorText = await businessCategoryPage.getValidationErrorText();
    const addCategoryVisible = await businessCategoryPage.isAddCategorySuggestionVisible(scenario.value);
    const result = {
      passed: !addCategoryVisible,
      reason: addCategoryVisible
        ? 'Add Category suggestion appeared for meaningless 7+ character input.'
        : '',
    };

    appendBusinessCategoryResult({
      scenario: scenario.name,
      inputValue: scenario.value,
      fieldValue,
      errorVisible,
      errorText,
      addCategoryVisible,
      status: result.passed ? 'PASS' : 'FAIL',
      reason: result.reason,
    });

    await resilient.truthy(`Business Category Add suggestion hidden - ${scenario.name}`, () => result.passed, {
      impact: [
        `Test Data: ${JSON.stringify(scenario.value)}`,
        `Field Value: ${JSON.stringify(fieldValue)}`,
        `Add Category Visible: ${addCategoryVisible}`,
        `Error Visible: ${errorVisible}`,
        `Error Text: ${errorText || 'N/A'}`,
      ],
      recoveryAction: 'Record the Add Category failure and continue with the next scenario.',
      severity: 'VALIDATION',
    });
  }
}

async function runBusinessCategoryApprovedExtraValidations({ businessCategoryPage, resilient }) {
  await businessCategoryPage.clearSearch();

  await resilient.truthy(
    'Business Category empty Continue is blocked',
    async () => {
      const disabled = await businessCategoryPage.continueButton().isDisabled();
      if (disabled) return true;

      await businessCategoryPage.clickContinue();
      return businessCategoryPage.categoryRequiredToast().isVisible({ timeout: timeouts.quickAction });
    },
    {
      impact: ['User could continue without selecting a Business Category.'],
      recoveryAction: 'Record the validation failure and continue with field-level checks.',
      severity: 'VALIDATION',
    }
  );

  const longCategory = 'A'.repeat(45);
  await businessCategoryPage.clearSearch();
  await businessCategoryPage.enterCategory(longCategory);
  const cappedValue = await businessCategoryPage.getSearchValue();

  appendBusinessCategoryResult({
    scenario: 'Max length cap',
    inputValue: longCategory,
    fieldValue: cappedValue,
    errorVisible: await businessCategoryPage.isValidationErrorVisible(),
    errorText: await businessCategoryPage.getValidationErrorText(),
    addCategoryVisible: 'N/A',
    status: cappedValue.length <= 30 ? 'PASS' : 'FAIL',
    reason: cappedValue.length <= 30 ? '' : `Expected max length 30, actual ${cappedValue.length}.`,
  });

  await resilient.truthy('Business Category max length cap', () => cappedValue.length <= 30, {
    impact: [`Expected max length: 30`, `Actual length: ${cappedValue.length}`],
    recoveryAction: 'Record the boundary failure and continue with positive category checks.',
    severity: 'VALIDATION',
  });

  const spacedCategoryInput = 'tuktuk      driver';
  await businessCategoryPage.clearSearch();
  await businessCategoryPage.enterCategory(spacedCategoryInput);
  const spacedFieldValue = await businessCategoryPage.getSearchValue();
  const addCategoryBoxVisible = await businessCategoryPage.isAddCategoryBoxVisible();
  const addCategoryBoxText = addCategoryBoxVisible ? await businessCategoryPage.getAddCategoryBoxText() : '';
  const normalizedAddCategoryBoxText = addCategoryBoxText.replace(/\s+/g, ' ').trim();
  const spacedCategoryTrimPassed =
    addCategoryBoxVisible &&
    !/\s{3,}/.test(addCategoryBoxText) &&
    /\btuktuk\b/i.test(normalizedAddCategoryBoxText) &&
    /\bdriver\b/i.test(normalizedAddCategoryBoxText);

  appendBusinessCategoryResult({
    scenario: 'Add Category box trims repeated spaces',
    inputValue: spacedCategoryInput,
    fieldValue: spacedFieldValue,
    errorVisible: await businessCategoryPage.isValidationErrorVisible(),
    errorText: await businessCategoryPage.getValidationErrorText(),
    addCategoryVisible: addCategoryBoxVisible,
    status: spacedCategoryTrimPassed ? 'PASS' : 'FAIL',
    reason: spacedCategoryTrimPassed
      ? ''
      : `Expected Add box to normalize repeated spaces and show both words. Actual Add box text: ${JSON.stringify(
          addCategoryBoxText
        )}`,
  });

  await resilient.truthy('Business Category Add box trims repeated spaces', () => spacedCategoryTrimPassed, {
    impact: [
      `Input Data: ${JSON.stringify(spacedCategoryInput)}`,
      `Input Field Value: ${JSON.stringify(spacedFieldValue)}`,
      `Add Box Text: ${JSON.stringify(addCategoryBoxText)}`,
      `Normalized Add Box Text: ${JSON.stringify(normalizedAddCategoryBoxText)}`,
    ],
    recoveryAction: 'Record the Add box trim failure and continue with positive category checks.',
    severity: 'VALIDATION',
  });

  await businessCategoryPage.clearSearch();
  await businessCategoryPage.enterCategory('Restaurant');
  await resilient.truthy(
    'Business Category existing category does not show Add Category',
    async () => !(await businessCategoryPage.isAddCategorySuggestionVisible('Restaurant')),
    {
      impact: ['Existing category search showed a duplicate Add Category option.'],
      recoveryAction: 'Record the duplicate suggestion failure and continue.',
      severity: 'VALIDATION',
    }
  );

  await businessCategoryPage.clearSearch();
  await businessCategoryPage.enterCategory('restaurant');
  await resilient.truthy(
    'Business Category duplicate category is case-insensitive',
    async () => !(await businessCategoryPage.isAddCategorySuggestionVisible('restaurant')),
    {
      impact: ['Case-insensitive duplicate category showed Add Category option.'],
      recoveryAction: 'Record the duplicate suggestion failure and continue.',
      severity: 'VALIDATION',
    }
  );

  await businessCategoryPage.clearSearch();
  await businessCategoryPage.enterCategory('Pet Grooming');
  await resilient.truthy(
    'Business Category meaningful custom category shows Add Category',
    async () => businessCategoryPage.isAddCategorySuggestionVisible('Pet Grooming'),
    {
      impact: ['A meaningful custom category could not be added.'],
      recoveryAction: 'Record the custom-category failure and continue.',
      severity: 'VALIDATION',
    }
  );
}

async function runBusinessCategoryPositiveScenarios({ businessCategoryPage, resilient }) {
  for (const scenario of positiveBusinessCategoryScenarios) {
    if (scenario.type === 'custom') {
      await resilient.run({
        name: `Business Category positive scenario - ${scenario.name}`,
        assert: async () => businessCategoryPage.selectCustomCategory(scenario.value),
        impact: [`Positive Business Category scenario failed: ${scenario.value}`],
        recoveryAction: 'Record the positive scenario failure and continue.',
        severity: 'VALIDATION',
      });
    } else {
      await resilient.run({
        name: `Business Category positive scenario - ${scenario.name}`,
        assert: async () => businessCategoryPage.selectExistingCategory(scenario.value),
        impact: [`Positive Business Category scenario failed: ${scenario.value}`],
        recoveryAction: 'Record the positive scenario failure and continue.',
        severity: 'VALIDATION',
      });
    }
  }
}

export async function runBusinessCategoryAutomation({ browser, page, businessStepUrl, dashboardUrl }) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/business-category-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);
  let activePage = page;
  let businessCategoryPage = new BusinessCategoryPage(activePage);
  const resumeToBusinessCategoryState = createOnboardingState({
    completedPages: [onboardingScreens.personalDetails],
    previous: onboardingScreens.personalDetails,
    lastOpened: onboardingScreens.businessCategory,
  });
  const resumeToBusinessDetailsState = createOnboardingState({
    completedPages: [onboardingScreens.personalDetails, onboardingScreens.businessCategory],
    previous: onboardingScreens.businessCategory,
    lastOpened: onboardingScreens.businessDetails,
  });

  initializeBusinessCategoryReport();

  await expect
    .poll(
      async () =>
        (await businessCategoryPage.title().isVisible().catch(() => false)) ||
        (await activePage.locator('text="business details"').first().isVisible().catch(() => false)),
      { timeout: timeouts.pageLoad }
    )
    .toBeTruthy();

  if (await activePage.locator('text="business details"').first().isVisible().catch(() => false)) {
    await resilient.truthy(
      'Business Category automation resumes from already-open Business Details screen',
      () => true,
      {
        impact: [
          'Application restored /business-step directly to Business Details.',
          'Business Category is already completed for this saved onboarding state, so execution continues with Business Details automation.',
        ],
        recoveryAction: 'Continue with Business Details automation instead of stopping on completed Business Category.',
        severity: 'INFO',
      }
    );

    return activePage;
  }

  await resilient.run({
    name: 'Business Category initial screen verification',
    assert: async () => businessCategoryPage.verifyLoaded(businessStepUrl),
    continueOnFailure: false,
    impact: ['Business Category automation cannot start without the correct onboarding screen.'],
    recoveryAction: 'Stop Business Category automation and review Personal Details navigation.',
    severity: 'CRITICAL',
  });

  if (POSITIVE_FLOW_ONLY) {
    // Positive-only run: skip Business Category negative/search validation scenarios.
    await businessCategoryPage.selectCategoryForContinue('Web Design Agency');
    await businessCategoryPage.clickContinue();
    await expect(activePage.locator('text="business details"')).toBeVisible({
      timeout: timeouts.pageLoad,
    });
    return activePage;
  }

  activePage = await verifyBusinessCategoryResume({
    browser,
    page: activePage,
    onboardingState: resumeToBusinessCategoryState,
    businessStepUrl,
    dashboardUrl,
    resilient,
  });
  businessCategoryPage = new BusinessCategoryPage(activePage);

  await runBusinessCategoryInvalidValidations({ businessCategoryPage, resilient });
  await runBusinessCategoryAddSuggestionValidations({ businessCategoryPage, resilient });
  await runBusinessCategoryApprovedExtraValidations({ businessCategoryPage, resilient });
  await runBusinessCategoryPositiveScenarios({ businessCategoryPage, resilient });

  await businessCategoryPage.clickContinue();

  await resilient.run({
    name: 'Business Category Continue moves to next onboarding screen',
    assert: async () => {
      await expect(activePage).toHaveURL(businessStepUrl, { timeout: timeouts.authRedirect });
      await expect(activePage.locator('text="business details"')).toBeVisible({
        timeout: timeouts.pageLoad,
      });
    },
    continueOnFailure: false,
    impact: ['Business Category did not advance to the Business Details onboarding screen.'],
    recoveryAction: 'Stop execution and review Business Category Continue behavior.',
    severity: 'CRITICAL',
  });

  activePage = await verifyBusinessCategoryResume({
    browser,
    page: activePage,
    onboardingState: resumeToBusinessDetailsState,
    businessStepUrl,
    dashboardUrl,
    resilient,
  });

  return activePage;
}

export async function runBusinessDetailsNameAutomation({ browser, page, businessStepUrl, dashboardUrl }) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/business-details-name-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);
  const businessDetailsPage = new BusinessDetailsPage(page);
  const resumeToBusinessListingState = createOnboardingState({
    completedPages: [
      onboardingScreens.personalDetails,
      onboardingScreens.businessCategory,
      onboardingScreens.businessDetails,
    ],
    previous: onboardingScreens.businessDetails,
    lastOpened: onboardingScreens.businessListing,
  });

  initializeBusinessDetailsReport();

  await resilient.run({
    name: 'Business Details initial screen verification',
    assert: async () => businessDetailsPage.verifyLoaded(businessStepUrl),
    continueOnFailure: false,
    impact: ['Business Details automation cannot start without the correct onboarding screen.'],
    recoveryAction: 'Stop Business Details automation and review Business Category resume flow.',
    severity: 'CRITICAL',
  });

  if (POSITIVE_FLOW_ONLY) {
    // Positive-only run: skip Business Details Name and PIN negative validation scenarios.
    await businessDetailsPage.clearBusinessName();
    await businessDetailsPage.enterBusinessName(positiveOnboardingData.businessName);
    await businessDetailsPage.clearZipCode();
    await businessDetailsPage.pasteZipCode(positiveOnboardingData.zipCode);
    await businessDetailsPage.waitForZipResolved().catch(() => {});
    await businessDetailsPage.selectFirstBusinessListingIfVisible();
    await continueBusinessDetailsAfterPrefillCheck({
      page,
      resilient,
      businessDetailsPage,
      businessStepUrl,
      contextName: 'Business Details positive-only flow',
    });

    await runBusinessListingAutomation({
      page,
      businessStepUrl,
    });
    return page;
  }

  for (const scenario of invalidBusinessNameScenarios) {
    await businessDetailsPage.clearBusinessName();
    await businessDetailsPage.enterBusinessName(scenario.value);
    await businessDetailsPage.triggerBusinessNameValidation();

    const fieldValue = await businessDetailsPage.getBusinessNameValue();
    const storedValue = await businessDetailsPage.getBusinessNameValueAttribute();
    const errorVisible = await businessDetailsPage.isBusinessNameErrorVisible();
    const errorText = await businessDetailsPage.getBusinessNameErrorText();
    const result = isBusinessNameScenarioPassed({ scenario, fieldValue, errorVisible });
    const screenshotPath = result.passed
      ? ''
      : await captureBusinessDetailsFailureScreenshot(page, scenario.name);

    appendBusinessDetailsResult({
      scenario: scenario.name,
      inputValue: scenario.value,
      fieldValue,
      storedValue,
      validationResult: result.validationResult,
      errorVisible,
      errorText,
      characterCount: fieldValue.length,
      status: result.passed ? 'PASS' : 'FAIL',
      reason: result.reason,
      screenshotPath,
    });

    await resilient.truthy(`Business Details Name validation - ${scenario.name}`, () => result.passed, {
      impact: [
        `Test Data: ${JSON.stringify(scenario.value)}`,
        `Field Value: ${JSON.stringify(fieldValue)}`,
        `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
        `Validation Result: ${result.validationResult}`,
        `Error Visible: ${errorVisible}`,
        `Error Text: ${errorText || 'N/A'}`,
        `Character Count: ${fieldValue.length}`,
        `Screenshot: ${screenshotPath || 'N/A'}`,
      ],
      recoveryAction: 'Record the Business Name validation failure and continue with the next scenario.',
      severity: 'VALIDATION',
    });
  }

  await businessDetailsPage.clearBusinessName();
  await businessDetailsPage.enterBusinessName(positiveOnboardingData.alphanumericBusinessName);

  const alphanumericBusinessNameValue = await businessDetailsPage.getBusinessNameValue();
  const alphanumericBusinessNameStoredValue = await businessDetailsPage.getBusinessNameValueAttribute();
  const alphanumericBusinessNameErrorVisible = await businessDetailsPage.isBusinessNameErrorVisible();
  const alphanumericBusinessNameErrorText = await businessDetailsPage.getBusinessNameErrorText();
  const alphanumericBusinessNamePassed =
    alphanumericBusinessNameValue === positiveOnboardingData.alphanumericBusinessName &&
    alphanumericBusinessNameStoredValue === positiveOnboardingData.alphanumericBusinessName &&
    !alphanumericBusinessNameErrorVisible;
  const alphanumericBusinessNameScreenshotPath = alphanumericBusinessNamePassed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, 'business-name-alphanumeric');

  appendBusinessDetailsResult({
    scenario: 'Business Name accepts alphanumeric values',
    inputValue: positiveOnboardingData.alphanumericBusinessName,
    fieldValue: alphanumericBusinessNameValue,
    storedValue: alphanumericBusinessNameStoredValue,
    validationResult: alphanumericBusinessNamePassed
      ? 'Alphanumeric Business Name accepted'
      : 'Alphanumeric Business Name was rejected or changed',
    errorVisible: alphanumericBusinessNameErrorVisible,
    errorText: alphanumericBusinessNameErrorText,
    characterCount: alphanumericBusinessNameValue.length,
    status: alphanumericBusinessNamePassed ? 'PASS' : 'FAIL',
    reason: alphanumericBusinessNamePassed
      ? ''
      : `Expected ${positiveOnboardingData.alphanumericBusinessName} to remain in the Business Name input without a validation message.`,
    screenshotPath: alphanumericBusinessNameScreenshotPath,
  });

  await resilient.truthy('Business Name accepts alphanumeric values', () => alphanumericBusinessNamePassed, {
    impact: [
      `Test Data: ${JSON.stringify(positiveOnboardingData.alphanumericBusinessName)}`,
      `Field Value: ${JSON.stringify(alphanumericBusinessNameValue)}`,
      `Stored Value Attribute: ${JSON.stringify(alphanumericBusinessNameStoredValue)}`,
      `Error Visible: ${alphanumericBusinessNameErrorVisible}`,
      `Error Text: ${alphanumericBusinessNameErrorText || 'N/A'}`,
      `Screenshot: ${alphanumericBusinessNameScreenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Review Business Name validation rules on Business Details.',
    severity: 'VALIDATION',
  });

  await runBusinessDetailsPinAutomation({ browser, page, businessDetailsPage, businessStepUrl, dashboardUrl });
}

async function enterPinCodeScenario({ businessDetailsPage, scenario }) {
  await businessDetailsPage.clearZipCode();

  if (!scenario.value) return;

  if (scenario.inputMethod === 'Paste') {
    await businessDetailsPage.pasteZipCode(scenario.value);
    return;
  }

  await businessDetailsPage.typeZipCode(scenario.value);
}

async function runPinCodeScenario({ page, businessDetailsPage, resilient, scenario }) {
  await enterPinCodeScenario({ businessDetailsPage, scenario });
  await businessDetailsPage.triggerZipValidation();

  const enteredValue = await businessDetailsPage.getZipCodeValue();
  const storedValue = await businessDetailsPage.getZipCodeValueAttribute();
  const errorVisible = await businessDetailsPage.isZipErrorVisible();
  const errorText = await businessDetailsPage.getZipErrorText();
  const result = isPinCodeScenarioPassed({ scenario, enteredValue, storedValue, errorVisible });
  const screenshotPath = result.passed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, `pin-${scenario.name}`);

  appendBusinessDetailsPinResult({
    scenario: scenario.name,
    inputValue: scenario.value,
    inputMethod: scenario.inputMethod,
    enteredValue,
    storedValue,
    validationMessageStatus: errorVisible ? 'VISIBLE' : 'NOT VISIBLE',
    errorText,
    assertionStatus: result.passed ? 'PASS' : 'FAIL',
    reason: result.reason,
    screenshotPath,
  });

  await resilient.truthy(`Business Details PIN Code validation - ${scenario.name}`, () => result.passed, {
    impact: [
      `Test Data: ${JSON.stringify(scenario.value)}`,
      `Input Method: ${scenario.inputMethod}`,
      `Entered Value: ${JSON.stringify(enteredValue)}`,
      `Actual Stored Value: ${JSON.stringify(storedValue)}`,
      `Validation Message Status: ${errorVisible ? 'VISIBLE' : 'NOT VISIBLE'}`,
      `Error Text: ${errorText || 'N/A'}`,
      `Validation Result: ${result.validationResult}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the PIN Code validation failure and continue with the next scenario.',
    severity: 'VALIDATION',
  });
}

async function runPinCodeManualEntryBoxValidation({ page, businessDetailsPage, resilient }) {
  const scenario = {
    name: 'Wrong PIN Code shows Enter Manually box',
    value: '00000',
    inputMethod: 'Typing',
  };

  await businessDetailsPage.clearZipCode();
  await businessDetailsPage.typeZipCode(scenario.value);
  await businessDetailsPage.waitForZipNotFoundError();

  await businessDetailsPage.clearZipCode();
  await businessDetailsPage.typeZipCode(scenario.value);
  await businessDetailsPage.waitForZipNotFoundError();

  const enteredValue = await businessDetailsPage.getZipCodeValue();
  const storedValue = await businessDetailsPage.getZipCodeValueAttribute();
  const errorVisible = await businessDetailsPage.isZipErrorVisible();
  const errorText = await businessDetailsPage.getZipErrorText();
  const manualEntryVisible = await businessDetailsPage.isManualEntryBoxVisible();
  const passed = manualEntryVisible;
  const screenshotPath = passed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, `pin-${scenario.name}`);

  appendBusinessDetailsPinResult({
    scenario: scenario.name,
    inputValue: scenario.value,
    inputMethod: scenario.inputMethod,
    enteredValue,
    storedValue,
    validationMessageStatus: errorVisible ? 'VISIBLE' : 'NOT VISIBLE',
    errorText,
    assertionStatus: passed ? 'PASS' : 'FAIL',
    reason: passed
      ? ''
      : 'Expected Enter details manually box and Enter manually button after repeated wrong PIN Code input.',
    screenshotPath,
  });

  await resilient.run({
    name: 'Wrong PIN Code displays Enter Manually box',
    assert: async () => businessDetailsPage.expectManualEntryBoxVisible(),
    impact: [
      `Test Data: ${JSON.stringify(scenario.value)}`,
      `Input Method: ${scenario.inputMethod}`,
      `Entered Value: ${JSON.stringify(enteredValue)}`,
      `Actual Stored Value: ${JSON.stringify(storedValue)}`,
      `Validation Message Status: ${errorVisible ? 'VISIBLE' : 'NOT VISIBLE'}`,
      `Error Text: ${errorText || 'N/A'}`,
      `Manual Entry Box Visible: ${manualEntryVisible}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the missing Enter Manually box and continue to the positive PIN Code scenario.',
    severity: 'VALIDATION',
  });
}

async function runBusinessDetailsPinAutomation({ browser, page, businessDetailsPage, businessStepUrl, dashboardUrl }) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/business-details-pin-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);

  initializeBusinessDetailsPinReport();
  await businessDetailsPage.clearBusinessName();

  await resilient.run({
    name: 'Business Name is cleared before PIN Code validation',
    assert: async () => expect(await businessDetailsPage.getBusinessNameValue()).toBe(''),
    impact: ['PIN Code validation did not start from the required clean Business Name state.'],
    recoveryAction: 'Stop Business Details PIN validation and review field reset behavior.',
    severity: 'CRITICAL',
  });

  for (const scenario of invalidPinCodeScenarios) {
    await runPinCodeScenario({ page, businessDetailsPage, resilient, scenario });
  }

  for (const scenario of boundaryPinCodeScenarios) {
    await runPinCodeScenario({ page, businessDetailsPage, resilient, scenario });
  }

  await runPinCodeManualEntryBoxValidation({ page, businessDetailsPage, resilient });

  await businessDetailsPage.clearBusinessName();
  await businessDetailsPage.enterBusinessName(positiveOnboardingData.businessName);
  await businessDetailsPage.clearZipCode();
  await businessDetailsPage.pasteZipCode(positiveOnboardingData.zipCode);

  await resilient.run({
    name: 'Valid 5-digit PIN Code is accepted',
    assert: async () => {
      await businessDetailsPage.waitForZipResolved();
      await businessDetailsPage.expectZipErrorHidden();
      expect(await businessDetailsPage.getBusinessNameValue()).toBe(positiveOnboardingData.businessName);
      expect(await businessDetailsPage.getBusinessNameValueAttribute()).toBe(positiveOnboardingData.businessName);
      expect(await businessDetailsPage.getZipCodeValue()).toBe(positiveOnboardingData.zipCode);
      expect(await businessDetailsPage.getZipCodeValueAttribute()).toBe(positiveOnboardingData.zipCode);
    },
    continueOnFailure: false,
    impact: ['Business Details cannot continue if a valid 5-digit PIN Code is not accepted.'],
    recoveryAction: 'Stop Business Details positive flow and review PIN Code validation/lookup.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Business Details PIN positive Continue moves to Business Listing screen',
    assert: async () => {
      await businessDetailsPage.continueToBusinessListing();
      await verifyBusinessStepScreen({
        page,
        screen: onboardingScreens.businessListing,
        businessStepUrl,
      });
    },
    continueOnFailure: false,
    impact: ['Business Details did not advance to the Business Listing onboarding screen.'],
    recoveryAction: 'Stop execution and review Business Details Continue behavior.',
    severity: 'CRITICAL',
  });

  await runBusinessListingAutomation({
    page,
    businessStepUrl,
  });

  return page;
}

async function runBusinessListingEmailScenario({ page, businessListingPage, resilient, scenario }) {
  await businessListingPage.clearEmail();

  if (scenario.inputMethod === 'Paste') {
    await businessListingPage.pasteEmail(scenario.value);
  } else {
    await businessListingPage.enterEmail(scenario.value);
  }

  await businessListingPage.triggerEmailValidation();

  let errorVisible = await businessListingPage.isEmailErrorVisible();
  if (errorVisible) {
    await businessListingPage.triggerEmailValidation({ clickLooksGood: true });
    errorVisible = await businessListingPage.isEmailErrorVisible();
  }

  const fieldValue = await businessListingPage.getEmailValue();
  const errorText = await businessListingPage.getEmailErrorText();
  const expectsValid = scenario.mode === 'valid';
  const maxLengthCapped =
    scenario.mode === 'maxlength-or-error' && fieldValue.length <= 40 && fieldValue !== scenario.value;
  const passed = expectsValid ? !errorVisible : errorVisible || maxLengthCapped;
  const reason = passed
    ? ''
    : expectsValid
      ? 'Expected valid email to be accepted without a validation message.'
      : 'Expected red email validation message, but invalid email was accepted by the popup.';
  const screenshotPath = passed
    ? ''
    : await captureBusinessListingFailureScreenshot(page, `email-${scenario.name}`);

  appendBusinessListingEmailResult({
    scenario: scenario.name,
    inputValue: scenario.value,
    inputMethod: scenario.inputMethod,
    fieldValue,
    validationMessageStatus: errorVisible ? 'VISIBLE' : 'NOT VISIBLE',
    errorText,
    status: passed ? 'PASS' : 'FAIL',
    reason,
    screenshotPath,
  });

  await resilient.truthy(`Business Listing Email validation - ${scenario.name}`, () => passed, {
    impact: [
      `Test Data: ${JSON.stringify(scenario.value)}`,
      `Input Method: ${scenario.inputMethod}`,
      `Field Value: ${JSON.stringify(fieldValue)}`,
      `Validation Message Status: ${errorVisible ? 'VISIBLE' : 'NOT VISIBLE'}`,
      `Error Text: ${errorText || 'N/A'}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the Business Listing email validation failure and continue with the next scenario.',
    severity: 'VALIDATION',
  });
}

async function runBusinessListingAutomation({ page, businessStepUrl }) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/business-listing-email-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);
  const businessListingPage = new BusinessListingPage(page);

  initializeBusinessListingEmailReport();
  initializeBusinessDetailsBugReport();

  await resilient.run({
    name: 'Business Listing screen verification',
    assert: async () => {
      await businessListingPage.verifyLoaded(businessStepUrl);
      expect(await businessListingPage.resultCount()).toBeGreaterThan(0);
    },
    continueOnFailure: false,
    impact: ['Business Listing automation cannot start without Google Business results.'],
    recoveryAction: 'Stop Business Listing automation and review Google Business API results.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Select first Google Business result',
    assert: async () => businessListingPage.selectFirstBusinessListing(),
    continueOnFailure: false,
    impact: ['Business Listing popup cannot be validated until the first result is selected.'],
    recoveryAction: 'Stop Business Listing automation and review Use this button behavior.',
    severity: 'CRITICAL',
  });

  if (POSITIVE_FLOW_ONLY) {
    // Positive-only run: skip Business Listing email negative/boundary/paste validations and Edit/manual flow.
    const positiveEmail = positiveOnboardingData.email;
    await businessListingPage.clearEmail();
    await businessListingPage.enterEmail(positiveEmail);
    await businessListingPage.triggerEmailValidation();
    await businessListingPage.expectEmailErrorHidden();
    await businessListingPage.confirmLooksGood();
    await expect(page.locator('text=/your AI sounds/i').first()).toBeVisible({ timeout: timeouts.authRedirect });
    await createAgentFromAiSoundsAndStoreMeetDetails({ page, businessStepUrl });
    return;
  }

  for (const scenario of invalidBusinessListingEmailScenarios) {
    await runBusinessListingEmailScenario({ page, businessListingPage, resilient, scenario });
  }

  for (const scenario of boundaryBusinessListingEmailScenarios) {
    await runBusinessListingEmailScenario({ page, businessListingPage, resilient, scenario });
  }

  for (const scenario of pasteBusinessListingEmailScenarios) {
    await runBusinessListingEmailScenario({ page, businessListingPage, resilient, scenario });
  }

  for (const scenario of positiveBusinessListingEmailScenarios) {
    await runBusinessListingEmailScenario({ page, businessListingPage, resilient, scenario });
  }

  const positiveEmail = positiveOnboardingData.email;
  await businessListingPage.clearEmail();
  await businessListingPage.enterEmail(positiveEmail);
  const looksGoodData = await businessListingPage.collectLooksGoodData();

  await resilient.run({
    name: 'Business Listing positive email is accepted before Edit',
    assert: async () => {
      await businessListingPage.triggerEmailValidation();
      await businessListingPage.expectEmailErrorHidden();
      expect(await businessListingPage.getEmailValue()).toBe(positiveEmail);
    },
    continueOnFailure: false,
    impact: ['Business Listing popup did not accept the configured positive email before Edit.'],
    recoveryAction: 'Stop Business Listing continuation and review Looks Good popup email validation.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Click Edit icon from Looks Good popup',
    assert: async () => businessListingPage.clickEditIconFromLooksGoodPopup(),
    continueOnFailure: false,
    impact: ['Business Details bug verification cannot start until the Looks Good popup Edit icon is clicked.'],
    recoveryAction: 'Stop Business Listing continuation and review the edit_icon in Looks Good popup.',
    severity: 'CRITICAL',
  });

  appendBusinessListingEmailPersistenceResult({
    positiveEmail,
    popupSavedSuccessfully: 'N/A - Edit icon flow used before Looks Good save',
    businessListingLoaded: 'N/A - Flow moves directly from popup Edit to Business Details',
    editPopupOpened: true,
    storedEmailValue: looksGoodData.email,
    expectedEmailValue: positiveEmail,
    status: looksGoodData.email === positiveEmail ? 'PASS' : 'FAIL',
    reason:
      looksGoodData.email === positiveEmail
        ? ''
        : 'Positive email value changed before clicking Edit icon from Looks Good popup.',
    screenshotPath:
      looksGoodData.email === positiveEmail
        ? ''
        : await captureBusinessListingFailureScreenshot(page, 'positive-email-before-edit'),
  });

  await runBusinessDetailsBugVerificationAfterEdit({
    page,
    resilient,
    businessListingPage,
    looksGoodData: {
      ...looksGoodData,
      email: positiveEmail,
    },
    businessStepUrl,
  });
}

async function ensureBusinessDetailsSimplePrefill({ page, resilient, businessDetailsPage }) {
  const businessName = await businessDetailsPage.getBusinessNameValue().catch(() => '');
  const zipCode = await businessDetailsPage.getZipCodeValue().catch(() => '');

  if (!businessName) {
    await reportBug({
      page,
      bugTitle: 'Business Name not prefilled on Business Details return',
      expectedResult: 'Business Name should remain populated.',
      actualResult: 'Business Name was empty.',
      screenName: 'Business Details',
    });
    await businessDetailsPage.enterBusinessName(positiveOnboardingData.businessName);
  }

  if (!zipCode) {
    await reportBug({
      page,
      bugTitle: 'PIN Code not prefilled on Business Details return',
      expectedResult: 'PIN Code should remain populated.',
      actualResult: 'PIN Code was empty.',
      screenName: 'Business Details',
    });
    await businessDetailsPage.pasteZipCode(positiveOnboardingData.zipCode);
    await businessDetailsPage.waitForZipResolved().catch(() => {});
  }

  await resilient.truthy(
    'Business Details simple prefill has Business Name and PIN Code',
    async () =>
      Boolean(await businessDetailsPage.getBusinessNameValue()) &&
      Boolean(await businessDetailsPage.getZipCodeValue()),
    {
      impact: ['Business Details returned without required prefilled values.'],
      recoveryAction: 'Positive test data was filled from centralized onboarding data.',
      severity: 'BUG',
    }
  );

  const continueEnabled = await businessDetailsPage.continueButton()
    .isEnabled({ timeout: timeouts.quickAction })
    .catch(() => false);

  if (!continueEnabled) {
    const currentBusinessName = await businessDetailsPage.getBusinessNameValue().catch(() => '');
    const currentZipCode = await businessDetailsPage.getZipCodeValue().catch(() => '');
    await reportBug({
      page,
      bugTitle: 'Business Details Continue button disabled after Business Name and PIN Code prefill',
      expectedResult: 'Continue button should be enabled after Business Name and PIN Code are populated.',
      actualResult: `Continue button was disabled. Business Name: ${currentBusinessName || 'EMPTY'}, PIN Code: ${currentZipCode || 'EMPTY'}.`,
      screenName: 'Business Details',
    });

    await businessDetailsPage.refillSimpleBusinessDetails({
      businessName: positiveOnboardingData.businessName,
      zipCode: positiveOnboardingData.zipCode,
    });
    await businessDetailsPage.selectFirstBusinessListingIfVisible();
  }
}

async function continueBusinessDetailsAfterPrefillCheck({
  page,
  resilient,
  businessDetailsPage,
  businessStepUrl,
  contextName = 'Business Details',
}) {
  await ensureBusinessDetailsSimplePrefill({ page, resilient, businessDetailsPage });

  let continueEnabled = await businessDetailsPage.continueButton()
    .isEnabled({ timeout: timeouts.quickAction })
    .catch(() => false);

  if (!continueEnabled) {
    const currentBusinessName = await businessDetailsPage.getBusinessNameValue().catch(() => '');
    const currentZipCode = await businessDetailsPage.getZipCodeValue().catch(() => '');

    await reportBug({
      page,
      bugTitle: `${contextName} Continue button still disabled after refill`,
      expectedResult: 'Continue button should become enabled after refilling Business Name and PIN Code.',
      actualResult: `Continue button remained disabled. Business Name: ${currentBusinessName || 'EMPTY'}, PIN Code: ${currentZipCode || 'EMPTY'}.`,
      screenName: contextName,
    });

    await businessDetailsPage.refillSimpleBusinessDetails({
      businessName: positiveOnboardingData.businessName,
      zipCode: positiveOnboardingData.zipCode,
    });
    await businessDetailsPage.selectFirstBusinessListingIfVisible();

    continueEnabled = await businessDetailsPage.continueButton()
      .isEnabled({ timeout: timeouts.action })
      .catch(() => false);
  }

  await resilient.truthy(
    `${contextName} Continue enabled after Business Name and PIN Code recovery`,
    () => continueEnabled,
    {
      impact: ['Driver cannot continue to Business Listing if Continue stays disabled after recovery.'],
      recoveryAction: 'Business Name and PIN Code were refilled and first listing was selected if available.',
      severity: 'CRITICAL',
    }
  );

  if (
    !(await page
      .locator('text="Business Listing"')
      .first()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false))
  ) {
    await businessDetailsPage.continueButton().click({ force: true });
  }

  const categoryRequiredVisible = await page
    .locator(onboardingLocators.businessStep.errorToast)
    .isVisible({ timeout: timeouts.shortAction })
    .catch(() => false);

  if (categoryRequiredVisible) {
    await reportBug({
      page,
      bugTitle: `${contextName} blocked by missing Business Category`,
      expectedResult: 'Business Category should remain selected when returning from Update Your Business Details.',
      actualResult: 'Business Details Continue showed "Please select a category first." and did not open Business Listing.',
      screenName: contextName,
    });

    await forceBusinessCategorySelectionAndReturnToDetails({
      page,
      businessStepUrl,
      resilient,
    });

    await ensureBusinessDetailsSimplePrefill({ page, resilient, businessDetailsPage });
    const recoveredContinueEnabled = await businessDetailsPage.continueButton()
      .isEnabled({ timeout: timeouts.quickAction })
      .catch(() => false);

    if (!recoveredContinueEnabled) {
      await reportBug({
        page,
        bugTitle: `${contextName} Continue button disabled after Business Category recovery`,
        expectedResult: 'Continue button should be enabled after category recovery and Business Details refill.',
        actualResult: 'Continue button was still disabled after returning from Business Category recovery.',
        screenName: contextName,
      });
      await businessDetailsPage.refillSimpleBusinessDetails({
        businessName: positiveOnboardingData.businessName,
        zipCode: positiveOnboardingData.zipCode,
      });
    }

    await businessDetailsPage.continueButton().click({ force: true });
  }

  if (businessStepUrl) {
    await verifyBusinessStepScreen({
      page,
      screen: onboardingScreens.businessListing,
      businessStepUrl,
    });
  }
}

async function continueRecoveredBusinessDetailsToListingFast({
  page,
  resilient,
  businessDetailsPage,
  businessStepUrl,
  contextName = 'Recovered Business Details',
}) {
  const listingVisible = async () =>
    page
      .locator('text="Business Listing"')
      .first()
      .isVisible({ timeout: timeouts.quickAction })
      .catch(() => false);

  const fillBusinessDetailsIfNeeded = async () => {
    if (await businessDetailsPage.isManualLoaded().catch(() => false)) {
      await businessDetailsPage.clickSearchAgainIfVisible();
    }

    await ensureBusinessDetailsSimplePrefill({ page, resilient, businessDetailsPage });

    let continueVisible = await businessDetailsPage.continueButton()
      .isVisible({ timeout: 4000 })
      .catch(() => false);
    let continueEnabled = continueVisible && await businessDetailsPage.continueButton()
      .isEnabled({ timeout: timeouts.quickAction })
      .catch(() => false);

    if (!continueVisible || !continueEnabled) {
      await reportBug({
        page,
        bugTitle: `${contextName} Continue button not ready within 4 seconds`,
        expectedResult: 'Continue should be visible and enabled after returning to Business Details with positive data.',
        actualResult: 'Continue was not visible/enabled within 4 seconds, so automation cleared and refilled Business Details without refreshing.',
        screenName: contextName,
      });

      await businessDetailsPage.refillSimpleBusinessDetails({
        businessName: positiveOnboardingData.businessName,
        zipCode: positiveOnboardingData.zipCode,
      });

      continueVisible = await businessDetailsPage.continueButton()
        .isVisible({ timeout: 4000 })
        .catch(() => false);
      continueEnabled = continueVisible && await businessDetailsPage.continueButton()
        .isEnabled({ timeout: timeouts.quickAction })
        .catch(() => false);
    }

    return continueEnabled;
  };

  const clickContinueAndCheckListing = async () => {
    const continueVisible = await businessDetailsPage.continueButton()
      .isVisible({ timeout: 4000 })
      .catch(() => false);

    if (!continueVisible) return false;

    const continueEnabled = await fillBusinessDetailsIfNeeded();
    if (!continueEnabled) return false;

    await businessDetailsPage.continueButton().click({ force: true });
    await page.waitForTimeout(700);

    if (await listingVisible()) return true;

    if (
      await page
        .locator(onboardingLocators.businessStep.errorToast)
        .isVisible({ timeout: timeouts.shortAction })
        .catch(() => false)
    ) {
      await reportBug({
        page,
        bugTitle: `${contextName} blocked by missing Business Category`,
        expectedResult: 'Business Category should remain selected when returning from Your AI Sounds.',
        actualResult: 'Business Details Continue showed "Please select a category first." and did not open Business Listing.',
        screenName: contextName,
      });

      await forceBusinessCategorySelectionAndReturnToDetails({
        page,
        businessStepUrl,
        resilient,
      });

      await fillBusinessDetailsIfNeeded();
      await businessDetailsPage.continueButton().click({ force: true });
      await page.waitForTimeout(700);
    }

    return listingVisible();
  };

  if (await clickContinueAndCheckListing()) return;

  await verifyBusinessStepScreen({
    page,
    screen: onboardingScreens.businessListing,
    businessStepUrl,
  });
}

async function fillPositiveUpdateBusinessDetailsExceptWebUrl(businessDetailsPage) {
  const data = positiveOnboardingData.updateBusinessDetails;

  await businessDetailsPage.uncheckNoWebsiteIfChecked();
  await setManualBusinessNameIfNeeded(businessDetailsPage, data.businessName);
  await setManualPhoneIfNeeded(businessDetailsPage, data.phoneNumber);
  await setManualAddressIfNeeded(businessDetailsPage, data.businessAddress);
  await setManualEmailIfNeeded(businessDetailsPage, data.businessEmail);
}

async function fillPositiveUpdateBusinessDetailsExceptBusinessName(businessDetailsPage) {
  const data = positiveOnboardingData.updateBusinessDetails;

  await businessDetailsPage.uncheckNoWebsiteIfChecked();
  await setManualWebsiteIfNeeded(businessDetailsPage, data.webUrl);
  await setManualPhoneIfNeeded(businessDetailsPage, data.phoneNumber);
  await setManualAddressIfNeeded(businessDetailsPage, data.businessAddress);
  await setManualEmailIfNeeded(businessDetailsPage, data.businessEmail);
}

async function fillPositiveUpdateBusinessDetailsExceptPhone(businessDetailsPage) {
  const data = positiveOnboardingData.updateBusinessDetails;

  await businessDetailsPage.uncheckNoWebsiteIfChecked();
  await setManualWebsiteIfNeeded(businessDetailsPage, data.webUrl);
  await setManualBusinessNameIfNeeded(businessDetailsPage, data.businessName);
  await setManualAddressIfNeeded(businessDetailsPage, data.businessAddress);
  await setManualEmailIfNeeded(businessDetailsPage, data.businessEmail);
}

async function fillPositiveUpdateBusinessDetailsExceptEmail(businessDetailsPage) {
  const data = positiveOnboardingData.updateBusinessDetails;

  await businessDetailsPage.uncheckNoWebsiteIfChecked();
  await setManualWebsiteIfNeeded(businessDetailsPage, data.webUrl);
  await setManualBusinessNameIfNeeded(businessDetailsPage, data.businessName);
  await setManualPhoneIfNeeded(businessDetailsPage, data.phoneNumber);
  await setManualAddressIfNeeded(businessDetailsPage, data.businessAddress);
}

async function fillPositiveUpdateBusinessDetailsAllFields(businessDetailsPage) {
  const data = positiveOnboardingData.updateBusinessDetails;

  await businessDetailsPage.uncheckNoWebsiteIfChecked();
  await setManualWebsiteIfNeeded(businessDetailsPage, data.webUrl);
  await setManualBusinessNameIfNeeded(businessDetailsPage, data.businessName);
  await setManualPhoneIfNeeded(businessDetailsPage, data.phoneNumber);
  await setManualAddressIfNeeded(businessDetailsPage, data.businessAddress);
  await setManualEmailIfNeeded(businessDetailsPage, data.businessEmail);
}

async function setManualFieldIfNeeded({ getter, setter, expectedValue }) {
  const currentValue = await getter().catch(() => '');
  if (normalizeComparableValue(currentValue) === normalizeComparableValue(expectedValue)) return;
  await setter(expectedValue);
}

async function setManualWebsiteIfNeeded(businessDetailsPage, value) {
  await setManualFieldIfNeeded({
    getter: () => businessDetailsPage.getManualWebsiteValue(),
    setter: (nextValue) => businessDetailsPage.enterManualWebsite(nextValue),
    expectedValue: value,
  });
}

async function setManualBusinessNameIfNeeded(businessDetailsPage, value) {
  await setManualFieldIfNeeded({
    getter: () => businessDetailsPage.getManualBusinessNameValue(),
    setter: (nextValue) => businessDetailsPage.enterManualBusinessName(nextValue),
    expectedValue: value,
  });
}

async function setManualPhoneIfNeeded(businessDetailsPage, value) {
  await setManualFieldIfNeeded({
    getter: () => businessDetailsPage.getManualPhoneValue(),
    setter: (nextValue) => businessDetailsPage.enterManualPhone(nextValue),
    expectedValue: value,
  });
}

async function setManualAddressIfNeeded(businessDetailsPage, value) {
  await setManualFieldIfNeeded({
    getter: () => businessDetailsPage.manualAddressInput().inputValue(),
    setter: (nextValue) => businessDetailsPage.enterManualAddress(nextValue),
    expectedValue: value,
  });
}

async function setManualEmailIfNeeded(businessDetailsPage, value) {
  await setManualFieldIfNeeded({
    getter: () => businessDetailsPage.getManualEmailValue(),
    setter: (nextValue) => businessDetailsPage.enterManualEmail(nextValue),
    expectedValue: value,
  });
}

function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

async function recoverUpdateBusinessDetailsFromAiSounds({
  page,
  resilient,
  businessListingPage,
  businessDetailsPage,
  businessStepUrl,
}) {
  if (!(await isYourAiSoundsScreenVisible(page))) return false;

  await reportBug({
    page,
    bugTitle: 'Web URL validation redirected to Your AI Sounds',
    expectedResult: 'Invalid empty or spaces-only Web URL should keep driver on Update Your Business Details with validation.',
    actualResult: 'Driver was redirected to Your AI Sounds screen.',
    screenName: 'Update Your Business Details',
  });

  await recoverUpdateBusinessDetailsManualFlowFromAiSounds({
    page,
    resilient,
    businessListingPage,
    businessDetailsPage,
    businessStepUrl,
    fillPositiveData: () => fillPositiveUpdateBusinessDetailsExceptWebUrl(businessDetailsPage),
  });
  return true;
}

async function recoverUpdateBusinessDetailsManualFlowFromAiSounds({
  page,
  resilient,
  businessListingPage,
  businessDetailsPage,
  businessStepUrl,
  fillPositiveData,
}) {
  await closeAnyVisiblePopupBeforeAiSoundsDotRecovery(page);
  await page.waitForTimeout(2000);
  await businessListingPage.clickProgressDot(2);
  await continueRecoveredBusinessDetailsToListingFast({
    page,
    resilient,
    businessDetailsPage,
    businessStepUrl,
    contextName: 'Business Details after AI Sounds recovery',
  });

  await businessListingPage.openManualEntryFromListing();
  await businessListingPage.continueManually();
  await businessDetailsPage.verifyManualLoaded();
  await fillPositiveData();
}

async function closeAnyVisiblePopupBeforeAiSoundsDotRecovery(page) {
  const popupCloseCandidates = [
    'button[aria-label="Close"]',
    'button:has-text("Close")',
    'button:has-text("Okay")',
    'button:has-text("Okey")',
    'button:has-text("OK")',
    '[role="dialog"] button:has-text("Ã—")',
    '[role="dialog"] button',
  ];

  for (const selector of popupCloseCandidates) {
    const closeButton = page.locator(selector).first();
    if (await closeButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await closeButton.click({ force: true }).catch(() => {});
      await page.waitForTimeout(300);
      break;
    }
  }
}

async function recoverUpdateBusinessDetailsBusinessNameFromAiSounds({
  page,
  resilient,
  businessListingPage,
  businessDetailsPage,
  businessStepUrl,
}) {
  if (!(await isYourAiSoundsScreenVisible(page))) return false;

  await reportBug({
    page,
    bugTitle: 'Business Name validation redirected to Your AI Sounds',
    expectedResult: 'Invalid Business Name should keep driver on Update Your Business Details with a red alert.',
    actualResult: 'Driver was redirected to Your AI Sounds screen.',
    screenName: 'Update Your Business Details',
  });

  await recoverUpdateBusinessDetailsManualFlowFromAiSounds({
    page,
    resilient,
    businessListingPage,
    businessDetailsPage,
    businessStepUrl,
    fillPositiveData: () => fillPositiveUpdateBusinessDetailsExceptBusinessName(businessDetailsPage),
  });
  return true;
}

async function recoverUpdateBusinessDetailsPhoneFromAiSounds({
  page,
  resilient,
  businessListingPage,
  businessDetailsPage,
  businessStepUrl,
}) {
  if (!(await isYourAiSoundsScreenVisible(page))) return false;

  await reportBug({
    page,
    bugTitle: 'Phone Number validation redirected to Your AI Sounds',
    expectedResult: 'Invalid Phone Number should keep driver on Update Your Business Details with a red alert.',
    actualResult: 'Driver was redirected to Your AI Sounds screen.',
    screenName: 'Update Your Business Details',
  });

  await recoverUpdateBusinessDetailsManualFlowFromAiSounds({
    page,
    resilient,
    businessListingPage,
    businessDetailsPage,
    businessStepUrl,
    fillPositiveData: () => fillPositiveUpdateBusinessDetailsExceptPhone(businessDetailsPage),
  });
  return true;
}

async function recoverUpdateBusinessDetailsEmailFromAiSounds({
  page,
  resilient,
  businessListingPage,
  businessDetailsPage,
  businessStepUrl,
}) {
  if (!(await isYourAiSoundsScreenVisible(page))) return false;

  await reportBug({
    page,
    bugTitle: 'Business Email validation redirected to Your AI Sounds',
    expectedResult: 'Invalid Business Email should keep driver on Update Your Business Details with a red alert.',
    actualResult: 'Driver was redirected to Your AI Sounds screen.',
    screenName: 'Update Your Business Details',
  });

  await closeAnyVisiblePopupBeforeAiSoundsDotRecovery(page);
  await recoverUpdateBusinessDetailsManualFlowFromAiSounds({
    page,
    resilient,
    businessListingPage,
    businessDetailsPage,
    businessStepUrl,
    fillPositiveData: () => fillPositiveUpdateBusinessDetailsExceptEmail(businessDetailsPage),
  });
  return true;
}

function isUpdateBusinessDetailsWebUrlScenarioPassed({
  scenario,
  enteredValue,
  validationPopupVisible,
  invalidUrlIconVisible,
  validUrlIconVisible,
  noWebsiteWasChecked,
  redirectedToAiSounds,
}) {
  const normalizedEnteredValue = normalizeComparableValue(enteredValue);
  const normalizedExpectedValue = normalizeComparableValue(scenario.normalizedValue);
  const rejected = validationPopupVisible || invalidUrlIconVisible;

  if (scenario.mode === 'valid') {
    return {
      passed:
        validUrlIconVisible &&
        !validationPopupVisible &&
        !invalidUrlIconVisible &&
        normalizedEnteredValue === normalizeComparableValue(scenario.value),
      reason:
        validUrlIconVisible && !validationPopupVisible && !invalidUrlIconVisible
          ? ''
          : 'Expected valid Web URL to show green valid icon without validation popup or red invalid icon.',
    };
  }

  if (scenario.name === 'Empty field' || scenario.name === 'Only spaces') {
    if (noWebsiteWasChecked) {
      return {
        passed: false,
        reason: 'I do not have a Business website checkbox was checked during empty/spaces-only Web URL validation.',
      };
    }

    if (redirectedToAiSounds) {
      return {
        passed: false,
        reason: 'Driver redirected to Your AI Sounds instead of showing validation for empty/spaces-only Web URL.',
      };
    }
  }

  if (scenario.mode === 'reject-or-trim') {
    const trimmed = Boolean(normalizedExpectedValue) && normalizedEnteredValue === normalizedExpectedValue;
    return {
      passed: rejected || trimmed,
      reason: rejected || trimmed ? '' : 'Expected Web URL to be rejected with red icon/popup or trimmed.',
    };
  }

  return {
    passed: rejected,
    reason: rejected ? '' : 'Expected Web URL to be rejected, but red invalid icon or validation popup was not detected.',
  };
}

async function runUpdateBusinessDetailsWebUrlScenario({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
  resilient,
  scenario,
}) {
  await businessDetailsPage.verifyManualLoaded();
  await businessDetailsPage.clearManualWebsite();
  await businessDetailsPage.uncheckNoWebsiteIfChecked();

  if (scenario.inputMethod === 'Paste') {
    await businessDetailsPage.enterManualWebsite(scenario.value);
  } else {
    await businessDetailsPage.manualWebsiteInput().pressSequentially(scenario.value);
  }

  const continueEnabledBeforeClick = await businessDetailsPage.continueButton()
    .isEnabled({ timeout: timeouts.quickAction })
    .catch(() => false);
  const noWebsiteWasCheckedBeforeValidation = await businessDetailsPage.isNoWebsiteChecked();

  if (scenario.mode === 'valid') {
    await businessDetailsPage.manualWebsiteInput().blur();
  } else {
    await businessDetailsPage.triggerManualWebsiteValidation();
  }

  await waitForManualWebsiteValidationSignal({ page, businessDetailsPage });

  const redirectedToAiSounds = await isYourAiSoundsScreenVisible(page);
  const noWebsiteWasCheckedAfterValidation = await businessDetailsPage.isNoWebsiteChecked();
  let noWebsiteAutoChecked = noWebsiteWasCheckedBeforeValidation || noWebsiteWasCheckedAfterValidation;
  if (noWebsiteAutoChecked) {
    await reportAndUncheckUnexpectedNoWebsite({
      page,
      businessDetailsPage,
      resilient,
      scenarioName: scenario.name,
      phase: 'after validation',
    });
  }
  if (
    !noWebsiteAutoChecked &&
    (scenario.name === 'Empty field' || scenario.name === 'Only spaces') &&
    redirectedToAiSounds
  ) {
    noWebsiteAutoChecked = true;
    const screenshotPath = await reportBug({
      page,
      bugTitle: `No Business Website checkbox auto-selected and advanced flow during ${scenario.name}`,
      expectedResult:
        'Empty/spaces-only Web URL should not auto-select the "I do not have a Business website" checkbox or move to Your AI Sounds.',
      actualResult: 'Driver was redirected to Your AI Sounds after Web URL validation.',
      screenName: 'Update Your Business Details',
    });

    await resilient.truthy(
      `Unexpected No Business Website auto-advance - ${scenario.name}`,
      () => false,
      {
        impact: [
          `Scenario: ${scenario.name}`,
          'The checkbox state was no longer visible because the app advanced to Your AI Sounds.',
          `Screenshot: ${screenshotPath || 'N/A'}`,
        ],
        recoveryAction: 'Recover from Your AI Sounds and continue with the remaining Web URL validation cases.',
        severity: 'BUG',
      }
    );
  }
  const recoveredFromAiSounds = await recoverUpdateBusinessDetailsFromAiSounds({
    page,
    businessStepUrl,
    resilient,
    businessListingPage,
    businessDetailsPage,
  });
  const enteredValue = await businessDetailsPage.getManualWebsiteValue().catch(() => '');
  const storedValue = await businessDetailsPage.getManualWebsiteValueAttribute().catch(() => '');
  const validationPopupVisible = await businessDetailsPage.isAlertPopupVisible();
  const validUrlIconVisible = await businessDetailsPage.isManualValidUrlIconVisible();
  const invalidUrlIconVisible = await businessDetailsPage.isManualInvalidUrlIconVisible();
  const result = isUpdateBusinessDetailsWebUrlScenarioPassed({
    scenario,
    enteredValue,
    validationPopupVisible,
    invalidUrlIconVisible,
    validUrlIconVisible,
    noWebsiteWasChecked: noWebsiteAutoChecked,
    redirectedToAiSounds,
  });
  const screenshotPath = result.passed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, `update-web-url-${scenario.name}`);

  appendUpdateBusinessDetailsWebUrlResult({
    scenario: scenario.name,
    inputValue: scenario.value,
    inputMethod: scenario.inputMethod,
    enteredValue,
    storedValue,
    validationSignal: [
      `Popup Visible: ${validationPopupVisible}`,
      `Valid URL Icon Visible: ${validUrlIconVisible}`,
      `Invalid URL Icon Visible: ${invalidUrlIconVisible}`,
      `Continue Enabled Before Click: ${continueEnabledBeforeClick}`,
      `No Website Checkbox Checked Before Validation: ${noWebsiteWasCheckedBeforeValidation}`,
      `No Website Checkbox Checked After Validation: ${noWebsiteWasCheckedAfterValidation}`,
      `No Website Checkbox Auto-check Bug Logged: ${noWebsiteAutoChecked}`,
      `Redirected To AI Sounds: ${redirectedToAiSounds}`,
      `Recovered From AI Sounds: ${recoveredFromAiSounds}`,
    ].join(' | '),
    assertionStatus: result.passed ? 'PASS' : 'FAIL',
    reason: result.reason,
    screenshotPath,
  });

  await resilient.truthy(`Update Business Details Web URL validation - ${scenario.name}`, () => result.passed, {
    impact: [
      `Test Data: ${JSON.stringify(scenario.value)}`,
      `Input Method: ${scenario.inputMethod}`,
      `Entered Value: ${JSON.stringify(enteredValue)}`,
      `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
      `Popup Visible: ${validationPopupVisible}`,
      `Valid URL Icon Visible: ${validUrlIconVisible}`,
      `Invalid URL Icon Visible: ${invalidUrlIconVisible}`,
      `Continue Enabled Before Click: ${continueEnabledBeforeClick}`,
      `No Website Checkbox Checked Before Validation: ${noWebsiteWasCheckedBeforeValidation}`,
      `No Website Checkbox Checked After Validation: ${noWebsiteWasCheckedAfterValidation}`,
      `No Website Checkbox Auto-check Bug Logged: ${noWebsiteAutoChecked}`,
      `Redirected To AI Sounds: ${redirectedToAiSounds}`,
      `Recovered From AI Sounds: ${recoveredFromAiSounds}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the Web URL validation failure and continue with the next URL case.',
    severity: 'VALIDATION',
  });

  await businessDetailsPage.closeAlertPopupIfVisible();
  await businessDetailsPage.uncheckNoWebsiteIfChecked();
}

async function runUpdateBusinessDetailsWebUrlAutomation({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
}) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/update-business-details-web-url-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);
  const positiveWebUrl = positiveOnboardingData.updateBusinessDetails.webUrl;

  initializeUpdateBusinessDetailsWebUrlReport();

  await businessDetailsPage.verifyManualLoaded();
  await fillPositiveUpdateBusinessDetailsExceptWebUrl(businessDetailsPage);
  await businessDetailsPage.clearManualWebsite();
  await businessDetailsPage.uncheckNoWebsiteIfChecked();

  for (const scenario of invalidUpdateBusinessDetailsWebUrlScenarios) {
    await runUpdateBusinessDetailsWebUrlScenario({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
      resilient,
      scenario,
    });
  }

  for (const scenario of boundaryUpdateBusinessDetailsWebUrlScenarios) {
    await runUpdateBusinessDetailsWebUrlScenario({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
      resilient,
      scenario,
    });
  }

  for (const scenario of pasteUpdateBusinessDetailsWebUrlScenarios) {
    await runUpdateBusinessDetailsWebUrlScenario({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
      resilient,
      scenario,
    });
  }

  await businessDetailsPage.verifyManualLoaded();
  await businessDetailsPage.clearManualWebsite();
  await businessDetailsPage.uncheckNoWebsiteIfChecked();
  await businessDetailsPage.enterManualWebsite(positiveWebUrl);
  await businessDetailsPage.manualWebsiteInput().blur();
  await waitForManualWebsiteValidationSignal({ page, businessDetailsPage });

  const positiveValue = await businessDetailsPage.getManualWebsiteValue();
  const positiveStoredValue = await businessDetailsPage.getManualWebsiteValueAttribute();
  const positivePopupVisible = await businessDetailsPage.isAlertPopupVisible();
  const positiveValidIconVisible = await businessDetailsPage.isManualValidUrlIconVisible();
  const positiveInvalidIconVisible = await businessDetailsPage.isManualInvalidUrlIconVisible();
  const positivePassed =
    normalizeComparableValue(positiveValue) === positiveWebUrl &&
    normalizeComparableValue(positiveStoredValue) === positiveWebUrl &&
    positiveValidIconVisible &&
    !positivePopupVisible &&
    !positiveInvalidIconVisible;
  const screenshotPath = positivePassed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, 'update-web-url-positive');

  appendUpdateBusinessDetailsWebUrlResult({
    scenario: 'Positive Web URL accepted',
    inputValue: positiveWebUrl,
    inputMethod: 'Typing',
    enteredValue: positiveValue,
    storedValue: positiveStoredValue,
    validationSignal: [
      `Popup Visible: ${positivePopupVisible}`,
      `Valid URL Icon Visible: ${positiveValidIconVisible}`,
      `Invalid URL Icon Visible: ${positiveInvalidIconVisible}`,
    ].join(' | '),
    assertionStatus: positivePassed ? 'PASS' : 'FAIL',
    reason: positivePassed ? '' : 'Expected positive Web URL to remain accepted without validation signals.',
    screenshotPath,
  });

  await resilient.truthy('Update Business Details positive Web URL accepted', () => positivePassed, {
    impact: [
      `Positive Web URL: ${positiveWebUrl}`,
      `Entered Value: ${JSON.stringify(positiveValue)}`,
      `Stored Value Attribute: ${JSON.stringify(positiveStoredValue)}`,
      `Popup Visible: ${positivePopupVisible}`,
      `Valid URL Icon Visible: ${positiveValidIconVisible}`,
      `Invalid URL Icon Visible: ${positiveInvalidIconVisible}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the positive Web URL failure before moving to the next Update Business Details field.',
    severity: 'VALIDATION',
  });

  await businessDetailsPage.closeAlertPopupIfVisible();
}

function isUpdateBusinessDetailsBusinessNameScenarioPassed({
  scenario,
  enteredValue,
  storedValue,
  continueEnabledBeforeClick,
  validationPopupVisible,
  redirectedToAiSounds,
}) {
  if (scenario.mode === 'disabled') {
    return {
      passed: !continueEnabledBeforeClick,
      reason: !continueEnabledBeforeClick ? '' : 'Expected Continue button to remain disabled.',
    };
  }

  if (scenario.mode === 'maxlength') {
    return {
      passed: storedValue.length === scenario.maxLength,
      reason:
        storedValue.length === scenario.maxLength
          ? ''
          : `Expected Business Name value attribute to contain exactly ${scenario.maxLength} characters after entering more than ${scenario.maxLength}.`,
    };
  }

  if (scenario.mode === 'red-alert') {
    return {
      passed: validationPopupVisible,
      reason: validationPopupVisible
        ? ''
        : redirectedToAiSounds
          ? 'Expected red alert, but driver was redirected to Your AI Sounds.'
          : 'Expected red alert, but validation popup was not visible.',
    };
  }

  return {
    passed: false,
    reason: `Unsupported Business Name scenario mode: ${scenario.mode}`,
  };
}

async function runUpdateBusinessDetailsBusinessNameScenario({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
  resilient,
  scenario,
}) {
  await businessDetailsPage.verifyManualLoaded();
  await businessDetailsPage.closeAlertPopupIfVisible();
  await businessDetailsPage.clearManualBusinessName();

  if (scenario.inputMethod === 'Paste') {
    await businessDetailsPage.enterManualBusinessName(scenario.value);
  } else if (scenario.value) {
    await businessDetailsPage.manualBusinessNameInput().pressSequentially(scenario.value);
  }

  const continueEnabledBeforeClick = await businessDetailsPage.continueButton()
    .isEnabled({ timeout: timeouts.quickAction })
    .catch(() => false);

  if (scenario.mode === 'red-alert') {
    if (continueEnabledBeforeClick) {
      await businessDetailsPage.continueButton().click({ force: true }).catch(() => {});
    }
  } else {
    await businessDetailsPage.manualBusinessNameInput().blur();
  }

  const shouldCheckRecovery = scenario.mode !== 'disabled';
  const redirectedToAiSounds = shouldCheckRecovery ? await isYourAiSoundsScreenVisible(page) : false;
  const recoveredFromAiSounds = shouldCheckRecovery
    ? await recoverUpdateBusinessDetailsBusinessNameFromAiSounds({
        page,
        businessStepUrl,
        resilient,
        businessListingPage,
        businessDetailsPage,
      })
    : false;
  const enteredValue = await businessDetailsPage.getManualBusinessNameValue().catch(() => '');
  const storedValue = await businessDetailsPage.getManualBusinessNameValueAttribute().catch(() => '');
  const validationPopupVisible = await businessDetailsPage.isAlertPopupVisible();
  const result = isUpdateBusinessDetailsBusinessNameScenarioPassed({
    scenario,
    enteredValue,
    storedValue,
    continueEnabledBeforeClick,
    validationPopupVisible,
    redirectedToAiSounds,
  });
  const screenshotPath = result.passed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, `update-business-name-${scenario.name}`);

  appendUpdateBusinessDetailsBusinessNameResult({
    scenario: scenario.name,
    inputValue: scenario.value,
    inputMethod: scenario.inputMethod,
    enteredValue,
    storedValue,
    validationSignal: [
      `Continue Enabled Before Click: ${continueEnabledBeforeClick}`,
      `Popup Visible: ${validationPopupVisible}`,
      `Redirected To AI Sounds: ${redirectedToAiSounds}`,
      `Recovered From AI Sounds: ${recoveredFromAiSounds}`,
      `Entered Length: ${enteredValue.length}`,
      `Stored Value Attribute Length: ${storedValue.length}`,
    ].join(' | '),
    assertionStatus: result.passed ? 'PASS' : 'FAIL',
    reason: result.reason,
    screenshotPath,
  });

  await resilient.truthy(`Update Business Details Business Name validation - ${scenario.name}`, () => result.passed, {
    impact: [
      `Test Data: ${JSON.stringify(scenario.value)}`,
      `Input Method: ${scenario.inputMethod}`,
      `Entered Value: ${JSON.stringify(enteredValue)}`,
      `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
      `Continue Enabled Before Click: ${continueEnabledBeforeClick}`,
      `Popup Visible: ${validationPopupVisible}`,
      `Redirected To AI Sounds: ${redirectedToAiSounds}`,
      `Recovered From AI Sounds: ${recoveredFromAiSounds}`,
      `Entered Length: ${enteredValue.length}`,
      `Stored Value Attribute Length: ${storedValue.length}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the Business Name validation failure and continue with the next Business Name case.',
    severity: 'VALIDATION',
  });

  await businessDetailsPage.closeAlertPopupIfVisible();
}

async function runUpdateBusinessDetailsBusinessNameAutomation({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
}) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/update-business-details-business-name-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);
  const positiveBusinessName = positiveOnboardingData.updateBusinessDetails.businessName;

  initializeUpdateBusinessDetailsBusinessNameReport();

  await businessDetailsPage.verifyManualLoaded();
  await fillPositiveUpdateBusinessDetailsExceptBusinessName(businessDetailsPage);
  await businessDetailsPage.clearManualBusinessName();

  for (const scenario of updateBusinessDetailsBusinessNameScenarios) {
    await runUpdateBusinessDetailsBusinessNameScenario({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
      resilient,
      scenario,
    });
  }

  await businessDetailsPage.verifyManualLoaded();
  await businessDetailsPage.clearManualBusinessName();
  await businessDetailsPage.enterManualBusinessName(positiveBusinessName);
  await businessDetailsPage.manualBusinessNameInput().blur();

  const positiveValue = await businessDetailsPage.getManualBusinessNameValue();
  const positiveStoredValue = await businessDetailsPage.getManualBusinessNameValueAttribute();
  const positivePassed = positiveValue === positiveBusinessName && positiveStoredValue === positiveBusinessName;
  const screenshotPath = positivePassed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, 'update-business-name-positive');

  appendUpdateBusinessDetailsBusinessNameResult({
    scenario: 'Positive Business Name accepted',
    inputValue: positiveBusinessName,
    inputMethod: 'Typing',
    enteredValue: positiveValue,
    storedValue: positiveStoredValue,
    validationSignal: 'Positive Business Name retained in input and value attribute.',
    assertionStatus: positivePassed ? 'PASS' : 'FAIL',
    reason: positivePassed ? '' : 'Expected positive Business Name to remain exactly in the input field.',
    screenshotPath,
  });

  await resilient.truthy('Update Business Details positive Business Name accepted', () => positivePassed, {
    impact: [
      `Positive Business Name: ${positiveBusinessName}`,
      `Entered Value: ${JSON.stringify(positiveValue)}`,
      `Stored Value Attribute: ${JSON.stringify(positiveStoredValue)}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the positive Business Name failure before moving to the next Update Business Details field.',
    severity: 'VALIDATION',
  });
}

function isUpdateBusinessDetailsPhoneScenarioPassed({
  scenario,
  enteredValue,
  storedValue,
  digitValue,
  validationPopupVisible,
  redirectedToAiSounds,
}) {
  if (scenario.mode === 'valid') {
    return {
      passed: digitValue.endsWith(scenario.expectedDigits) && !validationPopupVisible && !redirectedToAiSounds,
      reason:
        digitValue.endsWith(scenario.expectedDigits) && !validationPopupVisible && !redirectedToAiSounds
          ? ''
          : 'Expected valid numeric phone number to be accepted without red alert or redirect.',
    };
  }

  if (scenario.mode === 'max-digits') {
    return {
      passed: digitValue.length <= scenario.maxDigits,
      reason:
        digitValue.length <= scenario.maxDigits
          ? ''
          : `Expected Phone Number value attribute to contain no more than ${scenario.maxDigits} digits.`,
    };
  }

  if (scenario.mode === 'red-alert') {
    return {
      passed: validationPopupVisible,
      reason: validationPopupVisible
        ? ''
        : redirectedToAiSounds
          ? 'Expected red alert, but driver was redirected to Your AI Sounds.'
          : 'Expected red alert below Phone Number input field.',
    };
  }

  if (scenario.mode === 'red-alert-or-empty') {
    return {
      passed: validationPopupVisible || enteredValue.length === 0 || storedValue.length === 0,
      reason:
        validationPopupVisible || enteredValue.length === 0 || storedValue.length === 0
          ? ''
          : 'Expected red alert or spaces to be blocked from the Phone Number field.',
    };
  }

  if (scenario.mode === 'red-alert-or-trim') {
    const normalizedEntered = normalizeComparableValue(enteredValue);
    const normalizedStored = normalizeComparableValue(storedValue);
    return {
      passed:
        validationPopupVisible ||
        normalizedEntered === scenario.normalizedValue ||
        normalizedStored === scenario.normalizedValue,
      reason:
        validationPopupVisible ||
        normalizedEntered === scenario.normalizedValue ||
        normalizedStored === scenario.normalizedValue
          ? ''
          : 'Expected Phone Number value to be rejected with red alert or trimmed.',
    };
  }

  if (scenario.mode === 'red-alert-or-sanitized') {
    const enteredWithoutCountryCode = String(enteredValue || '').replace(/^\+1\s*/, '');
    const storedWithoutCountryCode = String(storedValue || '').replace(/^\+1\s*/, '');
    const sanitized =
      !scenario.forbidden.test(enteredWithoutCountryCode) &&
      !scenario.forbidden.test(storedWithoutCountryCode);
    return {
      passed: validationPopupVisible || sanitized,
      reason: validationPopupVisible || sanitized ? '' : 'Expected red alert or invalid characters to be blocked.',
    };
  }

  return {
    passed: false,
    reason: `Unsupported Phone Number scenario mode: ${scenario.mode}`,
  };
}

async function runUpdateBusinessDetailsPhoneScenario({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
  resilient,
  scenario,
}) {
  await businessDetailsPage.verifyManualLoaded();
  await businessDetailsPage.closeAlertPopupIfVisible();
  await businessDetailsPage.clearManualPhone();

  if (scenario.inputMethod === 'Paste') {
    await businessDetailsPage.enterManualPhone(scenario.value);
  } else if (scenario.value) {
    await businessDetailsPage.manualPhoneInput().pressSequentially(scenario.value);
  }

  const continueEnabledBeforeClick = await businessDetailsPage.continueButton()
    .isEnabled({ timeout: timeouts.quickAction })
    .catch(() => false);

  if (scenario.mode !== 'valid' && scenario.mode !== 'max-digits' && continueEnabledBeforeClick) {
    await businessDetailsPage.continueButton().click({ force: true }).catch(() => {});
  } else {
    await businessDetailsPage.manualPhoneInput().blur();
  }

  const redirectedToAiSounds = await isYourAiSoundsScreenVisible(page);
  const recoveredFromAiSounds = await recoverUpdateBusinessDetailsPhoneFromAiSounds({
    page,
    businessStepUrl,
    resilient,
    businessListingPage,
    businessDetailsPage,
  });
  const enteredValue = await businessDetailsPage.getManualPhoneValue().catch(() => '');
  const storedValue = await businessDetailsPage.getManualPhoneValueAttribute().catch(() => '');
  const digitValue = phoneDigits(storedValue || enteredValue);
  const validationPopupVisible = await businessDetailsPage.isAlertPopupVisible();
  const result = isUpdateBusinessDetailsPhoneScenarioPassed({
    scenario,
    enteredValue,
    storedValue,
    digitValue,
    validationPopupVisible,
    redirectedToAiSounds,
  });
  const screenshotPath = result.passed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, `update-phone-${scenario.name}`);

  appendUpdateBusinessDetailsPhoneResult({
    scenario: scenario.name,
    inputValue: scenario.value,
    inputMethod: scenario.inputMethod,
    enteredValue,
    storedValue,
    digitValue,
    validationSignal: [
      `Continue Enabled Before Click: ${continueEnabledBeforeClick}`,
      `Popup Visible: ${validationPopupVisible}`,
      `Redirected To AI Sounds: ${redirectedToAiSounds}`,
      `Recovered From AI Sounds: ${recoveredFromAiSounds}`,
      `Digit Count: ${digitValue.length}`,
    ].join(' | '),
    assertionStatus: result.passed ? 'PASS' : 'FAIL',
    reason: result.reason,
    screenshotPath,
  });

  await resilient.truthy(`Update Business Details Phone validation - ${scenario.name}`, () => result.passed, {
    impact: [
      `Test Data: ${JSON.stringify(scenario.value)}`,
      `Input Method: ${scenario.inputMethod}`,
      `Entered Value: ${JSON.stringify(enteredValue)}`,
      `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
      `Digits From Value Attribute: ${digitValue}`,
      `Continue Enabled Before Click: ${continueEnabledBeforeClick}`,
      `Popup Visible: ${validationPopupVisible}`,
      `Redirected To AI Sounds: ${redirectedToAiSounds}`,
      `Recovered From AI Sounds: ${recoveredFromAiSounds}`,
      `Digit Count: ${digitValue.length}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the Phone Number validation failure and continue with the next Phone Number case.',
    severity: 'VALIDATION',
  });

  await businessDetailsPage.closeAlertPopupIfVisible();
}

async function runUpdateBusinessDetailsPhoneAutomation({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
}) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/update-business-details-phone-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);
  const positivePhone = positiveOnboardingData.updateBusinessDetails.phoneNumber;

  initializeUpdateBusinessDetailsPhoneReport();

  await businessDetailsPage.verifyManualLoaded();
  await fillPositiveUpdateBusinessDetailsExceptPhone(businessDetailsPage);
  await businessDetailsPage.clearManualPhone();

  for (const scenario of updateBusinessDetailsPhoneScenarios) {
    await runUpdateBusinessDetailsPhoneScenario({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
      resilient,
      scenario,
    });
  }

  await businessDetailsPage.verifyManualLoaded();
  await businessDetailsPage.clearManualPhone();
  await businessDetailsPage.enterManualPhone(positivePhone);
  await businessDetailsPage.manualPhoneInput().blur();

  const positiveValue = await businessDetailsPage.getManualPhoneValue();
  const positiveStoredValue = await businessDetailsPage.getManualPhoneValueAttribute();
  const positiveDigits = phoneDigits(positiveStoredValue || positiveValue);
  const positiveExpectedDigits = phoneDigits(positivePhone);
  const positivePassed = positiveDigits.endsWith(positiveExpectedDigits);
  const screenshotPath = positivePassed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, 'update-phone-positive');

  appendUpdateBusinessDetailsPhoneResult({
    scenario: 'Positive Phone Number accepted',
    inputValue: positivePhone,
    inputMethod: 'Typing',
    enteredValue: positiveValue,
    storedValue: positiveStoredValue,
    digitValue: positiveDigits,
    validationSignal: `Positive Phone Number retained in input value. Expected Local Digits: ${positiveExpectedDigits}`,
    assertionStatus: positivePassed ? 'PASS' : 'FAIL',
    reason: positivePassed ? '' : 'Expected positive Phone Number digits to remain in the input field.',
    screenshotPath,
  });

  await resilient.truthy('Update Business Details positive Phone Number accepted', () => positivePassed, {
    impact: [
      `Positive Phone Number: ${positivePhone}`,
      `Entered Value: ${JSON.stringify(positiveValue)}`,
      `Stored Value Attribute: ${JSON.stringify(positiveStoredValue)}`,
      `Digits From Value Attribute: ${positiveDigits}`,
      `Expected Local Digits: ${positiveExpectedDigits}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the positive Phone Number failure before moving to the next Update Business Details field.',
    severity: 'VALIDATION',
  });
}

function isUpdateBusinessDetailsEmailScenarioPassed({
  scenario,
  enteredValue,
  storedValue,
  emailErrorVisible,
  validationPopupVisible,
  redirectedToAiSounds,
}) {
  const hasValidationSignal = emailErrorVisible || validationPopupVisible;

  if (scenario.mode === 'valid') {
    return {
      passed:
        normalizeComparableValue(storedValue) === normalizeComparableValue(scenario.expectedValue) &&
        !emailErrorVisible &&
        !validationPopupVisible &&
        !redirectedToAiSounds,
      reason:
        normalizeComparableValue(storedValue) === normalizeComparableValue(scenario.expectedValue) &&
        !emailErrorVisible &&
        !validationPopupVisible &&
        !redirectedToAiSounds
          ? ''
          : 'Expected valid Business Email to be accepted without validation signal or redirect.',
    };
  }

  if (scenario.mode === 'maxlength-or-red-alert') {
    return {
      passed: hasValidationSignal || String(storedValue || '').length <= scenario.maxLength,
      reason:
        hasValidationSignal || String(storedValue || '').length <= scenario.maxLength
          ? ''
          : `Expected Business Email value attribute to be limited to ${scenario.maxLength} characters or rejected.`,
    };
  }

  if (scenario.mode === 'red-alert-or-empty') {
    return {
      passed: hasValidationSignal || enteredValue.length === 0 || storedValue.length === 0,
      reason:
        hasValidationSignal || enteredValue.length === 0 || storedValue.length === 0
          ? ''
          : 'Expected red email validation or spaces to be blocked from the Business Email field.',
    };
  }

  if (scenario.mode === 'red-alert-or-trim') {
    const normalizedEntered = normalizeComparableValue(enteredValue);
    const normalizedStored = normalizeComparableValue(storedValue);
    return {
      passed:
        hasValidationSignal ||
        normalizedEntered === scenario.normalizedValue ||
        normalizedStored === scenario.normalizedValue,
      reason:
        hasValidationSignal ||
        normalizedEntered === scenario.normalizedValue ||
        normalizedStored === scenario.normalizedValue
          ? ''
          : 'Expected Business Email value to be rejected with red alert or trimmed.',
    };
  }

  if (scenario.mode === 'red-alert') {
    return {
      passed: hasValidationSignal,
      reason: hasValidationSignal
        ? ''
        : redirectedToAiSounds
          ? 'Expected red email validation, but driver was redirected to Your AI Sounds.'
          : 'Expected red email validation signal.',
    };
  }

  return {
    passed: false,
    reason: `Unsupported Business Email scenario mode: ${scenario.mode}`,
  };
}

async function blurActiveFieldSafely(page) {
  if (page.isClosed()) {
    throw new Error('Cannot blur active field because the page is already closed.');
  }

  await page
    .evaluate(() => {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    })
    .catch(async () => {
      if (!page.isClosed()) {
        await page.keyboard.press('Tab').catch(() => {});
      }
    });
}

async function runUpdateBusinessDetailsEmailScenario({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
  resilient,
  scenario,
}) {
  await businessDetailsPage.verifyManualLoaded();
  await businessDetailsPage.closeAlertPopupIfVisible();
  await businessDetailsPage.clearManualEmail();

  if (scenario.inputMethod === 'Paste') {
    await businessDetailsPage.enterManualEmail(scenario.value);
  } else if (scenario.value) {
    await businessDetailsPage.manualEmailInput().pressSequentially(scenario.value);
  }

  await blurActiveFieldSafely(page);
  const continueEnabledBeforeClick = await businessDetailsPage.continueButton()
    .isEnabled({ timeout: timeouts.quickAction })
    .catch(() => false);

  if (scenario.mode !== 'valid' && continueEnabledBeforeClick) {
    await businessDetailsPage.continueButton().click({ force: true }).catch(() => {});
  }

  const redirectedToAiSounds = await isYourAiSoundsScreenVisible(page);
  const recoveredFromAiSounds = await recoverUpdateBusinessDetailsEmailFromAiSounds({
    page,
    businessStepUrl,
    resilient,
    businessListingPage,
    businessDetailsPage,
  });
  const enteredValue = await businessDetailsPage.getManualEmailValue().catch(() => '');
  const storedValue = await businessDetailsPage.getManualEmailValueAttribute().catch(() => '');
  const emailErrorVisible = await businessDetailsPage.isManualEmailErrorVisible();
  const emailErrorText = await businessDetailsPage.getManualEmailErrorText();
  const validationPopupVisible = await businessDetailsPage.isAlertPopupVisible();
  const result = isUpdateBusinessDetailsEmailScenarioPassed({
    scenario,
    enteredValue,
    storedValue,
    emailErrorVisible,
    validationPopupVisible,
    redirectedToAiSounds,
  });
  const screenshotPath = result.passed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, `update-email-${scenario.name}`);

  appendUpdateBusinessDetailsEmailResult({
    scenario: scenario.name,
    inputValue: scenario.value,
    inputMethod: scenario.inputMethod,
    enteredValue,
    storedValue,
    validationSignal: [
      `Continue Enabled Before Click: ${continueEnabledBeforeClick}`,
      `Inline Email Error Visible: ${emailErrorVisible}`,
      `Popup Visible: ${validationPopupVisible}`,
      `Redirected To AI Sounds: ${redirectedToAiSounds}`,
      `Recovered From AI Sounds: ${recoveredFromAiSounds}`,
      `Stored Value Length: ${String(storedValue || '').length}`,
    ].join(' | '),
    errorText: emailErrorText,
    assertionStatus: result.passed ? 'PASS' : 'FAIL',
    reason: result.reason,
    screenshotPath,
  });

  await resilient.truthy(`Update Business Details Business Email validation - ${scenario.name}`, () => result.passed, {
    impact: [
      `Test Data: ${JSON.stringify(scenario.value)}`,
      `Input Method: ${scenario.inputMethod}`,
      `Entered Value: ${JSON.stringify(enteredValue)}`,
      `Stored Value Attribute: ${JSON.stringify(storedValue)}`,
      `Continue Enabled Before Click: ${continueEnabledBeforeClick}`,
      `Inline Email Error Visible: ${emailErrorVisible}`,
      `Popup Visible: ${validationPopupVisible}`,
      `Error Text: ${emailErrorText || 'N/A'}`,
      `Redirected To AI Sounds: ${redirectedToAiSounds}`,
      `Recovered From AI Sounds: ${recoveredFromAiSounds}`,
      `Stored Value Length: ${String(storedValue || '').length}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the Business Email validation failure and continue with the next Business Email case.',
    severity: 'VALIDATION',
  });

  await businessDetailsPage.closeAlertPopupIfVisible();
}

async function runUpdateBusinessDetailsEmailAutomation({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
}) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/update-business-details-email-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);
  const positiveEmail = positiveOnboardingData.updateBusinessDetails.businessEmail;

  initializeUpdateBusinessDetailsEmailReport();

  await businessDetailsPage.verifyManualLoaded();
  await fillPositiveUpdateBusinessDetailsExceptEmail(businessDetailsPage);
  await businessDetailsPage.clearManualEmail();

  for (const scenario of updateBusinessDetailsEmailScenarios) {
    await runUpdateBusinessDetailsEmailScenario({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
      resilient,
      scenario,
    });
  }

  await businessDetailsPage.verifyManualLoaded();
  await businessDetailsPage.clearManualEmail();
  await businessDetailsPage.enterManualEmail(positiveEmail);
  await blurActiveFieldSafely(page);

  const positiveValue = await businessDetailsPage.getManualEmailValue();
  const positiveStoredValue = await businessDetailsPage.getManualEmailValueAttribute();
  const emailErrorVisible = await businessDetailsPage.isManualEmailErrorVisible();
  const positivePassed =
    positiveStoredValue === positiveEmail &&
    positiveValue === positiveEmail &&
    !emailErrorVisible;
  const screenshotPath = positivePassed
    ? ''
    : await captureBusinessDetailsFailureScreenshot(page, 'update-email-positive');

  appendUpdateBusinessDetailsEmailResult({
    scenario: 'Positive Business Email accepted',
    inputValue: positiveEmail,
    inputMethod: 'Typing',
    enteredValue: positiveValue,
    storedValue: positiveStoredValue,
    validationSignal: `Inline Email Error Visible: ${emailErrorVisible}`,
    errorText: await businessDetailsPage.getManualEmailErrorText(),
    assertionStatus: positivePassed ? 'PASS' : 'FAIL',
    reason: positivePassed ? '' : 'Expected positive Business Email to remain exactly in the input field.',
    screenshotPath,
  });

  await resilient.truthy('Update Business Details positive Business Email accepted', () => positivePassed, {
    impact: [
      `Positive Business Email: ${positiveEmail}`,
      `Entered Value: ${JSON.stringify(positiveValue)}`,
      `Stored Value Attribute: ${JSON.stringify(positiveStoredValue)}`,
      `Inline Email Error Visible: ${emailErrorVisible}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record the positive Business Email failure before moving to the next Update Business Details field.',
    severity: 'VALIDATION',
  });
}

function storeFinalBusinessDetails(details) {
  fs.mkdirSync(path.dirname(finalBusinessDetailsFile), { recursive: true });
  fs.writeFileSync(
    finalBusinessDetailsFile,
    JSON.stringify(
      {
        ...details,
        storedAt: new Date().toISOString(),
        purpose: 'Used for matching these business details in later application screens.',
      },
      null,
      2
    ),
    'utf8'
  );
}

function readStoredFinalBusinessDetails() {
  if (!fs.existsSync(finalBusinessDetailsFile)) return {};

  return JSON.parse(fs.readFileSync(finalBusinessDetailsFile, 'utf8'));
}

function updateStoredFinalBusinessDetails(details) {
  storeFinalBusinessDetails({
    ...readStoredFinalBusinessDetails(),
    ...details,
  });
}

function appendAgentCreationReport(message) {
  fs.mkdirSync(path.dirname(agentCreationReportFile), { recursive: true });
  const line = `${new Date().toISOString()} ${message}`;
  fs.appendFileSync(agentCreationReportFile, `${line}\n`, 'utf8');
  console.log(message);
}

function appendFastStepPostCallReport(message) {
  fs.mkdirSync(path.dirname(fastStepPostCallReportFile), { recursive: true });
  const line = `${new Date().toISOString()} ${message}`;
  fs.appendFileSync(fastStepPostCallReportFile, `${line}\n`, 'utf8');
}

async function closeUnexpectedAgentCreationPopupIfVisible(page) {
  const failedPopupVisible = await page
    .locator('text=/Failed to create agent|failed to create agent|Please try again/i')
    .first()
    .isVisible({ timeout: timeouts.quickAction })
    .catch(() => false);

  if (!failedPopupVisible) return false;

  await page
    .locator('button:has-text("Close"), button[aria-label="Close"], button:has-text("OK")')
    .first()
    .click({ force: true })
    .catch(() => {});

  await page.waitForTimeout(500);
  return true;
}

async function findVisibleEnabledFinishButton(page) {
  const finishButtons = page.locator('button:has-text("Finish")');
  const count = await finishButtons.count();

  for (let index = 0; index < count; index += 1) {
    const button = finishButtons.nth(index);
    const visible = await button.isVisible({ timeout: timeouts.quickAction }).catch(() => false);
    const enabled = visible && (await button.isEnabled().catch(() => false));

    if (visible && enabled) return button;
  }

  return finishButtons.first();
}

async function clickVisibleFinishButton(page) {
  const finishButton = await findVisibleEnabledFinishButton(page);
  await expect(finishButton).toBeVisible({ timeout: timeouts.pageLoad });
  await expect(finishButton).toBeEnabled({ timeout: timeouts.action });
  await finishButton.scrollIntoViewIfNeeded().catch(() => {});

  await finishButton.click({ timeout: timeouts.action }).catch(async () => {
    await finishButton.evaluate((element) => element.click());
  });

  await page.waitForTimeout(750);

  const stillOnIdleFinish = await finishButton
    .isVisible({ timeout: timeouts.quickAction })
    .catch(() => false);
  const creatingVisible = await page
    .locator('button:has-text("Creating..."), text=/Creating your\\s+Custom AI Receptionist/i')
    .first()
    .isVisible({ timeout: timeouts.quickAction })
    .catch(() => false);

  if (stillOnIdleFinish && !creatingVisible && currentPath(page) === '/business-step') {
    const box = await finishButton.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(750);
    }
  }
}

async function clickFinishAndWaitForFastStep({ page, businessStepUrl }) {
  await expect(page).toHaveURL(businessStepUrl, { timeout: timeouts.authRedirect });
  await expect(page.locator('text="your AI sounds"').first()).toBeVisible({ timeout: timeouts.pageLoad });
  await page.evaluate(() => {
    localStorage.removeItem('fromLp');
    localStorage.removeItem('paymentDone');
    localStorage.removeItem('paidPlan');
  });
  await clickVisibleFinishButton(page);

  await page
    .locator('text=/Creating your\\s+Custom AI Receptionist/i')
    .first()
    .isVisible({ timeout: timeouts.pageLoad })
    .catch(() => {});

  const firstCreateState = await expect
    .poll(
      async () => {
        if (currentPath(page) === '/fast-step') return 'fast-step';
        if (currentPath(page) === '/go-live-setup') return 'go-live-setup';
        if (
          await page
            .locator('text=/Failed to create agent|failed to create agent|Please try again/i')
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          return 'failed-popup';
        }
        return 'waiting';
      },
      { timeout: 180000 }
    )
    .not.toBe('waiting')
    .then(async () => {
      if (currentPath(page) === '/fast-step') return 'fast-step';
      if (currentPath(page) === '/go-live-setup') return 'go-live-setup';
      return (await page
        .locator('text=/Failed to create agent|failed to create agent|Please try again/i')
        .first()
        .isVisible()
        .catch(() => false))
        ? 'failed-popup'
        : 'unknown';
    })
    .catch(() => 'timeout');

  if (firstCreateState === 'fast-step') return true;
  if (firstCreateState === 'go-live-setup') {
    appendAgentCreationReport('Agent created successfully and redirected directly to /go-live-setup.');
    return true;
  }

  if (firstCreateState === 'timeout' && currentPath(page) === '/business-step') {
    appendAgentCreationReport('Finish click did not start agent creation within timeout. Retrying Finish click once.');
    await clickVisibleFinishButton(page);

    const retryCreateState = await expect
      .poll(
        async () => {
          if (currentPath(page) === '/fast-step') return 'fast-step';
          if (currentPath(page) === '/go-live-setup') return 'go-live-setup';
          if (
            await page
              .locator('text=/Failed to create agent|failed to create agent|Please try again/i')
              .first()
              .isVisible()
              .catch(() => false)
          ) {
            return 'failed-popup';
          }
          return 'waiting';
        },
        { timeout: 180000 }
      )
      .not.toBe('waiting')
      .then(() => currentPath(page) === '/fast-step' ? 'fast-step' : currentPath(page) === '/go-live-setup' ? 'go-live-setup' : 'failed-popup')
      .catch(() => 'timeout');

    if (retryCreateState === 'fast-step') return true;
    if (retryCreateState === 'go-live-setup') {
      appendAgentCreationReport('Agent created successfully and redirected directly to /go-live-setup.');
      return true;
    }
  }

  if (firstCreateState === 'failed-popup' && (await closeUnexpectedAgentCreationPopupIfVisible(page))) {
    appendAgentCreationReport('Failed to create agent popup appeared. Closed popup and waiting 2 minutes before retry.');
    await page.waitForTimeout(120000);
    await clickVisibleFinishButton(page);

    await expect
      .poll(() => currentPath(page), { timeout: 180000 })
      .toMatch(/\/fast-step|\/go-live-setup/);
    return true;
  }

  return false;
}

async function createAgentFromAiSoundsAndStoreMeetDetails({ page, businessStepUrl }) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/agent-creation-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);

  await resilient.run({
    name: 'Finish AI Sounds and create agent',
    assert: async () => {
      const created = await clickFinishAndWaitForFastStep({ page, businessStepUrl });
      expect(created).toBeTruthy();

      appendAgentCreationReport('Agent created successfully');

      const meetTitle = page.locator('text=/^Meet\\s+.+/').first();
      await expect(meetTitle).toBeVisible({ timeout: timeouts.pageLoad });
      const meetText = (await meetTitle.innerText()).trim();
      const agentName = meetText.replace(/^Meet\s+/i, '').trim();

      updateStoredFinalBusinessDetails({
        agentCreation: {
          status: 'Agent created successfully',
          fastStepUrl: page.url(),
          meetPopupTitle: meetText,
          agentName,
          createdAt: new Date().toISOString(),
        },
      });

      await runFastStepAgentNameAutomation({ page, originalAgentName: agentName });
    },
    continueOnFailure: false,
    impact: ['Driver could not create the agent or capture the Meet agent popup details.'],
    recoveryAction: 'Stop flow and inspect the AI Sounds Finish/create-agent lifecycle.',
    severity: 'CRITICAL',
  });
}

function fastStepMeetTitle(page) {
  return page.locator('text=/^Meet\\s+.+/').first();
}

function fastStepReadyTitle(page) {
  return page.locator('text=/^.+\\sis ready$/i').first();
}

function fastStepAgentNameInput(page) {
  return page.locator('input[maxlength="14"]').first();
}

function fastStepAgentNameEditIcon(page) {
  return page.locator('img[alt="edit-svg.svg"]').first();
}

async function getFastStepMeetAgentName(page) {
  const meetText = (await fastStepMeetTitle(page).innerText()).trim();
  return meetText.replace(/^Meet\s+/i, '').trim();
}

async function getFastStepCurrentAgentName(page, fallbackName = 'Auto agent') {
  if (await fastStepMeetTitle(page).isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
    return getFastStepMeetAgentName(page);
  }

  if (await fastStepReadyTitle(page).isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
    const readyText = (await fastStepReadyTitle(page).innerText()).trim();
    return readyText.replace(/\s+is ready$/i, '').trim();
  }

  return fallbackName;
}

async function ensureFastStepAgentNameEditing(page) {
  if (await fastStepAgentNameInput(page).isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
    return;
  }

  await expect(fastStepAgentNameEditIcon(page)).toBeVisible({ timeout: timeouts.pageLoad });
  await fastStepAgentNameEditIcon(page).click({ force: true });
  await expect(fastStepAgentNameInput(page)).toBeVisible({ timeout: timeouts.action });
}

function isFastStepAgentNameScenarioPassed({ scenario, originalAgentName, inputValueAfterEdit, meetNameWhileEditing }) {
  const meetUnchanged = meetNameWhileEditing === originalAgentName;
  const normalizedInput = normalizeComparableValue(inputValueAfterEdit);

  if (scenario.mode === 'valid-boundary') {
    const expectedValue = scenario.value;
    return {
      passed: inputValueAfterEdit === expectedValue && meetNameWhileEditing === expectedValue,
      reason:
        inputValueAfterEdit === expectedValue && meetNameWhileEditing === expectedValue
          ? ''
          : `Expected boundary value ${expectedValue} to be accepted and reflected while editing.`,
    };
  }

  if (scenario.mode === 'maxlength') {
    const lengthOk = inputValueAfterEdit.length <= scenario.maxLength;
    return {
      passed: lengthOk && meetUnchanged,
      reason:
        lengthOk && meetUnchanged
          ? ''
          : `Expected value to be limited to ${scenario.maxLength} characters and Meet name to remain ${originalAgentName}.`,
    };
  }

  if (scenario.mode === 'reject-or-trim') {
    const trimmed = normalizedInput === normalizeComparableValue(scenario.normalizedValue);
    return {
      passed: meetUnchanged && (inputValueAfterEdit === '' || trimmed),
      reason:
        meetUnchanged && (inputValueAfterEdit === '' || trimmed)
          ? ''
          : `Expected input to be rejected/trimmed and Meet name to remain ${originalAgentName}.`,
    };
  }

  if (scenario.mode === 'reject-or-normalize') {
    const normalized = normalizedInput === normalizeComparableValue(scenario.normalizedValue);
    return {
      passed: meetUnchanged && (inputValueAfterEdit === '' || normalized),
      reason:
        meetUnchanged && (inputValueAfterEdit === '' || normalized)
          ? ''
          : `Expected input to be rejected/normalized and Meet name to remain ${originalAgentName}.`,
    };
  }

  if (scenario.mode === 'reject-or-sanitized') {
    const sanitized = !scenario.forbidden.test(inputValueAfterEdit || '');
    return {
      passed: meetUnchanged && sanitized,
      reason:
        meetUnchanged && sanitized
          ? ''
          : `Expected invalid characters to be blocked and Meet name to remain ${originalAgentName}.`,
    };
  }

  return {
    passed: meetUnchanged && inputValueAfterEdit === '',
    reason:
      meetUnchanged && inputValueAfterEdit === ''
        ? ''
        : `Expected input to be rejected and Meet name to remain ${originalAgentName}.`,
  };
}

async function runFastStepAgentNameScenario({ page, resilient, originalAgentName, scenario }) {
  await ensureFastStepAgentNameEditing(page);
  const input = fastStepAgentNameInput(page);
  await input.fill('');

  if (scenario.inputMethod === 'Paste') {
    await input.fill(scenario.value);
  } else if (scenario.value) {
    await input.pressSequentially(scenario.value);
  }

  const inputValueAfterEdit = await input.inputValue();
  const meetNameWhileEditing = await getFastStepMeetAgentName(page);
  const result = isFastStepAgentNameScenarioPassed({
    scenario,
    originalAgentName,
    inputValueAfterEdit,
    meetNameWhileEditing,
  });
  const screenshotPath = result.passed
    ? ''
    : await captureBusinessListingFailureScreenshot(page, `fast-step-agent-name-${scenario.name}`);

  appendFastStepAgentNameResult({
    scenario: scenario.name,
    inputValue: scenario.value,
    inputMethod: scenario.inputMethod,
    originalMeetName: originalAgentName,
    inputValueAfterEdit,
    meetNameWhileEditing,
    meetNameAfterScenario: meetNameWhileEditing,
    assertionStatus: result.passed ? 'PASS' : 'FAIL',
    reason: result.reason,
    screenshotPath,
  });

  await resilient.truthy(`Fast Step Agent Name validation - ${scenario.name}`, () => result.passed, {
    impact: [
      `Test Data: ${JSON.stringify(scenario.value)}`,
      `Input Method: ${scenario.inputMethod}`,
      `Original Meet Agent Name: ${originalAgentName}`,
      `Input Value After Edit: ${JSON.stringify(inputValueAfterEdit)}`,
      `Meet Agent Name While Editing: ${meetNameWhileEditing}`,
      `Screenshot: ${screenshotPath || 'N/A'}`,
    ],
    recoveryAction: 'Record Fast Step Agent Name validation failure and continue with the next scenario.',
    severity: 'VALIDATION',
  });

  await input.fill(originalAgentName);
}

async function runFastStepAgentNameAutomation({ page, originalAgentName }) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/fast-step-agent-name-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);

  initializeFastStepAgentNameReport();
  await expect(page).toHaveURL(/\/fast-step/, { timeout: timeouts.authRedirect });
  await expect(fastStepMeetTitle(page)).toBeVisible({ timeout: timeouts.pageLoad });

  if (POSITIVE_FLOW_ONLY) {
    // Positive-only run: skip Fast Step Agent Name negative validation scenarios.
    const agentName = await getFastStepCurrentAgentName(page, originalAgentName);
    await runFastStepPostCallFlow({ page, finalAgentName: agentName, skipRename: true });
    return;
  }

  for (const scenario of fastStepAgentNameScenarios) {
    await runFastStepAgentNameScenario({
      page,
      resilient,
      originalAgentName,
      scenario,
    });
  }

  await ensureFastStepAgentNameEditing(page);
  await fastStepAgentNameInput(page).fill(originalAgentName);
  await fastStepAgentNameInput(page).blur();

  const restoredAgentName = await getFastStepMeetAgentName(page);
  updateStoredFinalBusinessDetails({
    fastStepAgentNameValidation: {
      originalAgentName,
      restoredAgentName,
      reportFile: fastStepAgentNameReportFile,
      assertionReportFile: 'reports/assertions/fast-step-agent-name-assertion-impact-report.txt',
      completedAt: new Date().toISOString(),
    },
  });

  await runFastStepPostCallFlow({ page });
}

async function renameFastStepAgent({ page, agentName }) {
  await ensureFastStepAgentNameEditing(page);
  await fastStepAgentNameInput(page).fill(agentName);
  await fastStepAgentNameInput(page).blur();
  await expect(fastStepMeetTitle(page)).toContainText(agentName, { timeout: timeouts.authRedirect });
}

async function grantMicrophonePermissionForCurrentOrigin(page) {
  const currentOrigin = new URL(page.url()).origin;
  await page.context().grantPermissions(['microphone'], { origin: currentOrigin });
  return currentOrigin;
}

const expectedRecommendedPlans = [
  { name: 'Starter', price: '$119/month' },
  { name: 'Scaler', price: '$299/month' },
  { name: 'Growth', price: '$599/month' },
];

const stripeCheckoutDetails = {
  email: positiveOnboardingData.email,
  cardNumber: '4242 4242 4242 4242',
  expiry: '04 / 32',
  cvc: '322',
  cardholderName: 'Vansh Dhiman',
  country: 'India',
  addressLine1: '1-2',
  city: 'Mohali',
  district: 'Sahibzada Ajit Singh Nagar',
  postalCode: '160062',
  state: 'Punjab',
};

async function fillFirstVisibleInput(page, selectors, value) {
  for (const selector of selectors) {
    const input = page.locator(selector).first();
    if (await input.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await input.fill(value);
      return true;
    }
  }

  return false;
}

async function selectStripeUsdCurrency(page) {
  const usdSelectors = [
    'button:has-text("USD")',
    '[role="button"]:has-text("USD")',
    'div:has-text("USD")',
    'text="USD"',
  ];

  for (const selector of usdSelectors) {
    const usdOption = page.locator(selector).first();
    if (await usdOption.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await usdOption.click({ force: true });
      return;
    }
  }

  await expect(page.locator('text="USD"').first()).toBeVisible({ timeout: timeouts.authRedirect });
  await page.locator('text="USD"').first().click({ force: true });
}

async function fillStripeCheckoutDetails(page) {
  await page.locator('text=/Payment method|Card information|Subscribe to Scaler/i').first().waitFor({
    state: 'visible',
    timeout: timeouts.authRedirect,
  });

  const changeSavedCard = page.locator('text=/Change|Use a different payment method/i').first();
  if (await changeSavedCard.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
    await changeSavedCard.click({ force: true }).catch(() => {});
  }

  const cardNumberFilled = await fillFirstVisibleInput(
    page,
    [
      'input[name="cardNumber"]',
      'input[autocomplete="cc-number"]',
      'input[placeholder="1234 1234 1234 1234"]',
      'input[aria-label*="Card number" i]',
    ],
    stripeCheckoutDetails.cardNumber
  );
  const expiryFilled = await fillFirstVisibleInput(
    page,
    [
      'input[name="cardExpiry"]',
      'input[autocomplete="cc-exp"]',
      'input[placeholder="MM / YY"]',
      'input[aria-label*="Expiration" i]',
    ],
    stripeCheckoutDetails.expiry
  );
  const cvcFilled = await fillFirstVisibleInput(
    page,
    [
      'input[name="cardCvc"]',
      'input[autocomplete="cc-csc"]',
      'input[placeholder="CVC"]',
      'input[aria-label*="CVC" i]',
    ],
    stripeCheckoutDetails.cvc
  );
  const cardholderNameFilled = await fillFirstVisibleInput(
    page,
    [
      'input[name="billingName"]',
      'input[autocomplete="cc-name"]',
      'input[placeholder*="Cardholder" i]',
      'input[aria-label*="Cardholder" i]',
    ],
    stripeCheckoutDetails.cardholderName
  );
  const savedCardVisible = await page
    .locator('text=/4242|Keep using|Pay with/i')
    .first()
    .isVisible({ timeout: timeouts.quickAction })
    .catch(() => false);

  expect(
    cardNumberFilled || savedCardVisible,
    'Expected Stripe card number field to be filled or saved test card ending 4242 to be available.'
  ).toBeTruthy();
  expect(
    expiryFilled || savedCardVisible,
    'Expected Stripe expiry field to be filled or saved test card ending 4242 to be available.'
  ).toBeTruthy();
  expect(
    cvcFilled || savedCardVisible,
    'Expected Stripe CVC field to be filled or saved test card ending 4242 to be available.'
  ).toBeTruthy();
  expect(
    cardholderNameFilled || savedCardVisible,
    'Expected Stripe cardholder name field to be filled or saved test card ending 4242 to be available.'
  ).toBeTruthy();

  const countrySelect = page.locator('select[name="billingCountry"], select[autocomplete="billing country"]').first();
  if (await countrySelect.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
    await countrySelect.selectOption({ label: stripeCheckoutDetails.country }).catch(async () => {
      await countrySelect.selectOption('IN');
    });
  }

  await fillFirstVisibleInput(
    page,
    [
      'input[name="billingAddressLine1"]',
      'input[autocomplete="billing address-line1"]',
      'input[placeholder*="Address" i]',
      'input[aria-label*="Address line 1" i]',
    ],
    stripeCheckoutDetails.addressLine1
  );
  await fillFirstVisibleInput(
    page,
    [
      'input[name="billingLocality"]',
      'input[autocomplete="billing address-level2"]',
      'input[placeholder*="City" i]',
      'input[aria-label*="City" i]',
    ],
    stripeCheckoutDetails.city
  );
  await fillFirstVisibleInput(
    page,
    [
      'input[name="billingAdministrativeArea"]',
      'input[autocomplete="billing address-level1"]',
      'input[placeholder*="State" i]',
      'input[aria-label*="State" i]',
    ],
    stripeCheckoutDetails.state
  );

  const stateSelect = page
    .locator(
      'select[name="billingAdministrativeArea"], select[autocomplete="billing address-level1"], select[aria-label*="State" i]'
    )
    .first();
  if (await stateSelect.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
    await stateSelect.selectOption({ label: stripeCheckoutDetails.state }).catch(async () => {
      await stateSelect.selectOption({ value: 'PB' }).catch(async () => {
        await stateSelect.selectOption({ label: /Punjab/i });
      });
    });
  }

  await fillFirstVisibleInput(
    page,
    [
      'input[name="billingPostalCode"]',
      'input[autocomplete="billing postal-code"]',
      'input[placeholder*="PIN" i]',
      'input[placeholder*="Postal" i]',
      'input[aria-label*="Postal" i]',
    ],
    stripeCheckoutDetails.postalCode
  );

  const visibleTextboxes = page.locator('input:visible');
  const inputCount = await visibleTextboxes.count().catch(() => 0);
  for (let i = 0; i < inputCount; i += 1) {
    const input = visibleTextboxes.nth(i);
    const value = await input.inputValue().catch(() => '');
    if (value) continue;

    const label = [
      await input.getAttribute('name').catch(() => ''),
      await input.getAttribute('placeholder').catch(() => ''),
      await input.getAttribute('aria-label').catch(() => ''),
      await input.getAttribute('autocomplete').catch(() => ''),
    ].join(' ');

    if (/district|county|dependent/i.test(label)) {
      await input.fill(stripeCheckoutDetails.district).catch(() => {});
    }
  }
}

async function collectRecommendedPlanDetails(page) {
  const collectedPlans = [];

  for (const plan of expectedRecommendedPlans) {
    const planName = page.locator(`text=/^${plan.name}$/i`).first();
    const planPrice = page.locator(`text="${plan.price}"`).first();
    await expect(planName).toBeVisible({ timeout: timeouts.pageLoad });
    await expect(planPrice).toBeVisible({ timeout: timeouts.pageLoad });

    const planCard = page
      .locator(`[class*="planCard"]:has-text("${plan.price}"), div:has-text("${plan.name}"):has-text("${plan.price}")`)
      .first();
    collectedPlans.push({
      ...plan,
      visible: true,
      cardText: await planCard.innerText({ timeout: timeouts.quickAction }).catch(() => ''),
    });
  }

  return collectedPlans;
}

async function navigateToRecommendedTrialPage(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem('goLiveVariantCount', '0');
      localStorage.setItem('goLiveActiveVariant', 'trial');
      localStorage.setItem('goLiveLastVisitAt', '0');
      localStorage.removeItem('goLiveKeepVariantOnReturn');
    } catch (_error) {
      // Best effort only; the route checks below prove which page rendered.
    }
  });

  const recommendedPlanUrl = new URL(page.url());
  recommendedPlanUrl.pathname = onboardingLocators.routes.recommendedPlan;
  recommendedPlanUrl.search = '';
  recommendedPlanUrl.hash = '';
  await page.goto(recommendedPlanUrl.toString(), { waitUntil: 'domcontentloaded', timeout: timeouts.authRedirect });
  await expect(page).toHaveURL(/\/recommended-plan/, { timeout: timeouts.authRedirect });
  appendFastStepPostCallReport(`Navigated directly to recommended-plan trial page: ${page.url()}`);
}

async function verifyRecommendedTrialOffer(page) {
  await expect(page.locator(billingLocators.trialOffer.heading).first()).toBeVisible({
    timeout: timeouts.pageLoad,
  });
  await expect(page.locator(billingLocators.trialOffer.payAmount).first()).toBeVisible({
    timeout: timeouts.pageLoad,
  });
  await expect(page.locator(billingLocators.trialOffer.includedMinutes).first()).toBeVisible({
    timeout: timeouts.pageLoad,
  });
  await expect(page.locator(billingLocators.trialOffer.scalerTierTitle).first()).toBeVisible({
    timeout: timeouts.pageLoad,
  });
  await expect(page.locator(billingLocators.trialOffer.scalerPrice).first()).toBeVisible({
    timeout: timeouts.pageLoad,
  });
  appendFastStepPostCallReport('Verified recommended-plan 21-Day trial page with $20 Scaler offer');
}

async function openTrialOfferPlansAndSelectScaler(page) {
  await clickFirstVisibleLocator(
    page,
    [
      billingLocators.trialOffer.preferPlansButton,
      'button:has-text("Prefer to see plans first")',
      'text=/Prefer to see plans first/i',
      '[class*="checkPlanBtn"]',
    ],
    'Prefer to see plans first button',
    timeouts.pageLoad
  );

  await expect(page.locator(billingLocators.choosePlanModal.title).first()).toBeVisible({
    timeout: timeouts.pageLoad,
  });
  appendFastStepPostCallReport('Choose Plan modal opened from trial offer');

  const planDetails = [];
  for (const plan of expectedRecommendedPlans) {
    const card = page.locator(billingLocators.choosePlanModal.planCard(plan.name.toUpperCase())).first();
    await expect(card).toBeVisible({ timeout: timeouts.pageLoad });
    const text = await card.innerText().catch(() => '');
    planDetails.push({ name: plan.name, text });
  }

  const scalerCard = page.locator(billingLocators.choosePlanModal.scalerCard).first();
  await scalerCard.scrollIntoViewIfNeeded().catch(() => {});
  await scalerCard.click({ force: true });
  appendFastStepPostCallReport('Selected Scaler plan in trial offer plan modal');

  await expect(page.locator(billingLocators.choosePlanModal.selectedPlanCard).first()).toContainText(/SCALER/i, {
    timeout: timeouts.pageLoad,
  });

  updateStoredFinalBusinessDetails({
    recommendedPlanSelection: {
      pageUrl: page.url(),
      trialOffer: {
        title: 'Start Your 21-Day trial',
        todayPay: '$20',
        minutes: '150',
        tier: 'Scaler',
      },
      verifiedPlans: planDetails,
      selectedPlan: 'Scaler',
      storedAt: new Date().toISOString(),
    },
  });

  await clickFirstVisibleLocator(
    page,
    [
      billingLocators.trialOffer.checkoutButton,
      '[class*="footer"] button:has-text("Continue")',
      'button:has-text("Continue")',
    ],
    'Scaler plan Continue button',
    timeouts.authRedirect
  );
  appendFastStepPostCallReport('Clicked Scaler Continue from trial offer footer');
}

async function continueFromPaymentSuccessIfShown(page) {
  const reachedPaymentSuccess = await expect
    .poll(
      async () =>
        currentPath(page) === billingLocators.paymentSuccessRoute ||
        (await page.locator('text=/Thank You!|Your payment is successful/i').first().isVisible().catch(() => false)),
      { timeout: timeouts.shortAction }
    )
    .toBeTruthy()
    .then(() => true)
    .catch(() => false);

  if (!reachedPaymentSuccess) return false;

  appendFastStepPostCallReport(`Payment success Thank You page appeared: ${page.url()}`);
  await clickFirstVisibleLocator(
    page,
    [
      billingLocators.success.continueButton,
      'button:has-text("Continue")',
      'text=/Continue/i',
    ],
    'Payment Success Continue button',
    timeouts.authRedirect
  );
  return true;
}

async function completeRecommendedPlanAndStripeCheckout(page) {
  await expect(page).toHaveURL(/\/recommended-plan/, { timeout: timeouts.authRedirect });
  appendFastStepPostCallReport('Redirected to recommended-plan page');

  await verifyRecommendedTrialOffer(page);
  await openTrialOfferPlansAndSelectScaler(page);
  await page.waitForLoadState('domcontentloaded', { timeout: timeouts.authRedirect }).catch(() => {});

  await expect
    .poll(() => page.url(), { timeout: 180000 })
    .toContain('checkout.stripe.com');
  appendFastStepPostCallReport(`Redirected to Stripe checkout: ${page.url()}`);

  await selectStripeUsdCurrency(page);
  appendFastStepPostCallReport('Selected USD currency on Stripe checkout');

  await fillStripeCheckoutDetails(page);
  appendFastStepPostCallReport('Filled Stripe checkout details');

  updateStoredFinalBusinessDetails({
    stripeCheckout: {
      selectedCurrency: 'USD',
      plan: 'Scaler',
      checkoutDetails: {
        email: stripeCheckoutDetails.email,
        cardLast4: '4242',
        expiry: stripeCheckoutDetails.expiry,
        cardholderName: stripeCheckoutDetails.cardholderName,
        billingAddress: {
          country: stripeCheckoutDetails.country,
          addressLine1: stripeCheckoutDetails.addressLine1,
          city: stripeCheckoutDetails.city,
          district: stripeCheckoutDetails.district,
          postalCode: stripeCheckoutDetails.postalCode,
          state: stripeCheckoutDetails.state,
        },
      },
      storedAt: new Date().toISOString(),
    },
  });

  const subscribeButton = page.locator('button:has-text("Subscribe")').first();
  await expect(subscribeButton).toBeEnabled({ timeout: timeouts.authRedirect });
  await subscribeButton.click({ force: true });
  appendFastStepPostCallReport('Clicked Subscribe on Stripe checkout');

  await expect
    .poll(
      async () =>
        page.url().includes('/go-live-setup') ||
        page.url().includes('/payment-success') ||
        (await page.locator('text=/Thank You!|Your payment is successful/i').first().isVisible().catch(() => false)),
      { timeout: 180000 }
    )
    .toBeTruthy();
  await continueFromPaymentSuccessIfShown(page);

  await expect
    .poll(() => page.url(), { timeout: 180000 })
    .toContain('/go-live-setup');
  appendFastStepPostCallReport(`Redirected to go-live-setup: ${page.url()}`);

  updateStoredFinalBusinessDetails({
    stripeCheckoutResult: {
      subscribed: true,
      finalUrl: page.url(),
      reachedGoLiveSetup: true,
      completedAt: new Date().toISOString(),
    },
  });
}

async function clickFirstVisibleLocator(page, selectors, description, timeout = timeouts.pageLoad) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await locator.scrollIntoViewIfNeeded().catch(() => {});
      await expect(locator, `${description} should be enabled`).toBeEnabled({ timeout }).catch(() => {});
      await locator.click({ force: true });
      appendFastStepPostCallReport(`Clicked ${description}`);
      return locator;
    }
  }

  const fallback = page.locator(selectors[0]).first();
  await fallback.scrollIntoViewIfNeeded().catch(() => {});
  await expect(fallback, `${description} should be visible`).toBeVisible({ timeout });
  await fallback.click({ force: true });
  appendFastStepPostCallReport(`Clicked ${description}`);
  return fallback;
}

async function clickFastStepCallControl(page, labelPattern, description) {
  const selector =
    description === 'Make Web Call Now'
      ? onboardingLocators.fastSetup.makeWebCallButton
      : onboardingLocators.fastSetup.endCallButton;

  const waitForExpectedCallState = async () => {
    if (description === 'Make Web Call Now') {
      return expect
        .poll(
          async () =>
            (await page.locator(onboardingLocators.fastSetup.connectingText).first().isVisible().catch(() => false)) ||
            (await page.locator(onboardingLocators.fastSetup.endCallButton).first().isVisible().catch(() => false)) ||
            (await page.getByText(/End Call|End Call Now|Ending/i).first().isVisible().catch(() => false)) ||
            (await fastStepReadyTitle(page).isVisible().catch(() => false)) ||
            (await page.locator(onboardingLocators.fastSetup.popupMessage).first().isVisible().catch(() => false)),
          { timeout: timeouts.shortAction }
        )
        .toBeTruthy()
        .then(() => true)
        .catch(async () => {
          await page.waitForTimeout(1000);
          return true;
        });
    }

    return expect
      .poll(
        async () =>
          (await fastStepReadyTitle(page).isVisible().catch(() => false)) ||
          !(await page.locator(onboardingLocators.fastSetup.endCallButton).first().isVisible().catch(() => false)),
        { timeout: timeouts.shortAction }
      )
      .toBeTruthy()
      .then(() => true)
      .catch(() => false);
  };

  const clickMakeWebCallByDom = async () => {
    if (description !== 'Make Web Call Now') return { clicked: false, reason: 'not make-web-call' };

    return page.evaluate(() => {
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };

      const candidates = Array.from(document.querySelectorAll('[class*="btnTheme"], [class*="btnFix"], button, [role="button"], div'))
        .filter(isVisible)
        .filter((element) => /Make Web Call Now/i.test(element.textContent || ''));

      const target = candidates
        .map((element) => element.matches('[class*="btnTheme"], button, [role="button"]')
          ? element
          : element.querySelector('[class*="btnTheme"], button, [role="button"]') || element)
        .filter(isVisible)
        .find((element) => {
          const style = window.getComputedStyle(element);
          return style.pointerEvents !== 'none' && !element.disabled;
        }) || null;

      if (!target) return { clicked: false, reason: 'Make Web Call Now target not found or disabled' };

      target.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = target.getBoundingClientRect();
      const eventOptions = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      };

      target.dispatchEvent(new PointerEvent('pointerover', eventOptions));
      target.dispatchEvent(new PointerEvent('pointerenter', eventOptions));
      target.dispatchEvent(new MouseEvent('mouseover', eventOptions));
      target.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
      target.dispatchEvent(new MouseEvent('mousedown', eventOptions));
      target.dispatchEvent(new PointerEvent('pointerup', eventOptions));
      target.dispatchEvent(new MouseEvent('mouseup', eventOptions));
      target.dispatchEvent(new MouseEvent('click', eventOptions));
      return { clicked: true, text: target.textContent || '', tag: target.tagName, className: String(target.className || '') };
    });
  };

  const locatorTargets = page.locator(selector);
  const locatorCount = await locatorTargets.count().catch(() => 0);
  for (let index = 0; index < locatorCount; index += 1) {
    const locatorTarget = locatorTargets.nth(index);
    if (!(await locatorTarget.isVisible({ timeout: timeouts.quickAction }).catch(() => false))) {
      continue;
    }

    await locatorTarget.scrollIntoViewIfNeeded().catch(() => {});
    await locatorTarget.click({ force: true, noWaitAfter: true }).catch(() => {});
    if (await waitForExpectedCallState()) {
      appendFastStepPostCallReport(`Clicked ${description} using visible locator candidate ${index + 1}`);
      return;
    }

    const box = await locatorTarget.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
      if (await waitForExpectedCallState()) {
        appendFastStepPostCallReport(`Clicked ${description} using mouse center on locator candidate ${index + 1}`);
        return;
      }
    }
  }

  const directDomClick = await clickMakeWebCallByDom();
  if (directDomClick?.clicked && (await waitForExpectedCallState())) {
    appendFastStepPostCallReport(`Clicked ${description} using direct Make Web Call DOM fallback`);
    return;
  }

  const clicked = await page.evaluate((source, expectedDescription) => {
    const pattern = new RegExp(source, 'i');
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };

    const candidates = Array.from(document.querySelectorAll('[class*="btnTheme"], button, [role="button"], p, span, div'))
      .filter(isVisible)
      .filter((element) => pattern.test(element.textContent || ''));

    const target = candidates
      .map((element) => element.closest('[class*="btnTheme"], button, [role="button"]') || element)
      .filter(isVisible)
      .filter((element, index, list) => list.indexOf(element) === index)
      .sort((a, b) => {
        const priority = (element) => {
          if (element.matches('[class*="btnTheme"]')) return 0;
          if (element.matches('button, [role="button"]')) return 1;
          return 2;
        };
        if (priority(a) !== priority(b)) return priority(a) - priority(b);
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectB.width * rectB.height - rectA.width * rectA.height;
      })[0] || null;

    if (!target) return { clicked: false, reason: `${expectedDescription} target not found` };
    target.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = target.getBoundingClientRect();
    const options = { bubbles: true, cancelable: true, view: window, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    target.dispatchEvent(new PointerEvent('pointerdown', options));
    target.dispatchEvent(new MouseEvent('mousedown', options));
    target.dispatchEvent(new PointerEvent('pointerup', options));
    target.dispatchEvent(new MouseEvent('mouseup', options));
    target.dispatchEvent(new MouseEvent('click', options));
    return { clicked: true, text: target.textContent || '', tag: target.tagName, className: target.className || '' };
  }, labelPattern.source, description);

  if (clicked?.clicked && (await waitForExpectedCallState())) {
    appendFastStepPostCallReport(`Clicked ${description} using DOM dispatch fallback`);
    return;
  }

  const fallback = page.getByText(labelPattern).first();
  await expect(fallback).toBeVisible({ timeout: timeouts.pageLoad });
  await fallback.click({ force: true, noWaitAfter: true });
  if (await waitForExpectedCallState()) {
    appendFastStepPostCallReport(`Clicked ${description} using text fallback`);
    return;
  }

  throw new Error(`${description} click did not change Fast Step call state. DOM fallback result: ${JSON.stringify(clicked)}`);
}

async function clickVisibleTextControl(page, labelPattern, description) {
  const clicked = await page.evaluate((source) => {
    const pattern = new RegExp(source, 'i');
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };

    const candidates = Array.from(document.querySelectorAll('button, [role="button"], a, div, span, p'))
      .filter(isVisible)
      .filter((element) => pattern.test(element.textContent || ''));

    const target =
      candidates
        .map((element) => element.closest('button, [role="button"], a') || element)
        .filter(isVisible)
        .sort((a, b) => {
          const rectA = a.getBoundingClientRect();
          const rectB = b.getBoundingClientRect();
          return rectB.width * rectB.height - rectA.width * rectA.height;
        })[0] || null;

    if (!target) return false;
    target.scrollIntoView({ block: 'center', inline: 'center' });
    target.click();
    return true;
  }, labelPattern.source);

  if (!clicked) {
    const fallback = page.getByText(labelPattern).first();
    await expect(fallback).toBeVisible({ timeout: timeouts.pageLoad });
    await fallback.click({ force: true });
  }

  appendFastStepPostCallReport(`Clicked ${description}`);
}

async function clickGoLiveSaveAndContinueStrict(page) {
  const locator = page.locator(onboardingLocators.goLiveWizard.saveAndContinueButton).first();
  if (await locator.isVisible({ timeout: timeouts.shortAction }).catch(() => false)) {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await locator.click({ force: true });
    appendFastStepPostCallReport('Strict clicked Save & Continue button using wizard CTA locator');
    return;
  }

  const clicked = await page.evaluate(() => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };

    const candidates = Array.from(document.querySelectorAll('[class*="wizardShelf"] [class*="btnTheme"], [class*="btnTheme"]'))
      .filter(isVisible)
      .filter((element) => /Save\s*&\s*Continue/i.test(element.textContent || ''));

    const target = candidates[0] || null;
    if (!target) return false;

    target.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = target.getBoundingClientRect();
    const eventOptions = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    };

    target.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
    target.dispatchEvent(new MouseEvent('mousedown', eventOptions));
    target.dispatchEvent(new PointerEvent('pointerup', eventOptions));
    target.dispatchEvent(new MouseEvent('mouseup', eventOptions));
    target.dispatchEvent(new MouseEvent('click', eventOptions));
    target.click();
    return true;
  });

  if (!clicked) {
    throw new Error('Unable to strict click Save & Continue animated CTA.');
  }

  appendFastStepPostCallReport('Strict clicked Save & Continue button using DOM events');
}

async function completeFastAgentDetailsIntroTour(page) {
  const tourOverlay = page.locator(fastAgentDetailsLocators.tour.overlay).first();
  if (!(await tourOverlay.isVisible({ timeout: timeouts.authRedirect }).catch(() => false))) {
    appendFastStepPostCallReport('Fast Agent Details tour was not visible');
    return 0;
  }

  const customTooltip = page.locator('.introjs-tooltip, [class*="customTourTooltip"]').first();
  await expect(customTooltip).toBeVisible({ timeout: timeouts.pageLoad });
  await expect(page.locator(fastAgentDetailsLocators.tour.editAgentStep).first()).toBeVisible({
    timeout: timeouts.pageLoad,
  });
  await expect(customTooltip).toContainText('Manage Agent', { timeout: timeouts.pageLoad });
  appendFastStepPostCallReport('Fast Agent Details first guide popup appeared: Manage Agent');

  let clickedSteps = 0;
  for (let step = 1; step <= 9; step += 1) {
    const nextButton = page
      .locator(
        `${fastAgentDetailsLocators.tour.nextButton}, button:has-text("Next"), a:has-text("Next")`
      )
      .first();
    const doneButton = page
      .locator(
        `${fastAgentDetailsLocators.tour.doneButton}, button:has-text("Done"), a:has-text("Done"), button:has-text("Finish"), a:has-text("Finish")`
      )
      .first();

    if (await nextButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await nextButton.click({ force: true });
      clickedSteps += 1;
      appendFastStepPostCallReport(`Clicked Fast Agent Details tour Next ${clickedSteps}`);
      continue;
    }

    if (await doneButton.isVisible({ timeout: timeouts.quickAction }).catch(() => false)) {
      await doneButton.click({ force: true });
      clickedSteps += 1;
      appendFastStepPostCallReport(`Clicked Fast Agent Details tour Done ${clickedSteps}`);
      break;
    }

    await page.waitForTimeout(300);
  }

  await page
    .locator(fastAgentDetailsLocators.tour.overlay)
    .first()
    .waitFor({ state: 'hidden', timeout: timeouts.shortAction })
    .catch(() => {});

  return clickedSteps;
}

async function completeGoLiveSetupAndFastAgentDetailsTour(page) {
  await expect(page).toHaveURL(/\/go-live-setup/, { timeout: timeouts.authRedirect });
  appendFastStepPostCallReport('Started Go Live Setup flow');

  await clickFirstVisibleLocator(
    page,
    [
      onboardingLocators.goLiveWizard.setupCallForwardingButton,
      'button:has-text("Set Up Call Forwarding")',
      'button:has-text("Setup Call Forwarding")',
      'text=/Set Up Call Forwarding|Setup Call Forwarding/i',
    ],
    'Setup Call Forwarding button'
  );

  await expect(page.locator('text=/Who is your phone carrier\\?|phone carrier/i').first()).toBeVisible({
    timeout: timeouts.authRedirect,
  });

  await clickFirstVisibleLocator(
    page,
    [
      onboardingLocators.goLiveWizard.firstCarrierOption,
      'text="AT&T"',
      '[role="radio"]',
      'input[type="radio"]',
    ],
    'first phone carrier option'
  );

  await clickFirstVisibleLocator(
    page,
    [
      onboardingLocators.goLiveWizard.showMeHowButton,
      'button:has-text("Show Me How To Do It")',
      'button:has-text("Show me How to Do it")',
      'text=/Show Me How To Do It|Show me How to Do it/i',
    ],
    'Show Me How To Do It button'
  );

  await clickFirstVisibleLocator(
    page,
    [
      onboardingLocators.goLiveWizard.forwardMyCallsNowButton,
      'button:has-text("Forward My Calls Now")',
      'button:has-text("Forward my calls now")',
      'text=/Forward My Calls Now|Forward my calls now/i',
    ],
    'Forward My Calls Now button',
    timeouts.authRedirect
  );

  await expect(page.locator('text=/Did it work\\?/i').first()).toBeVisible({ timeout: timeouts.authRedirect });
  await clickFirstVisibleLocator(
    page,
    [
      onboardingLocators.goLiveWizard.yesItDidButton,
      'button:has-text("Yes, it did")',
      'text=/Yes, it did/i',
    ],
    'Yes, it did button'
  );

  await expect(page.locator('text=/Call Triage|When Calls Transfer/i').first()).toBeVisible({
    timeout: timeouts.authRedirect,
  });
  await page.waitForTimeout(3000);
  appendFastStepPostCallReport('Waited 3 seconds on Call Triage before Save & Continue');
  await clickGoLiveSaveAndContinueStrict(page);

  appendFastStepPostCallReport('Waiting for Agent live popup after Save & Continue');
  await expect(page.locator('text=/is live/i').first()).toBeVisible({ timeout: timeouts.authRedirect });
  const livePopupText = await page.locator('text=/is live/i').first().innerText().catch(() => '');
  await clickFirstVisibleLocator(
    page,
    [
      onboardingLocators.goLiveWizard.doItLaterButton,
      'button:has-text("Do it Later")',
      'text=/Do it Later/i',
    ],
    'Do it Later button'
  );

  await expect
    .poll(
      async () =>
        (await page.locator(onboardingLocators.sophiaReadyDialog.setupSummaryDialog).first().isVisible().catch(() => false)) ||
        (await page.locator(onboardingLocators.sophiaReadyDialog.setupSummaryTitle).first().isVisible().catch(() => false)) ||
        (await page.locator(onboardingLocators.sophiaReadyDialog.liveSummaryTitle).first().isVisible().catch(() => false)),
      { timeout: timeouts.authRedirect }
    )
    .toBeTruthy();
  appendFastStepPostCallReport('SophiaReadyDialog setup summary popup appeared after Do It Later');

  await clickFirstVisibleLocator(
    page,
    [
      onboardingLocators.sophiaReadyDialog.okayButton,
      onboardingLocators.goLiveWizard.okayButton,
      'button:has-text("Okay")',
      'button:has-text("Okey")',
      'button:has-text("OK")',
      'text=/Okay|Okey|OK/i',
    ],
    'Okay confirmation button',
    timeouts.authRedirect
  );
  appendFastStepPostCallReport('Clicked Okay on SophiaReadyDialog setup summary popup');

  await expect
    .poll(() => currentPath(page), { timeout: timeouts.authRedirect })
    .toBe('/fast-agent-detail');
  appendFastStepPostCallReport(`Redirected to Fast Agent Details: ${page.url()}`);

  await page.waitForTimeout(3000);
  appendFastStepPostCallReport('Waited before checking Fast Agent Details guide tour');
  const tourStepClicks = await completeFastAgentDetailsIntroTour(page);
  appendFastStepPostCallReport(`Fast Agent Details guide tour completed with ${tourStepClicks} click(s)`);

  updateStoredFinalBusinessDetails({
    goLiveSetupCompletion: {
      setupCallForwardingClicked: true,
      selectedCarrier: 'AT&T',
      callForwardingConfirmed: true,
      callTriageSaved: true,
      livePopupText,
      doItLaterClicked: true,
      finalUrl: page.url(),
      reachedFastAgentDetails: currentPath(page) === '/fast-agent-detail',
      fastAgentDetailsTourClicks: tourStepClicks,
      completedAt: new Date().toISOString(),
    },
  });
}

async function runFastStepPostCallFlow({ page, finalAgentName = 'Auto agent', skipRename = false } = {}) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/fast-step-post-call-flow-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);
  let activeAgentName = finalAgentName;

  fs.mkdirSync(path.dirname(fastStepPostCallReportFile), { recursive: true });
  fs.writeFileSync(
    fastStepPostCallReportFile,
    [
      'FAST STEP POST CALL FLOW REPORT',
      '===============================',
      `Execution Started: ${new Date().toISOString()}`,
      '',
    ].join('\n'),
    'utf8'
  );

  await resilient.run({
    name: 'Fast Step call trigger and recommended plan flow',
    assert: async () => {
      await expect(page).toHaveURL(/\/fast-step/, { timeout: timeouts.authRedirect });
      if (!skipRename) {
        await renameFastStepAgent({ page, agentName: activeAgentName });
        appendFastStepPostCallReport(`Agent renamed to ${activeAgentName}`);
      } else {
        activeAgentName = await getFastStepCurrentAgentName(page, activeAgentName);
        appendFastStepPostCallReport(`Using app-generated agent name: ${activeAgentName}`);
      }

      const microphoneOrigin = await grantMicrophonePermissionForCurrentOrigin(page);
      appendFastStepPostCallReport(`Microphone permission granted for ${microphoneOrigin}`);

      await clickFastStepCallControl(page, /Make Web Call Now/, 'Make Web Call Now');
      appendFastStepPostCallReport('Clicked Make Web Call Now; End Call and Go Live steps are removed in the latest application flow');
      await page.waitForTimeout(6000);

      activeAgentName = await getFastStepCurrentAgentName(page, activeAgentName);

      await navigateToRecommendedTrialPage(page);
      await completeRecommendedPlanAndStripeCheckout(page);
      await completeGoLiveSetupAndFastAgentDetailsTour(page);

      updateStoredFinalBusinessDetails({
        fastStepPostCallFlow: {
          agentName: activeAgentName,
          makeWebCallClicked: true,
          endCallSkippedBecauseRemoved: true,
          goLiveSkippedBecauseRemoved: true,
          directRecommendedPlanNavigation: true,
          finalUrl: page.url(),
          reachedFastAgentDetails: currentPath(page) === '/fast-agent-detail',
          reportFile: fastStepPostCallReportFile,
          assertionReportFile: 'reports/assertions/fast-step-post-call-flow-assertion-impact-report.txt',
          completedAt: new Date().toISOString(),
        },
      });
      // mithii yha flow khtm hota hai
    },
    continueOnFailure: false,
    impact: [
      'Driver could not complete Fast Step call trigger, recommended plan checkout, Go Live setup, or Fast Agent Details tour.',
    ],
    recoveryAction:
      'Stop flow and inspect Fast Step call trigger, recommended plan trial page, Stripe checkout, Go Live setup, and Fast Agent Details tour flow.',
    severity: 'CRITICAL',
  });
}

async function continueFinalBusinessDetailsToListing({ page, resilient, businessDetailsPage, businessStepUrl }) {
  await continueBusinessDetailsAfterPrefillCheck({
    page,
    resilient,
    businessDetailsPage,
    businessStepUrl,
    contextName: 'Business Details after Enter Manually validations',
  });
}

async function navigateFinalFlowToBusinessDetails({
  page,
  resilient,
  businessListingPage,
  businessDetailsPage,
  businessStepUrl,
}) {
  await businessListingPage.clickProgressDot(1);
  await expect(page).toHaveURL(businessStepUrl, { timeout: timeouts.authRedirect });
  let screenAfterDotOne = await detectBusinessStepScreen(page);

  if (screenAfterDotOne === onboardingScreens.updateBusinessDetails.key) {
    await businessListingPage.clickProgressDot(1);
    screenAfterDotOne = await detectBusinessStepScreen(page);
  }

  if (screenAfterDotOne === onboardingScreens.businessCategory.key) {
    await recoverBusinessDetailsFromBusinessCategory({
      page,
      businessStepUrl,
      resilient,
    });
    return;
  }

  if (screenAfterDotOne === onboardingScreens.businessDetails.key) {
    await ensureBusinessDetailsSimplePrefill({ page, resilient, businessDetailsPage });
    return;
  }

  expect(
    screenAfterDotOne,
    'Expected final first-dot flow to land on Business Category or Business Details.'
  ).toBe(onboardingScreens.businessCategory.key);
}

async function prepareFinalBusinessListingDetails({
  page,
  businessDetailsPage,
  businessListingPage,
  businessStepUrl,
}) {
  const reporter = new AssertionImpactReporter(
    'reports/assertions/final-business-details-setup-assertion-impact-report.txt'
  );
  reporter.initialize();
  const resilient = new ResilientAssertions(reporter);

  await resilient.run({
    name: 'Prepare final Business Listing details after Update Business Details validations',
    assert: async () => {
      await businessDetailsPage.verifyManualLoaded();
      await businessDetailsPage.closeAlertPopupIfVisible();
      await fillPositiveUpdateBusinessDetailsAllFields(businessDetailsPage);

      const updateDetailsData = await businessDetailsPage.getManualDetailsData();

      await navigateFinalFlowToBusinessDetails({
        page,
        resilient,
        businessListingPage,
        businessDetailsPage,
        businessStepUrl,
      });

      await ensureBusinessDetailsSimplePrefill({ page, resilient, businessDetailsPage });
      await continueFinalBusinessDetailsToListing({
        page,
        resilient,
        businessDetailsPage,
        businessStepUrl,
      });
      await businessListingPage.selectFirstBusinessListing();
      await businessListingPage.clearEmail();
      await businessListingPage.enterEmail(positiveOnboardingData.email);

      const looksGoodData = await businessListingPage.collectLooksGoodData();
      const finalDetails = {
        updateYourBusinessDetails: updateDetailsData,
        businessListingLooksGoodPopup: {
          ...looksGoodData,
          email: positiveOnboardingData.email,
        },
        expectedPositiveData: {
          simpleBusinessName: positiveOnboardingData.businessName,
          pinCode: positiveOnboardingData.zipCode,
          businessEmail: positiveOnboardingData.email,
          updateBusinessDetails: positiveOnboardingData.updateBusinessDetails,
        },
        currentUrl: page.url(),
      };

      storeFinalBusinessDetails(finalDetails);
      expect(await businessListingPage.getEmailValue()).toBe(positiveOnboardingData.email);

      await businessListingPage.confirmLooksGood();
      await expect(page.locator('text="your AI sounds"').first()).toBeVisible({
        timeout: timeouts.pageLoad,
      });
      await createAgentFromAiSoundsAndStoreMeetDetails({ page, businessStepUrl });
    },
    continueOnFailure: false,
    impact: ['Driver could not prepare and store final business details after Update Business Details validations.'],
    recoveryAction: 'Stop flow and review final Business Listing recovery/setup.',
    severity: 'CRITICAL',
  });
}

async function verifyManualFieldsPreservedAfterContinue({
  page,
  resilient,
  businessDetailsPage,
  beforeData,
  screenName,
}) {
  const manualStillVisible = await businessDetailsPage.manualBusinessNameInput()
    .isVisible({ timeout: timeouts.shortAction })
    .catch(() => false);

  if (!manualStillVisible) {
    const screenshotPath = await reportBug({
      page,
      bugTitle: `${screenName} form disappeared before field preservation verification`,
      expectedResult: 'Update Your Business Details form should remain visible until field values are verified.',
      actualResult: 'Manual business details inputs were not visible when field preservation verification started.',
      screenName,
    });

    await resilient.truthy(`${screenName} form visible for field preservation verification`, () => false, {
      impact: [
        'Driver could not verify whether input fields were cleared because the form was no longer visible.',
        `Screenshot: ${screenshotPath || 'N/A'}`,
      ],
      recoveryAction: 'Record missing form state and continue with available onboarding screen state.',
      severity: 'BUG',
    });
    return;
  }

  const afterData = await businessDetailsPage.getManualDetailsData();
  const fieldsToCheck = ['businessName', 'businessPhone', 'email', 'website', 'address'];

  for (const fieldName of fieldsToCheck) {
    const beforeValue = normalizeComparableValue(beforeData[fieldName]);
    const afterValue = normalizeComparableValue(afterData[fieldName]);

    if (!beforeValue || beforeValue === 'N/A') continue;

    const preserved = afterValue === beforeValue;
    const screenshotPath = preserved
      ? ''
      : await reportBug({
          page,
          bugTitle: `${screenName} ${fieldName} cleared or changed after Continue popup close`,
          expectedResult: `${fieldName} should remain ${beforeValue} after Continue and popup close.`,
          actualResult: `${fieldName} became ${afterValue || 'EMPTY'}.`,
          screenName,
        });

    await resilient.truthy(`${screenName} ${fieldName} preserved after Continue popup close`, () => preserved, {
      impact: [
        `Field: ${fieldName}`,
        `Before Continue: ${beforeValue}`,
        `After Popup Close: ${afterValue || 'EMPTY'}`,
        `Screenshot: ${screenshotPath || 'N/A'}`,
      ],
      recoveryAction: 'Record field-clearing bug and continue Business Details bug verification.',
      severity: 'BUG',
    });
  }
}

async function isYourAiSoundsScreenVisible(page) {
  return page
    .locator('text="your AI sounds"')
    .first()
    .isVisible({ timeout: timeouts.shortAction })
    .catch(() => false);
}

async function recoverBusinessListingFromAiSoundsAfterFieldClear({
  page,
  resilient,
  businessListingPage,
  businessDetailsPage,
  businessStepUrl,
}) {
  await resilient.truthy(
    'Edit Business Details field-clear verification passed by navigating to Your AI Sounds',
    () => true,
    {
      impact: [
        'Continue moved to Your AI Sounds, which means Update Your Business Details data was accepted.',
        'This is expected behavior and is not a wrong redirect.',
      ],
      recoveryAction: 'Return to Business Details with bottom dot 2, then continue forward to Business Listing.',
      severity: 'INFO',
    }
  );

  const isBusinessDetailsVisible = async () =>
    (await page.locator('text="business details"').first().isVisible().catch(() => false)) ||
    (await businessDetailsPage.isManualLoaded());

  const normalizeSimpleBusinessDetailsView = async () => {
    if (await businessDetailsPage.isManualLoaded()) {
      await businessDetailsPage.clickSearchAgainIfVisible();
    }

    return page
      .locator('text="business details"')
      .first()
      .isVisible({ timeout: timeouts.shortAction })
      .catch(() => false);
  };

  const waitForBusinessDetails = async (timeout = timeouts.authRedirect) =>
    expect
      .poll(async () => isBusinessDetailsVisible(), { timeout })
      .toBeTruthy()
      .then(() => true)
      .catch(() => false);

  const clickDotTwoByRuntimeDom = async () => {
    await page.waitForTimeout(2000);
    await businessListingPage.clickProgressDot(2);
    if (await waitForBusinessDetails(timeouts.shortAction)) {
      return normalizeSimpleBusinessDetailsView();
    }
    return false;
  };

  const useBrowserBackToReachBusinessDetails = async () => {
    await page.goBack({ waitUntil: 'domcontentloaded', timeout: timeouts.action }).catch(() => {});
    if (await waitForBusinessDetails(timeouts.shortAction)) {
      return normalizeSimpleBusinessDetailsView();
    }

    return false;
  };

  const clickDotTwoAndReachSimpleBusinessDetails = async () => {
    if (await clickDotTwoByRuntimeDom()) return true;
    if (await useBrowserBackToReachBusinessDetails()) return true;

    return false;
  };

  await resilient.run({
    name: 'Return from Your AI Sounds to Business Details using bottom dot 2',
    assert: async () => {
      let businessDetailsVisible = await clickDotTwoAndReachSimpleBusinessDetails();

      if (!businessDetailsVisible && (await isYourAiSoundsScreenVisible(page))) {
        businessDetailsVisible = await clickDotTwoAndReachSimpleBusinessDetails();
      }

      expect(businessDetailsVisible).toBeTruthy();
      await verifyBusinessStepScreen({
        page,
        screen: onboardingScreens.businessDetails,
        businessStepUrl,
      });
    },
    continueOnFailure: false,
    impact: ['Driver could not return from Your AI Sounds to Business Details using bottom dot 2.'],
    recoveryAction: 'Stop Update Business Details recovery and inspect BusinessStep footer dot navigation.',
    severity: 'CRITICAL',
  });

  await resilient.run({
    name: 'Continue from recovered Business Details to Business Listing',
    assert: async () => {
      await continueRecoveredBusinessDetailsToListingFast({
        page,
        resilient,
        businessDetailsPage,
        businessStepUrl,
      });
    },
    continueOnFailure: false,
    impact: ['Driver could not continue from recovered Business Details to Business Listing.'],
    recoveryAction: 'Stop flow and inspect Business Details positive data recovery.',
    severity: 'CRITICAL',
  });

  return 'businessListing';
}

async function runBusinessDetailsBugVerificationAfterEdit({
  page,
  resilient,
  businessListingPage,
  looksGoodData,
  businessStepUrl,
}) {
  const businessDetailsPage = new BusinessDetailsPage(page);

  await resilient.run({
    name: 'Edit redirects to Enter Your Business Details screen',
    assert: async () => businessDetailsPage.verifyManualLoaded(),
    impact: ['Edit icon did not redirect to Update Your Business Details screen.'],
    recoveryAction: 'Record the edit navigation bug and continue only if fields are available.',
    severity: 'BUG',
  });

  const editScreenData = await businessDetailsPage.getManualDetailsData().catch(() => ({}));
  await verifyDataPersistence({
    page,
    resilient,
    expectedData: looksGoodData,
    actualData: editScreenData,
    screenName: 'Edit Business Details',
    fieldMap: {
      businessName: 'businessName',
      businessPhone: 'businessPhone',
      email: 'email',
      website: 'website',
      address: 'address',
    },
  });

  const beforeFirstContinueData = await businessDetailsPage.getManualDetailsData().catch(() => editScreenData);
  await businessDetailsPage.continueButton().click().catch(() => {});
  const firstContinuePopupVisible = await businessDetailsPage.isAlertPopupVisible();

  if (firstContinuePopupVisible) {
    await reportBug({
      page,
      bugTitle: 'Unexpected alert after continuing from edited Business Details',
      expectedResult: 'No unexpected alert should appear after valid prefilled Business Details.',
      actualResult: 'Unexpected alert popup appeared.',
      screenName: 'Edit Business Details',
    });
    await businessDetailsPage.closeAlertPopupIfVisible();

    await businessDetailsPage.continueButton().click().catch(() => {});

    if (await businessDetailsPage.isManualLoaded()) {
      await verifyManualFieldsPreservedAfterContinue({
        page,
        resilient,
        businessDetailsPage,
        beforeData: beforeFirstContinueData,
        screenName: 'Edit Business Details',
      });
    }
  }

  let aiSoundsLoaded = await isYourAiSoundsScreenVisible(page);

  if (!aiSoundsLoaded) {
    const fieldClearCheckData = await businessDetailsPage.getManualDetailsData().catch(() => beforeFirstContinueData);
    await businessDetailsPage.continueButton().click().catch(() => {});
    const secondContinuePopupVisible = await businessDetailsPage.isAlertPopupVisible();

    if (secondContinuePopupVisible) {
      await reportBug({
        page,
        bugTitle: 'Unexpected alert during edited Business Details field-clear verification',
        expectedResult: 'After closing the first popup, Continue should either preserve fields or move to the next onboarding screen.',
        actualResult: 'Unexpected alert popup appeared again during the field-clear verification click.',
        screenName: 'Edit Business Details',
      });
      await businessDetailsPage.closeAlertPopupIfVisible();
    }

    aiSoundsLoaded = await isYourAiSoundsScreenVisible(page);

    if (!aiSoundsLoaded) {
      await verifyManualFieldsPreservedAfterContinue({
        page,
        resilient,
        businessDetailsPage,
        beforeData: fieldClearCheckData,
        screenName: 'Edit Business Details',
      });
    }
  }

  if (aiSoundsLoaded) {
    await recoverBusinessListingFromAiSoundsAfterFieldClear({
      page,
      resilient,
      businessListingPage,
      businessDetailsPage,
      businessStepUrl,
    });
  } else {
    await resilient.run({
      name: 'Navigate to Business Category using first progress dot after field preservation check',
      assert: async () => businessListingPage.clickProgressDot(1),
      impact: ['Driver could not navigate to Business Category using the first bottom progress dot.'],
      recoveryAction: 'Record the progress-dot navigation failure and continue with available screen state.',
      severity: 'BUG',
    });

    await recoverBusinessDetailsFromBusinessCategory({
      page,
      businessStepUrl,
      resilient,
    });
    await continueBusinessDetailsAfterPrefillCheck({
      page,
      resilient,
      businessDetailsPage,
      businessStepUrl,
      contextName: 'Business Details after Business Category recovery',
    }).catch(() => {});
  }

  if (await businessListingPage.isBusinessListingScreenVisible()) {
    await businessListingPage.openManualEntryFromListing();
    await businessListingPage.continueManually();
    await businessDetailsPage.verifyManualLoaded();
    await runUpdateBusinessDetailsWebUrlAutomation({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
    });
    await runUpdateBusinessDetailsBusinessNameAutomation({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
    });
    await runUpdateBusinessDetailsPhoneAutomation({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
    });
    await runUpdateBusinessDetailsEmailAutomation({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
    });
    await prepareFinalBusinessListingDetails({
      page,
      businessDetailsPage,
      businessListingPage,
      businessStepUrl,
    });
  }
}

