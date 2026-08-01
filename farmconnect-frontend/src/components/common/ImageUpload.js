import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/ImageUpload.css';

const ImageUpload = ({ onImageUploaded, currentImageUrl = null }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        'http://localhost:8082/api/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      if (response.data.success) {
        toast.success('Image uploaded successfully!');
        onImageUploaded(response.data.fileUrl);
        setSelectedFile(null);
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(currentImageUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded('');
  };

  return (
    <div className="image-upload-container">
      <div className="image-preview-section">
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <button
              type="button"
              className="remove-image-button"
              onClick={handleClear}
              disabled={uploading}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="image-placeholder">
            <div className="placeholder-icon">📷</div>
            <p>No image selected</p>
          </div>
        )}
      </div>

      <div className="upload-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        <button
          type="button"
          className="select-file-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {selectedFile ? 'Change Image' : 'Select Image'}
        </button>

        {selectedFile && (
          <>
            <div className="selected-file-info">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>

            <div className="upload-actions">
              <button
                type="button"
                className="upload-button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>

              <button
                type="button"
                className="cancel-upload-button"
                onClick={handleRemove}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>

            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="upload-guidelines">
        <p className="guidelines-title">Image Guidelines:</p>
        <ul>
          <li>Supported formats: JPEG, PNG, GIF, WEBP</li>
          <li>Maximum file size: 10MB</li>
          <li>Recommended dimensions: 800x800 pixels</li>
          <li>Use clear, high-quality images</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;