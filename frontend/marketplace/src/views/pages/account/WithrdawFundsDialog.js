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
  CModalHeader,
  CCard,
  CRow,
  CCardBody,
  CCardText,
  CCardTitle
} from '@coreui/react';

const WithdrawFundsDialog = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    exchangeRateId: '',
    amount: 0,
  });
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    if (visible) {
      clearForm();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && exchangeRates.length > 0) {
      setFormData(prevState => ({
        ...prevState,
        exchangeRateId: exchangeRates[0]._id
      }));
    }
  }, [visible, exchangeRates]);
  
  useEffect(() => {
    validateForm();
  }, [formData]);

  useEffect(() => {
    if (formData.exchangeRateId) {
      const selectedRate = exchangeRates.find(rate => rate._id === formData.exchangeRateId);
      if(formData.amount){
        if (selectedRate) {
          const converted = formData.amount * selectedRate.coins;
          setConvertedAmount(converted.toFixed(2));
          setCurrency(selectedRate.code);
        }
      }
      
      if (selectedRate) {
        setCurrency(selectedRate.code);
      }
    }
  }, [formData, exchangeRates]);

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
    setConvertedAmount(0);
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
    <CModal visible={visible} backdrop="static" onClose={onClose}>
      <CModalHeader closeButton>Withdraw Funds</CModalHeader>
      <CModalBody>
        <CForm className="row g-3" onSubmit={handleSubmit}>
          <CCol md={12}>
            <CFormLabel htmlFor='amount'>Amount of Nova Coins To Withdraw</CFormLabel>
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
          <CCol md={12}>
            <CFormLabel htmlFor='exchangeRateId'>Withdraw in</CFormLabel>
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
            <CCard className="mb-3">
              <CRow className="g-0">
                <CCol md={12}>
                  <CCardBody>
                    <CCardText>
                      <small className="text-body-secondary">Currency conversion</small>
                    </CCardText>
                    <CCardText className="text-body-secondary mr-2" style={{ fontSize: '2.5rem', display: 'inline', marginRight: '10px' }}>
                      {currency}
                    </CCardText>
                    <CCardText style={{ fontSize: '2.5rem', display: 'inline' }}>
                      {convertedAmount}
                    </CCardText>
                  </CCardBody>
                </CCol>
              </CRow>
            </CCard>
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleSubmit} disabled={!formValid}>
          Withdraw Funds
        </CButton>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default WithdrawFundsDialog;
