import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import axios from 'axios';

const Login = () => {
  const [errors, setErrors] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', color: '' });
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    stayLoggedIn: false,
  });

  const { email, password, stayLoggedIn } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showToast = (message, color) => {
    setToast({ visible: true, message, color });
    setTimeout(() => {
      setToast({ visible: false, message: '', color: '' });
    }, 3000);
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }

    setErrors(errors);
    setFormValid(Object.keys(errors).length === 0);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (formValid) {
      const admin = true;
      try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
          email,
          password,
          admin,
        });
        if (res.status === 200 || res.status === 201) {
          const user = res.data.user;
          if (stayLoggedIn) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('user_id', user.id);
          } else {
            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('user_id', user.id);
          }

          showToast(user ? 'Welcome ' + user.email : 'Welcome', 'primary');

          setTimeout(() => {
            window.location.replace('/');
          }, 1000);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        showToast(err.response ? err.response.data.message : err.message, 'danger');
      }
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
                    <h1 className="d-flex justify-content-center">Login</h1>
                    <p className="text-body-secondary d-flex justify-content-center">Sign In to your account</p>
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
                        invalid={!!errors.email && validated}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
                        invalid={!!errors.password && validated}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </CInputGroup>
                    <CRow>
                      <CCol xs={12} className="d-flex justify-content-center">
                        <CButton type="submit" color="primary" className="px-4">
                          Login
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
  );
};

export default Login;
