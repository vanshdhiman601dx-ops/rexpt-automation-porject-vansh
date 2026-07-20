export const notificationsLocators = {
  route: '/notifications',

  header: {
    backButton: 'img[alt="Back-icon"], button:has-text("Back")',
  },

  list: {
    notificationItem: '[role="button"], [class*="notification"]',
    viewButton: 'button:has-text("View")',
    loadMoreButton: 'button:has-text("Load More")',
    emptyState: 'text=/No notifications|Nothing here/i',
  },

  permissionModal: {
    enableNotificationsButton: 'button:has-text("Enable Notifications")',
    notNowButton: 'button:has-text("Not Now")',
    gotItButton: 'button:has-text("Got It")',
    closeButton: 'button[aria-label="Close modal"]',
  },
};
