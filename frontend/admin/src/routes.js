import React from 'react'
import MiningAreaManagement from './views/management/miningareas/MiningAreas'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const UserManagement = React.lazy(() => import('./views/management/users/Users'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: UserManagement },
  { path: '/products', name: 'Products', element: Dashboard },
  { path: '/miningareas', name: 'Mining Areas', element: MiningAreaManagement },


  { path: '/login', name: 'Login', exact: true }
]

export default routes
