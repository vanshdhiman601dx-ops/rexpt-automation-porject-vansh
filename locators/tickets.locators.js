export const ticketsLocators = {
  listRoute: '/raise-tickets',
  createRoute: '/create-ticket',

  list: {
    createTicketButton: 'button:has-text("CREATE")',
    searchInput: 'input[placeholder="Search by Ticket ID or Subject"]',
    statusSelect: 'select',
    prioritySelect: 'select',
    clearFilterButton: 'button:has-text("Clear Filter")',
    ticketRow: 'tr, [class*="ticket"]',
    viewButton: 'button:has-text("View")',
    previousPageButton: 'button:has-text("Previous")',
    nextPageButton: 'button:has-text("Next")',
  },

  form: {
    subjectInput: 'input[placeholder="Enter ticket subject"]',
    categorySelect: 'select',
    descriptionTextarea: 'textarea[placeholder="Describe the issue"]',
    prioritySelect: 'select',
    agentSelect: 'select',
    agentIdInput: 'input[placeholder="e.g. AGNT-1023"]',
    attachmentInput: 'input[type="file"]',
    submitButton: 'button:has-text("Submit"), button:has-text("Create")',
    cancelButton: 'button:has-text("Cancel")',
  },

  modal: {
    closeButton: 'button:has-text("Close"), [class*="closeBtn"]',
    previewLink: 'a[href]',
  },
};
