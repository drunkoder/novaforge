import React, { useState, useEffect } from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import { useNavigate } from 'react-router-dom';

const AppHeaderDropdown = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
   console.log(storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  };

  const handleProfile=()=>{
    navigate('/my-account',{replace:true});
  }



  const handleLogout = () =>{
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
  }

  const handleMyWallet = () => {
    navigate('/my-wallet', { replace: true });
  };

  const handlReloadProfile = () => {
    loadUserFromStorage();
  };

  return (
    <CDropdown variant="nav-item">
      <div className="py-0 pe-0" onClick={handlReloadProfile}>
        <CDropdownToggle placement="bottom-end" caret={false}>
          <CAvatar src={avatar8} size="md" />
        </CDropdownToggle>
      </div>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem onClick={handleProfile}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem onClick={handleMyWallet}>
          <CIcon icon={cilCreditCard} className="me-2" />
          Wallet
          {user && (<CBadge color="secondary" className="ms-2">
            {user?.nova_coin_balance?.toFixed(2)}
          </CBadge>
          )}
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem  onClick={handleLogout} >
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
