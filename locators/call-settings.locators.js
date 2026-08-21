export const callSettingsLocators = {
  callSettingRoute: '/call-setting',
  callTransferRoute: '/call-transfer',
  callDivertRoute: '/call_divert',
  businessHoursRoute: '/business_hours',
  agentScheduleRoute: '/Business_hours',

  callSetting: {
    headerTitle: 'text=/Call Setting For/i',
    agentSettingTitle: 'text="Agent Setting"',
    recordingCard: '[class*="recordingCard"]',
    phoneInput: 'input[placeholder="+1 (123) 456-7890"]',
    ringDurationInput: 'input[placeholder="Enter ring duration (seconds)"]',
    maxCallDurationInput: 'input[placeholder="Enter max call duration (seconds)"]',
    toggle: 'input[type="checkbox"]',
    saveButton: 'text=/Save|Submit|Continue/',
  },

  recordingDeclaration: {
    card: '[class*="recordingCard"]:has-text("Call Recording")',
    questionText: 'text=/Would you like your agent to announce.*Call Recording\\s+Declaration/i',
    toggleInput: '[class*="recordingCard"] input[type="checkbox"]',
    toggleSlider: '[class*="recordingCard"] [class*="slider"]',
    loadingSpinner: '[class*="recordingCard"] [role="progressbar"], [class*="recordingCard"] svg[class*="MuiCircularProgress"]',
    disclaimerDialog: '[role="presentation"]:has-text("Disclaimer"), [role="dialog"]:has-text("Disclaimer"), text="Disclaimer"',
    disclaimerTitle: 'text="Disclaimer"',
    disclaimerCheckbox: '[role="presentation"]:has-text("Disclaimer") input[type="checkbox"], [role="dialog"]:has-text("Disclaimer") input[type="checkbox"]',
    confirmButton: 'button:has-text("Confirm")',
    cancelButton: 'button:has-text("Cancel")',
  },

  backgroundSound: {
    card: '[class*="settingCard"]:has-text("Background Sound")',
    title: 'text="Background Sound"',
    description: 'text="Play a subtle ambient sound in the background of the call."',
    dropdown: '[class*="settingCard"]:has-text("Background Sound") select',
    option: (label) => `option:has-text("${label}")`,
    coffeeShopOption: 'option[value="coffee-shop"]',
    conventionHallOption: 'option[value="convention-hall"]',
    summerOutdoorOption: 'option[value="summer-outdoor"]',
    mountainOutdoorOption: 'option[value="mountain-outdoor"]',
    staticNoiseOption: 'option[value="static-noise"]',
    callCenterOption: 'option[value="call-center"]',
    noneOption: 'option[value="none"]',
    settingsButton: 'button[aria-label="Background sound settings"]',
    volumePopover: '[class*="volumePopover"]',
    volumeTitle: 'text="Background Sound Volume"',
    volumeSlider: '[class*="volumePopover"] input[type="range"]',
    volumeValue: '[class*="volumePopover"] [class*="sliderValue"]',
    lowLabel: '[class*="volumePopover"]:has-text("Low")',
    highLabel: '[class*="volumePopover"]:has-text("High")',
  },

  speechSetting: {
    interruptionSensitivityLabel: 'text="Interruption Sensitivity"',
    interruptionSensitivitySlider:
      '[class*="sliderContainer"]:has-text("Interruption Sensitivity") input[type="range"]',
    interruptionSensitivityValue:
      '[class*="sliderContainer"]:has-text("Interruption Sensitivity") [class*="sliderValue"]',
    responseEagernessLabel: 'text="Response Eagerness"',
    responseEagernessSlider:
      'xpath=//*[normalize-space()="Response Eagerness"]/following::input[@type="range"][1]',
    responseEagernessValue:
      'xpath=//*[normalize-space()="Response Eagerness"]/following::*[contains(@class,"sliderValue")][1]',
    voiceSpeedLabel: 'text="Voice Speed"',
    voiceSpeedSlider: 'xpath=//*[normalize-space()="Voice Speed"]/following::input[@type="range"][1]',
    voiceSpeedValue:
      'xpath=//*[normalize-space()="Voice Speed"]/following::*[contains(@class,"sliderValue")][1]',
    allSliders: 'input[type="range"]',
  },

  endCallOnSilence: {
    card: '[class*="settingCard"]:has-text("End Call on Silence")',
    title: 'text="End Call on Silence"',
    description: 'text="End the call if user stays silent for extended period of time."',
    slider: '[class*="settingCard"]:has-text("End Call on Silence") input[type="range"]',
    value: '[class*="settingCard"]:has-text("End Call on Silence") [class*="sliderValue"]',
    minLabel: '[class*="settingCard"]:has-text("End Call on Silence"):has-text("Min")',
    maxLabel: '[class*="settingCard"]:has-text("End Call on Silence"):has-text("Max")',
  },

  callTransfer: {
    addRuleButton: 'button:has-text("Add")',
    sendSmsButton: 'button[aria-label="Send SMS"]',
    removeRuleButton: 'button:has-text("Remove")',
    routeTypeSelect: 'select',
    conditionInput: 'input[placeholder="Sales/ Quote request—customer wants"]',
    emailInput: 'input[placeholder="Enter email (e.g. support@company.com)"]',
    submitButton: 'text=/Save|Submit|Continue/',
    toggleSwitch: 'button[role="switch"], input[type="checkbox"]',
  },

  callDivert: {
    createRuleButton: 'text="Create Rule"',
    saveRuleButton: 'text="Save Rule"',
    ruleTypeSelect: 'select',
    conditionInput: 'input[placeholder="e.g - If user shows frustration and anger"]',
    phoneInput: 'input[placeholder="985 XXX 88XX"]',
    coldTransferButton: 'button:has-text("Cold")',
    warmTransferButton: 'button:has-text("Warm")',
    businessHoursCheckbox: 'input[type="checkbox"]',
    searchInput: 'input[placeholder="Search"]',
    searchButton: 'button[type="submit"]',
    ruleCard: '[class*="ruleSection"]',
    editRuleButton: 'button[class*="edit"]',
    deleteRuleButton: 'button[class*="delete"]',
    cancelDeleteButton: 'button:has-text("Cancel")',
    confirmDeleteButton: 'button:has-text("Delete")',
  },

  businessHours: {
    backButton: '[class*="profileBack"]',
    saveButton: 'button:has-text("Save")',
    openTimeInput: 'input[type="time"]',
    closeTimeInput: 'input[type="time"]',
    closedToggleButton: 'button:has-text("Closed"), button:has-text("Open")',
  },

  agentSchedule: {
    timezoneDropdown: 'button[aria-haspopup="listbox"], button:has-text("Timezone")',
    timezoneListbox: '[role="listbox"]',
    timezoneOption: '[role="option"], button',
    startTimeInput: 'input[type="time"]',
    endTimeInput: 'input[type="time"]',
    closedCheckbox: 'input[type="checkbox"]',
    saveButton: 'text=/Save|Update/',
  },
};
