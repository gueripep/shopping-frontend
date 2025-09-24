import React from 'react';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import './ProductList.css';

const ProductList = ({ 
  products, 
  categories, 
  selectedCategory, 
  onAddToCart, 
  onCategoryChange, 
  categoriesLoading 
}) => {
  return (
    <div className="product-list">
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        loading={categoriesLoading}
      />
      
      {products.length === 0 ? (
        <div className="no-products">
          <h2>No products found</h2>
          <p>Try searching for something else or select a different category</p>
        </div>
      ) : (
        <>
          <div className="products-header">
            <h2>
              {selectedCategory 
                ? `${selectedCategory} Products (${products.length})` 
                : `All Products (${products.length})`
              }
            </h2>
          </div>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;