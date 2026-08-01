import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../styles/ImageUpload.css';

const MultipleImageUpload = ({ onImagesUploaded, maxImages = 5 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedFiles.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate each file
    const validFiles = files.filter((file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          'http://localhost:8082/api/upload/image',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        if (response.data.success) {
          uploadedUrls.push(response.data.fileUrl);
        }
      }

      toast.success(`${uploadedUrls.length} images uploaded successfully!`);
      onImagesUploaded(uploadedUrls);
      setSelectedFiles([]);
      setPreviews([]);
    } catch (error) {
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <div className="multiple-image-upload">
      <div className="upload-header">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading || selectedFiles.length >= maxImages}
        />
        <p>
          {selectedFiles.length} / {maxImages} images selected
        </p>
      </div>

      <div className="preview-grid">
        {previews.map((preview, index) => (
          <div key={index} className="preview-item">
            <img src={preview} alt={`Preview ${index + 1}`} />
            <button
              type="button"
              onClick={() => removeImage(index)}
              disabled={uploading}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {selectedFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUploadAll}
          disabled={uploading}
          className="upload-all-button"
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Images`}
        </button>
      )}
    </div>
  );
};

export default MultipleImageUpload;