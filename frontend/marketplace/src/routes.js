import React from 'react'
import UserWallet from './views/pages/account/UserWallet'
import { element, exact } from 'prop-types'
import MyInventory from './views/pages/myInventory/myInventory'
import LandingPage from './views/dashboard/LandingPage'
import Community from './views/pages/community/Community'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// TODO: Please put your routes here
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/inventory', name: 'My Inventory', element: MyInventory},
  { path: '/community', name: 'Community', element: Community },
  { path: '/my-wallet', name: 'My Wallet', element: UserWallet },
  { path: '/landing-page', name: 'Planetarium', element: LandingPage },
 { path: '/login', name: 'Login', element: Dashboard, exact: true }
]

export default routes
