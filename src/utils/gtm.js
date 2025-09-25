// GTM utility functions for tracking login events and user authentication status

/**
 * Initialize the dataLayer if it doesn't exist
 */
export const initializeDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
};

/**
 * Push login event to GTM dataLayer when user actively logs in
 * This should only be called when a user submits the login form
 * @param {string} userId - The user's unique identifier
 */
export const pushLoginEvent = (userId) => {
  initializeDataLayer();
  window.dataLayer.push({
    'event': 'login',
    'user_id': userId,
    'logged_in_status': 'logged-in'
  });
  console.log('GTM: Login event pushed', { userId });
};

/**
 * Push user authentication status to dataLayer without login event
 * Used for subsequent page loads when checking existing authentication
 * @param {string|null} userId - The user's unique identifier or null if not logged in
 */
export const pushUserStatus = (userId) => {
  initializeDataLayer();
  
  if (userId) {
    // User is logged in
    window.dataLayer.push({
      'user_id': userId,
      'logged_in_status': 'logged-in'
    });
    console.log('GTM: User status pushed (logged-in)', { userId });
  } else {
    // User is not logged in
    window.dataLayer.push({
      'logged_in_status': 'logged-out'
    });
    console.log('GTM: User status pushed (logged-out)');
  }
};

/**
 * Push logout event to dataLayer when user logs out
 */
export const pushLogoutEvent = () => {
  initializeDataLayer();
  window.dataLayer.push({
    'event': 'logout',
    'logged_in_status': 'logged-out'
  });
  console.log('GTM: Logout event pushed');
};