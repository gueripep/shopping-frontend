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
 * Push user authentication status to dataLayer with status check event
 * Used for subsequent page loads when checking existing authentication
 * @param {string|null} userId - The user's unique identifier or null if not logged in
 */
export const pushUserStatus = (userId) => {
  initializeDataLayer();
  
  if (userId) {
    // User is logged in
    window.dataLayer.push({
      'event': 'user_status_check',
      'user_id': userId,
      'logged_in_status': 'logged-in'
    });
    console.log('GTM: User status event pushed (logged-in)', { userId });
  } else {
    // User is not logged in
    window.dataLayer.push({
      'event': 'user_status_check',
      'logged_in_status': 'logged-out'
    });
    console.log('GTM: User status event pushed (logged-out)');
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

/**
 * Push add to cart event to GTM dataLayer when user adds a product to cart
 * @param {Object} product - The product being added to cart
 * @param {string} product.id - Product ID
 * @param {string} product.name - Product name
 * @param {string} product.category - Product category
 * @param {number} product.price - Product price
 * @param {number} quantity - Quantity being added (default: 1)
 * @param {string} visitorCode - Visitor code for Kameleoon correlation
 */
export const pushAddToCartEvent = (product, quantity = 1, visitorCode = null) => {
  initializeDataLayer();
  
  const eventData = {
    'event': 'add_to_cart',
    'ecommerce': {
      'currency': 'USD',
      'value': product?.price || 0,
      'items': [{
        'item_id': product?.id || 'unknown',
        'item_name': product?.name || 'Unknown Product',
        'item_category': product?.category || 'Unknown',
        'price': product?.price || 0,
        'quantity': quantity
      }]
    }
  };

  // Add visitor code if provided for Kameleoon correlation
  if (visitorCode) {
    eventData.visitor_code = visitorCode;
  }

  window.dataLayer.push(eventData);
  console.log('GTM: Add to cart event pushed', { 
    productId: product?.id, 
    productName: product?.name, 
    quantity,
    visitorCode 
  });
};

/**
 * Push product view event to GTM dataLayer when user views a product
 * @param {Object} product - The product being viewed
 * @param {string} product.id - Product ID
 * @param {string} product.name - Product name
 * @param {string} product.category - Product category
 * @param {number} product.price - Product price
 * @param {string} visitorCode - Visitor code for Kameleoon correlation
 */
export const pushProductViewEvent = (product, visitorCode = null) => {
  initializeDataLayer();
  
  const eventData = {
    'event': 'view_item',
    'ecommerce': {
      'currency': 'USD',
      'value': product?.price || 0,
      'items': [{
        'item_id': product?.id || 'unknown',
        'item_name': product?.name || 'Unknown Product',
        'item_category': product?.category || 'Unknown',
        'price': product?.price || 0,
        'quantity': 1
      }]
    }
  };

  // Add visitor code if provided for Kameleoon correlation
  if (visitorCode) {
    eventData.visitor_code = visitorCode;
  }

  window.dataLayer.push(eventData);
  console.log('GTM: Product view event pushed', { 
    productId: product?.id, 
    productName: product?.name,
    visitorCode 
  });
};