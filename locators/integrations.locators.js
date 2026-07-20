export const integrationsLocators = {
  widgetGuideRoute: '/widget-guide',
  integrateAgentRoute: '/integrate-agent',
  businessListingRoute: '/your-business-Listing',
  addFileRoute: '/add-file',
  publicWidgetRoute: '/public-widget',

  widget: {
    copyScriptButton: 'button:has-text("Copy"), img[alt="Copy"]',
    installGuideTab: 'text=/Install|Guide/',
    previewFrame: 'iframe',
  },

  publicListing: {
    businessSearchInput: 'input[placeholder="Type the name of your Business to Search"]',
    websiteInput: 'input[placeholder*="https://" i]',
    confirmButton: 'button:has-text("Confirm")',
    continueButton: 'text=/Continue|Save/',
  },

  knowledgeBase: {
    addFileButton: 'text=/Add|Upload/',
    sourceLink: 'a[href]',
    deleteSourceButton: 'button:has-text("Delete")',
    fileInput: 'input[type="file"]',
    removeFileButton: 'button:has-text("Remove")',
    cancelButton: 'button:has-text("Cancel")',
    submitButton: 'button:has-text("Submit"), button:has-text("Upload")',
  },

  drivePopup: {
    title: 'text="Connect Google Drive"',
    connectDriveButton: 'button:has-text("Connect Drive")',
    doItLaterButton: 'button:has-text("Do it later")',
    disconnectButton: 'button:has-text("Disconnect")',
  },
};
