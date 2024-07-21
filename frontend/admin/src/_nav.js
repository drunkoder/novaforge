import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilCat,
  cilLocationPin,
  cilGroup,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard-content',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />
  },
  {
    component: CNavTitle,
    name: 'Management',
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Products',
    to: '/products',
    icon: <CIcon icon={cilCat} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Mining Areas',
    to: '/miningareas',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Exchange Rates',
    to: '/exchange-rates',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  }
]

export default _nav
