import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { CForm, CFormInput, CButton, CContainer, CRow, CCol, CCard, CCardBody } from '@coreui/react';

//const BASE_URL = 'http://localhost:3001'; // replace with your API base URL

const ResetPassword = () => {
  const { token } = useParams();
  const history = useHistory();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/reset-password/${token}`, { password, confirmPassword });
      setMessage(res.data.message);
      if (res.data.redirectUrl) {
        console.log(history.push(`${BASE_URL}/login`));
      }
    } catch (error) {
      setMessage(error.response ? error.response.data.message : error.message);
    }
  };

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard>
            <CCardBody>
              <h1>Reset Password</h1>
              {message && <p>{message}</p>}
              <CForm onSubmit={onSubmit}>
                <CFormInput
                  type="password"
                  name="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <CFormInput
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <CButton type="submit" color="primary" className="mt-3">
                  Reset Password
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ResetPassword;
