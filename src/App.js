import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Header from './components/Header';
import { useData, useFeatureFlag, useInitialize, useVisitorCode } from '@kameleoon/react-sdk';

/* global Kameleoon */



const API_BASE_URL = 'https://api.gueripep.com';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = 'user123'; // Simple user ID for demo

  const { initialize } = useInitialize();
  const { getVisitorCode } = useVisitorCode();
  const { isFeatureFlagActive } = useFeatureFlag();
  const { trackConversion } = useData();


  const init = useCallback(async () => {
    await initialize();
    const visitorCode = getVisitorCode();

    const featureKey = 'shopping_test';
    const isFFActive = isFeatureFlagActive({visitorCode, featureKey});
    setIsActive(isFFActive);
    console.log('Visitor Code:', visitorCode);
    console.log('Feature Variation:', isActive);
  }, [initialize, getVisitorCode, isFeatureFlagActive, trackConversion]);

  useEffect(() => {
    init();
    fetchProducts();
    fetchCart();
  }, [init]);

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

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cart/${userId}`, {
        productId,
        quantity: 1
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/${userId}/${productId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cart/${userId}/${productId}`, {
        quantity
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/checkout/${userId}`);
      console.log('Checkout successful:', response.data);
      
      // Update local cart state to reflect empty cart
      setCart([]);
      
      // Show success message or redirect
      alert(`Checkout successful! Order ID: ${response.data.order.orderId}`);
      
      // Close cart after successful checkout
      setShowCart(false);

      // confirm kameleoon goal
      Kameleoon.API.Goals.processConversion(391785);
      
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
    searchProducts(query);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <Header
        cartItemCount={getCartItemCount()}
        onCartClick={() => setShowCart(!showCart)}
        onSearch={handleSearch}
        searchQuery={searchQuery}
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
            onAddToCart={addToCart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
