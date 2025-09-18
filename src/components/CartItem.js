import React from 'react';
import './CartItem.css';

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const { product, quantity, productId } = item;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      onRemove(productId);
    } else {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  const handleRemove = () => {
    onRemove(productId);
  };

  return (
    <div className="cart-item">
      <img 
        src={product.image} 
        alt={product.name} 
        className="cart-item-image"
      />
      
      <div className="cart-item-details">
        <h4 className="cart-item-name">{product.name}</h4>
        <p className="cart-item-price">${product.price}</p>
      </div>
      
      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button 
            className="quantity-btn"
            onClick={() => handleQuantityChange(quantity - 1)}
          >
            -
          </button>
          <span className="quantity">{quantity}</span>
          <button 
            className="quantity-btn"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            +
          </button>
        </div>
        
        <div className="cart-item-total">
          ${(product.price * quantity).toFixed(2)}
        </div>
        
        <button 
          className="remove-btn"
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;