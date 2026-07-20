export const billingLocators = {
  checkoutRoute: '/checkout',
  plansRoute: '/plans',
  recommendedPlanRoute: '/recommended-plan',
  paymentSuccessRoute: '/payment-success',
  cancelPaymentRoute: '/cancel-payment',

  plans: {
    monthlyToggle: 'text="Monthly"',
    yearlyToggle: 'text="Yearly"',
    billingToggle: 'button[aria-label="Toggle billing interval"], text=/Monthly|Yearly/',
    planCard: (plan) => `text="${plan}"`,
    subscribeButton: 'text=/Subscribe|Get Started|Start Trial|Continue/',
    customPlanButton: 'text=/Custom|Build your own/',
    featureExpandButton: 'button:has-text("Show"), button:has-text("View")',
  },

  recommendedPlan: {
    backToPlansButton: 'button:has-text("Back"), button:has-text("Plans")',
    startTrialButton: 'button:has-text("Start Trial")',
    continueButton: 'button:has-text("Continue")',
    dismissButton: 'button[aria-label="Dismiss"]',
    contactSupportLink: 'a[href="mailto:support@rxpt.us"]',
    topTierModalCloseButton: 'button:has-text("Close")',
  },

  checkout: {
    nameInput: 'input[name="name"], input[placeholder*="Name" i]',
    emailInput: 'input[type="email"], input[placeholder*="email" i]',
    phoneInput: 'input[type="tel"], input[placeholder*="phone" i]',
    countryInput: 'input[placeholder="Select Country"]',
    nextButton: 'button:has-text("Next")',
    promoCodeInput: 'input[placeholder="Enter Promo Code"]',
    applyPromoButton: 'button:has-text("Apply")',
    removePromoButton: 'button:has-text("Remove")',
  },

  emailVerification: {
    emailInput: 'input[placeholder="Enter email"]',
    sendOtpButton: 'button:has-text("Send")',
    otpInput: 'input[placeholder="Enter OTP"]',
    verifyOtpButton: 'button:has-text("Verify")',
  },

  invoices: {
    invoiceLink: 'a[href]',
    downloadButton: 'button:has-text("Download")',
  },

  success: {
    progressToggleButton: 'button:has-text("Progress"), button[aria-expanded]',
    continueButton: 'button:has-text("Continue")',
    dashboardButton: 'button:has-text("Dashboard"), text="Go to Dashboard"',
    invoiceLink: 'a[href]',
  },
};
