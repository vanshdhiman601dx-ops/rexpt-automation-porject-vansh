export const calendarLocators = {
  route: '/calendar',
  connectCalendarRoute: '/connect-calender',
  connectCalendarV2Route: '/connect-calender2',

  calendar: {
    viewSelect: 'select',
    eventCard: '[role="button"], [class*="event"]',
    dayCell: '[class*="day"], [role="gridcell"]',
  },

  calCom: {
    eventTypesLink: 'a[href="https://app.cal.com/event-types"]',
    apiKeysLink: 'a[href="https://app.cal.com/settings/developer/api-keys"]',
    apiKeyInput: 'input[placeholder="Cal.com API Key"]',
    submitButton: 'text=/Submit|Connect|Save/',
    guideLink: 'a[href="/calinfo"]',
    whyCalLink: 'a:has-text("Why Cal.com Account")',
    createAccountLink: 'a[href*="cal.com"]',
  },

  eventModal: {
    titleInput: 'input[placeholder="Meeting with John"]',
    descriptionInput: 'input[placeholder="Follow-up session"]',
    lengthInput: 'input[placeholder="30"]',
    cancelButton: 'button:has-text("Cancel")',
    createButton: 'button:has-text("Create"), button:has-text("Save")',
  },

  providerConnect: {
    googleProvider: 'text=/Google Calendar|Google/',
    outlookProvider: 'text=/Outlook|Microsoft/',
    appleProvider: 'text=/Apple Calendar|Apple/',
    connectButton: 'button:has-text("Connect")',
    disconnectButton: 'button:has-text("Disconnect")',
  },

  appleCalendar: {
    appleIdInput: 'input[placeholder="Apple ID email (e.g. you@icloud.com)"]',
    appPasswordInput: 'input[placeholder="App-specific password (xxxx-xxxx-xxxx-xxxx)"]',
    manageAppleAccountLink: 'a[href="https://account.apple.com/account/manage"]',
    connectButton: 'button:has-text("Connect")',
  },
};
