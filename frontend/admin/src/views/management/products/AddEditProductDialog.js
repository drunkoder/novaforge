import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader
} from '@coreui/react';

// const BASE_URL = 'http://localhost:3000';  // Adjust this according to your setup

const AddEditProductDialog = ({ visible, onClose, onSubmit, product }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    image: '',
  });
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imagePath, setImagePath] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code || '',
        name: product.name || '',
        description: product.description || '',
        image: product.image || '',
      });
      const path = product.image ? product.image : null;
      setImagePath(path);
      setPreviewImage(path ? BASE_URL + path : null);
    } else {
      clearForm();
    }
  }, [product]);

  useEffect(() => {
    setValidated(false);
    validateForm();
  }, [visible, formData]);

  const clearForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      image: '',
    });
    setPreviewImage(null);
    setImagePath(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) {
      errors.code = 'Code is required';
    }
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      errors.name = 'Name should be alphabetic';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    setErrors(errors);
    setFormValid(Object.keys(errors).length === 0);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const imageFile = files[0];
      if (imageFile) {
        setFormData((prev) => ({
          ...prev,
          image: imageFile,
        }));
        setPreviewImage(URL.createObjectURL(imageFile));
      } else {
        setFormData((prev) => ({
          ...prev,
          image: '',
        }));
        setPreviewImage(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidated(true);
    if (formValid) {
      const data = new FormData();
      data.append('code', formData.code.toUpperCase()); // Convert code to uppercase
      data.append('name', formData.name);
      data.append('description', formData.description);
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      } else {
        data.append('image', formData.image); // Use default alternate text if no image
      }
      onSubmit(data);
      clearForm();
    }
  };

  return (
    <CModal visible={visible} backdrop="static" onClose={onClose} size="lg">
      <CModalHeader closeButton>{product ? 'Edit Product' : 'Add Product'}</CModalHeader>
      <CModalBody>
        <CForm className="row g-3" onSubmit={handleSubmit}>
          <CCol md={12}>
            <CFormInput
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              label="Code"
              invalid={!!errors.code && validated}
            />
            <div className="invalid-feedback">{errors.code}</div>
          </CCol>
          <CCol md={12}>
            <CFormInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              label="Name"
              invalid={!!errors.name && validated}
            />
            <div className="invalid-feedback">{errors.name}</div>
          </CCol>
          <CCol md={12}>
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-control ${errors.description && validated ? 'is-invalid' : ''}`}
              rows={5}
            />
            {errors.description && validated && <div className="invalid-feedback">{errors.description}</div>}
          </CCol>
          <CCol md={12}>
            <label htmlFor="image" className="form-label">Image</label>
            <input
              type="file"
              id="image"
              name="image"
              className="form-control"
              onChange={handleChange}
            />
            {previewImage && (
              <div className="mt-3">
                <img src={previewImage} alt="Preview" style={{ maxHeight: '100px' }} />
              </div>
            )}
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleSubmit}>
          {product ? 'Save' : 'Add'}
        </CButton>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddEditProductDialog;
