export const fastAgentDetailsLocators = {
  route: '/fast-agent-detail',

  header: {
    title: 'text="Agent Details"',
    profileButton: '[aria-label="Profile"]',
    profileImage: 'img[alt="Profile"]',
    agentDropdown: 'select',
    notificationIcon: 'img[alt="Notification_icon"]',
    logoutButton: 'button[aria-label="Logout"]',
  },

  draftAgent: {
    card: '#tour-draft-card, div:has-text("Finish setting up your first agent")',
    badge: 'text="Draft Agent"',
    title: 'text="Finish setting up your first agent to start automating your inbound calls."',
    description:
      'text="You started setup but haven\'t completed it yet. Pick up where you left off, or discard the draft and start fresh."',
    discardButton: 'button:has-text("Discard")',
    continueSetupButton:
      '#tour-draft-continue, button:has-text("Continue Setup"), button:has-text("Start")',
    discardModalTitle: 'text="Discard draft agent?"',
    discardModalCloseButton: 'button:has-text("Close")',
    discardModalContinueButton: 'button:has-text("Continue")',
  },

  calendarReminder: {
    title: 'text="Connect your calendar"',
    notNowButton: 'button:has-text("Not now")',
    connectButton: 'button:has-text("Connect")',
  },

  driveReminder: {
    banner: '[role="button"]:has-text("Connect Google Drive")',
    connectText: 'text="Connect"',
  },

  setupScore: {
    cardTitle: 'text=/Setup Score/',
    progressLabel: 'text="complete"',
    continueSetupButton: 'button:has-text("Continue Setup")',
    stepDot: (label, state) => `[aria-label="${label} (${state})"]`,
  },

  greatProgress: {
    card: '[class*="setupProgress"]:has-text("Great Progress!")',
    title: 'text="Great Progress!"',
    subtitle: 'text="Complete setup to unlock all features."',
    percentLabel: '[class*="percentLabel"]',
    continueButton: 'button:has-text("Continue")',
  },

  agentCard: {
    card: 'text=/AI Agent Phone Number/',
    agentAvatar: 'img[alt="agent_dp"]',
    editAgentButton: '#tour-edit-agent',
    planStatus: '[class*="planStatus"]',
    planStatusText: 'text=/Free|Demo|Starter|Scaler|Growth|PAYG/i',
    freePlanStatus: '[class*="planStatus"]:has-text("free"), [class*="planStatus"]:has-text("Free")',
    agentName: '[class*="AgentName"]',
    businessName: '[class*="bussinesName"]',
    languageBadge: '[class*="language"]',
    liveStatus: 'text="Live"',
    inactiveStatus: 'text="Inactive"',
    activeStatus: '[class*="activeStatus"]',
    readyNotLiveStatus: 'text="Ready (not live)"',
    phoneNumberSection: 'text="AI Agent Phone Number"',
    notAssignedWrapper: '[class*="notAssign"]',
    notAssignedText: 'text="Not assigned yet"',
    testAgentCallButton: '[role="button"]:has-text("Test Agent Call")',
    assignPhoneNumberButton: '[role="button"]:has-text("Assign Phone Number")',
    callRoutingButton: '#tour-call-routing',
    connectCalendarButton: '#tour-connect-calendar',
    knowledgeBaseButton: '[role="button"]:has-text("Knowledge Base")',
    agentScheduleButton: '[role="button"]:has-text("Agent Schedule")',
    widgetInstallButton: '#tour-widget-install',
  },

  publicAgentUrl: {
    sectionTitle: 'text="Your Public Agent Url"',
    container: '#tour-public-agent-url',
    urlText: '#tour-public-agent-url h3',
    linkEditContainer: '#tour-public-agent-url [class*="linkEdit"]',
    editButton: 'button[title="Edit Public URL"]',
    editIcon: 'img[alt="edit-svg2"]',
    copyButton: 'img[alt="Copy"]',
    copyButtonWrapper: '#tour-public-agent-url [class*="copyButton"]',
    copiedTooltip: 'text="Copied!"',
    lockedWrapper: '[class*="lockWrapper"]:has(#tour-public-agent-url)',
    lockIcon: '[class*="lockWrapper"]:has(#tour-public-agent-url) [class*="lockIcon"]',
    lockToast: '[class*="lockWrapper"]:has(#tour-public-agent-url) [class*="toast"]',
    upgradeLockMessage: 'text="Upgrade your plan to unlock your public agent URL."',
    driveLockMessage: 'text="Connect Google Drive to use this."',
  },

  publicUrlModal: {
    title: 'text="Public URL"',
    closeButton: 'button:has(img[alt="cross-icon"])',
    urlInput: 'input[readonly][type="text"]',
    copyButton: 'button:has-text("Copy")',
    copiedButton: 'button:has-text("Copied!")',
    editUrlButton: 'button[title="Edit URL"]',
    vanityUrlInput: 'input[placeholder="your-keyboards"]',
    addVanityUrlButton: 'button:has-text("Add Vanity URL")',
    updateVanityUrlButton: 'button:has-text("Update Vanity URL")',
    cancelButton: 'button:has-text("Cancel")',
  },

  agentAnalysis: {
    title: 'text="Agent Analysis"',
    totalCallsCard: '#tour-total-calls',
    totalCallsLabel: '#tour-total-calls [class*="statText"]',
    totalCallsValue: '#tour-total-calls [class*="statDetail"]',
    avgCallDurationCard: '[role="button"]:has-text("Avg. Call Duration")',
    avgCallDurationValue:
      '[role="button"]:has-text("Avg. Call Duration") [class*="statDetail"]',
    bookingsCard: '[role="button"]:has-text("Bookings")',
    bookingsValue: '[role="button"]:has-text("Bookings") [class*="statDetail"]',
    minutesRemainingCard: '[class*="stat"]:has-text("Minutes Remaining")',
    minutesRemainingValue: '[class*="stat"]:has-text("Minutes Remaining") [class*="statDetail"]',
  },

  footer: {
    homeButton: '#tour-footer-home',
    calendarButton: '#tour-footer-calendar',
    moreButtonWrapper: '#tour-footer-more',
    moreButton: 'button[aria-label="Create"]',
    contactsButton: '#tour-footer-contacts',
  },

  moreMenu: {
    title: 'text="More Setting"',
    closeButton: 'button[aria-label="Close modal"]',
    option: (label) => `[role="button"]:has-text("${label}")`,
    testAgentOption: '[role="button"]:has-text("Test Agent")',
    callSettingOption: '[role="button"]:has-text("Call Setting")',
    connectCalendarOption: '[role="button"]:has-text("Connect Calendar")',
    agentScheduleOption: '[role="button"]:has-text("Agent Schedule")',
    knowledgeBaseOption: '[role="button"]:has-text("Knowledge Base")',
    voiceLanguageOption: '[role="button"]:has-text("Voice & language")',
    widgetInstallOption: '[role="button"]:has-text("Widget Install")',
    businessDetailsOption: '[role="button"]:has-text("Business Details")',
    connectDriveOption: '[role="button"]:has-text("Connect Drive")',
    driveConnectedOption: '[role="button"]:has-text("Drive Connected")',
    upgradeAgentOption: '[role="button"]:has-text("Upgrade Agent")',
    cancelSubscriptionOption: '[role="button"]:has-text("Cancel Subscription")',
    activateAgentOption: '[role="button"]:has-text("Activate Agent")',
    deactivateAgentOption: '[role="button"]:has-text("Deactivate Agent")',
    deleteAgentOption: '[role="button"]:has-text("Delete Agent")',
  },

  callTestModal: {
    closeButton: 'button:has(img[alt="cross-icon"])',
    startCallButton: 'text=/^Call /',
    endCallButton: 'text=/^Call End/',
    connectingText: 'text="Connecting..."',
    disconnectingText: 'text="Disconnecting..."',
  },

  assignNumberPopup: {
    activateTrialButton: 'button:has-text("Activate Trial")',
    viewPlansButton: 'button:has-text("View Plans")',
    errorMessage: 'text="Could not start the trial. Please try again."',
  },

  connectDrivePopup: {
    title: 'text="Connect Google Drive"',
    connectDriveButton: 'button:has-text("Connect Drive")',
    connectingButton: 'button:has-text("Connecting...")',
    doItLaterButton: 'button:has-text("Do it later")',
    errorMessage: 'text=/Drive connection failed|Could not start Drive connection/',
  },

  contactSyncPopup: {
    googleContactsButton: 'button:has-text("Google Contacts")',
    phoneContactsButton: 'button:has-text("Phone Contacts")',
    skipButton: 'button:has-text("Skip for now")',
  },

  pushPermissionModal: {
    enableNotificationsButton: 'button:has-text("Enable Notifications")',
    notNowButton: 'button:has-text("Not Now")',
    gotItButton: 'button:has-text("Got It")',
    closeButton: 'button[aria-label="Close modal"]',
  },

  summaryDialog: {
    dialog: '[role="dialog"][aria-labelledby="sophia-ready-title"]',
    okayButton: 'button:has-text("Okay")',
    dashboardButton: 'button:has-text("Go to Dashboard")',
    continueButton: 'button:has-text("Continue")',
  },

  unlockNumberModal: {
    closeButton: 'button:has-text("×")',
    upgradeButton: 'button:has-text("Upgrade")',
  },

  notifications: {
    backButton: 'img[alt="Back-icon"]',
    item: '[role="button"]',
    viewButton: 'button:has-text("View")',
    loadMoreButton: 'button:has-text("Load More")',
  },

  confirmationModal: {
    upgradeTitle: 'text="Upgrade Plan"',
    deleteTitle: 'text="Are you sure?"',
    deactivateTitle: 'text=/Deactivate Agent|Activate Agent|Subscription Required/',
    paygTitle: 'text=/Pay-As-You-Go|Are you sure/',
    cancelSubscriptionTitle: 'text="Cancel subscription?"',
    disconnectDriveTitle: 'text="Disconnect Drive?"',
    cancelButton: 'button:has-text("Cancel")',
    closeButton: 'button:has-text("Close")',
    noButton: 'button:has-text("No")',
    yesButton: 'button:has-text("Yes")',
    confirmButton: 'button:has-text("Confirm")',
    upgradeButton: 'button:has-text("Upgrade")',
    keepActiveButton: 'button:has-text("Keep Active")',
    yesPauseButton: 'button:has-text("Yes, Pause")',
    pickPlanButton: 'button:has-text("Pick a Plan")',
    gotItButton: 'button:has-text("Got it")',
    keepSubscriptionButton: 'button:has-text("Keep Subscription")',
    yesCancelButton: 'button:has-text("Yes, Cancel")',
    disconnectButton: 'button:has-text("Disconnect")',
    refundPolicyLink: 'a[href="https://www.rxpt.ai/terms-condition"]',
  },

  deactivateReasonModal: {
    reasonRadio: 'input[type="radio"]',
    otherReasonTextarea: 'textarea[placeholder="Tell us other reason..."]',
    cancelButton: 'button:has-text("Cancel")',
    deactivateButton: 'button:has-text("Deactivate")',
  },

  cancelSubscriptionModal: {
    reasonRadio: 'input[type="radio"]',
    otherReasonTextarea: 'textarea[placeholder="Tell us other reason..."]',
    keepSubscriptionButton: 'button:has-text("Keep Subscription")',
    yesCancelButton: 'button:has-text("Yes, Cancel")',
  },

  popup: {
    message: '[class*="message"]',
    cancelButton: 'button:has-text("Cancel")',
    confirmButton: 'button:has-text("Confirm")',
    closeButton: 'button:has-text("Close")',
    supportLink: 'a[href^="mailto:"]',
  },

  tour: {
    editAgentStep: '#tour-edit-agent',
    callRoutingStep: '#tour-call-routing',
    connectCalendarStep: '#tour-connect-calendar',
    widgetInstallStep: '#tour-widget-install',
    publicAgentUrlStep: '#tour-public-agent-url',
    totalCallsStep: '#tour-total-calls',
    footerHomeStep: '#tour-footer-home',
    footerCalendarStep: '#tour-footer-calendar',
    footerMoreStep: '#tour-footer-more',
    nextButton: '.introjs-nextbutton',
    previousButton: '.introjs-prevbutton',
    doneButton: '.introjs-donebutton',
    skipButton: '.introjs-skipbutton',
    closeButton: '.introjs-closebutton',
    overlay: '.introjs-overlay, .introjs-helperLayer, .introjs-tooltip',
  },
};

