import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams} from 'react-router-dom';
import {
  CForm, CFormInput, CButton, CContainer, CRow, CCol, CCard, CCardBody, CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilWarning, cilInfo } from '@coreui/icons'



const ResetPassword = () => {
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/validate-reset-token/${token}`);
        if (res.data.valid) {
          setIsValidToken(true);
        } else {
          console.log('invalid link');
          setTimeout(() => {
            window.location.replace('/login');
          }, 5000); 
        }
      } catch (error) {
        console.error('Error validating token:', error);
        
      }
    };

    checkTokenValidity();
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMessage('Both password fields are required');
      setMessageType('danger');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('danger');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setMessageType('danger');
      return;
    }

    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(password)) {
      setMessage('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      setMessageType('danger');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/reset-password/${token}`, { password, confirmPassword });
      setMessage(res.data.message);
      setMessageType('success');
      setPassword(''); // Clear password field
      setConfirmPassword(''); // Clear confirmPassword field
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000); // Redirect after 2 seconds
      
    } catch (error) {
      setMessage(error.response ? error.response.data.message : error.message);
      setMessageType('danger');
      setPassword(''); // Clear password field
      setConfirmPassword(''); // Clear confirmPassword field
      
    }
  };

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard className="mt-5">
            <CCardBody>
              <h1 className="mb-4">Reset Password</h1>
              {message && <CAlert color={messageType} className="d-flex align-items-center"><CIcon icon={cilInfo} className="flex-shrink-0 me-2" width={24} height={24} /> {message}</CAlert>}
              {isValidToken ? (
                <CForm onSubmit={onSubmit}>
                  <CFormInput
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mb-3"
                  />
                  <CFormInput
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mb-3"
                  />
                  <CButton type="submit" color="primary" className="mt-3">
                    Reset Password
                  </CButton>
                </CForm>
              ) : (
                <CAlert color="danger" className="d-flex align-items-center">
                  <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
                  <div>Invalid or Expired link. Please request a new password reset.</div>
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ResetPassword;
