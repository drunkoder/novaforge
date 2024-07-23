import React, { useState, useEffect } from 'react';
import axios from '../../../axios_interceptor';
import { CContainer, CRow, CCol, CCard, CCardBody, CButton, CBadge, CCardTitle, CCardText, CCallout,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilMinus, cilLemon } from '@coreui/icons';
import AddFundsDialog from './AddFundsDialog';
import WithdrawFundsDialog from './WithrdawFundsDialog';

const UserWallet = ({ hideTitle }) => {
  const [user, setUser] = useState(null);
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [showWithdrawFundsDialog, setShowWithdrawFundsDialog] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }else{
      if (user && user.id) {
        fetchUserDetails(user.id);
      }
    }
  };

  // useEffect(() => {
  //   const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
  //   if (storedUser) {
  //     const parsedUser = JSON.parse(storedUser);
  //     setUser(parsedUser);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (user && user.id) {
  //     fetchUserDetails(user.id);
  //   }
  // }, [user]);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}`);
      console.log(response.data);
      setUser(response.data);

    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleAddFunds = () => {
    setShowAddFundsDialog(true);
  };

  const handleCloseAddFundsDialog = () => {
    setShowAddFundsDialog(false);
  };

  const handleAddFundsSubmit = async (formData) => {
    console.log(formData);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/${user?._id || user?.id || formData.userId}/add-coins`, formData);
     
      if (response.status === 200 || response.status === 201) {
        showToast('You have successfully added funds!', 'success');
        //setUser(response.data);

        console.log(response.data);
        fetchUserDetails(response.data.updatedUser.id);

        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
        let updatedUser = JSON.parse(storedUser);
        updatedUser.nova_coin_balance = response.data.updatedUser.nova_coin_balance;

        const updatedUserStr = JSON.stringify(updatedUser);
        sessionStorage.setItem('user', updatedUserStr); 
        localStorage.setItem('user', updatedUserStr); 


        return response.data.session_id;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding your fund:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    return null;
    }

    setShowAddFundsDialog(false);
  }

  const handleWithdraw = () => {
    setShowWithdrawFundsDialog(true);
  };

  const handleCloseWithdrawFundsDialog = () => {
    setShowWithdrawFundsDialog(false);
  };

  const handleWithdrawFundsSubmit = async (formData) => {
    console.log(formData);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/${user._id || user.id}/withdraw-coins`, formData);
      if (response.status === 200 || response.status === 201) {
        showToast('You have successfully withdrawn your funds!', 'success');
        //setUser(response.data);
        fetchUserDetails(response.data.updatedUser.id);

        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
        let updatedUser = JSON.parse(storedUser);
        updatedUser.nova_coin_balance = response.data.updatedUser.nova_coin_balance;

        const updatedUserStr = JSON.stringify(updatedUser);
        sessionStorage.setItem('user', updatedUserStr); 
        localStorage.setItem('user', updatedUserStr); 
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error withdrawing your funds:', error);
      showToast(error.response ? error.response.data.message : error.message, 'danger');
    }

    setShowWithdrawFundsDialog(false);
  }


  const showToast = (message, color) => {
    setToast({ show: true, message, color });
    setTimeout(() => {
      setToast({ show: false, message: '', color: '' });
    }, 3000);
  };

  return (
    <div className="c-app c-default-layout flex-row align-items-center">
    <CToaster position="top-end" className="position-fixed top-0 end-0 p-3">
        {toast.show && (
          <CToast autohide={true} visible={true} color={toast.color} className="text-white align-items-center">
            <CToastHeader closeButton>{toast.color === 'success' ? 'Success' : 'Error'}</CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        )}
      </CToaster>
    <CContainer>
    {!hideTitle && <CRow className='mt-5'></CRow>}
      <CRow className='my-wallet-card-container'>
        <CCol>
          <CCard>
            <CCardBody>
              {!hideTitle && <h1 className='my-wallet-header'>My Wallet</h1>}
              {user && (
                <CCallout color="info">
                  <div className="d-flex align-items-center">
                    <h6 className="mb-0 me-2">Nova Coins</h6>
                  </div>
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilLemon} className="me-1" style={{ fontSize: '80px' }} />
                    <span style={{ fontSize: '24px' }}>{user?.nova_coin_balance?.toFixed(2)}</span>
                  </div>
                </CCallout>
              )}


              <CButton color="primary" size="lg" className="mt-3" onClick={handleAddFunds}>
                <CIcon icon={cilPlus} className="me-1" />
                Add Funds
              </CButton>
              <CButton color="secondary" size="lg" className="mt-3 ms-2" onClick={handleWithdraw}>
                <CIcon icon={cilMinus} className="me-1" />
                Withdraw 
              </CButton>

              <AddFundsDialog
                visible={showAddFundsDialog}
                onClose={handleCloseAddFundsDialog}
                onSubmit={handleAddFundsSubmit}
              />

              <WithdrawFundsDialog
                visible={showWithdrawFundsDialog}
                onClose={handleCloseWithdrawFundsDialog}
                onSubmit={handleWithdrawFundsSubmit}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
    </div>
  );
};

export default UserWallet;
