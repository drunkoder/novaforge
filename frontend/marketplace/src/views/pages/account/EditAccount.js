import React, { useState, useEffect } from 'react';
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CFormTextarea
} from '@coreui/react';
import { IMaskInput, IMaskMixin } from 'react-imask';


const EditAccount = ({ visible, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || '',
      });
    } else {
      clearForm();
    }
  }, [user]);

  useEffect(() => {
    setValidated(false);
    validateForm();
  }, [visible, formData]);

  const clearForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      address: '',
      phone: '',
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      console.log('oops');
    }

    setErrors(errors);
    setFormValid(Object.keys(errors).length === 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidated(true);
    if (formValid) {
      onSubmit(formData);
      clearForm();
    }
  };

  return (
    <CModal visible={visible} backdrop="static" onClose={onClose} size="lg">
      <CModalHeader>
        <h5>Edit Account</h5>
      </CModalHeader>
      <CModalBody>
        <CForm className="row g-3" onSubmit={handleSubmit}>
          <CCol md={6}>
            <CFormInput
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange} maxLength={100}
              label="First Name"
              invalid={!!errors.first_name && validated}
            />
            {/* <div className="invalid-feedback">{errors.first_name}</div> */}
            {errors.first_name && validated && <div className="invalid-feedback">{errors.first_name}</div>}
          </CCol>
          <CCol md={6}>
            <CFormInput
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange} maxLength={100}
              label="Last Name"
              
            />
            
          </CCol>
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
            {errors.email && validated && <div className="invalid-feedback">{errors.email}</div>}
          </CCol>
          <CCol md={12}>
          <CFormTextarea
            type="text"
            id="address"
            name="address"
            value={formData.address} maxLength={250}
            onChange={handleChange}
            label="Address"
            rows={3}
          ></CFormTextarea>
            {/* <CFormInput
              type="text"
              id="address"
              name="address"
              value={formData.address} maxLength={250}
              onChange={handleChange}
              label="Address"
              
            /> */}
           
          </CCol>
          <CCol md={12}>
          {/* <CFormInputWithMask
              mask="+{1}(000)000-00-00"
              placeholder=""
              autoComplete="tel"
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange} maxLength={20}
              label="Phone"
            /> */}
            <label className="form-label" htmlFor="phone">Phone</label>
            <IMaskInput
              mask="+{1} (000) 000-00-00"
              radix="."
              autoComplete="tel"
              id="phone"
              name="phone"
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={handleChange} maxLength={20} minLength={12}
              label="Phone"
              as={CFormInput}
            />
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleSubmit}>
          Save
        </CButton>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default EditAccount;
