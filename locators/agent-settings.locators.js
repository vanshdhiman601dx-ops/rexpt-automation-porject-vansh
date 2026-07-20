export const agentSettingsLocators = {
  editAgentRoute: '/edit-agent',
  editBusinessTypeRoute: '/edit-business-type',
  editServicesOfferedRoute: '/edit-services-offered',
  editPublicRoute: '/edit-public',
  editPublicListingRoute: '/edit-public-listing',
  editBusinessDetailRoute: '/edit-business-detail',
  editLanguageRoute: '/edit-language',
  editGenderRoute: '/edit-gender',
  editNameAvatarRoute: '/edit-name-avtar',

  editAgent: {
    setupCard: (label) => `text="${label}"`,
  },

  businessType: {
    searchInput: 'input[placeholder="Quick find Business type"]',
    categoryCheckbox: 'input[type="checkbox"]',
    customServiceInput: 'input[placeholder="Enter your service name"]',
    saveButton: 'text=/Save|Continue/',
  },

  servicesOffered: {
    searchInput: 'input[placeholder="Quick find service"]',
    serviceCheckbox: 'input[type="checkbox"]',
    customServiceInput: 'input[placeholder="Enter your service name"]',
    addServiceButton: 'button:has-text("Add")',
    continueButton: 'text=/Save|Continue/',
  },

  publicListing: {
    businessSearchInput: 'input[placeholder="Type the name of your Business to Search"]',
    confirmNoButton: 'button:has-text("No")',
    confirmYesButton: 'button:has-text("Yes")',
    continueButton: 'text=/Continue|Save/',
  },

  businessDetail: {
    websiteInput: 'input[placeholder="https://Designersx.us"]',
    businessNameInput: 'input[placeholder="Your Business Name"]',
    phoneInput: 'input[placeholder="+1 (123)456-7890"]',
    addressInput: 'input[placeholder="Business Address"]',
    emailInput: 'input[placeholder="Business Email Address"]',
    introTextarea: 'textarea[placeholder="Write an Intro for your Business here"]',
    siteMapButton: 'text=/Sitemap|Site Map/',
    submitButton: 'text=/Save|Submit|Continue/',
  },

  language: {
    languageOption: (language) => `text="${language}"`,
    saveButton: 'text=/Save|Continue/',
  },

  gender: {
    genderOption: (gender) => `text="${gender}"`,
    voiceOption: (voice) => `text="${voice}"`,
    saveButton: 'text=/Save|Continue/',
  },

  nameAvatar: {
    nameInput: 'input[placeholder="Ex- Smith, Nova"]',
    avatarOption: 'input[type="radio"], [class*="avatar"]',
    previousAvatarButton: '[class*="arrowLeft"]',
    nextAvatarButton: '[class*="arrowRight"]',
    saveButton: 'text=/Save|Continue/',
  },
};
