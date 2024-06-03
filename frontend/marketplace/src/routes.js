import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// TODO: Please put your routes here
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/my-inventory', name: 'My Inventory', element: Dashboard },
  { path: '/community', name: 'Community', element: Dashboard },

  { path: '/login', name: 'Login', element: Dashboard, exact: true }
]

export default routes
