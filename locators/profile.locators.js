export const profileLocators = {
  route: '/edit-profile',

  header: {
    backButton: '[class*="profileBack"], img[alt*="Back"]',
    uploadProfileButton: 'button:has-text("Upload"), button:has-text("Change")',
    editSectionButton: 'text="Edit"',
    cancelButton: 'text="Cancel"',
    saveButton: 'text=/Save|Update/',
  },

  personalInfo: {
    nameInput: 'input[placeholder="Enter your name"]',
    phoneInput: 'input[type="tel"], input[placeholder*="phone" i]',
    emailInput: 'input[type="email"]',
    sendOtpButton: 'button:has-text("Send OTP")',
    otpInput: 'input[maxlength="1"], input[placeholder*="OTP" i]',
    addressTextarea: 'textarea[placeholder="Please enter address"]',
  },

  teamMembers: {
    tab: 'text=/Team|Members/',
    addMemberButton: 'button:has-text("Add"), button:has-text("Add Member")',
    memberNameInput: 'input[placeholder="Enter name"]',
    memberEmailInput: 'input[placeholder="Enter email"]',
    memberPhoneInput: 'input[placeholder="Enter phone number"]',
    permissionCheckbox: 'input[type="checkbox"]',
    editMemberButton: 'button[title="Edit member"]',
    removeMemberButton: 'button[title="Remove member"]',
    submitMemberButton: 'button:has-text("Add"), button:has-text("Update")',
    closeMemberModalButton: 'button:has-text("Close"), button:has-text("Cancel")',
  },

  integrations: {
    zapierToggle: 'text="Zapier"',
    clientToggle: 'text=/Client|API/',
    copyButton: 'button:has-text("Copy")',
    connectButton: 'button:has-text("Connect")',
  },

  account: {
    deleteAccountButton: 'button:has-text("Delete Account"), text="Delete Account"',
    confirmDeleteButton: 'button:has-text("Delete"), button:has-text("Confirm")',
    cancelDeleteButton: 'button:has-text("Cancel")',
  },
};
