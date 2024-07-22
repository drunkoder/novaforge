import React, { useEffect, useRef, useState   } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { logo } from 'src/assets/brand/logo'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('dark')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  useEffect(() => {
    const currentPath = window.location.pathname;

    if (currentPath === '/landing-page') {
      setActiveTab('home');
    } else if (currentPath === '/inventory') {
      setActiveTab('inventory');
    } else if (currentPath === '/community') {
      setActiveTab('community');
    }
  }, []);

  return (
    <CHeader position="sticky" className="p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink href="/">
              <CIcon customClassName="sidebar-brand-full" icon={logo} height={60} width={165}/>
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav className="d-none d-md-flex main-menu">
        <CNavItem>
            <CNavLink href="/landing-page" className={activeTab === 'home' ? 'nav-link active' : 'nav-link'}>Home</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/inventory" className={activeTab === 'inventory' ? 'nav-link active' : 'nav-link'}>My Inventory</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/community" className={activeTab === 'community' ? 'nav-link active' : 'nav-link'}>Community</CNavLink>
          </CNavItem>
         
        </CHeaderNav>
        <CHeaderNav>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      {/* <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer> */}
    </CHeader>
  )
}

export default AppHeader
