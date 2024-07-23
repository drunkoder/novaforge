import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import axios from 'axios';
import validators from '../../../ValidationUtil';

const Register = () => {
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', color: '' });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });

  const { email, password, confirmPassword, first_name, last_name } = formData;

  const onChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const MAX_TEXT_LENGTH = 100;
    const MIN_TEXT_LENGTH = 1;

    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }  else if (!validators.validateTextLength(formData.email.trim(), MIN_TEXT_LENGTH, MAX_TEXT_LENGTH)) {
      errors.email = 'Email is too long';
    } 

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }  else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'First Name is required';
    } else if (!validators.validateTextLength(formData.first_name.trim(), MIN_TEXT_LENGTH, MAX_TEXT_LENGTH)) {
      errors.email = 'First Name is too long';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (formData.last_name?.trim() && !validators.validateTextLength(formData.last_name?.trim(), MIN_TEXT_LENGTH, MAX_TEXT_LENGTH)) {
      errors.email = 'Last Name is too long';
    }

    setErrors(errors);
    setFormValid(Object.keys(errors).length === 0);
  };
  

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: ''
    });
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
        let res = await axios.post(`${BASE_URL}/api/users/register`, formData);

        if (res.status === 200 || res.status === 201) {
          showToast('You have registered successfully.', 'primary');
          setValidated(false);
          clearForm();
          setTimeout(() => {
            window.location.replace('/login');
          }, 3000);
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
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={onSubmit}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      placeholder="First Name"
                      autoComplete="first_name"
                      name="first_name"
                      value={first_name}
                      onChange={onChange} maxLength={100}
                      invalid={!!errors.first_name && validated}
                    />
                  
                  {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      placeholder="Last Name"
                      autoComplete="last_name"
                      name="last_name"
                      value={last_name} maxLength={100}
                      onChange={onChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="email"
                      name="email"
                      value={email}
                      onChange={onChange} maxLength={100}
                      invalid={!!errors.email && validated}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      invalid={!!errors.password && validated}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={onChange}
                      invalid={!!errors.confirmPassword && validated}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </CInputGroup>
                  
                  <div className="d-grid">
                    <CButton type="submit" color="success">Create Account</CButton>
                  </div>
                  <div className="d-grid">
                    <p className="text-body-secondary text-center mt-3">Already have an account? 
                      <CButton color="link" className="px-0" href="/login" style={{textDecoration:"none",fontWeight:"500"}}>
                        &nbsp;Login
                      </CButton>
                    </p>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}

export default Register;
