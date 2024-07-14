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
  CFormLabel
} from '@coreui/react';
import EditAccount from './EditAccount';
import { format } from 'date-fns';



const MyAccount = () => {
  const userStorage = sessionStorage.getItem('user') || localStorage.getItem('user');
  const storedUser = JSON.parse(userStorage);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const transactionsPerPage = 2;
  const [prop,setprop] = useState(['none']);
  const [novacoin, setNovacoin] = useState(parseFloat(storedUser.nova_coin_balance || 0).toFixed(2));
  const [userInfo, setUserInfo] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [transactionInfo, setTransactionInfo] = useState([]);
  
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
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
        fetchUserInfo(userInfo._id);
        showToast('Account updated successfully', 'success');
        closeEditModal();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error editing account:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'danger');
      return;
    }

    try {
      const response = await axios.put(`${BASE_URL}/api/users/${userInfo._id}`, { password: newPassword });
      if (response.status === 200) {
        fetchUserInfo(userInfo._id);
        showToast('Password updated successfully', 'success');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }
  };

  const showToast = (message, color) => {
    setToast({ show: true, message, color });
    setTimeout(() => {
      setToast({ show: false, message: '', color: '' });
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionResponse = await axios.get(`${BASE_URL}/api/transactions/buyer/${storedUser.id}`);
        const productResponse = transactionResponse.data;
        setTransactionInfo(productResponse);
        console.log(productResponse);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      }
    };

    fetchData();
  }, [storedUser.id]);

  const showtransactions = () => {
    setprop(prop === 'none' ? 'block' : 'none');
  };

  const filteredTransactions = transactionInfo.filter(transaction =>
    transaction.product_id.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <section style={{ backgroundColor: '#eee' }}>
      <CToaster position="top-end" className="position-fixed top-0 end-0 p-3">
        {toast.show && (
          <CToast autohide={true} visible={true} color={toast.color} className="text-white align-items-center">
            <CToastHeader closeButton>{toast.color === 'success' ? 'Success' : 'Error'}</CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <CContainer className="py-5">
        <CRow>
          <CCol lg="4">
            <CCard className="mb-4">
              <CCardBody className="text-center">
                <CCardImage
                  src="https://raw.githubusercontent.com/twbs/icons/main/icons/person.svg"
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: '150px' }}
                />
                <p className="text-muted mb-1">{userInfo.first_name} {userInfo.last_name}</p>
                <p className="text-muted mb-4">{userInfo.address}</p>
                <div className="d-flex justify-content-center mb-2">
                  <CButton color="primary" onClick={openEditModal}>Edit Profile</CButton>
                </div>
                <div className="d-flex justify-content-center mb-2">
                  <CButton href="./my-wallet" color="primary">My Wallet</CButton>
                </div>
                <div className="d-flex justify-content-center mb-2">
                  <CButton onClick={showtransactions} color="primary">Transaction History</CButton>
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
                      <CCol md={3}>
                        <CFormLabel>New Password</CFormLabel>
                      </CCol>
                      <CCol md={6}>
                        <CFormInput
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </CCol>
                    </CRow>
                    <hr />
                    <CRow>
                      <CCol md={3}>
                        <CFormLabel>Confirm New Password</CFormLabel>
                      </CCol>
                      <CCol md={6}>
                        <CFormInput
                          type="password"
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </CCol>
                    </CRow>
                    <hr />
                    <CRow>
                      <CCol sm="6">
                        <div className="d-flex justify-content-left mb-2">
                          <CButton color="primary" onClick={handleChangePassword}>Change Password</CButton>
                          <CButton color="secondary" style={{display:'none'}} className="ms-1" onClick={closeEditModal}>Cancel</CButton>
                        </div>
                      </CCol>
                    </CRow>
                  </CForm>
                </CRow>
              </CCardBody>
            </CCard>

            <CCard id="transactions" style={{ display:prop }} className="mb-4">
              <CCardBody>
              <CFormInput
            type="text"
            placeholder="Search Product By name"
            value={searchTerm}
            onChange={handleSearchChange}
          />
                <CTable>
                  <CTableHead>
                    
                    <CTableRow>
                      <CTableHeaderCell scope="col">Product Name</CTableHeaderCell>
                         <CTableHeaderCell scope="col">Mining Area</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Quantity</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Coins Used</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Transaction Type</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Purchase Time </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentTransactions.map((transaction) => (
                      <CTableRow key={transaction._id}>
                         <CTableDataCell>{transaction.product_id.name}</CTableDataCell>
                         <CTableDataCell>{transaction.mining_area_id.name}</CTableDataCell>
                        <CTableDataCell>{transaction.quantity}</CTableDataCell>
                        <CTableDataCell>{transaction.coins_used}</CTableDataCell>
                        <CTableDataCell>{transaction.transaction_type}</CTableDataCell>
                        <CTableDataCell>{format(new Date(transaction.created_at), 'MMMM dd, yyyy')}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
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
