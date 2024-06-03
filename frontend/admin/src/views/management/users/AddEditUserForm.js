import React, { useState, useEffect } from 'react';
import { CForm, CFormInput, CFormLabel, CRow, CFormSelect } from '@coreui/react';

const AddEditUserForm = forwardRef((props, ref) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'User',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (props.user) {
      setFormData({
        email: props.user.email || '',
        password: '',
        first_name: props.user.first_name || '',
        last_name: props.user.last_name || '',
        role: props.user.role || 'User',
      });
    }
  }, [props.user]);

  useEffect(() => {
    props.onValidate(validateForm());
  }, [formData, props.onValidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.first_name.trim()) {
      errors.first_name = 'First Name is required';
    }
    setErrors(errors);
    console.log(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      props.onSubmit(formData);
    }
  };

  return (
    <CForm className="row g-3" onSubmit={handleSubmit} ref={ref}>
      <CCol md={12}>
        <CFormInput
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          label="Email"
          invalid={!!errors.email}
        />
        <div className="invalid-feedback">{errors.email}</div>
      </CCol>
      <CCol md={12}>
        <CFormInput
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          label="Password"
          invalid={!!errors.password}
        />
        <div className="invalid-feedback">{errors.password}</div>
      </CCol>
      <CCol md={12}>
        <CFormInput
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          label="First Name"
          invalid={!!errors.error.first_name} // typo fixed
        />
        <div className="invalid-feedback">{errors.first_name}</div>
      </CCol>
      <CCol md={12}>
        <CFormInput id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} label="Last Name" />
      </CCol>
      <CCol md={12}>
        <CFormSelect id="role" name="role" value={formData.role} onChange={handleChange} label="Role">
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </CFormSelect>
      </CCol>
    </CForm>
  );
});

export default AddEditUserForm;
