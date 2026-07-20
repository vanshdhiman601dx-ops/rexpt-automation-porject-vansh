export const publicPagesLocators = {
  publicCallRoute: '/public-call',
  comparisonRoute: '/the-comparison',
  solutionRoute: '/the-solution',
  deleteAccountRoute: '/delete-account',

  publicCall: {
    startCallButton: 'button:has-text("Call"), text=/Start|Call/',
    endCallButton: 'button:has-text("End"), text=/End Call/',
    nameInput: 'input[placeholder*="name" i]',
    phoneInput: 'input[placeholder*="phone" i], input[type="tel"]',
  },

  marketing: {
    primaryCta: 'button:has-text("Get Started"), a:has-text("Get Started")',
    secondaryCta: 'button:has-text("Learn More"), a:has-text("Learn More")',
  },

  deleteAccount: {
    emailInput: 'input[type="email"], input[placeholder*="email" i]',
    reasonTextarea: 'textarea',
    deleteButton: 'button:has-text("Delete")',
    cancelButton: 'button:has-text("Cancel")',
    confirmButton: 'button:has-text("Confirm")',
  },
};
