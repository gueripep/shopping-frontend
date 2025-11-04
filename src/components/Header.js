import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = ({ cartItemCount, onCartClick, onSearch, searchQuery, kameleoonVariation, onLoginClick }) => {
  const { currentUser, logout } = useAuth();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const divStyle = useMemo(() => ({
    backgroundColor: kameleoonVariation?.variables?.get("header_color")?.value,
  }), [kameleoonVariation]);

  return (
    <header style={divStyle} className='header'>
      <div className="header-content">
        <h1 className="logo">🛒 ShopEasy</h1>
        
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
        
        <div className="header-actions">
          {currentUser ? (
            <>
              <span className="user-welcome">
                Welcome, {currentUser.displayName || currentUser.email}!
              </span>
              <button className="cart-button" onClick={onCartClick}>
                🛒 Cart ({cartItemCount})
              </button>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="login-button" onClick={onLoginClick}>
                Login
              </button>
              <button className="cart-button disabled" disabled>
                🛒 Cart (0)
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;