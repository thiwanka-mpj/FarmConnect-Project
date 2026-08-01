import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);

  const { user } = useAuth();

  const categories = [
    'All',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Eggs',
    'Other',
  ];

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAvailableProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (user.role !== 'CUSTOMER') {
      toast.error('Only customers can add items to cart');
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.productId);

    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      toast.success('Quantity updated in cart');
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          farmerId: product.farmerId,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
      toast.success('Added to cart');
    }

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1>Fresh Products from Local Farmers</h1>

        <div className="product-filters">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-button ${
                  selectedCategory === category ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.productId} className="product-card">
              <div className="product-image">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.productName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="product-image-placeholder">
                          ${product.category === 'Vegetables' ? '🥬' :
                            product.category === 'Fruits' ? '🍎' :
                            product.category === 'Dairy' ? '🥛' :
                            product.category === 'Eggs' ? '🥚' : '🌾'}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="product-image-placeholder">
                    {product.category === 'Vegetables' && '🥬'}
                    {product.category === 'Fruits' && '🍎'}
                    {product.category === 'Dairy' && '🥛'}
                    {product.category === 'Eggs' && '🥚'}
                    {product.category === 'Other' && '🌾'}
                  </div>
                )}
              </div>

              <div className="product-info">
                <h3>{product.productName}</h3>
                <p className="product-description">{product.description}</p>

                <div className="product-details">
                  <span className="product-category">{product.category}</span>
                  <span className="product-stock">
                    {product.quantityAvailable} units available
                  </span>
                </div>

                <div className="product-footer">
                  <span className="product-price">
                    Rs. {product.price.toFixed(2)}
                  </span>

                  {user && user.role === 'CUSTOMER' ? (
                    <button
                      className="add-to-cart-button"
                      onClick={() => addToCart(product)}
                      disabled={product.quantityAvailable === 0}
                    >
                      {product.quantityAvailable === 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </button>
                  ) : (
                    <Link to="/login" className="add-to-cart-button">
                      Login to Buy
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;