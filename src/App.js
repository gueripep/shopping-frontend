import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Header from './components/Header';

const API_BASE_URL = 'http://localhost:5001/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = 'user123'; // Simple user ID for demo

  useEffect(() => {
    fetchProducts();
    fetchCart();
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
