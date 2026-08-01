import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import ImageUpload from '../common/ImageUpload';
import { toast } from 'react-toastify';
import '../../styles/Products.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    quantityAvailable: '',
    category: 'Vegetables',
    imageUrl: '',
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageUploaded = (imageUrl) => {
    setFormData({
      ...formData,
      imageUrl: imageUrl,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const productData = {
        ...formData,
        farmerId: user.userId,
        price: parseFloat(formData.price),
        quantityAvailable: parseInt(formData.quantityAvailable),
      };

      await productService.createProduct(productData, token);
      toast.success('Product added successfully!');
      navigate('/farmer/products');
    } catch (error) {
      toast.error('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1>Add New Product</h1>
        <p>Fill in the details to list your product</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="product-form">
          {/* Image Upload Section */}
          <div className="form-section">
            <h3 className="section-title">Product Image</h3>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              currentImageUrl={formData.imageUrl}
            />
          </div>

          {/* Product Details Section */}
          <div className="form-section">
            <h3 className="section-title">Product Details</h3>

            <div className="form-group">
              <label htmlFor="productName">Product Name *</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                placeholder="e.g., Fresh Tomatoes"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your product..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (Rs.) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantityAvailable">Quantity Available *</label>
                <input
                  type="number"
                  id="quantityAvailable"
                  name="quantityAvailable"
                  value={formData.quantityAvailable}
                  onChange={handleChange}
                  min="0"
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
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
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                <span>Product is available for sale</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/farmer/products')}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;