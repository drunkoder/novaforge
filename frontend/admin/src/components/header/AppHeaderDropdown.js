import React from 'react'
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
  const userStorage = sessionStorage.getItem('user') || localStorage.getItem('user');
  const storedUser = userStorage ? JSON.parse(userStorage) : null;
  const userName = storedUser ? `${storedUser.first_name} ${(!storedUser.last_name ? '' : storedUser.last_name)}` : 'User';

  const handleLogout = () =>{
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
  }

  const handleProfile=()=>{
    navigate('/my-account',{replace:true});
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0 d-flex align-items-center" caret={false}>
      <span className="ms-2 dropdown-username">{userName}</span> {/* Added username */}
        <CAvatar src="https://raw.githubusercontent.com/twbs/icons/main/icons/person.svg" size="md" />
        
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem onClick={handleProfile}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem  onClick={handleLogout} >
          <CIcon icon={cilLockLocked} className="me-2" />
          Log out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
