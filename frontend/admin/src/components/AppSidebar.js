import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'

// sidebar nav config
import navigation from '../_nav'
import './AppSidebar.css' // Import the custom CSS

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const spaceThemeStyles = {
    sidebar: {
      backgroundColor: '#000000', // Black background
      color: '#ffffff',
    },
    headerFooter: {
      backgroundColor: '#23233a',
    },
    brand: {
      filter: 'brightness(0) invert(1)',
    },
    closeButton: {
      color: '#ffffff',
    },
    toggler: {
      color: '#ffffff',
    },
  }

  return (
    <CSidebar
      className="border-end space-theme-sidebar"
      style={spaceThemeStyles.sidebar}
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <div className="planet"></div>
      <div className="asteroid"></div>
      <CSidebarHeader className="border-bottom space-theme-header" style={spaceThemeStyles.headerFooter}>
        <CSidebarBrand to="/" style={spaceThemeStyles.brand} className="space-theme-brand">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={60} width={165}/>
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none space-theme-close-button"
          dark
          style={spaceThemeStyles.closeButton}
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex space-theme-footer" style={spaceThemeStyles.headerFooter}>
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
          style={spaceThemeStyles.toggler}
          className="space-theme-toggler"
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
