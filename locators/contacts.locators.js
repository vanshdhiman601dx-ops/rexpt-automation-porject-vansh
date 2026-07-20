export const contactsLocators = {
  route: '/contacts',

  header: {
    backButton: 'button:has-text("Back"), [class*="backBtn"]',
    retryButton: 'button:has-text("Retry")',
  },

  sync: {
    reconnectGoogleButton: 'button:has-text("Reconnect")',
    dismissSyncStatusButton: 'button:has-text("✕"), button:has-text("×")',
    googleContactsButton: 'button:has-text("Google Contacts")',
    phoneContactsButton: 'button:has-text("Phone Contacts")',
    skipButton: 'button:has-text("Skip")',
  },

  contactsList: {
    searchInput: 'input[placeholder*="Search" i]',
    contactRow: '[class*="contact"], tr',
    importButton: 'button:has-text("Import")',
    syncButton: 'button:has-text("Sync")',
  },
};
