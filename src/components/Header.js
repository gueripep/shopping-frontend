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

  const headerStyle = useMemo(() => ({
    backgroundColor: kameleoonVariation?.variables?.get("header_color")?.value || 'var(--secondary-bg)',
  }), [kameleoonVariation]);

  return (
    <header style={headerStyle} className='header'>
      <div className="header-content">
        <div className="logo-container">
          <img 
            src="/logo-easyshop.png" 
            alt="EasyShop" 
            className="logo-img"
          />
          <span className="logo-text">EasyShop</span>
        </div>
        
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        </form>
        
        <div className="header-actions">
          {currentUser ? (
            <>
              <div className="user-info">
                <span className="user-welcome">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              <button className="cart-button" onClick={onCartClick}>
                <div className="cart-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                </div>
              </button>
            </>
          ) : (
            <>
              <button className="login-button" onClick={onLoginClick}>
                Login
              </button>
              <button className="cart-button disabled" disabled title="Login to see cart">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;