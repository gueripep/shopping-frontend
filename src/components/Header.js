import React from 'react';
import './Header.css';

const Header = ({ cartItemCount, onCartClick, onSearch, searchQuery }) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="header">
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
        
        <button className="cart-button" onClick={onCartClick}>
          🛒 Cart ({cartItemCount})
        </button>
      </div>
    </header>
  );
};

export default Header;