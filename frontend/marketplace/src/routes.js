import React from 'react'
import UserWallet from './views/pages/account/UserWallet'
import { element } from 'prop-types'
import LandingPage from './views/dashboard/LandingPage'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// TODO: Please put your routes here
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/my-inventory', name: 'My Inventory', element: Dashboard },
  { path: '/community', name: 'Community', element: Dashboard },
  { path: '/my-wallet', name: 'My Wallet', element: UserWallet },
  { path: '/landing-page', name: 'Planetarium', element: LandingPage },

  { path: '/login', name: 'Login', element: Dashboard, exact: true }
]

export default routes
