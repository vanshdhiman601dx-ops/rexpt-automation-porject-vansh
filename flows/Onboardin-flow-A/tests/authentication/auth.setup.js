import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import otpData from '../../../../test-data/login/otpData.json' with { type: 'json' };
import signupOtpData from '../../../../test-data/signup/signupOtpData.json' with { type: 'json' };
import { LoginPage } from '../../pages/authentication/LoginPage.js';
// import { GoogleLoginPage } from '../../pages/authentication/GoogleLoginPage.js';
import { FastAgentDetailsPage } from '../../pages/fast-agent-details/FastAgentDetailsPage.js';
import { PersonalDetailsPage } from '../../pages/onboarding-browsercloses-flow/PersonalDetailsPage.js';
import { OTPHelper } from '../../../../helpers/OTPHelper.js';
import { AssertionImpactReporter } from '../../../../utils/AssertionImpactReporter.js';
import { ResilientAssertions } from '../../../../utils/Assertions.js';
import { CriticalFailureHandler } from '../../../../utils/CriticalFailureHandler.js';
import envConfig from '../../../../config/config.js';
import { timeouts } from '../../../../config/timeouts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.resolve(__dirname, '../../../../playwright/.auth/users.json');

async function verifyNoAuthenticationBypass({ loginPage, reporter, criticalFailureHandler, scenario }) {
  const authenticated = loginPage.isOnUrl(otpData.finalUrl) || (await loginPage.hasAuthToken());

  if (authenticated) {
    await criticalFailureHandler.authenticationBypass({
      page: loginPage.page,
      reason: `Authentication bypass detected after ${scenario}.`,
    });
  }

  reporter.record({
    assertionName: `Security validation - ${scenario}`,
    status: 'PASS',
    impact: ['User remains unauthenticated after invalid authentication attempt.'],
    recoveryAction: 'Continue executing remaining authentication validations.',
    severity: 'SECURITY',
  });
}

function recordSkipped(reporter, assertionName, impact) {
  reporter.record({
    assertionName,
    status: 'SKIPPED',
    failureReason: 'Dependent prerequisite failed.',
    impact,
    recoveryAction: 'Skipped because executing this validation would produce misleading results.',
    severity: 'SKIPPED',
  });
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

async function completeSignupViaEmailOtp({
  page,
  loginPage,
  personalDetailsPage,
  resilient,
  reporter,
}) {
  const signupEmail = envConfig.signup.email;
  const detailsUrl = envConfig.signup.detailsUrl;

  const signupScreenReady = await resilient.run({
    name: 'Sign Up email screen verification',
    assert: async () => {
      await loginPage.verifyLoginScreen();
      await loginPage.openEmailLogin();
    },
    impact: [
      'Sign Up email screen could not be verified.',
      'Sign Up OTP flow was skipped.',
    ],
    recoveryAction: 'Stop Sign Up flow if email screen is unavailable.',
  });

  if (!signupScreenReady) return false;

  await resilient.run({
    name: 'Sign Up email entry verification',
    assert: async () => {
      await loginPage.enterEmail(signupEmail);
      await loginPage.expectEmailValue(signupEmail);
    },
    impact: ['Sign Up OTP may be sent to an incorrect email.'],
    recoveryAction: 'Continue only after configured email is entered correctly.',
    continueOnFailure: false,
  });

  const otpRequested = await resilient.run({
    name: 'Sign Up OTP request verification',
    assert: async () => loginPage.sendOtp(),
    impact: [
      'Sign Up OTP request failed.',
      'OTP screen could not be verified.',
    ],
    recoveryAction: 'Stop Sign Up flow if OTP request fails.',
  });

  if (!otpRequested) return false;

  const otpScreenReady = await resilient.run({
    name: 'Sign Up OTP screen verification',
    assert: async () => loginPage.verifyOtpScreen(signupEmail),
    impact: ['Sign Up OTP screen was not displayed.'],
    recoveryAction: 'Stop Sign Up flow if OTP screen is unavailable.',
  });

  if (!otpScreenReady) return false;

  await resilient.run({
    name: 'Sign Up OTP timer verification',
    assert: async () => loginPage.getResendOtpTimerText(),
    impact: ['OTP timer/resend control was not visible.'],
    recoveryAction: 'Continue because OTP can still be entered manually.',
  });

  OTPHelper.showTerminalMessage(`Entering fixed Sign Up OTP for ${signupEmail}.`);
  await loginPage.clearOtp();
  await loginPage.fillOtp(otpData.validOtp.split(''));
  await loginPage.continueWithOtp();

  const signupOtpSucceeded = await resilient.run({
    name: 'Sign Up fixed OTP redirect verification',
    assert: async () => expect(page).toHaveURL(detailsUrl, { timeout: timeouts.authRedirect }),
    impact: [
      'Fixed Sign Up OTP did not redirect to Personal Details.',
      'Personal Details onboarding flow was not reached.',
    ],
    recoveryAction: 'Validate error popup and stop Sign Up automation gracefully.',
  });

  if (!signupOtpSucceeded) {
    await resilient.run({
      name: 'Sign Up fixed OTP failure popup validation',
      assert: async () => {
        const primaryMessageVisible = await loginPage.isPopupMessageVisible(
          signupOtpData.messages.invalidOtp,
          timeouts.action
        );

        if (primaryMessageVisible) {
          await loginPage.expectPopupMessage(signupOtpData.messages.invalidOtp);
          return;
        }

        await loginPage.expectPopupMessage(signupOtpData.messages.invalidOtpFallback);
      },
      impact: ['Fixed OTP failure popup was not validated after failed Sign Up attempt.'],
      recoveryAction: 'Close popup and stop Sign Up flow.',
    });

    await resilient.run({
      name: 'Sign Up fixed OTP failure popup close verification',
      assert: async () => loginPage.closePopup(),
      impact: ['Fixed OTP failure popup may block later cleanup.'],
      recoveryAction: 'Stop Sign Up flow after closing the popup.',
    });

    recordSkipped(reporter, 'Sign Up Personal Details verification', [
      'Fixed Sign Up OTP verification did not complete successfully.',
      'Personal Details onboarding flow was not reached.',
    ]);
    return false;
  }

  const personalDetailsLoaded = await resilient.run({
    name: 'Personal Details page verification',
    assert: async () => personalDetailsPage.verifyLoaded(detailsUrl),
    impact: ['Personal Details onboarding page did not load correctly.'],
    recoveryAction: 'Review Sign Up redirect and onboarding page rendering.',
  });

  return personalDetailsLoaded;
}

// Temporarily skipped: legacy Login OTP + Google authentication setup is kept for future reuse.
test.describe.skip('Login via Email OTP authentication setup', () => {
  test.setTimeout(timeouts.test);

  test('validates OTP flow and stores authenticated session', async ({ page }) => {
    const reporter = new AssertionImpactReporter();
    reporter.initialize();

    const resilient = new ResilientAssertions(reporter);
    const criticalFailureHandler = new CriticalFailureHandler(reporter);
    const loginPage = new LoginPage(page);
    const fastAgentDetailsPage = new FastAgentDetailsPage(page);
    // const googleLoginPage = new GoogleLoginPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);

    const launched = await resilient.run({
      name: 'Application launch',
      assert: async () => loginPage.goto(),
      impact: [
        'Login screen validation could not be completed.',
        'OTP flow could not be executed.',
        'Dashboard verification was skipped.',
      ],
      recoveryAction: 'Terminate because the application is not reachable.',
      continueOnFailure: false,
    }).catch(async (error) => {
      await criticalFailureHandler.applicationCrash({
        page,
        flowName: 'Login Flow',
        error,
      });
      return false;
    });

    if (!launched) return;

    await resilient.run({
      name: 'Application title verification',
      assert: async () => loginPage.verifyTitle(otpData.expectedTitle),
      impact: [
        'Login screen branding validation may be unreliable.',
        'Authentication flow will continue because the application is reachable.',
      ],
      recoveryAction: 'Continue with login screen validation.',
    });

    const emailLoginReady = await resilient.run({
      name: 'Login page email mode verification',
      assert: async () => loginPage.openEmailLogin(),
      impact: [
        'Email entry verification could not be completed.',
        'OTP request could not be executed.',
        'Authentication session could not be generated.',
      ],
      recoveryAction: 'Skip OTP flow if email login is unavailable.',
    });

    if (!emailLoginReady) {
      recordSkipped(reporter, 'OTP authentication flow', [
        'Email login screen was unavailable.',
        'OTP validation, expiration, resend, and session storage were skipped.',
      ]);
      return;
    }

    await resilient.run({
      name: 'Email entry verification',
      assert: async () => {
        await loginPage.enterEmail(otpData.email);
        await loginPage.expectEmailValue(otpData.email);
      },
      impact: [
        'OTP request may be sent to an incorrect or empty email.',
        'Manual OTP entry instructions may be invalid.',
      ],
      recoveryAction: 'Continue only if the entered email value can be verified.',
      continueOnFailure: false,
    });

    const otpRequested = await resilient.run({
      name: 'Send OTP request verification',
      assert: async () => loginPage.sendOtp(),
      impact: [
        'OTP page verification could not be completed.',
        'OTP input validation could not be executed.',
        'Session storage could not be generated.',
      ],
      recoveryAction: 'Skip OTP validations because OTP request/navigation failed.',
    });

    if (!otpRequested) {
      recordSkipped(reporter, 'OTP validation suite', [
        'Send OTP request or OTP page navigation failed.',
        'Negative OTP scenarios, expiration, resend, and authentication checks were skipped.',
      ]);
      return;
    }

    const otpScreenReady = await resilient.run({
      name: 'OTP page verification',
      assert: async () => loginPage.verifyOtpScreen(otpData.email),
      impact: [
        'OTP input validation could not be executed.',
        'Popup validation could not be completed.',
        'Session storage could not be generated.',
      ],
      recoveryAction: 'Skip OTP validations because OTP screen is unavailable.',
    });

    await resilient.run({
      name: 'Initial popup close verification',
      assert: async () => loginPage.closePopupIfVisible(),
      impact: ['A leftover success/error popup may block OTP input interactions.'],
      recoveryAction: 'Continue because popup may not always be present.',
    });

    if (!otpScreenReady) {
      recordSkipped(reporter, 'OTP validation suite', [
        'OTP screen did not render correctly.',
        'Negative OTP scenarios, expiration, resend, and authentication checks were skipped.',
      ]);
      return;
    }

    for (const otpCase of otpData.fieldValidationCases) {
      await test.step(`Field validation: ${otpCase.name}`, async () => {
        await loginPage.fillOtp(otpCase.values);
        await resilient.run({
          name: `OTP input validation - ${otpCase.name}`,
          assert: async () => OTPHelper.expectOtpValues(loginPage, otpCase.expectedValues),
          impact: [
            `${otpCase.name} field restriction could not be confirmed.`,
            'Character filtering report may be incomplete for this scenario.',
          ],
          recoveryAction: 'Continue with the next OTP validation case.',
        });

        if (otpCase.submit) {
          await loginPage.continueWithOtp();
          await resilient.run({
            name: `Popup validation - ${otpCase.name}`,
            assert: async () => loginPage.expectPopupMessage(otpCase.expectedPopupMessage),
            impact: [
              `${otpCase.name} popup content could not be validated.`,
              'Negative OTP feedback report is incomplete for this scenario.',
            ],
            recoveryAction: 'Attempt to close popup and continue with next scenario.',
          });
          await resilient.run({
            name: `Popup close verification - ${otpCase.name}`,
            assert: async () => loginPage.closePopup(),
            impact: ['Popup may block subsequent OTP scenarios.'],
            recoveryAction: 'Continue; next scenario will attempt to clear OTP fields.',
          });
        }
      });
    }

    for (const otpCase of otpData.pasteValidationCases) {
      await test.step(`Paste validation: ${otpCase.name}`, async () => {
        await loginPage.pasteOtp(otpCase.pasteValue);
        await resilient.run({
          name: `OTP paste validation - ${otpCase.name}`,
          assert: async () => OTPHelper.expectOtpValues(loginPage, otpCase.expectedValues),
          impact: [
            `${otpCase.name} paste distribution could not be confirmed.`,
            'Paste behavior report may be incomplete for this scenario.',
          ],
          recoveryAction: 'Continue with the next paste validation case.',
        });

        if (otpCase.submit) {
          await loginPage.continueWithOtp();
          await resilient.run({
            name: `Popup validation - ${otpCase.name}`,
            assert: async () => loginPage.expectPopupMessage(otpCase.expectedPopupMessage),
            impact: [`${otpCase.name} popup content could not be validated.`],
            recoveryAction: 'Attempt to close popup and continue with next scenario.',
          });
          await resilient.run({
            name: `Popup close verification - ${otpCase.name}`,
            assert: async () => loginPage.closePopup(),
            impact: ['Popup may block subsequent OTP scenarios.'],
            recoveryAction: 'Continue; next scenario will attempt to clear OTP fields.',
          });
        }
      });
    }

    await test.step('Invalid OTP backend validation', async () => {
      await loginPage.pasteOtp(otpData.invalidOtp);
      await resilient.run({
        name: 'Invalid OTP input distribution verification',
        assert: async () => OTPHelper.expectOtpValues(loginPage, otpData.invalidOtp.split('')),
        impact: ['Invalid OTP backend validation may not use the intended OTP value.'],
        recoveryAction: 'Continue to backend validation with the current OTP value.',
      });
      await loginPage.continueWithOtp();

      await verifyNoAuthenticationBypass({
        loginPage,
        reporter,
        criticalFailureHandler,
        scenario: 'invalid OTP submission',
      });

      await resilient.run({
        name: 'Invalid OTP popup validation',
        assert: async () => loginPage.expectPopupMessage(otpData.messages.invalidOtp),
        impact: [
          'Invalid OTP error popup could not be validated.',
          'Invalid OTP negative scenario report is incomplete.',
        ],
        recoveryAction: 'Attempt to close popup and continue with expiration validation.',
      });
      await resilient.run({
        name: 'Invalid OTP popup close verification',
        assert: async () => loginPage.closePopup(),
        impact: ['Expired OTP flow may be blocked by the invalid OTP popup.'],
        recoveryAction: 'Continue with expiration flow.',
      });
    });

    await test.step('Complete successful login with fixed OTP', async () => {
      OTPHelper.showTerminalMessage('Negative OTP test cases completed.');
      await loginPage.clearOtp();

      OTPHelper.showTerminalMessage(`Entering fixed login OTP for ${otpData.email}.`);
      await loginPage.fillOtp(otpData.validOtp.split(''));
      await loginPage.continueWithOtp();

      const firstValidOtpAttemptSucceeded = await resilient.run({
        name: 'Successful fixed OTP authentication URL verification',
        assert: async () => expect(page).toHaveURL(otpData.finalUrl, { timeout: timeouts.authRedirect }),
        impact: [
          'Fast Agent Details page verification could not be completed.',
          'Logout validation could not be completed.',
          'Google login transition flow could not be executed.',
          'Stored session may not represent an authenticated user.',
        ],
        recoveryAction: 'Check whether a wrong OTP popup appeared and stop the login flow.',
      });

      if (!firstValidOtpAttemptSucceeded) {
        const invalidOtpPopupVisible = await resilient.run({
          name: 'Fixed OTP failure popup validation',
          assert: async () => loginPage.expectPopupMessage(otpData.messages.invalidOtp),
          impact: [
            'The wrong OTP popup could not be confirmed after fixed OTP submission.',
            'The fixed OTP backend support may not be active.',
          ],
          recoveryAction: 'Close the popup and skip successful login verification.',
        });

        if (invalidOtpPopupVisible) {
          await resilient.run({
            name: 'Fixed OTP failure popup close verification',
            assert: async () => loginPage.closePopup(),
            impact: ['The popup may block later cleanup.'],
            recoveryAction: 'Skip successful login after closing the popup.',
          });
        }

        recordSkipped(reporter, 'Fixed OTP login flow', [
          'Fixed OTP did not redirect to Fast Agent Details.',
          'Logout, Google login, and storage state generation were skipped.',
        ]);
        return;
      }

      await resilient.run({
        name: 'Successful authentication final URL verification',
        assert: async () => expect(page).toHaveURL(otpData.finalUrl, { timeout: timeouts.authRedirect }),
        impact: [
          'Fast Agent Details page verification could not be completed.',
          'Logout validation could not be completed.',
          'Google login transition flow could not be executed.',
          'Stored session may not represent an authenticated user.',
        ],
        recoveryAction: 'Continue to page and token validation to confirm authentication state.',
      });

      const fastAgentDetailsLoaded = await resilient.run({
        name: 'Fast Agent Details page load verification',
        assert: async () => fastAgentDetailsPage.verifyLoaded(otpData.finalUrl),
        impact: [
          'Logout button could not be verified.',
          'Logout validation was skipped.',
          'Google login transition flow was skipped.',
          'Storage state generation was skipped.',
        ],
        recoveryAction: 'Skip logout and Google transition if the authenticated landing page is unavailable.',
      });

      if (!fastAgentDetailsLoaded) {
        recordSkipped(reporter, 'OTP to Google login transition', [
          'Fast Agent Details page did not load after OTP authentication.',
          'Logout, login screen verification, Google login, and storage state generation were skipped.',
        ]);
        return;
      }

      const tokenPresent = await resilient.truthy(
        'Successful authentication token verification',
        async () => loginPage.hasAuthToken(),
        {
          impact: [
            'Authentication may not have completed successfully.',
            'Storage state generation may be invalid for dashboard suites.',
          ],
          recoveryAction: 'Attempt storage state generation only if authentication token exists.',
        }
      );

      if (!tokenPresent) {
        recordSkipped(reporter, 'Storage state generation', [
          'Authentication token was not present.',
          'Logout and Google transition cannot safely continue from a confirmed OTP session.',
          'Future authenticated suites cannot safely reuse this session.',
        ]);
        return;
      }

      const loggedOut = await resilient.run({
        name: 'Fast Agent Details logout verification',
        assert: async () => fastAgentDetailsPage.logout(),
        impact: [
          'Login screen verification could not be completed.',
          'Google login transition flow was skipped.',
          'Storage state generation was skipped.',
        ],
        recoveryAction: 'Skip Google login transition because the OTP-authenticated user could not be logged out.',
      });

      if (!loggedOut) {
        recordSkipped(reporter, 'Google login transition after OTP logout', [
          'Logout from Fast Agent Details failed.',
          'Login screen verification, Google login, and storage state generation were skipped.',
        ]);
        return;
      }

      const sessionCleared = await resilient.run({
        name: 'Logout session clear verification',
        assert: async () => {
          await loginPage.clearAuthenticationSession();
          await fastAgentDetailsPage.verifySessionCleared();
        },
        impact: [
          'The browser may still contain authenticated OTP session data.',
          'Google login transition could reuse stale user state.',
          'Storage state generation was skipped.',
        ],
        recoveryAction: 'Skip Google login transition until logout clears local and session storage.',
      });

      if (!sessionCleared) {
        recordSkipped(reporter, 'Google login transition after logout', [
          'Logout completed, but authenticated storage was not fully cleared.',
          'Login screen verification, Google login, and storage state generation were skipped.',
        ]);
        return;
      }

      const loginScreenReady = await resilient.run({
        name: 'Login screen verification after logout',
        assert: async () => fastAgentDetailsPage.verifyLoggedOutToLoginScreen(),
        impact: [
          'Google login flow could not be started from a verified login screen.',
          'Storage state generation was skipped.',
        ],
        recoveryAction: 'Skip Google login until the Rexpt login screen is visible again.',
      });

      if (!loginScreenReady) {
        recordSkipped(reporter, 'Google login transition after logout', [
          'Rexpt login screen was not visible after logout.',
          'Google login and storage state generation were skipped.',
        ]);
        return;
      }

      // Google sign-in flow temporarily commented out. Keep this block for future reuse.
      // const googleAuthenticated = await resilient.run({
      //   name: 'Google authentication after OTP logout',
      //   assert: async () =>
      //     googleLoginPage.completeGoogleAuthentication({
      //       ...getGoogleAccount(),
      //       finalUrl: envConfig.auth.finalUrl,
      //     }),
      //   impact: [
      //     'Final authenticated session could not be generated through Google login.',
      //     'Storage state generation was skipped.',
      //   ],
      //   recoveryAction: 'Review Google account configuration or OAuth prompt state before rerunning.',
      // });
      //
      // if (!googleAuthenticated) {
      //   recordSkipped(reporter, 'Google login assertions and Sign Up flow', [
      //     'Google authentication after OTP logout did not complete.',
      //     'Google login assertions, logout, session clearing, Sign Up, and storage state generation were skipped.',
      //   ]);
      //   return;
      // }
      //
      // const googleFastAgentDetailsLoaded = await resilient.run({
      //   name: 'Google login Fast Agent Details verification',
      //   assert: async () => fastAgentDetailsPage.verifyLoaded(envConfig.auth.finalUrl),
      //   impact: [
      //     'Google login did not land on Fast Agent Details.',
      //     'Google logout, session clearing, Sign Up, and storage state generation were skipped.',
      //   ],
      //   recoveryAction: 'Stop the flow because Google login assertions are mandatory.',
      // });
      //
      // if (!googleFastAgentDetailsLoaded) return;
      //
      // const googleLoggedOut = await resilient.run({
      //   name: 'Google authenticated user logout verification',
      //   assert: async () => fastAgentDetailsPage.logout(),
      //   impact: [
      //     'The Google-authenticated user could not be logged out.',
      //     'Sign Up flow was not started from a verified logged-out state.',
      //   ],
      //   recoveryAction: 'Stop before Sign Up because proper application logout is required.',
      // });
      //
      // if (!googleLoggedOut) return;
      //
      // const googleLoginScreenReady = await resilient.run({
      //   name: 'Login screen verification after Google logout',
      //   assert: async () => {
      //     await fastAgentDetailsPage.verifyLoggedOutToLoginScreen();
      //     await loginPage.verifyLoginScreen();
      //   },
      //   impact: [
      //     'The login screen was not visible after Google logout.',
      //     'Sign Up flow could not start from the required screen.',
      //   ],
      //   recoveryAction: 'Stop before Sign Up because login screen verification is required.',
      // });
      //
      // if (!googleLoginScreenReady) return;
      //
      // const googleSessionCleared = await resilient.run({
      //   name: 'Google logout session clear verification',
      //   assert: async () => {
      //     await loginPage.clearAuthenticationSession();
      //     await fastAgentDetailsPage.verifySessionCleared();
      //   },
      //   impact: [
      //     'The browser may still contain Google-authenticated session data.',
      //     'Sign Up could reuse stale user state.',
      //   ],
      //   recoveryAction: 'Stop before Sign Up until the browser session is clean.',
      // });
      //
      // if (!googleSessionCleared) return;

      const signupCompleted = await completeSignupViaEmailOtp({
        page,
        loginPage,
        personalDetailsPage,
        resilient,
        reporter,
      });

      if (!signupCompleted) {
        recordSkipped(reporter, 'Storage state generation after Sign Up', [
          'Sign Up via Email OTP did not complete.',
          'Personal Details page was not verified.',
          'Future authenticated suites cannot safely reuse this session.',
        ]);
        return;
      }

      await resilient.run({
        name: 'Storage state generation',
        assert: async () => loginPage.saveSession(authFile),
        impact: [
          'Authenticated session could not be persisted.',
          'Future dashboard suites may need to authenticate again.',
        ],
        recoveryAction: 'Review storage state path and filesystem permissions.',
      });
    });
  });
});
