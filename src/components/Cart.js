import React from 'react';
import CartItem from './CartItem';
import './Cart.css';

const Cart = ({ cart, products, isKameleoonActive, onRemove, onUpdateQuantity, onClose, onCheckout }) => {
  const getCartItemsWithDetails = () => {
    return cart.map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      return {
        ...cartItem,
        product
      };
    }).filter(item => item.product); // Filter out items where product wasn't found
  };

  const cartItems = getCartItemsWithDetails();
  
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button className="close-cart-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="continue-shopping-btn" onClick={onClose}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <CartItem
                key={item.productId}
                item={item}
                onRemove={onRemove}
                onUpdateQuantity={onUpdateQuantity}
                isKameleoonActive={isKameleoonActive}
              />
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="cart-total">
              <p>Total Items: {getTotalItems()}</p>
              <p className="total-price">Total: ${getTotalPrice()}</p>
            </div>
            
            <div className="cart-actions">
              <button className="continue-shopping-btn" onClick={onClose}>
                Continue Shopping
              </button>
              <button className="checkout-btn" onClick={onCheckout} id='kameleoon-checkout-btn'>
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;