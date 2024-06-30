import React from 'react'
import MiningAreaManagement from './views/management/miningareas/MiningAreas'
import ExchangeRateManagement from './views/management/exchangerates/ExchangeRates'
import ProductManagement from './views/management/products/Products'


const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const UserManagement = React.lazy(() => import('./views/management/users/Users'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: UserManagement },
  { path: '/products', name: 'Products', element: ProductManagement},
  { path: '/miningareas', name: 'Mining Areas', element: MiningAreaManagement },
  { path: '/exchange-rates', name: 'Exchange Rates', element: ExchangeRateManagement },
  { path: '/login', name: 'Login', exact: true }
]

export default routes
