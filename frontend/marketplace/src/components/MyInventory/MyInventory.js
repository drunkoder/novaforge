import React, { useState, useEffect } from 'react'
import axios from '../../axios_interceptor'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CInputGroup,
  CFormInput,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'

const MyInventory = () => {
  const storedUser = localStorage.getItem('user_id')
  console.log(`paku id :::${storedUser}`)

  const [userId, setUserId] = useState(storedUser)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [inventoryData, setInventoryData] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(1)

  const fetchInventory = async (statusOverride = '') => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/users/${userId}/inventory`, {
        params: { status: statusOverride, search, page },
      })

      const inventory = response.data.inventory

      console.log(response)

      const filteredData = inventory.map((item) => ({
        id: item._id,
        productName: item.product_id.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        status: item.status,
      }))

      setInventoryData(response.data)
      setFilteredData(filteredData)
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message)
    }

    setLoading(false)
  }

  // for filtering based on product status
  useEffect(() => {
    let statusToFetch = ''
    switch (activeTab) {
      case 2:
        statusToFetch = 'AVAILABLE'
        break
      case 3:
        statusToFetch = 'FOR_SALE'
        break
      case 4:
        statusToFetch = 'SOLD'
        break
      default:
        statusToFetch = ''
    }
    fetchInventory(statusToFetch)
  }, [userId, page, search, activeTab])

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setPage(1) // Reset to the first page when switching tabs
  }

  return (
    <CContainer className='my-5' >
      <CRow className="justify-content-center">
        <CCol md={20}>
          <CCard>
            <CCardHeader>
              <h1>User Inventory</h1>
            </CCardHeader>
            <CCardBody>
              <CNav variant="tabs">
                <CNavItem>
                  <CNavLink active={activeTab === 1} onClick={() => handleTabChange(1)}>
                    All Products
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 2} onClick={() => handleTabChange(2)}>
                    Available Products
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 3} onClick={() => handleTabChange(3)}>
                    For Sale
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 4} onClick={() => handleTabChange(4)}>
                    Sold Products
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CTabContent className="mt-3">
                <CTabPane
                  visible={activeTab === 1 || activeTab === 2 || activeTab === 3 || activeTab === 4}
                >
                  <CInputGroup className="mb-3">
                    <CFormInput
                      type="text"
                      placeholder="Search By Product Name OR Status"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </CInputGroup>
                  {loading && <CSpinner color="primary" />}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  {inventoryData && (
                    <>
                      <CTable hover responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>ID</CTableHeaderCell>
                            <CTableHeaderCell>Product Name</CTableHeaderCell>
                            <CTableHeaderCell>Quantity</CTableHeaderCell>
                            <CTableHeaderCell>Price</CTableHeaderCell>
                            <CTableHeaderCell>Total Price</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {filteredData.map((item) => (
                            <CTableRow key={item.id}>
                              <CTableDataCell>{item.id}</CTableDataCell>
                              <CTableDataCell>{item.productName}</CTableDataCell>
                              <CTableDataCell>{item.quantity}</CTableDataCell>
                              <CTableDataCell>{item.price}</CTableDataCell>
                              <CTableDataCell>{item.totalPrice}</CTableDataCell>
                              <CTableDataCell>{item.status}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                      <div className="d-flex justify-content-between">
                        <CButton
                          disabled={inventoryData.currentPage === 1}
                          onClick={() => handlePageChange(inventoryData.currentPage - 1)}
                        >
                          Previous
                        </CButton>
                        <span>
                          Page {inventoryData.currentPage} of {inventoryData.totalPages}
                        </span>
                        <CButton
                          disabled={inventoryData.currentPage === inventoryData.totalPages}
                          onClick={() => handlePageChange(inventoryData.currentPage + 1)}
                        >
                          Next
                        </CButton>
                      </div>
                    </>
                  )}
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default MyInventory
