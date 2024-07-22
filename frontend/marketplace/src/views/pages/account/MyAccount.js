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
  CTabPanel ,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import EditAccount from './EditAccount';
import { format } from 'date-fns';
import UserWallet from './UserWallet';
import { getUserFromSession } from '../../../UserSession';

const MyAccount = () => {
  const userStorage = sessionStorage.getItem('user') || localStorage.getItem('user');
  const storedUser = JSON.parse(userStorage);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const transactionsPerPage = 5;
  const [prop, setprop] = useState('block');
  const [novacoin, setNovacoin] = useState(parseFloat(storedUser.nova_coin_balance || 0).toFixed(2));
  const [userInfo, setUserInfo] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [transactionInfo, setTransactionInfo] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');


  const getUserInfo = () => {
    const loggedInUser = getUserFromSession();
    if (loggedInUser.id) {
      fetchUserInfo(loggedInUser.id);
    } else {
      console.error('No user ID found in local storage');
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm]);

  const fetchUserInfo = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}`);
      setUserInfo(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/transactions/user/${storedUser.id}`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: transactionsPerPage
        }
      });
      setTransactionInfo(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
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
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // console.error('Error editing account:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
    
    fetchUserInfo(userInfo._id);
    closeEditModal();
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
      const response = await axios.put(`${BASE_URL}/api/users/${userInfo._id}`, { password: newPassword, is_change_password: true });
      if (response.status === 200) {
        fetchUserInfo(userInfo._id);
        showToast('Password updated successfully', 'success');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      // Handle backend error response
      showToast(error.response ? error.response.data.message : error.message, 'danger');
      getUserInfo();
    }
  };
  

  const showToast = (message, color) => {
    setToast({ show: true, message, color });
    setTimeout(() => {
      setToast({ show: false, message: '', color: '' });
    }, 3000);
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const transactionResponse = await axios.get(`${BASE_URL}/api/transactions/user/${storedUser.id}`);
  //       const productResponse = transactionResponse.data;
  //       setTransactionInfo(productResponse);
  //       console.log(productResponse);
  //     } catch (error) {
  //       console.error('Error fetching transaction data:', error);
  //     }
  //   };

  //   fetchData();
  // }, [storedUser.id]);

  const showtransactions = () => {
    setprop(prop === 'none' ? 'block' : 'none');
  };

  // const filteredTransactions = transactionInfo.filter(transaction =>
  //   transaction.product_id.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // const indexOfLastTransaction = currentPage * transactionsPerPage;
  // const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  // const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      <CContainer className="py-5 px-5 my-account-page-container">
        <CRow>
          <CCard className='my-account-container'>
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
                      <p className="text-muted mb-1 mt-2 name">{userInfo.first_name} {userInfo.last_name}</p>
                      <p className="text-muted mb-4">{userInfo.address}</p>
                      <div className="d-flex justify-content-center mb-2">
                        <CButton color="primary" onClick={openEditModal}>Edit Profile</CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol lg="8 detail-section">
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
        <CRow className='mt-2 transactions-history-container'>
          <CCard style={{ display: prop }}>
            <CCardBody>
              <CTabs activeItemKey={1}>
                <CTabList variant="underline-border">
                  <CTab aria-controls="transaction-tab-pane" itemKey={1}>Transaction History</CTab>
                  <CTab aria-controls="my-wallet-tab-pane" itemKey={2}>My Wallet</CTab>
                </CTabList>
                <CTabContent>
                  <CTabPanel className="py-3" aria-labelledby="transaction-tab-pane" itemKey={1}>
                    <CCard id="transactions" style={{ display: prop }} className="mb-4">
                      <CCardBody>
                        <CFormInput
                          type="text"
                          placeholder="Search Product By name"
                          value={searchTerm}
                  onChange={handleSearchChange} className='search'
                        />
                    <CRow>
                      <CCol>
                      <CTable responsive>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell scope="col">Product Name</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Mining Area</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Quantity</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Coins Used</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Transaction Type</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Purchase Time</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                          {transactionInfo?.map((transaction) => (
                              <CTableRow key={transaction._id}>
                                <CTableDataCell>{transaction.product_id.name}</CTableDataCell>
                                <CTableDataCell>{transaction.mining_area_id.name}</CTableDataCell>
                                <CTableDataCell>{transaction.quantity}</CTableDataCell>
                                <CTableDataCell>{transaction.coins_used}</CTableDataCell>
                                <CTableDataCell>{transaction.transaction_type}</CTableDataCell>
                              <CTableDataCell>{format(new Date(transaction.created_at), 'MMMM dd, yyyy H:mm:a')}</CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                        </CTable>
                      </CCol>
                      </CRow>
                      <CRow className="justify-content-between align-items-center mt-3">
                        <CCol sm={4}>
                          <CButton
                            color="primary"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </CButton>
                        </CCol>
                        <CCol sm={4} className='text-center'>
                          <span className="mx-2 text-white">
                            Page {currentPage} of {totalPages < 1 ? 1 : totalPages}
                          </span>
                        </CCol>
                        <CCol sm={4} className='text-end'>
                          
                        <CButton
                            color="primary"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={totalPages < 1 || currentPage === totalPages}
                          >
                            Next
                          </CButton>
                        </CCol>
                      </CRow>
                      {/* <CPagination className="mt-3">
                          <CPaginationItem
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            Previous
                          </CPaginationItem>
                          {[...Array(totalPages).keys()].map((page) => (
                            <CPaginationItem
                              key={page + 1}
                              active={page + 1 === currentPage}
                              onClick={() => handlePageChange(page + 1)}
                            >
                              {page + 1}
                            </CPaginationItem>
                          ))}
                          <CPaginationItem
                            disabled={currentPage === totalPages || !totalPages || totalPages < 1}
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            Next
                          </CPaginationItem>
                        </CPagination> */}
                      </CCardBody>
                    </CCard>
                  </CTabPanel>
                  <CTabPanel className="py-3" aria-labelledby="my-wallet-tab-pane" itemKey={2}>
                    <UserWallet hideTitle={true} />
                  </CTabPanel>
                </CTabContent>
              </CTabs>
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
