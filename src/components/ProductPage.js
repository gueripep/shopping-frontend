import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useVisitorCode } from '@kameleoon/react-sdk';
import { pushProductViewEvent } from '../utils/gtm';
import './ProductPage.css';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5001'
  : 'https://api.gueripep.com';

const ProductPage = ({ onAddToCart, onLoginRequired }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getVisitorCode } = useVisitorCode();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const trackedProductRef = useRef(null);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      setProduct(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Reset tracked product when ID changes
  useEffect(() => {
    trackedProductRef.current = null;
  }, [id]);

  // Track product view event when product is successfully loaded
  useEffect(() => {
    if (product && !loading && !error && trackedProductRef.current !== product.id) {
      const visitorCode = getVisitorCode();
      pushProductViewEvent(product, visitorCode);
      trackedProductRef.current = product.id;
    }
  }, [product, loading, error, getVisitorCode]);

  const handleAddToCart = () => {
    if (!currentUser) {
      onLoginRequired();
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product.id);
    }
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(value);
  };

  const handleBackToProducts = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="product-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-page-error">
        <h2>Product Not Found</h2>
        <p>{error}</p>
        <button onClick={handleBackToProducts} className="back-btn">
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page-error">
        <h2>Product Not Found</h2>
        <button onClick={handleBackToProducts} className="back-btn">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-page-header">
        <button onClick={handleBackToProducts} className="back-btn">
          ← Back to Products
        </button>
      </div>
      
      <div className="product-page-content">
        <div className="product-image-section">
          <img 
            src={product.image} 
            alt={product.name}
            className="product-page-image"
          />
        </div>
        
        <div className="product-details-section">
          <div className="product-category-badge">{product.category}</div>
          <h1 className="product-page-title">{product.name}</h1>
          <p className="product-page-description">{product.description}</p>
          
          <div className="product-page-price">
            <span className="price-label">Price:</span>
            <span className="price-value">${product.price}</span>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="quantity-input"
              />
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="add-to-cart-btn-large"
            >
              Add {quantity > 1 ? `${quantity} items` : 'to Cart'} - ${(product.price * quantity).toFixed(2)}
            </button>
          </div>

          {product.inStock === false && (
            <div className="out-of-stock-notice">
              This item is currently out of stock
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;