import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import ProductList from './components/ProductList';
import ProductPage from './components/ProductPage';
import Cart from './components/Cart';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CustomData, useData, useFeatureFlag, useInitialize, useVisitorCode } from '@kameleoon/react-sdk';
import { pushAddToCartEvent } from './utils/gtm';


// Configure Axios to always send/receive cookies for CORS requests
axios.defaults.withCredentials = true;

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5001'
  : 'https://api.gueripep.com';

const ALL_CATEGORIES = 'All Categories';

function AppContent() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visitorCode, setVisitorCode] = useState('');
  const [kameleoonVariation, setKameleoonVariation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { addData, flush } = useData();
  const featureKey = 'shopping_test';
  const hasTrackedInitialView = useRef(false);


  //Kameleoon hooks
  const { currentUser } = useAuth();
  const { initialize } = useInitialize();
  const { getVisitorCode } = useVisitorCode();
  const { getVariation } = useFeatureFlag();
  const { trackConversion } = useData();
  const navigate = useNavigate();

  const init = useCallback(async () => {
    try {
      await initialize();
      const code = getVisitorCode();
      setVisitorCode(code);

      const variation = getVariation({ visitorCode: code, featureKey });

      console.log('Kameleoon variation:', variation.key);

      //example of setting widget information in side a flag
      localStorage.setItem('variation_name', variation.key);
      const customData = new CustomData(4, variation.key);
      addData(code, customData);
      flush();

      

      setKameleoonVariation(variation);

    } catch (error) {
      console.warn('Kameleoon - Failed to initialize SDK (likely blocked or network error):', error);
      // Fallback: the app continues to work without experiment variations
    }
  }, [initialize, getVisitorCode, getVariation, featureKey, addData, flush]);

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

  // Axeptio Consent Synchronization
  useEffect(() => {
    // 1. Wait for Axeptio initialization
    if (typeof window._axcb === "undefined") {
      window._axcb = [];
    }

    window._axcb.push((axeptio) => {
      axeptio.on("cookies:complete", async (choices) => {
        const consent = !!choices.kameleoon;


        try {
          // 2. Synchronize choice with backend to trigger the server-side Set-Cookie header
          await axios.post(`${API_BASE_URL}/consent`, {
            consent,
            visitorCode // Current visitor code for identification
          });

        } catch (error) {
          console.error('[Axeptio] Failed to synchronize consent:', error);
        }
      });
    });
  }, [visitorCode]);

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

      // Find the product details for GTM tracking
      const product = products.find(p => p.id === productId);

      // Push add to cart event to GTM
      pushAddToCartEvent(product, 1, visitorCode);

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

      // No need to close cart state here as it's now a page


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
      'event': 'category_view',
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
    navigate('/cart');
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
        kameleoonVariation={kameleoonVariation}
        onLoginClick={handleLoginClick}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProductList
                products={products}
                categories={categories}
                selectedCategory={selectedCategory}
                onAddToCart={addToCart}
                onCategoryChange={handleCategoryChange}
                categoriesLoading={categoriesLoading}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductPage
                onAddToCart={addToCart}
                onLoginRequired={handleLoginClick}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                products={products}
                onRemove={removeFromCart}
                onUpdateQuantity={updateCartQuantity}
                onCheckout={handleCheckout}
              />
            }
          />
        </Routes>
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
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
