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
  CToastHeader,
  CToaster,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import axios from 'axios';

const Login = () => {
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', color: '' });
  const [validated, setValidated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    stayLoggedIn: false,
  });

  const { email, password, stayLoggedIn } = formData;

  useEffect(() => {
    validateForm();
  }, [formData]);

  const onChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'email' && !modalVisible) {
      setForgotPasswordEmail(value);
    }
  };

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

  const showToast = (message, color) => {
    setToast({ visible: true, message, color });
    setTimeout(() => {
      setToast({ visible: false, message: '', color: '' });
    }, 3000);
  };

  const onSubmit = async e => {
    e.preventDefault();
    setValidated(true);
    if (formValid) {
      try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
          email,
          password,
        });
        if (res.status === 200 || res.status === 201) {
          const user = res.data.user;
          
          console.log(user);
          if (stayLoggedIn) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('user_id', user.id);
          } else {
            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('user_id', user.id);
          }

          showToast(res.data.user ? 'Welcome ' + res.data.user.email : 'Welcome', 'primary');

          setTimeout(() => {
            window.location.replace('/');
          }, 3000);

          // Clear form data and errors after successful login
          setFormData({
            email: '',
            password: '',
            stayLoggedIn: false,
          });
          setErrors({});
          setValidated(false);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        showToast(err.response ? err.response.data.message : err.message, 'danger');
        // Clear form data and errors after unsuccessful login
        setFormData({
          email: '',
          password: '',
          stayLoggedIn: false,
        });
        setErrors({});
        setValidated(false);
      }
    }
  };

  const onForgotPasswordSubmit = async () => {
    const errors = {};
    if (!forgotPasswordEmail.trim()) {
      errors.forgotPasswordEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      errors.forgotPasswordEmail = 'Email is invalid';
    }
    console.log(errors);
    setErrors(errors);
    setValidated(true);

    if (Object.keys(errors).length === 0) {
      try {
        const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
          email: forgotPasswordEmail,
        });

        if (res.status === 200 || res.status === 201) {
          showToast('Password reset link sent to your email', 'primary');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        showToast(err.response.data.message, 'danger');
      }

      setModalVisible(false);
    }
  };

  const ModalVisible = visible => {
    if (!visible) {
      setForgotPasswordEmail(email);
    } else if (email) {
      setForgotPasswordEmail(email);
    }
    setModalVisible(visible);
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
      <CModal alignment="center" visible={modalVisible} onClose={() => ModalVisible(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Forgot Password</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="email"
            placeholder="Enter your email"
            value={forgotPasswordEmail}
            onChange={e => setForgotPasswordEmail(e.target.value)}
            invalid={!!errors.forgotPasswordEmail && validated}
          />
          {errors.forgotPasswordEmail && <div className="invalid-feedback">{errors.forgotPasswordEmail}</div>}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => ModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={onForgotPasswordSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={onSubmit}>
                    <h1>Marketplace Login</h1>
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
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0" onClick={() => ModalVisible(true)} style={{textDecoration:"none",fontWeight:"500"}}>
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Join Nova Forge, the premier marketplace for buying and selling mined resources from space. Discover the future of space mining and trade with us today.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
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
