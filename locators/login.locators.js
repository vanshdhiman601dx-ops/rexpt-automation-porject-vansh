export const loginLocators = {
  splashScreen1Logo: 'img[alt="Rexpt Logo"]',
  splashScreen1HowItWorksButton:
    '[class*="btnTheme"]:has-text("How it Works"), button:has-text("How it Works"), [role="button"]:has-text("How it Works")',
  splashScreen2Logo: 'img[alt="Rexpt Logo"]',
  splashScreen2BuildMyReceptionistButton:
    '[class*="btnTheme"]:has-text("Build My Receptionist"), button:has-text("Build My Receptionist"), [role="button"]:has-text("Build My Receptionist")',
  landingPrimaryCta:
    '[class*="btnTheme"]:has-text("How it Works"), button:has-text("How it Works"), [role="button"]:has-text("How it Works")',
  landingBuildReceptionistCta:
    '[class*="btnTheme"]:has-text("Build My Receptionist"), button:has-text("Build My Receptionist"), [role="button"]:has-text("Build My Receptionist")',
  landingSkipLink: 'text=/^Skip\\s*$/',
  howItWorksButton: '[class*="btnTheme"]:has-text("How it Works")',
  buildMyReceptionistButton: '[class*="btnTheme"]:has-text("Build My Receptionist")',
  emailModeToggle: 'text="Sign In with Email"',
  emailInput: 'input[type="email"][placeholder="Enter your email"]',
  passwordInput: '[data-testid="password"]',
  loginButton: '[data-testid="login-button"]',
  sendOtpButton:
    '[class*="btnTheme"]:has-text("Send One Time Password"), [class*="BtnDiv"]:has-text("Send One Time Password") [class*="btnTheme"], button:has-text("Send One Time Password")',
  sendOtpText: 'text="Send One Time Password"',
  otpInput: (index) => `#otp-${index}`,
  otpScreenText: 'text=Enter the code sent to your email',
  otpEmailSentText: 'text=Email has been sent to',
  continueButton: 'text="Continue"',
  resendOtpButton: 'xpath=//p[contains(., "spam folder")]/following::button[1]',
  popup: '[class*="popup"]',
  popupMessage: '[class*="message"]',
  popupCloseButton: 'button:has-text("Close")',
  googleLoginButton: '[data-testid="google-login"]',
  googleLoginFrame: 'iframe[title*="Sign in with Google"], iframe[title*="Continue with Google"]',
  googleLoginIcon: 'img[alt="Continue with Google"], img[alt="Sign in with Google"], img[alt="Google"]',
  googleGisButton: '[class*="nsm7Bb-HzV7m-LgbsSe"], [role="button"]:has-text("Continue with Google"), [role="button"]:has-text("Sign in with Google")',
  googleLoginSvgIcon: 'xpath=//*[local-name()="svg" and @xmlns="http://www.w3.org/2000/svg"]',
  googleLoginSvgButton:
    'xpath=//*[local-name()="svg" and @xmlns="http://www.w3.org/2000/svg"]/ancestor::*[self::button or @role="button"][1]',
  googleLoginText: 'text=/Sign in with Google|Continue with Google/',
  googleOauthEmailInput: 'input[type="email"], #identifierId',
  googleOauthPasswordInput: 'input[type="password"], input[name="Passwd"]',
  googleOauthNextButton: '#identifierNext button, #passwordNext button, button:has-text("Next"), [role="button"]:has-text("Next")',
  googleOauthContinueButton: 'button:has-text("Continue"), [role="button"]:has-text("Continue"), button:has-text("Allow"), [role="button"]:has-text("Allow")',
  googleOauthSomethingWentWrong: 'text=/Something went wrong|Sorry, something went wrong there/i',
  googleOauthRestartButton: 'button:has-text("Restart"), [role="button"]:has-text("Restart")',
  googleOauthErrorCode: 'text=/\\b(?:400|401|403|404|429|500)\\b|Error\\s*\\d+|status\\s*code/i',
  googleOauthCloseButton:
    'button[aria-label="Close"], [aria-label="Close"], button:has-text("Close"), [role="button"]:has-text("Close"), button:has-text("Cancel"), [role="button"]:has-text("Cancel")',
  errorMessage: '[data-testid="login-error"]',
};
