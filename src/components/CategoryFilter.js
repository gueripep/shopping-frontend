import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="category-filter">
        <div className="category-filter-loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="category-filter">
      <h3 className="category-filter-title">Filter by Category</h3>
      <div className="category-buttons">
        <button
          className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => onCategoryChange('')}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;