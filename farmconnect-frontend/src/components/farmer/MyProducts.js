// 1. Import useCallback and remove useNavigate
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import { toast } from 'react-toastify';
import '../../styles/Products.css';
import ImageUpload from '../common/ImageUpload';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!user || !user.userId) return;
    try {
      const data = await productService.getProductsByFarmer(user.userId);
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await productService.deleteProduct(productId, token);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      await productService.updateProduct(
        editingProduct.productId,
        editingProduct,
        token
      );
      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>My Products</h1>
        <Link to="/farmer/products/new" className="add-product-button">
          + Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>You haven't added any products yet</p>
          <Link to="/farmer/products/new" className="get-started-button">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price (Rs.)</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId}>
                  <td>
                    <div className="product-cell">
                      <div className="product-icon">
                        {product.category === 'Vegetables' && '🥬'}
                        {product.category === 'Fruits' && '🍎'}
                        {product.category === 'Dairy' && '🥛'}
                        {product.category === 'Eggs' && '🥚'}
                        {product.category === 'Other' && '🌾'}
                      </div>
                      <span>{product.productName}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.price.toFixed(2)}</td>
                  <td>
                    <span
                      className={`stock-badge ${
                        product.quantityAvailable === 0 ? 'out-of-stock' : ''
                      }`}
                    >
                      {product.quantityAvailable}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        product.isAvailable ? 'available' : 'unavailable'
                      }`}
                    >
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product.productId)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button
                className="close-button"
                onClick={() => setEditingProduct(null)}
              >
                ×
              </button>
            </div>

            {/* 5. Removed the invalid '//' comment from here */}
            <form onSubmit={handleUpdate} className="product-form">
              {/* Image Upload Section */}
              <div className="form-section">
                <h3 className="section-title">Product Image</h3>
                <ImageUpload
                  onImageUploaded={(url) =>
                    setEditingProduct({ ...editingProduct, imageUrl: url })
                  }
                  currentImageUrl={editingProduct.imageUrl}
                />
              </div>

              {/* Rest of the form remains the same */}
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={editingProduct.productName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editingProduct.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (Rs.)</label>
                  <input
                    type="number"
                    name="price"
                    value={editingProduct.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity Available</label>
                  <input
                    type="number"
                    name="quantityAvailable"
                    value={editingProduct.quantityAvailable}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={editingProduct.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={editingProduct.isAvailable}
                    onChange={handleChange}
                  />
                  <span>Product is available for sale</span>
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;