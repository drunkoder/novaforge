import React, { useState, useEffect } from 'react';
import axios from '../../../axios_interceptor';
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

const AddFundsDialog = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    exchangeRateId: '',
    amount: 0,
  });
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);
  const [exchangeRates, setExchangeRates] = useState([]);

  useEffect(() => {
    if (visible) {
      clearForm();
    }
  }, [visible]);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/exchange-rates`, {
        params: {
          page: 1,
          limit: 1000,
          sortBy: 'country_name'
        },
      });
      setExchangeRates(response.data.exchangeRates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const clearForm = () => {
    setFormData({
      exchangeRateId: '',
      amount: 0,
    });
    setValidated(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.exchangeRateId.trim()) {
      errors.exchangeRateId = 'Exchange Rate is required';
    } 

    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      errors.amount = 'Amount must be a positive number';
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
      <CModalHeader closeButton>Add Funds</CModalHeader>
      <CModalBody>
        <CForm className="row g-3" onSubmit={handleSubmit}>
          <CCol md={12}>
            <CFormSelect
              id="exchangeRateId"
              name="exchangeRateId"
              value={formData.exchangeRateId}
              onChange={handleChange}
              invalid={!!errors.exchangeRateId && validated}
            >
              {exchangeRates.map(rate => (
                <option key={rate._id} value={rate._id}>{rate.country_name} - {rate.code}</option>
              ))}
            </CFormSelect>
            {errors.exchangeRateId && validated && <div className="invalid-feedback">{errors.exchangeRateId}</div>}
          </CCol>
          <CCol md={12}>
            <CFormInput
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              invalid={!!errors.amount && validated}
            />
            {errors.amount && validated && <div className="invalid-feedback">{errors.amount}</div>}
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleSubmit} disabled={!formValid}>
          Add Funds
        </CButton>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddFundsDialog;
