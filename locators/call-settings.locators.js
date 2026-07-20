export const callSettingsLocators = {
  callSettingRoute: '/call-setting',
  callTransferRoute: '/call-transfer',
  callDivertRoute: '/call_divert',
  businessHoursRoute: '/business_hours',
  agentScheduleRoute: '/Business_hours',

  callSetting: {
    phoneInput: 'input[placeholder="+1 (123) 456-7890"]',
    ringDurationInput: 'input[placeholder="Enter ring duration (seconds)"]',
    maxCallDurationInput: 'input[placeholder="Enter max call duration (seconds)"]',
    toggle: 'input[type="checkbox"]',
    saveButton: 'text=/Save|Submit|Continue/',
  },

  callTransfer: {
    addRuleButton: 'button:has-text("Add"), text="Add"',
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
