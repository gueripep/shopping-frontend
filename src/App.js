import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useData, useFeatureFlag, useInitialize, useVisitorCode } from '@kameleoon/react-sdk';


const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5001'
  : 'https://api.gueripep.com';

const ALL_CATEGORIES = 'All Categories';

function AppContent() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [visitorCode, setVisitorCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const featureKey = 'shopping_test';
  const hasTrackedInitialView = useRef(false);

  const { currentUser } = useAuth();
  const { initialize } = useInitialize();
  const { getVisitorCode } = useVisitorCode();
  const { isFeatureFlagActive } = useFeatureFlag();
  const { trackConversion } = useData();


  const init = useCallback(async () => {
    await initialize();
    const visitorCode = getVisitorCode();
    setVisitorCode(visitorCode);
    const isActive = isFeatureFlagActive({ visitorCode, featureKey });
    setIsActive(isActive);
    console.log('Visitor Code:', visitorCode);
    console.log('Feature Variation:', isActive); // Log the actual value, not the stale state
  }, [initialize, getVisitorCode, isFeatureFlagActive, featureKey]);

  const fetchCart = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${currentUser.uid}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    init();
    fetchProducts();
    fetchCategories();
    if (currentUser) {
      fetchCart();
    }
  }, [init, currentUser, fetchCart]);

  // Track initial page view for "All Categories" only once when component mounts
  useEffect(() => {
    if (!hasTrackedInitialView.current) {
      trackCategorySelection('');
      hasTrackedInitialView.current = true;
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
      setCategoriesLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesLoading(false);
    }
  };

  const fetchProductsByCategory = async (category) => {
    if (!category) {
      fetchProducts();
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/products/category/${category}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products by category:', error);
    }
  };

  const addToCart = async (productId) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/cart/${currentUser.uid}`, {
        productId,
        quantity: 1
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!currentUser) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/${currentUser.uid}/${productId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    if (!currentUser) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/cart/${currentUser.uid}/${productId}`, {
        quantity
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/checkout/${currentUser.uid}`, {
        visitorCode: visitorCode  // Send the frontend visitor code to backend
      });
      console.log('Checkout successful:', response.data);

      // confirm kameleoon goal
      trackConversion({
        visitorCode,
        goalId: 392014, // The ID for your "purchase" goal
        revenue: response.data.order.total// Optional: include the revenue from the conversion
      });

      // Update local cart state to reflect empty cart
      setCart([]);

      // Show success message or redirect
      alert(`Checkout successful! Order ID: ${response.data.order.orderId}`);

      // Close cart after successful checkout
      setShowCart(false);

    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  const searchProducts = async (query) => {
    if (!query.trim()) {
      fetchProducts();
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/products/search/${query}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedCategory(''); // Clear category filter when searching
    searchProducts(query);
  };

  const trackCategorySelection = (category) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'page_view',
      'content_group': category || ALL_CATEGORIES
    });
  };

  const handleCategoryChange = (category) => {
    trackCategorySelection(category);
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search query when filtering by category
    fetchProductsByCategory(category);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCartClick = () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    setShowCart(!showCart);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <Header
        cartItemCount={getCartItemCount()}
        onCartClick={handleCartClick}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        isKameleoonActive={isActive}
        onLoginClick={handleLoginClick}
      />

      <main className="main-content">
        {showCart ? (
          <Cart
            cart={cart}
            products={products}
            onRemove={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onClose={() => setShowCart(false)}
            onCheckout={handleCheckout}
          />
        ) : (
          <ProductList
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onAddToCart={addToCart}
            onCategoryChange={handleCategoryChange}
            categoriesLoading={categoriesLoading}
          />
        )}
      </main>

      {showLogin && (
        <Login
          onClose={handleCloseLogin}
          switchToRegister={switchToRegister}
        />
      )}

      {showRegister && (
        <Register
          onClose={handleCloseRegister}
          switchToLogin={switchToLogin}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
