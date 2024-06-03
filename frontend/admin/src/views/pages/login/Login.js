import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CToast,
  CToastBody,
  CToastClose,
  CToaster,
  CToastHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from 'axios'

const Login = () => {

  const [errorMessage, setError] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', color: '' });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    stayLoggedIn: false
  });

  const { email, password, stayLoggedIn } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showToast = (message, color) => {
    setToast({ visible: true, message, color });
    setTimeout(() => {
      setToast({ visible: false, message: '', color: '' });
    }, 3000);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const admin = true;
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
        admin
      });
      if (res.status === 200 || res.status === 201) {
        if (stayLoggedIn) { 
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } else {
          sessionStorage.setItem('token', res.data.token);
          sessionStorage.setItem('user', JSON.stringify(res.data.user));
        }
        
        showToast(res?.data?.user ? 'Welcome ' + res.data.user.email : 'Welcome', 'primary');

        setTimeout(() => {
          window.location.replace('/');
        }, 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : err.message);
      showToast(err.response ? err.response.data.message : err.message, 'danger');
      
    }
  };
  
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CToaster position="top-end" className="position-fixed top-0 end-0 p-3">
        {toast.visible && (
          <CToast autohide={false} visible={true} color={toast.color} className="text-white align-items-center">
            <CToastHeader closeButton>
              <strong className="me-auto">Notification</strong>
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={onSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        name="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={onChange}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={onChange}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
