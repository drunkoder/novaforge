import React, { useState, useEffect } from 'react';
import axios from '../../../axios_interceptor';
import {
  CContainer,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCard,
  CCardBody,
  CCardImage,
  CCardText,
  CButton,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody,
  CForm,
  CFormInput,
  CFormLabel,
  CCardTitle,
  CTabs,
  CTabList,
  CTab,
  CTabContent,
  CTabPanel,
  CCardHeader
} from '@coreui/react';
import EditAccount from './EditAccount';

const MyAccount = () => {
    const [userInfo, setUserInfo] = useState({});
    const [editModal, setEditModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', color: '' });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
    useEffect(() => {
      const userId = sessionStorage.getItem('user_id');
      console.log('Fetched user ID from local storage:', userId);
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
        handleError(error);
      }
    };

  const handleError = (error) => {
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
  };

  const openEditModal = () => {
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
  };

  const handleEditAccount = async (formData) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/users/${userInfo._id}`, formData);
      if (response.status === 200) {
        const responseData = response.data;

        if (responseData.message === "No changes made") {
          showToast('No changes were made to user information', 'danger');
          // Optionally, update the form fields with existing user data
          setUserInfo(prevUserInfo => ({
            ...prevUserInfo,
            ...formData  // Assuming formData contains the edited user data
          }));
        } else {
          fetchUserInfo(userInfo._id); // Fetch updated user info
          showToast('Account updated successfully', 'success');
          closeEditModal();
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error editing account:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setConfirmPasswordError('');
  
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      setPasswordError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      return;
    } 
    try {
      const response = await axios.put(`${BASE_URL}/api/users/${userInfo._id}`, { password: newPassword });
      if (response.status === 200) {
        setNewPassword('');
        setConfirmPassword('');
        fetchUserInfo(userInfo._id);
        
        showToast('Password updated successfully', 'success');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      // Handle backend error response
      if (error.response && error.response.data) {
        setNewPassword('');
        setConfirmPassword('');
        if (error.response.data.error === 'Password already in use') {
          showToast('The new password cannot be the same as the current password', 'danger');
        } else {
          showToast(error.response.data.message, 'danger');
        }
      } else {
        showToast(error.message, 'danger');
      }
    }
  };
  

  const showToast = (message, color) => {
    setToast({ show: true, message, color });
    setTimeout(() => {
      setToast({ show: false, message: '', color: '' });
    }, 3000);
  };
  
 

  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <section>
      <CToaster position="top-end" className="position-fixed top-0 end-0 p-3">
        {toast.show && (
          <CToast autohide={true} visible={true} color={toast.color} className="text-white align-items-center">
            <CToastHeader closeButton>{toast.color === 'success' ? 'Success' : 'Error'}</CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <CContainer className="py-5 px-5 my-account">
        <CRow>
          <CCard className='my-account-container'>
          <CCardHeader className='profile-header'>Profile</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol lg="4">
                  <CCard className="mb-4 my-account-photo-section">
                    <CCardBody className="text-center img-section">
                      <CCardImage
                        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        alt="avatar"
                        className="rounded-circle"
                        style={{ width: '75%' }}
                      />
                      <p className="text-muted mb-1 mt-3">{userInfo.first_name} {userInfo.last_name}</p>
                      <p className="text-muted mb-4">{userInfo.address}</p>
                      <div className="d-flex justify-content-center mb-2">
                        <CButton color="primary" onClick={openEditModal}>Edit Profile</CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol lg="8">
                  <CCard className="mb-4">
                    <CCardBody>
                      <CRow>
                        <CCol sm="3">
                          <CCardText>First Name</CCardText>
                        </CCol>
                        <CCol sm="9">
                          <CCardText className="text-muted">{userInfo.first_name} {userInfo.last_name}</CCardText>
                        </CCol>
                      </CRow>
                      <hr />
                      <CRow>
                        <CCol sm="3">
                          <CCardText>Email</CCardText>
                        </CCol>
                        <CCol sm="9">
                          <CCardText className="text-muted">{userInfo.email}</CCardText>
                        </CCol>
                      </CRow>
                      <hr />
                      <CRow>
                        <CCol sm="3">
                          <CCardText>Mobile</CCardText>
                        </CCol>
                        <CCol sm="9">
                          <CCardText className="text-muted">{userInfo.phone || '--------------'}</CCardText>
                        </CCol>
                      </CRow>
                      <hr />
                      <CRow>
                        <CCol sm="3">
                          <CCardText>Address</CCardText>
                        </CCol>
                        <CCol sm="9">
                          <CCardText className="text-muted">{userInfo.address || '--------------'}</CCardText>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                  <CCard className="mb-4">
                    <CCardBody>
                      <CRow>
                        <CForm className="row g-3">
                          <CRow>
                            <CCol md={4}>
                              <CFormLabel>New Password</CFormLabel>
                            </CCol>
                            <CCol md={8}>
                              <CFormInput
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              {passwordError && <p className="text-danger">{passwordError}</p>}
                            </CCol>
                          </CRow>
                          <hr />
                          <CRow>
                            <CCol md={4}>
                              <CFormLabel>Confirm New Password</CFormLabel>
                            </CCol>
                            <CCol md={8}>
                              <CFormInput
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                              {confirmPasswordError && <p className="text-danger">{confirmPasswordError}</p>}
                            </CCol>
                          </CRow>
                          <hr />
                          <CRow>
                            <CCol sm="6">
                              <div className="d-flex justify-content-left mb-2">
                                <CButton
                                  color="primary"
                                  onClick={handleChangePassword}
                                  
                                >
                                  Change Password
                                </CButton>
                                <CButton color="secondary" style={{display:'none'}} className="ms-1" onClick={closeEditModal}>Cancel</CButton>
                              </div>
                            </CCol>
                          </CRow>
                        </CForm>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CRow>
        
      </CContainer>
      <EditAccount
        visible={editModal}
        onClose={closeEditModal}
        onSubmit={handleEditAccount}
        user={userInfo}
      />
    </section>
  );
};

export default MyAccount;
