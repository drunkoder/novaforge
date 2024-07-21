import React, { useState, useEffect } from 'react';
import axios from '../../../axios_interceptor';
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  CCardText
} from '@coreui/react';

const AddFundsDialog = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    exchangeRateId: '',
    amount: 0,
    external: false,
    noOfCoins: 0,
    userId: ''
  });
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [userinfo, setUserInfo] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (visible) {
      clearForm();
    }
  }, [visible]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetchUserInfo(userId);
    } else {
      console.error('No user ID found in local storage');
    }
  }, []);

  const fetchUserInfo = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}`);
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  useEffect(() => {
    if (visible && exchangeRates.length > 0) {
      setFormData(prevState => ({
        ...prevState,
        exchangeRateId: exchangeRates[0]._id,
      }));
    }
  }, [visible, exchangeRates]);

  useEffect(() => {
    validateForm();
  }, [formData]);

  useEffect(() => {
    if (formData.exchangeRateId && formData.amount) {
      const selectedRate = exchangeRates.find(rate => rate._id === formData.exchangeRateId);
      if (selectedRate) {
        const converted = formData.amount / selectedRate.coins;
        setConvertedAmount(converted.toFixed(2));
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
      external: false,
      noOfCoins: 0
    });
    setValidated(false);
    setConvertedAmount(0);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'exchangeRateId') {
      const selectedRate = exchangeRates.find(rate => rate._id === value);
      if (selectedRate) {
        setFormData(prevState => ({
          ...prevState,
          code: selectedRate.code
        }));
      }
    }
  };

  const verifyPayment = async (session_id) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/verify-payment`, { session_id });
      if (response.data.success) {
        const nova_balance = response.data.nova_balance;
        const userId = response.data.userId;
        console.log(`Successfully added ${nova_balance} Nova coins`);
        submitFormData({
          external: true,
          noOfCoins: parseFloat(nova_balance),
          userId: userId
        });
      } else {
        console.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  useEffect(() => {
    const handleVerifyPayment = async () => {
      const urlParams = new URLSearchParams(location.search);
      const session_id = urlParams.get('session_id');
      if (session_id) {
        await verifyPayment(session_id);
      }
    };
    handleVerifyPayment();
  }, [location]);

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

  const makePayment = async () => {
    try {
      const convertedAmountValue = parseFloat(convertedAmount);
      if (convertedAmountValue < 20 || convertedAmountValue > 10000) {
        toast.error('Nova Coins must be between 20 and 10000');
        return;
      }

      const stripe = await loadStripe("pk_test_51Pcwg3LFGACAQg9KkjQ3jhsWsrp2E0njsxGm2jbxZjO6kj1T1ncR0WVDHQWNaKQAzMGVan1g9tffW4yGTc9ClPLU00rHGkjrtD");
      const selectedRate = exchangeRates.find(rate => rate._id === formData.exchangeRateId);
      const amountInCents = Math.floor(parseFloat(formData.amount) * 100);
      const nova_balance = Math.floor(convertedAmountValue);

      if (!Number.isInteger(amountInCents) || !Number.isFinite(nova_balance)) {
        throw new Error('Amount must be a valid integer after conversion to cents');
      }

      if (!selectedRate || !selectedRate.code) {
        throw new Error('Invalid exchange rate selected');
      }

      const body = {
        nova_balance: convertedAmount,
        amount: amountInCents,
        currency: selectedRate.code,
        userId: userinfo._id
      };
      const headers = {
        "Content-Type": "application/json"
      };

      const response = await fetch(`${BASE_URL}/api/paymentgateway`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }

      const session = await response.json();
      if (!session.id) {
        throw new Error('Session ID is not present in the response');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (result.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const submitFormData = (data) => {
    onSubmit(data);
    clearForm();
  }

  const handleSubmit = e => {
    e.preventDefault();
    setValidated(true);
    if (formValid) {
      submitFormData(formData);
    }
  };

  return (
    <>
      <ToastContainer />
      <CModal visible={visible} backdrop="static" onClose={onClose} size="lg">
        <CModalHeader closeButton>Add Funds</CModalHeader>
        <CModalBody>
          <CForm className="row g-3" onSubmit={(e)=>{e.preventDefault()}}>
            <CCol md={6}>
              <CFormLabel htmlFor='exchangeRateId'>Add Funds in</CFormLabel>
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
            <CCol md={6}>
              <CFormLabel htmlFor='amount'>Amount</CFormLabel>
              <CFormInput
                type="number"
                id="amount"
                name="amount"
                min="50"
                max="15000"
                value={formData.amount}
                onChange={handleChange}
                invalid={!!errors.amount && validated}
              />
              {errors.amount && validated && <div className="invalid-feedback">{errors.amount}</div>}
            </CCol>
            <CCol md={12}>
              <CCard className="mb-3">
                <CRow className="g-0">
                  <CCol md={12}>
                    <CCardBody>
                      <CCardText>
                        <small className="text-body-secondary">Nova coins to buy</small>
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
          <CButton color="primary" onClick={makePayment} disabled={!formValid}>
            Add Funds
          </CButton>
          <CButton color="secondary" onClick={onClose}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default AddFundsDialog;
