export const dashboardLocators = {
  route: '/fast-agent-detail',

  navigation: {
    homeButton: '#tour-footer-home',
    calendarButton: '#tour-footer-calendar',
    moreButton: '#tour-footer-more, button[aria-label="Create"]',
    contactsButton: '#tour-footer-contacts',
    notificationsButton: 'img[alt="Notification_icon"], img[alt="Notification_icon_active"]',
    profileButton: '[aria-label="Profile"], img[alt="Profile"]',
    logoutButton: 'button[aria-label="Logout"]',
  },

  cards: {
    agentCard: 'text=/AI Agent Phone Number/',
    setupScoreCard: 'text=/Setup Score/',
    analysisCard: 'text="Agent Analysis"',
    publicUrlCard: '#tour-public-agent-url',
    totalCallsCard: '#tour-total-calls',
  },

  actions: {
    continueSetupButton: 'button:has-text("Continue Setup")',
    testAgentCallButton: '[role="button"]:has-text("Test Agent Call")',
    assignPhoneNumberButton: '[role="button"]:has-text("Assign Phone Number")',
    callRoutingButton: '#tour-call-routing',
    connectCalendarButton: '#tour-connect-calendar',
    knowledgeBaseButton: '[role="button"]:has-text("Knowledge Base")',
    agentScheduleButton: '[role="button"]:has-text("Agent Schedule")',
    widgetInstallButton: '#tour-widget-install',
    upgradeAgentButton: '[role="button"]:has-text("Upgrade Agent")',
  },

  moreMenu: {
    title: 'text="More Setting"',
    closeButton: 'button[aria-label="Close modal"]',
    option: (label) => `[role="button"]:has-text("${label}")`,
  },
};
