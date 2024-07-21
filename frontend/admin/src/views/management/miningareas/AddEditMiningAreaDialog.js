import React, { useState, useEffect } from 'react';
import axios from '../../../axios_interceptor';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader
} from '@coreui/react';
import { cilTrash, cilPencil, cilPlus } from '@coreui/icons';
import AreaTypes from '../../../utils/enums';
import miningAreaImages from '../../../utils/mining_area_images.json';

const AddEditMiningAreaDialog = ({ visible, onClose, onSubmit, miningArea }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: AreaTypes.ASTEROID,
    image: '',
    products: []
  });
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]); 
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (miningArea) {
      setFormData({
        name: miningArea.name || '',
        description: miningArea.description || '',
        type: miningArea.type || AreaTypes.ASTEROID,
        image: miningArea.image || '',
        products: miningArea.products.map(product => ({
          product_id: product.product_id,
          price: product.price,
          quantity: product.quantity
        }))
      });
    } else {
      clearForm();
    }

    fetchProducts().then(products => setProducts(products));
    setImages(miningAreaImages);
  }, [miningArea]);

  useEffect(() => {
    setValidated(false);
    validateForm();
  }, [visible, formData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      type: AreaTypes.ASTEROID,
      image: '',
      products: []
    });
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } 

    if (!formData.image.trim()) {
      errors.image = 'Image is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    // Validate products
    formData.products.forEach((product, index) => {

      if (!product.product_id) {
        errors[`product_${index}_product_id`] = 'Product is required';
      }else if (formData.products.filter(p => p.product_id === product.product_id).length > 1) {
        errors[`product_${index}_product_id`] = 'Product must be unique';
      }

      if (!product.price) {
        errors[`product_${index}_price`] = 'Price is required';
      }
      if (!product.quantity) {
        errors[`product_${index}_quantity`] = 'Quantity is required';
      }

      if (product.price === undefined || product.price < 0) {
        errors[`product_${index}_price`] = 'Price must be a non-negative number';
      }
      if (product.quantity === undefined || product.quantity < 0) {
        errors[`product_${index}_quantity`] = 'Quantity must be a non-negative number';
      }
    });
    
    setErrors(errors);
    setFormValid(Object.keys(errors).length === 0);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setValidated(true);
    if (formValid) {
      onSubmit(formData);
      clearForm();
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products`);
      console.log(response.data.products)
      return response.data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const handleProductChange = (event, index) => {
    const { value } = event.target;
    const newProducts = [...formData.products];
    newProducts[index].product_id = value;
    setFormData({ ...formData, products: newProducts });
  };
  
  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', price: '', quantity: '' }]
    });

  };

  const removeProduct = index => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };

  const handleProductPriceChange = (event, index) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index].price = event.target.value;
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };

  const handleProductQuantityChange = (event, index) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index].quantity = event.target.value;
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };
  
  const handleProductQuantityKeyDownEvent = (event, index) => {
    if (event.key === '.') {
      event.preventDefault();
    }
  };

  return (
    <CModal visible={visible} backdrop="static" onClose={onClose} size="lg">
      <CModalHeader closeButton>{miningArea ? 'Edit Mining Area' : 'Add Mining Area'}</CModalHeader>
      <CModalBody>
        <CForm className="row g-3" onSubmit={handleSubmit}>
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
            <label htmlFor="description" className='form-label'>Description</label>
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
            <CFormSelect
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              label="Image"
              invalid={!!errors.image && validated}
            >
              <option value="">Select an image</option>
              {images.map(image => (
                <option key={image.filename} value={image.filename}>{image.name}</option>
              ))}
            </CFormSelect>
            {errors.image && validated && <div className="invalid-feedback">{errors.image}</div>}
            {formData.image && (
              <div style={{ marginTop: '10px', overflow: 'hidden' }}>
                <img src={'src/assets/images/planets_textures/' + images.find(img => img.filename === formData.image)?.url} alt="Thumbnail" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </CCol>

          <CCol md={12}>
            <CFormSelect
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type"
            >
              <option value={AreaTypes.ASTEROID}>{AreaTypes.ASTEROID}</option>
              <option value={AreaTypes.MOON}>{AreaTypes.MOON}</option>
              <option value={AreaTypes.PLANET}>{AreaTypes.PLANET}</option>
              <option value={AreaTypes.STAR}>{AreaTypes.STAR}</option>
            </CFormSelect>
          </CCol>

          <CCol md={12}>
            <label htmlFor="products">Products</label>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.products.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={product.product_id}
                        onChange={event => handleProductChange(event, index)}
                        className={`form-select ${errors[`product_${index}_product_id`] && validated ? 'is-invalid' : ''}`}
                      >
                        {!products || products.length === 0 ? (
                          <option value="">No products available</option>
                        ) : (
                          <>
                            <option value="">Select a product</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </>
                        )}
                      </select>
                      {errors[`product_${index}_product_id`] && validated && <div className="invalid-feedback">{errors[`product_${index}_product_id`]}</div>}
                    </td>
                    <td>
                      <CFormInput
                        type="number"
                        value={product.price}
                        onChange={event => handleProductPriceChange(event, index)}
                        min="0"
                        step="0.01"
                        invalid={!!errors[`product_${index}_price`] && validated}
                      />
                      {errors[`product_${index}_price`] && validated && <div className="invalid-feedback">{errors[`product_${index}_price`]}</div>}


                      {/* <input
                        type="number"
                        value={product.price}
                        onChange={event => handleProductPriceChange(event, index)}
                        className={`form-control ${errors[`product_${index}_price`] && validated ? 'is-invalid' : ''}`}
                        min="0"
                        step="0.01"
                      />
                      {errors[`product_${index}_price`] && validated && <div className="invalid-feedback">{errors[`product_${index}_price`]}</div>} */}
                    </td>
                    <td>
                      <CFormInput
                          type="number"
                          value={product.quantity}
                          onChange={event => handleProductQuantityChange(event, index)}
                          onKeyDown={event => handleProductQuantityKeyDownEvent(event, index)}
                          min="0"
                          invalid={!!errors[`product_${index}_quantity`] && validated}
                        />
                      {errors[`product_${index}_quantity`] && validated && <div className="invalid-feedback">{errors[`product_${index}_quantity`]}</div>}
                      {/* <input
                        type="number"
                        value={product.quantity}
                        onChange={event => handleProductQuantityChange(event, index)}
                        onKeyDown={event => {
                          if (event.key === '.') {
                            event.preventDefault();
                          }
                        }}
                        className={`form-control ${errors[`product_${index}_quantity`] && validated ? 'is-invalid' : ''}`}
                        min="0"
                      />
                      {errors[`product_${index}_quantity`] && validated && <div className="invalid-feedback">{errors[`product_${index}_quantity`]}</div>} */}
                    </td>
                    <td>
                      <CButton color="danger" onClick={() => removeProduct(index)} className="text-white align-items-center">
                        <CIcon icon={cilTrash} size="sm" title="Delete" />
                      </CButton>
                    </td>
                  </tr>
                  
                ))}
              </tbody>
            </table>
            <CButton color="primary" onClick={addProduct}>
              <CIcon icon={cilPlus} size="sm" /> Add Product
            </CButton>
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleSubmit}>
          {miningArea ? 'Save' : 'Add'}
        </CButton>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddEditMiningAreaDialog;
