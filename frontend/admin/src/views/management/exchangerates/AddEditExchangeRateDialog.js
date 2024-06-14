import React, { useState, useEffect } from 'react';
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

const AddEditExchangeRateDialog = ({ visible, onClose, onSubmit, exchangeRate }) => {
  const [formData, setFormData] = useState({
    country_name: '',
    code: '',
    coins: 0,
  });
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (exchangeRate) {
      setFormData({
        country_name: exchangeRate.country_name || '',
        code: exchangeRate.code || '',
        coins: exchangeRate.coins || 0,
      });
    } else {
      clearForm();
    }
  }, [exchangeRate]);

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
      country_name: '',
      code: '',
      coins: 0,
    });
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.country_name.trim()) {
      errors.country_name = 'Country name is required';
    } 

    if (!formData.code.trim()) {
      errors.code = 'Code is required';
    }

    if (!formData.coins || isNaN(formData.coins)) {
      errors.coins = 'Coins must be a number';
    }
    
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

  return (
    <CModal visible={visible} backdrop="static" onClose={onClose} size="lg">
      <CModalHeader closeButton>{exchangeRate ? 'Edit Exchange Rate' : 'Add Exchange Rate'}</CModalHeader>
      <CModalBody>
        <CForm className="row g-3" onSubmit={handleSubmit}>
          <CCol md={12}>
            <CFormInput
              type="text"
              id="country_name"
              name="country_name"
              value={formData.country_name}
              onChange={handleChange}
              label="Country Name"
              invalid={!!errors.country_name && validated}
            />
            {errors.country_name && validated && <div className="invalid-feedback">{errors.country_name}</div>}
          </CCol>
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
            {errors.code && validated && <div className="invalid-feedback">{errors.code}</div>}
          </CCol>
          <CCol md={12}>
            <CFormInput
              type="number"
              id="coins"
              name="coins"
              value={formData.coins}
              onChange={handleChange}
              label="Coins"
              invalid={!!errors.coins && validated}
            />
            {errors.coins && validated && <div className="invalid-feedback">{errors.coins}</div>}
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleSubmit}>
          {exchangeRate ? 'Save' : 'Add'}
        </CButton>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddEditExchangeRateDialog;
