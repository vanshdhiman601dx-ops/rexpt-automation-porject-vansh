export const callHistoryLocators = {
  route: '/totalcall-list',
  callDetailsRoute: '/call-details',

  list: {
    exportButton: 'button:has-text("Export")',
    callRow: 'tr, [class*="call"]',
    viewDetailsButton: 'button:has-text("View"), text="View"',
    previousPageButton: 'button:has-text("Previous")',
    nextPageButton: 'button:has-text("Next")',
    pageButton: (page) => `button:has-text("${page}")`,
    loadMoreButton: 'button:has-text("Load More")',
  },

  exportModal: {
    dialog: '[role="dialog"], text=/Export/',
    yearSelect: 'select',
    monthSelect: 'select',
    cancelButton: 'button:has-text("Cancel")',
    exportButton: 'button:has-text("Export"), button:has-text("Download")',
  },

  details: {
    backButton: 'button:has-text("Back"), img[alt*="Back"]',
    transcriptTab: 'text=/Transcript/',
    summaryTab: 'text=/Summary/',
    recordingButton: 'button:has-text("Play"), button:has-text("Pause")',
    sendEmailButton: 'button:has-text("Send"), button:has-text("Email")',
  },
};
