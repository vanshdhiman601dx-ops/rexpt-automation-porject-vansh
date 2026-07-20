export const signupLocators = {
  pageTitle: 'text=Log In to your Account',
  pageSubtitle: "text=If it doesn't exist, we'll create one for you completely free!",
  emailInput:
    'input[type="email"][placeholder="Johnvick@gmail.com"], input[type="email"][placeholder="Enter your email"]',
  sendOtpButton: 'text="Send One Time Password"',
  otpInput: (index) => `#otp-${index}`,
  otpScreenText: 'text=Enter the code sent to your email',
  otpEmailSentText: 'text=Email has been sent to',
  continueButton: 'text="Continue"',
  resendOtpButton: 'xpath=//p[contains(., "spam folder")]/following::button[1]',
  popup: '[class*="popup"]',
  popupMessage: '[class*="message"]',
  popupCloseButton: 'button:has-text("Close")',
  googleLoginText: 'text=/Continue with Google|Sign in with Google/',
  termsLink: 'a:has-text("Terms & Conditions")',
  privacyLink: 'a:has-text("Privacy Policy")',
};
