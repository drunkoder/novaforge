import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader
} from '@coreui/react';

const AddEditUserDialog = ({ visible, onClose, onSubmit, user, init }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'User'
  });
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (user && !init) {
      setFormData({
        email: user.email || '',
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || 'User'
      });
    } else {
      resetForm();
    }
  }, [user, init]);

  useEffect(() => {
    setValidated(false);
    validateForm();
  }, [formData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'User'
    });
    setErrors({});
    setFormValid(false);
    setValidated(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password.trim() && !user) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6 && !user) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.first_name.trim()) {
      errors.first_name = 'First Name is required';
    }
    setErrors(errors);
    setFormValid(Object.keys(errors).length === 0);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setValidated(true);
    if (formValid) {
      onSubmit(formData);
     
      resetForm();
      
    }
  };

  return (
    <CModal visible={visible} backdrop="static" onClose={onClose}>
      <CModalHeader closeButton>{user ? 'Edit User' : 'Add User'}</CModalHeader>
      <CModalBody>
        <CForm className="row g-3" onSubmit={handleSubmit}>
          <CCol md={12}>
            <CFormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange} maxLength={100}
              label="Email"
              invalid={!!errors.email && validated}
            />
            <div className="invalid-feedback">{errors.email}</div>
          </CCol>
          {!user && (
            <CCol md={12}>
              <CFormInput
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                label="Password"
                invalid={!!errors.password && validated}
              />
              <div className="invalid-feedback">{errors.password}</div>
            </CCol>
          )}
          <CCol md={12}>
            <CFormInput
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange} maxLength={100}
              label="First Name"
              invalid={!!errors.first_name && validated}
            />
            <div className="invalid-feedback">{errors.first_name}</div>
          </CCol>
          <CCol md={12}>
            <CFormInput
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange} maxLength={100}
              label="Last Name"
            />
          </CCol>
          <CCol md={12}>
            <CFormSelect
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </CFormSelect>
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleSubmit} >
          {user ? 'Save' : 'Add'}
        </CButton>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddEditUserDialog;
